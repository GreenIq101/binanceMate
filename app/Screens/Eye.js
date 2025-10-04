"use client"

import { StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator, Animated, Modal } from "react-native"
import { useState, useEffect, useRef } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { widthPercentageToDP as w, heightPercentageToDP as h } from "react-native-responsive-screen"
import axios from "axios"
import iOSColors from "../Commponents/Colors"

let COIN_PAIRS = [] // Will be populated dynamically

const MarketEye = () => {
  const [marketData, setMarketData] = useState({})
  const [loadingRows, setLoadingRows] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h")
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPairs, setSelectedPairs] = useState([])
  const [modalData, setModalData] = useState({})
  const [modalTimeframe, setModalTimeframe] = useState("1h")
  const [coinPairs, setCoinPairs] = useState([])
  const [topCoins, setTopCoins] = useState([])
  const [scanningProgress, setScanningProgress] = useState(0)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  const timeframes = ["5m", "15m", "30m", "1h", "4h", "1d"]

  const fetchCoinPairs = async () => {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo')
      const symbols = response.data.symbols
        .filter(symbol => symbol.status === 'TRADING' && symbol.symbol.endsWith('USDT'))
        .map(symbol => symbol.symbol.toUpperCase())
      // Remove duplicates
      const uniquePairs = [...new Set(symbols)]
      setCoinPairs(uniquePairs)
      COIN_PAIRS = uniquePairs
    } catch (error) {
      console.error('Error fetching coin pairs:', error)
      // Fallback to some default pairs
      setCoinPairs(['BTCUSDT', 'ETHUSDT', 'BNBUSDT'])
      COIN_PAIRS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
    }
  }

  useEffect(() => {
    fetchCoinPairs()
    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start()
  }, [])

  useEffect(() => {
    setModalTimeframe(selectedTimeframe)
  }, [selectedTimeframe])

  const fetchDataForPairs = async (pairs, row) => {
    setLoadingRows((prevState) => ({ ...prevState, [row]: true }))
    const results = []

    for (const pair of pairs) {
      try {
        const resPrice = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`)
        const price = Number.parseFloat(resPrice.data.price)

        // If the price is invalid, skip the pair
        if (isNaN(price)) {
          results.push({
            pair,
            price: "N/A",
            sma: "N/A",
            ema: "N/A",
            rsi: "N/A",
            predictedPrice: "N/A",
            percentageChange: "N/A",
          })
          continue
        }

        const resHistorical = await axios.get(
          `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1h&limit=200`,
        )
        const data = resHistorical.data.map((item) => ({
          close: Number.parseFloat(item[4]),
          volume: Number.parseFloat(item[5]),
          high: Number.parseFloat(item[2]),
          low: Number.parseFloat(item[3]),
        }))

        const closingPrices = data.map((item) => item.close)
        const filteredPrices = removeOutliers(closingPrices)

        // Add the condition to check if there is enough data to calculate indicators
        if (filteredPrices.length < 14) {
          console.warn(`Not enough data for ${pair} to calculate indicators.`)
          results.push({
            pair,
            price: price.toFixed(9),
            sma: "N/A",
            ema: "N/A",
            rsi: "N/A",
            predictedPrice: "N/A",
            percentageChange: "N/A",
          })
          continue // Skip further processing for this pair
        }

        const sma = calculateSMA(filteredPrices, 14)
        const ema = calculateEMA(filteredPrices, 14)
        const rsi = calculateRSI(filteredPrices, 14)

        const predictedPrice =
          sma !== "N/A" && ema !== "N/A" && filteredPrices.length > 0
            ? (sma * 0.3 + ema * 0.5 + linearRegressionPrediction(filteredPrices) * 0.2).toFixed(9)
            : "N/A"

        const percentageChange =
          price && predictedPrice !== "N/A"
            ? (((Number.parseFloat(predictedPrice) - price) / price) * 100).toFixed(2)
            : "N/A"

        results.push({
          pair,
          price: price.toFixed(9),
          sma: sma !== null ? sma.toFixed(2) : "N/A",
          ema: ema !== null ? ema.toFixed(2) : "N/A",
          rsi: rsi !== null ? rsi.toFixed(2) : "N/A",
          predictedPrice,
          percentageChange,
        })
      } catch (error) {
        console.error(`Error fetching data for ${pair}:`, error)
        results.push({
          pair,
          price: "N/A",
          sma: "N/A",
          ema: "N/A",
          rsi: "N/A",
          predictedPrice: "N/A",
          percentageChange: "N/A",
        })
      }
    }

    setMarketData((prevState) => ({ ...prevState, [row]: results }))
    setLoadingRows((prevState) => ({ ...prevState, [row]: false }))
  }

  const analyzeCoinForGrowth = async (pair, timeframe) => {
    try {
      const resPrice = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`)
      const price = Number.parseFloat(resPrice.data.price)
      if (isNaN(price)) return null

      const resHistorical = await axios.get(
        `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${timeframe}&limit=200`,
      )
      const data = resHistorical.data.map((item) => ({
        close: Number.parseFloat(item[4]),
        volume: Number.parseFloat(item[5]),
        high: Number.parseFloat(item[2]),
        low: Number.parseFloat(item[3]),
      }))

      const closingPrices = data.map((item) => item.close)
      const filteredPrices = removeOutliers(closingPrices)

      if (filteredPrices.length < 50) return null // Need more data for analysis

      const volumes = data.map((item) => item.volume)
      const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
      const currentVolume = volumes[volumes.length - 1]
      const volumeSpike = currentVolume > avgVolume * 1.5

      const rsi = calculateRSI(filteredPrices, 14)
      const ema12 = calculateEMA(filteredPrices, 12)
      const ema26 = calculateEMA(filteredPrices, 26)
      const macdSignal = ema12 > ema26 // Simple MACD signal

      const slope = linearRegressionPrediction(filteredPrices.slice(-10)) - filteredPrices[filteredPrices.length - 11] // Recent trend

      // Calculate score
      let score = 0
      if (rsi < 30) score += 30 // Oversold
      if (volumeSpike) score += 20 // Volume spike
      if (macdSignal) score += 15 // Bullish MACD
      if (slope > 0) score += 10 // Positive momentum
      if (rsi < 50 && rsi > 30) score += 5 // Neutral to bullish

      return {
        pair,
        price,
        rsi,
        volumeSpike,
        score,
        ema12,
        ema26,
        slope,
      }
    } catch (error) {
      console.error(`Error analyzing ${pair}:`, error)
      return null
    }
  }

  const scanAllCoins = async () => {
    setLoading(true)
    setScanningProgress(0)
    const results = []

    for (let i = 0; i < coinPairs.length; i++) {
      const analysis = await analyzeCoinForGrowth(coinPairs[i], selectedTimeframe)
      if (analysis && analysis.score > 0) {
        results.push(analysis)
      }
      setScanningProgress(((i + 1) / coinPairs.length) * 100)
    }

    // Sort by score descending and take top 5
    const top5 = results.sort((a, b) => b.score - a.score).slice(0, 5)
    setTopCoins(top5)
    setLoading(false)
  }

  const fetchModalData = async (pairs, timeframe) => {
    setLoading(true)
    const results = {}
    for (const pair of pairs) {
      try {
        const resPrice = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`)
        const price = Number.parseFloat(resPrice.data.price)
        if (isNaN(price)) {
          results[pair] = {
            price: "N/A",
            sma: "N/A",
            ema: "N/A",
            rsi: "N/A",
            predictedPrice: "N/A",
            percentageChange: "N/A",
          }
          continue
        }
        const resHistorical = await axios.get(
          `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${timeframe}&limit=200`,
        )
        const data = resHistorical.data.map((item) => ({
          close: Number.parseFloat(item[4]),
          volume: Number.parseFloat(item[5]),
          high: Number.parseFloat(item[2]),
          low: Number.parseFloat(item[3]),
        }))
        const closingPrices = data.map((item) => item.close)
        const filteredPrices = removeOutliers(closingPrices)
        if (filteredPrices.length < 14) {
          results[pair] = {
            price: price.toFixed(9),
            sma: "N/A",
            ema: "N/A",
            rsi: "N/A",
            predictedPrice: "N/A",
            percentageChange: "N/A",
          }
          continue
        }
        const sma = calculateSMA(filteredPrices, 14)
        const ema = calculateEMA(filteredPrices, 14)
        const rsi = calculateRSI(filteredPrices, 14)
        const predictedPrice =
          sma !== null && ema !== null && filteredPrices.length > 0
            ? (sma * 0.3 + ema * 0.5 + linearRegressionPrediction(filteredPrices) * 0.2).toFixed(9)
            : "N/A"
        const percentageChange =
          price && predictedPrice !== "N/A"
            ? (((Number.parseFloat(predictedPrice) - price) / price) * 100).toFixed(2)
            : "N/A"
        results[pair] = {
          price: price.toFixed(9),
          sma: sma !== null ? sma.toFixed(2) : "N/A",
          ema: ema !== null ? ema.toFixed(2) : "N/A",
          rsi: rsi !== null ? rsi.toFixed(2) : "N/A",
          predictedPrice,
          percentageChange,
        }
      } catch (error) {
        console.error(`Error fetching data for ${pair}:`, error)
        results[pair] = {
          price: "N/A",
          sma: "N/A",
          ema: "N/A",
          rsi: "N/A",
          predictedPrice: "N/A",
          percentageChange: "N/A",
        }
      }
    }
    setModalData(results)
    setLoading(false)
  }


  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={iOSColors.gradients.background} style={styles.background}>
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons name="eye" size={32} color={iOSColors.button.primary} />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Market Eye</Text>
                  <Text style={styles.headerSubtitle}>Multi-Pair Analysis</Text>
                </View>
              </View>
            </View>

            {/* Timeframe Selector */}
            <View style={styles.timeframeSection}>
              <Text style={styles.sectionTitle}>Analysis Timeframe</Text>
              <View style={styles.timeframeContainer}>
                {timeframes.map((tf) => (
                  <TouchableOpacity
                    key={tf}
                    onPress={() => setSelectedTimeframe(tf)}
                    style={[styles.timeframeButton, selectedTimeframe === tf && styles.timeframeButtonActive]}
                  >
                    <Text style={[styles.timeframeText, selectedTimeframe === tf && styles.timeframeTextActive]}>
                      {tf}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Scan Section */}
            <View style={styles.scanSection}>
              <Text style={styles.scanTitle}>Scan All Coins for Growth Opportunities</Text>
              <Text style={styles.scanSubtitle}>Using advanced technical analysis to find top rising coins</Text>

              <TouchableOpacity onPress={scanAllCoins} style={styles.scanButton} disabled={loading || coinPairs.length === 0}>
                <LinearGradient colors={loading ? iOSColors.gradients.card : iOSColors.gradients.primary} style={styles.scanButtonGradient}>
                  {loading ? (
                    <View style={styles.loadingScan}>
                      <ActivityIndicator size="small" color={iOSColors.button.primary} />
                      <Text style={styles.scanButtonText}>Scanning... {Math.round(scanningProgress)}%</Text>
                    </View>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="radar" size={24} color={iOSColors.text.primary} />
                      <Text style={styles.scanButtonText}>Start Market Scan</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {loading && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          width: `${scanningProgress}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{Math.round(scanningProgress)}% Complete</Text>
                </View>
              )}
            </View>

            {/* Top Coins Display */}
            {topCoins.length > 0 && (
              <View style={styles.topCoinsContainer}>
                <Text style={styles.topCoinsTitle}>Top 5 Rising Coins</Text>
                {topCoins.map((coin, index) => (
                  <View key={index} style={styles.topCoinCard}>
                    <LinearGradient colors={iOSColors.gradients.card} style={styles.topCoinGradient}>
                      <View style={styles.topCoinHeader}>
                        <View style={styles.rankBadge}>
                          <Text style={styles.rankText}>#{index + 1}</Text>
                        </View>
                        <Text style={styles.topCoinSymbol}>{coin.pair}</Text>
                        <Text style={styles.topCoinPrice}>${coin.price.toFixed(6)}</Text>
                      </View>

                      <View style={styles.topCoinIndicators}>
                        <View style={styles.indicatorRow}>
                          <Text style={styles.indicatorLabel}>RSI:</Text>
                          <Text style={[styles.indicatorValue, { color: coin.rsi < 30 ? iOSColors.status.bullish : iOSColors.text.primary }]}>
                            {coin.rsi.toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.indicatorRow}>
                          <Text style={styles.indicatorLabel}>Volume Spike:</Text>
                          <Text style={[styles.indicatorValue, { color: coin.volumeSpike ? iOSColors.status.bullish : iOSColors.text.secondary }]}>
                            {coin.volumeSpike ? 'Yes' : 'No'}
                          </Text>
                        </View>
                        <View style={styles.indicatorRow}>
                          <Text style={styles.indicatorLabel}>Score:</Text>
                          <Text style={styles.indicatorValue}>{coin.score}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setSelectedPairs([coin.pair])
                          setModalVisible(true)
                          fetchModalData([coin.pair], modalTimeframe)
                        }}
                        style={styles.detailButton}
                      >
                        <Text style={styles.detailButtonText}>View Details</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        </LinearGradient>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <ScrollView style={styles.modalContainer} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={iOSColors.gradients.background} style={styles.modalBackground}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Market Analysis</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={iOSColors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.timeframeSection}>
              <Text style={styles.sectionTitle}>Analysis Timeframe</Text>
              <View style={styles.timeframeContainer}>
                {timeframes.map((tf) => (
                  <TouchableOpacity
                    key={tf}
                    onPress={() => {
                      setModalTimeframe(tf)
                      fetchModalData(selectedPairs, tf)
                    }}
                    style={[styles.timeframeButton, modalTimeframe === tf && styles.timeframeButtonActive]}
                  >
                    <Text style={[styles.timeframeText, modalTimeframe === tf && styles.timeframeTextActive]}>
                      {tf}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={iOSColors.button.primary} />
                <Text style={styles.loadingText}>Loading Market Data...</Text>
              </View>
            ) : (
              <View style={styles.modalPairsContainer}>
                {selectedPairs.map((pair, index) => (
                  <View key={index} style={styles.pairAnalysisCard}>
                    <LinearGradient colors={iOSColors.gradients.card} style={styles.pairAnalysisGradient}>
                      <View style={styles.pairHeaderModal}>
                        <Text style={styles.pairSymbolModal}>{pair}</Text>
                        <Text style={styles.pairPriceModal}>${modalData[pair]?.price || "Loading..."}</Text>
                      </View>

                      <View style={styles.indicatorsContainerModal}>
                        <View style={styles.indicatorRow}>
                          <Text style={styles.indicatorLabel}>SMA:</Text>
                          <Text style={styles.indicatorValue}>{modalData[pair]?.sma || "N/A"}</Text>
                        </View>
                        <View style={styles.indicatorRow}>
                          <Text style={styles.indicatorLabel}>EMA:</Text>
                          <Text style={styles.indicatorValue}>{modalData[pair]?.ema || "N/A"}</Text>
                        </View>
                        <View style={styles.indicatorRow}>
                          <Text style={styles.indicatorLabel}>RSI:</Text>
                          <Text style={styles.indicatorValue}>{modalData[pair]?.rsi || "N/A"}</Text>
                        </View>
                      </View>

                      <View style={styles.predictionContainerModal}>
                        <Text style={styles.predictionLabel}>Prediction:</Text>
                        <Text style={styles.predictionValue}>${modalData[pair]?.predictedPrice || "N/A"}</Text>
                        <Text
                          style={[
                            styles.changeValue,
                            {
                              color:
                                (modalData[pair]?.percentageChange || 0) > 0
                                  ? iOSColors.status.bullish
                                  : iOSColors.status.bearish,
                            },
                          ]}
                        >
                          {(modalData[pair]?.percentageChange || 0) > 0 ? "+" : ""}
                          {modalData[pair]?.percentageChange || "N/A"}%
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            )}
          </LinearGradient>
        </ScrollView>
      </Modal>
    </View>
  )
}

// Helper functions for technical indicators

const calculateSMA = (data, period) => {
  if (data.length < period) return null // Ensure enough data points
  const sum = data.slice(-period).reduce((acc, val) => acc + val, 0)
  return sum / period
}

const calculateEMA = (data, period) => {
  if (data.length < period) return null // Ensure enough data points
  const k = 2 / (period + 1) // Smoothing factor
  let ema = data[0] // Start with the first data point

  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k)
  }

  return ema
}

const calculateRSI = (data, period) => {
  if (data.length < period) return null // Ensure enough data points
  let gains = 0
  let losses = 0

  for (let i = 1; i < period; i++) {
    const change = data[i] - data[i - 1]
    if (change > 0) {
      gains += change
    } else {
      losses -= change
    }
  }

  const averageGain = gains / period
  const averageLoss = losses / period

  if (averageLoss === 0) return 100 // No losses means RSI is 100

  const rs = averageGain / averageLoss
  return 100 - 100 / (1 + rs)
}

const removeOutliers = (data) => {
  const q1 = data[Math.floor(data.length * 0.25)]
  const q3 = data[Math.floor(data.length * 0.75)]
  const iqr = q3 - q1
  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr
  return data.filter((value) => value >= lowerBound && value <= upperBound)
}

const linearRegressionPrediction = (prices) => {
  const n = prices.length
  const sumX = (n * (n - 1)) / 2
  const sumY = prices.reduce((acc, y) => acc + y, 0)
  const sumXY = prices.reduce((acc, y, i) => acc + i * y, 0)
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2)
  const intercept = (sumY - slope * sumX) / n

  return slope * n + intercept
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: iOSColors.background.primary,
  },
  background: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: w("5%"),
    paddingTop: h("7%"),
    paddingBottom: h("5%"),
  },
  header: {
    marginBottom: h("3%"),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextContainer: {
    marginLeft: w("3%"),
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: iOSColors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: iOSColors.text.primary,
    marginBottom: h("2%"),
  },
  timeframeSection: {
    marginBottom: h("3%"),
  },
  timeframeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeframeButton: {
    flex: 1,
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 12,
    paddingVertical: h("1.5%"),
    marginHorizontal: w("1%"),
    alignItems: "center",
    borderWidth: 1,
    borderColor: iOSColors.border.light,
  },
  timeframeButtonActive: {
    backgroundColor: iOSColors.button.primary,
    borderColor: iOSColors.button.primary,
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: "600",
    color: iOSColors.text.secondary,
  },
  timeframeTextActive: {
    color: iOSColors.text.primary,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: h("10%"),
  },
  loadingText: {
    color: iOSColors.text.secondary,
    fontSize: 16,
    marginTop: h("2%"),
  },
  pairsContainer: {
    flex: 1,
  },
  rowContainer: {
    marginBottom: h("3%"),
  },
  rowGradient: {
    borderRadius: 16,
    padding: w("5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  pairHeaders: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: h("2%"),
  },
  pairHeader: {
    flex: 1,
    alignItems: "center",
  },
  pairSymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: iOSColors.text.primary,
  },
  fetchButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: h("2%"),
    shadowColor: iOSColors.button.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fetchButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: h("1.5%"),
    paddingHorizontal: w("4%"),
  },
  fetchButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: iOSColors.text.primary,
    marginLeft: w("2%"),
  },
  resultsContainer: {
    // Container for results
  },
  resultCard: {
    marginBottom: h("2%"),
  },
  resultGradient: {
    borderRadius: 12,
    padding: w("4%"),
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: h("2%"),
  },
  resultSymbol: {
    fontSize: 18,
    fontWeight: "700",
    color: iOSColors.text.primary,
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: iOSColors.button.primary,
  },
  indicatorsContainer: {
    marginBottom: h("2%"),
  },
  indicatorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: h("1%"),
  },
  indicatorLabel: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    fontWeight: "500",
  },
  indicatorValue: {
    fontSize: 14,
    color: iOSColors.text.primary,
    fontWeight: "600",
  },
  predictionContainer: {
    borderTopWidth: 1,
    borderTopColor: iOSColors.border.light,
    paddingTop: h("2%"),
  },
  predictionLabel: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    marginBottom: h("1%"),
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: "600",
    color: iOSColors.text.primary,
    marginBottom: h("1%"),
  },
  changeValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: iOSColors.background.primary,
  },
  modalBackground: {
    flex: 1,
    paddingHorizontal: w("5%"),
    paddingTop: h("7%"),
    paddingBottom: h("5%"),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: h("3%"),
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: iOSColors.text.primary,
  },
  modalPairsContainer: {
    flex: 1,
  },
  pairAnalysisCard: {
    marginBottom: h("3%"),
  },
  pairAnalysisGradient: {
    borderRadius: 16,
    padding: w("5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  pairHeaderModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: h("2%"),
  },
  pairSymbolModal: {
    fontSize: 20,
    fontWeight: "700",
    color: iOSColors.text.primary,
  },
  pairPriceModal: {
    fontSize: 18,
    fontWeight: "600",
    color: iOSColors.button.primary,
  },
  indicatorsContainerModal: {
    marginBottom: h("2%"),
  },
  predictionContainerModal: {
    borderTopWidth: 1,
    borderTopColor: iOSColors.border.light,
    paddingTop: h("2%"),
  },
  scanSection: {
    alignItems: "center",
    marginBottom: h("4%"),
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: iOSColors.text.primary,
    textAlign: "center",
    marginBottom: h("1%"),
  },
  scanSubtitle: {
    fontSize: 16,
    color: iOSColors.text.secondary,
    textAlign: "center",
    marginBottom: h("3%"),
  },
  scanButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: iOSColors.button.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  scanButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: h("2%"),
    paddingHorizontal: w("8%"),
  },
  loadingScan: {
    flexDirection: "row",
    alignItems: "center",
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: iOSColors.text.primary,
    marginLeft: w("2%"),
  },
  progressContainer: {
    marginTop: h("3%"),
    alignItems: "center",
  },
  progressBar: {
    width: w("80%"),
    height: 8,
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: iOSColors.button.primary,
    borderRadius: 4,
  },
  progressText: {
    marginTop: h("1%"),
    fontSize: 14,
    color: iOSColors.text.secondary,
  },
  topCoinsContainer: {
    flex: 1,
  },
  topCoinsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: iOSColors.text.primary,
    textAlign: "center",
    marginBottom: h("2%"),
  },
  topCoinCard: {
    marginBottom: h("2%"),
  },
  topCoinGradient: {
    borderRadius: 16,
    padding: w("5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  topCoinHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: h("2%"),
  },
  rankBadge: {
    backgroundColor: iOSColors.button.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: w("3%"),
  },
  rankText: {
    fontSize: 12,
    fontWeight: "700",
    color: iOSColors.text.primary,
  },
  topCoinSymbol: {
    fontSize: 18,
    fontWeight: "700",
    color: iOSColors.text.primary,
    flex: 1,
  },
  topCoinPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: iOSColors.button.primary,
  },
  topCoinIndicators: {
    marginBottom: h("2%"),
  },
  detailButton: {
    backgroundColor: iOSColors.button.primary,
    borderRadius: 8,
    paddingVertical: h("1%"),
    paddingHorizontal: w("4%"),
    alignSelf: "flex-start",
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: iOSColors.text.primary,
  },
})

export default MarketEye

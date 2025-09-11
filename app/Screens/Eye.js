import { StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput, ActivityIndicator, Alert, Animated, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as w, heightPercentageToDP as h } from 'react-native-responsive-screen';
import axios from 'axios';
import { db } from '../Firebase/fireConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import iOSColors from '../Commponents/Colors';

const MarketEye = () => {
  const [newPair, setNewPair] = useState('');
  const [pairsFromFirestore, setPairsFromFirestore] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [loadingRows, setLoadingRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const timeframes = ['5m', '15m', '30m', '1h', '4h', '1d'];
  
  useEffect(() => {
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
    ]).start();

    fetchPairsFromFirestore();
  }, []);

  const fetchPairsFromFirestore = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'currencyPairs'));
      const pairs = querySnapshot.docs.map(doc => doc.data().pair);
      setPairsFromFirestore(pairs);
      // Save pairs to the global array
      currencyPairsArray = pairs;
      console.log("Currency pairs saved in array:", currencyPairsArray);
    } catch (error) {
      console.error("Error fetching pairs from Firestore:", error);
    }
    setLoading(false);
  };

  const checkPairInFirestore = async (pair) => {
    try {
      const q = query(collection(db, 'currencyPairs'), where('pair', '==', pair.toUpperCase()));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.length > 0;
    } catch (error) {
      console.error("Error checking pair in Firestore:", error);
      return false;
    }
  };

  const addPairToFirestore = async () => {
    if (!newPair) return;

    const exists = await checkPairInFirestore(newPair);
    if (exists) {
      alert('This pair has already been added.');
      return;
    }

    try {
      await addDoc(collection(db, 'currencyPairs'), { pair: newPair.toUpperCase() });
      setNewPair('');
      fetchPairsFromFirestore();
    } catch (error) {
      console.error("Error adding pair to Firestore:", error);
    }
  };

  const fetchDataForPairs = async (pairs, row) => {
    setLoadingRows((prevState) => ({ ...prevState, [row]: true }));
    let results = [];
  
    for (let pair of pairs) {
      try {
        const resPrice = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
        const price = parseFloat(resPrice.data.price);
  
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
          });
          continue;
        }
  
        const resHistorical = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1h&limit=200`);
        const data = resHistorical.data.map(item => ({
          close: parseFloat(item[4]),
          volume: parseFloat(item[5]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
        }));
  
        const closingPrices = data.map(item => item.close);
        const filteredPrices = removeOutliers(closingPrices);
  
        // Add the condition to check if there is enough data to calculate indicators
        if (filteredPrices.length < 14) {
          console.warn(`Not enough data for ${pair} to calculate indicators.`);
          results.push({
            pair,
            price: price.toFixed(9),
            sma: "N/A",
            ema: "N/A",
            rsi: "N/A",
            predictedPrice: "N/A",
            percentageChange: "N/A",
          });
          continue;  // Skip further processing for this pair
        }
  
        const sma = calculateSMA(filteredPrices, 14);
        const ema = calculateEMA(filteredPrices, 14);
        const rsi = calculateRSI(filteredPrices, 14);
  
        const predictedPrice = sma !== "N/A" && ema !== "N/A" && filteredPrices.length > 0
          ? (sma * 0.3 + ema * 0.5 + linearRegressionPrediction(filteredPrices) * 0.2).toFixed(9)
          : "N/A";
  
        const percentageChange = price && predictedPrice !== "N/A"
          ? ((parseFloat(predictedPrice) - price) / price * 100).toFixed(2)
          : "N/A";
  
        results.push({
          pair,
          price: price.toFixed(9),
          sma: sma !== "N/A" ? sma.toFixed(2) : "N/A",
          ema: ema !== "N/A" ? ema.toFixed(2) : "N/A",
          rsi: rsi !== "N/A" ? rsi.toFixed(2) : "N/A",
          predictedPrice,
          percentageChange,
        });
  
      } catch (error) {
        console.error(`Error fetching data for ${pair}:`, error);
        results.push({
          pair,
          price: "N/A",
          sma: "N/A",
          ema: "N/A",
          rsi: "N/A",
          predictedPrice: "N/A",
          percentageChange: "N/A",
        });
      }
    }
  
    setMarketData((prevState) => ({ ...prevState, [row]: results }));
    setLoadingRows((prevState) => ({ ...prevState, [row]: false }));
  };
  
  

  // Group pairs into rows of 5
  const groupedPairs = [];
  for (let i = 0; i < pairsFromFirestore.length; i += 5) {
    groupedPairs.push(pairsFromFirestore.slice(i, i + 5));
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={iOSColors.gradients.background}
        style={styles.background}
      >
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
              <MaterialCommunityIcons
                name="eye"
                size={32}
                color={iOSColors.button.primary}
              />
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Market Eye</Text>
                <Text style={styles.headerSubtitle}>Multi-Pair Analysis</Text>
              </View>
            </View>
          </View>

          {/* Add Pair Section */}
          <View style={styles.addPairSection}>
            <LinearGradient
              colors={iOSColors.gradients.card}
              style={styles.addPairGradient}
            >
              <Text style={styles.sectionTitle}>Add Currency Pair</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter pair (e.g. BTCUSDT)"
                  placeholderTextColor={iOSColors.text.tertiary}
                  value={newPair}
                  onChangeText={setNewPair}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  onPress={addPairToFirestore}
                  style={styles.addButton}
                  disabled={!newPair.trim()}
                >
                  <LinearGradient
                    colors={!newPair.trim() ? iOSColors.gradients.card : iOSColors.gradients.primary}
                    style={styles.addButtonGradient}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color={!newPair.trim() ? iOSColors.text.tertiary : iOSColors.text.primary}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Timeframe Selector */}
          <View style={styles.timeframeSection}>
            <Text style={styles.sectionTitle}>Analysis Timeframe</Text>
            <View style={styles.timeframeContainer}>
              {timeframes.map((tf) => (
                <TouchableOpacity
                  key={tf}
                  onPress={() => setSelectedTimeframe(tf)}
                  style={[
                    styles.timeframeButton,
                    selectedTimeframe === tf && styles.timeframeButtonActive
                  ]}
                >
                  <Text style={[
                    styles.timeframeText,
                    selectedTimeframe === tf && styles.timeframeTextActive
                  ]}>
                    {tf}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pairs Analysis */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={iOSColors.button.primary} />
              <Text style={styles.loadingText}>Loading Market Data...</Text>
            </View>
          ) : (
            <View style={styles.pairsContainer}>
              {groupedPairs.map((rowPairs, rowIndex) => (
                <View key={rowIndex} style={styles.rowContainer}>
                  <LinearGradient
                    colors={iOSColors.gradients.card}
                    style={styles.rowGradient}
                  >
                    {/* Pair Headers */}
                    <View style={styles.pairHeaders}>
                      {rowPairs.map((pair, index) => (
                        <View key={index} style={styles.pairHeader}>
                          <Text style={styles.pairSymbol}>{pair}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Fetch Button */}
                    <TouchableOpacity
                      onPress={() => fetchDataForPairs(rowPairs, rowIndex + 1)}
                      style={styles.fetchButton}
                      disabled={loadingRows[rowIndex + 1]}
                    >
                      <LinearGradient
                        colors={loadingRows[rowIndex + 1] ? iOSColors.gradients.card : iOSColors.gradients.primary}
                        style={styles.fetchButtonGradient}
                      >
                        {loadingRows[rowIndex + 1] ? (
                          <ActivityIndicator size="small" color={iOSColors.button.primary} />
                        ) : (
                          <>
                            <MaterialCommunityIcons
                              name="chart-line"
                              size={20}
                              color={iOSColors.text.primary}
                            />
                            <Text style={styles.fetchButtonText}>Analyze</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Results */}
                    {marketData[rowIndex + 1] && (
                      <View style={styles.resultsContainer}>
                        {marketData[rowIndex + 1].map((item, idx) => (
                          <View key={idx} style={styles.resultCard}>
                            <LinearGradient
                              colors={iOSColors.gradients.secondary}
                              style={styles.resultGradient}
                            >
                              <View style={styles.resultHeader}>
                                <Text style={styles.resultSymbol}>{item.pair}</Text>
                                <Text style={styles.resultPrice}>${item.price}</Text>
                              </View>

                              <View style={styles.indicatorsContainer}>
                                <View style={styles.indicatorRow}>
                                  <Text style={styles.indicatorLabel}>SMA:</Text>
                                  <Text style={styles.indicatorValue}>{item.sma}</Text>
                                </View>
                                <View style={styles.indicatorRow}>
                                  <Text style={styles.indicatorLabel}>EMA:</Text>
                                  <Text style={styles.indicatorValue}>{item.ema}</Text>
                                </View>
                                <View style={styles.indicatorRow}>
                                  <Text style={styles.indicatorLabel}>RSI:</Text>
                                  <Text style={styles.indicatorValue}>{item.rsi}</Text>
                                </View>
                              </View>

                              <View style={styles.predictionContainer}>
                                <Text style={styles.predictionLabel}>Prediction:</Text>
                                <Text style={styles.predictionValue}>${item.predictedPrice}</Text>
                                <Text style={[
                                  styles.changeValue,
                                  { color: item.percentageChange > 0 ? iOSColors.status.bullish : iOSColors.status.bearish }
                                ]}>
                                  {item.percentageChange > 0 ? '+' : ''}{item.percentageChange}%
                                </Text>
                              </View>
                            </LinearGradient>
                          </View>
                        ))}
                      </View>
                    )}
                  </LinearGradient>
                </View>
              ))}

              {pairsFromFirestore.length === 0 && (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="eye-off"
                    size={60}
                    color={iOSColors.text.tertiary}
                  />
                  <Text style={styles.emptyText}>No currency pairs added</Text>
                  <Text style={styles.emptySubtext}>Add pairs above to start monitoring</Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
};

// Helper functions for technical indicators

const calculateSMA = (data, period) => {
  if (data.length < period) return null; // Ensure enough data points
  const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
  return sum / period;
};

const calculateEMA = (data, period) => {
  if (data.length < period) return null; // Ensure enough data points
  const k = 2 / (period + 1); // Smoothing factor
  let ema = data[0]; // Start with the first data point

  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }

  return ema;
};

const calculateRSI = (data, period) => {
  if (data.length < period) return null; // Ensure enough data points
  let gains = 0;
  let losses = 0;

  for (let i = 1; i < period; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  const averageGain = gains / period;
  const averageLoss = losses / period;

  if (averageLoss === 0) return 100; // No losses means RSI is 100

  const rs = averageGain / averageLoss;
  return 100 - (100 / (1 + rs));
};

const removeOutliers = (data) => {
  const q1 = data[Math.floor(data.length * 0.25)];
  const q3 = data[Math.floor(data.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  return data.filter(value => value >= lowerBound && value <= upperBound);
};

const linearRegressionPrediction = (prices) => {
  const n = prices.length;
  const sumX = n * (n - 1) / 2;
  const sumY = prices.reduce((acc, y) => acc + y, 0);
  const sumXY = prices.reduce((acc, y, i) => acc + i * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
  const intercept = (sumY - slope * sumX) / n;

  return slope * n + intercept;
};

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
    paddingHorizontal: w('5%'),
    paddingTop: h('7%'),
    paddingBottom: h('5%'),
  },
  header: {
    marginBottom: h('3%'),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: w('3%'),
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: iOSColors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    fontWeight: '500',
  },
  addPairSection: {
    marginBottom: h('3%'),
  },
  addPairGradient: {
    borderRadius: 16,
    padding: w('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('2%'),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 12,
    padding: w('4%'),
    fontSize: 16,
    color: iOSColors.text.primary,
    borderWidth: 1,
    borderColor: iOSColors.border.light,
    marginRight: w('3%'),
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: iOSColors.button.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeframeSection: {
    marginBottom: h('3%'),
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeframeButton: {
    flex: 1,
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 12,
    paddingVertical: h('1.5%'),
    marginHorizontal: w('1%'),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: iOSColors.border.light,
  },
  timeframeButtonActive: {
    backgroundColor: iOSColors.button.primary,
    borderColor: iOSColors.button.primary,
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
    color: iOSColors.text.secondary,
  },
  timeframeTextActive: {
    color: iOSColors.text.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: h('10%'),
  },
  loadingText: {
    color: iOSColors.text.secondary,
    fontSize: 16,
    marginTop: h('2%'),
  },
  pairsContainer: {
    flex: 1,
  },
  rowContainer: {
    marginBottom: h('3%'),
  },
  rowGradient: {
    borderRadius: 16,
    padding: w('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  pairHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: h('2%'),
  },
  pairHeader: {
    flex: 1,
    alignItems: 'center',
  },
  pairSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: iOSColors.text.primary,
  },
  fetchButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: h('2%'),
    shadowColor: iOSColors.button.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fetchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: h('1.5%'),
    paddingHorizontal: w('4%'),
  },
  fetchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginLeft: w('2%'),
  },
  resultsContainer: {
    // Container for results
  },
  resultCard: {
    marginBottom: h('2%'),
  },
  resultGradient: {
    borderRadius: 12,
    padding: w('4%'),
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h('2%'),
  },
  resultSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: iOSColors.text.primary,
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.button.primary,
  },
  indicatorsContainer: {
    marginBottom: h('2%'),
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: h('1%'),
  },
  indicatorLabel: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    fontWeight: '500',
  },
  indicatorValue: {
    fontSize: 14,
    color: iOSColors.text.primary,
    fontWeight: '600',
  },
  predictionContainer: {
    borderTopWidth: 1,
    borderTopColor: iOSColors.border.light,
    paddingTop: h('2%'),
  },
  predictionLabel: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    marginBottom: h('1%'),
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('1%'),
  },
  changeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: h('10%'),
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginTop: h('2%'),
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    textAlign: 'center',
  },
});

export default MarketEye;
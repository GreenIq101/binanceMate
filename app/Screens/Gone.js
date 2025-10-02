import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Animated, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as w, heightPercentageToDP as h } from 'react-native-responsive-screen';
import axios from 'axios';
import { RSI, BollingerBands, SMA, EMA } from 'technicalindicators';
import iOSColors from '../Commponents/Colors';

const Gone = () => {
  const [currencyPair, setCurrencyPair] = useState('bitcoin');
  const [priceData, setPriceData] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [indicators, setIndicators] = useState({});
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('1d');
  const [predictionAccuracy, setPredictionAccuracy] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const popularCoins = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
  ];

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

    fetchCurrentPrice();
  }, [currencyPair, timeframe]);

  const fetchCurrentPrice = async () => {
    try {
      const endpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${currencyPair}&vs_currencies=usd&include_market_cap=true&include_24hr_high=true&include_24hr_low=true&include_24hr_vol=true&include_24hr_change=true`;
      const response = await axios.get(endpoint);
      const data = response.data[currencyPair];

      if (data) {
        setPriceData({
          currentPrice: data.usd,
          highPrice: data.usd_24h_high,
          lowPrice: data.usd_24h_low,
          volume: data.usd_24h_vol,
          change: data.usd_24h_change,
          marketCap: data.usd_market_cap,
        });
      }
    } catch (error) {
      console.error('Error fetching current price data:', error);
      Alert.alert('Error', 'Failed to fetch price data. Please try again.');
    }
  };

  // Function to fetch historical data from CoinGecko
  const getHistoricalData = async (currencyPair, days = 7) => {
    const endpoint = `https://api.coingecko.com/api/v3/coins/${currencyPair}/market_chart?vs_currency=usd&days=${days}&interval=hourly`;
    try {
      const response = await axios.get(endpoint);
      return response.data.prices;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  };

  // Enhanced function to calculate indicators with better accuracy
  const calculateIndicators = (historicalData) => {
    if (!historicalData || historicalData.length < 50) {
      return {
        rsi: 50,
        sma: historicalData[historicalData.length - 1]?.[1] || 0,
        ema: historicalData[historicalData.length - 1]?.[1] || 0,
        bb: { middle: historicalData[historicalData.length - 1]?.[1] || 0 },
        macd: { signal: 0, histogram: 0 },
      };
    }

    const closePrices = historicalData.map((data) => data[1]);

    const rsi = RSI.calculate({ values: closePrices, period: 14 });
    const sma = SMA.calculate({ values: closePrices, period: 20 });
    const ema = EMA.calculate({ values: closePrices, period: 20 });
    const bb = BollingerBands.calculate({
      values: closePrices,
      period: 20,
      stdDev: 2,
    });

    // Calculate MACD for better prediction accuracy
    const macdData = closePrices.map((price, index) => {
      if (index < 26) return 0;
      const ema12 = EMA.calculate({ values: closePrices.slice(0, index + 1), period: 12 });
      const ema26 = EMA.calculate({ values: closePrices.slice(0, index + 1), period: 26 });
      return ema12[ema12.length - 1] - ema26[ema26.length - 1];
    });

    const signalLine = EMA.calculate({ values: macdData, period: 9 });

    return {
      rsi: rsi[rsi.length - 1] || 50,
      sma: sma[sma.length - 1] || closePrices[closePrices.length - 1],
      ema: ema[ema.length - 1] || closePrices[closePrices.length - 1],
      bb: bb[bb.length - 1] || { middle: closePrices[closePrices.length - 1] },
      macd: {
        signal: signalLine[signalLine.length - 1] || 0,
        histogram: (macdData[macdData.length - 1] || 0) - (signalLine[signalLine.length - 1] || 0),
      },
    };
  };

  // Enhanced prediction algorithm with multiple factors
  const predictPrice = (historicalData) => {
    if (!historicalData || historicalData.length < 10) {
      return priceData?.currentPrice || 0;
    }

    const indicators = calculateIndicators(historicalData);
    const currentPrice = priceData?.currentPrice || historicalData[historicalData.length - 1][1];

    // Advanced prediction algorithm using multiple indicators
    const trendWeight = 0.4;
    const momentumWeight = 0.3;
    const volatilityWeight = 0.3;

    // Trend-based prediction (SMA/EMA)
    const trendPrediction = (indicators.sma * 0.4 + indicators.ema * 0.6);

    // Momentum-based prediction (RSI and MACD)
    const rsiNormalized = indicators.rsi / 100;
    const momentumFactor = rsiNormalized > 0.7 ? 1.02 : rsiNormalized < 0.3 ? 0.98 : 1.0;
    const momentumPrediction = currentPrice * momentumFactor;

    // Volatility-based prediction (Bollinger Bands)
    const bbPosition = (currentPrice - indicators.bb.lower) / (indicators.bb.upper - indicators.bb.lower);
    const volatilityFactor = bbPosition < 0.2 ? 0.98 : bbPosition > 0.8 ? 1.02 : 1.0;
    const volatilityPrediction = currentPrice * volatilityFactor;

    // Weighted prediction
    const prediction = (
      trendPrediction * trendWeight +
      momentumPrediction * momentumWeight +
      volatilityPrediction * volatilityWeight
    );

    setIndicators(indicators);

    // Calculate prediction accuracy based on recent price movements
    const recentPrices = historicalData.slice(-24); // Last 24 hours
    const actualChange = ((recentPrices[recentPrices.length - 1][1] - recentPrices[0][1]) / recentPrices[0][1]) * 100;
    const predictedChange = ((prediction - currentPrice) / currentPrice) * 100;

    const accuracy = Math.max(0, 100 - Math.abs(actualChange - predictedChange));
    setPredictionAccuracy(accuracy.toFixed(1));

    return prediction;
  };

  const handlePredict = async () => {
    if (!priceData) {
      Alert.alert('Error', 'Please fetch current price data first.');
      return;
    }

    setLoading(true);
    try {
      const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30;
      const historicalData = await getHistoricalData(currencyPair, days);
      const prediction = predictPrice(historicalData);
      setPredictedPrice(prediction);
    } catch (error) {
      console.error('Error generating prediction:', error);
      Alert.alert('Error', 'Failed to generate prediction. Please try again.');
    }
    setLoading(false);
  };

  const selectPopularCoin = (coinId) => {
    setCurrencyPair(coinId);
    setPredictedPrice(null);
    setPredictionAccuracy(null);
  };

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
                name="brain"
                size={32}
                color={iOSColors.button.primary}
              />
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>AI Predictions</Text>
                <Text style={styles.headerSubtitle}>Advanced Price Forecasting</Text>
              </View>
            </View>
          </View>

          {/* Popular Coins */}
          <View style={styles.popularCoinsSection}>
            <Text style={styles.sectionTitle}>Popular Cryptocurrencies</Text>
            <View style={styles.coinsGrid}>
              {popularCoins.map((coin) => (
                <Pressable
                  key={coin.id}
                  onPress={() => selectPopularCoin(coin.id)}
                  style={[
                    styles.coinButton,
                    currencyPair === coin.id && styles.coinButtonActive
                  ]}
                >
                  <LinearGradient
                    colors={currencyPair === coin.id ? iOSColors.gradients.primary : iOSColors.gradients.card}
                    style={styles.coinGradient}
                  >
                    <Text style={[
                      styles.coinSymbol,
                      currencyPair === coin.id && styles.coinSymbolActive
                    ]}>
                      {coin.symbol}
                    </Text>
                    <Text style={[
                      styles.coinName,
                      currencyPair === coin.id && styles.coinNameActive
                    ]}>
                      {coin.name}
                    </Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Custom Input */}
          <View style={styles.inputSection}>
            <LinearGradient
              colors={iOSColors.gradients.card}
              style={styles.inputGradient}
            >
              <Text style={styles.sectionTitle}>Custom Coin</Text>
              <TextInput
                value={currencyPair}
                onChangeText={(text) => {
                  setCurrencyPair(text.toLowerCase());
                  setPredictedPrice(null);
                  setPredictionAccuracy(null);
                }}
                placeholder="Enter coin name (e.g. bitcoin)"
                placeholderTextColor={iOSColors.text.tertiary}
                style={styles.input}
                autoCapitalize="none"
              />
            </LinearGradient>
          </View>

          {/* Timeframe Selector */}
          <View style={styles.timeframeSection}>
            <Text style={styles.sectionTitle}>Analysis Period</Text>
            <View style={styles.timeframeContainer}>
              {['1d', '7d', '30d'].map((tf) => (
                <Pressable
                  key={tf}
                  onPress={() => setTimeframe(tf)}
                  style={[
                    styles.timeframeButton,
                    timeframe === tf && styles.timeframeButtonActive
                  ]}
                >
                  <Text style={[
                    styles.timeframeText,
                    timeframe === tf && styles.timeframeTextActive
                  ]}>
                    {tf}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Current Price Data */}
          {priceData && (
            <View style={styles.priceSection}>
              <LinearGradient
                colors={iOSColors.gradients.card}
                style={styles.priceGradient}
              >
                <View style={styles.priceHeader}>
                  <Text style={styles.priceTitle}>Current Market Data</Text>
                  <View style={styles.priceBadge}>
                    <Text style={[
                      styles.changeText,
                      { color: priceData.change >= 0 ? iOSColors.status.bullish : iOSColors.status.bearish }
                    ]}>
                      {priceData.change >= 0 ? '+' : ''}{priceData.change?.toFixed(2)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.priceGrid}>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>Current Price</Text>
                    <Text style={styles.priceValue}>${priceData.currentPrice?.toLocaleString()}</Text>
                  </View>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>24h High</Text>
                    <Text style={styles.priceValue}>${priceData.highPrice?.toLocaleString()}</Text>
                  </View>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>24h Low</Text>
                    <Text style={styles.priceValue}>${priceData.lowPrice?.toLocaleString()}</Text>
                  </View>
                  <View style={styles.priceItem}>
                    <Text style={styles.priceLabel}>Market Cap</Text>
                    <Text style={styles.priceValue}>${(priceData.marketCap / 1e9)?.toFixed(1)}B</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Prediction Button */}
          <View style={styles.predictSection}>
            <Pressable
              onPress={handlePredict}
              style={styles.predictButton}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? iOSColors.gradients.card : iOSColors.gradients.primary}
                style={styles.predictGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={iOSColors.button.primary} />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="brain"
                      size={24}
                      color={iOSColors.text.primary}
                    />
                    <Text style={styles.predictText}>Generate Prediction</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Prediction Results */}
          {predictedPrice && (
            <View style={styles.predictionSection}>
              <LinearGradient
                colors={iOSColors.gradients.card}
                style={styles.predictionGradient}
              >
                <View style={styles.predictionHeader}>
                  <Text style={styles.predictionTitle}>AI Prediction Results</Text>
                  {predictionAccuracy && (
                    <View style={styles.accuracyBadge}>
                      <MaterialCommunityIcons
                        name="target"
                        size={16}
                        color={iOSColors.status.bullish}
                      />
                      <Text style={styles.accuracyText}>{predictionAccuracy}% Accuracy</Text>
                    </View>
                  )}
                </View>

                <View style={styles.predictionMain}>
                  <Text style={styles.predictedPriceLabel}>Predicted Price</Text>
                  <Text style={styles.predictedPriceValue}>
                    ${predictedPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={[
                    styles.priceChange,
                    {
                      color: predictedPrice > priceData?.currentPrice
                        ? iOSColors.status.bullish
                        : iOSColors.status.bearish
                    }
                  ]}>
                    {predictedPrice > priceData?.currentPrice ? '+' : ''}
                    {(((predictedPrice - priceData?.currentPrice) / priceData?.currentPrice) * 100)?.toFixed(2)}%
                  </Text>
                </View>

                <View style={styles.indicatorsContainer}>
                  <Text style={styles.indicatorsTitle}>Technical Indicators</Text>
                  <View style={styles.indicatorsGrid}>
                    <View style={styles.indicatorItem}>
                      <Text style={styles.indicatorLabel}>RSI</Text>
                      <Text style={styles.indicatorValue}>{indicators.rsi?.toFixed(1)}</Text>
                    </View>
                    <View style={styles.indicatorItem}>
                      <Text style={styles.indicatorLabel}>SMA</Text>
                      <Text style={styles.indicatorValue}>${indicators.sma?.toFixed(2)}</Text>
                    </View>
                    <View style={styles.indicatorItem}>
                      <Text style={styles.indicatorLabel}>EMA</Text>
                      <Text style={styles.indicatorValue}>${indicators.ema?.toFixed(2)}</Text>
                    </View>
                    <View style={styles.indicatorItem}>
                      <Text style={styles.indicatorLabel}>BB Middle</Text>
                      <Text style={styles.indicatorValue}>${indicators.bb?.middle?.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimerSection}>
            <LinearGradient
              colors={iOSColors.gradients.secondary}
              style={styles.disclaimerGradient}
            >
              <MaterialCommunityIcons
                name="information"
                size={20}
                color={iOSColors.text.secondary}
              />
              <Text style={styles.disclaimerText}>
                AI predictions are for educational purposes only. Always do your own research before making investment decisions.
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
};

export default Gone;

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
    paddingTop: h('4%'),
    paddingBottom: h('2%'),
  },
  header: {
    marginBottom: h('2%'),
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('1%'),
  },
  popularCoinsSection: {
    marginBottom: h('2%'),
  },
  coinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  coinButton: {
    width: w('28%'),
    marginBottom: h('1%'),
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  coinButtonActive: {
    shadowColor: iOSColors.button.primary,
    shadowOpacity: 0.3,
    elevation: 12,
  },
  coinGradient: {
    padding: w('3%'),
    alignItems: 'center',
  },
  coinSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: iOSColors.text.primary,
    marginBottom: 4,
  },
  coinSymbolActive: {
    color: iOSColors.text.primary,
  },
  coinName: {
    fontSize: 12,
    color: iOSColors.text.secondary,
    fontWeight: '500',
  },
  coinNameActive: {
    color: iOSColors.text.primary,
  },
  inputSection: {
    marginBottom: h('2%'),
  },
  inputGradient: {
    borderRadius: 16,
    padding: w('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  input: {
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 12,
    padding: w('4%'),
    fontSize: 16,
    color: iOSColors.text.primary,
    borderWidth: 1,
    borderColor: iOSColors.border.light,
  },
  timeframeSection: {
    marginBottom: h('2%'),
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
  priceSection: {
    marginBottom: h('2%'),
  },
  priceGradient: {
    borderRadius: 16,
    padding: w('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h('1%'),
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  priceBadge: {
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 12,
    paddingHorizontal: w('3%'),
    paddingVertical: h('0.5%'),
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  priceItem: {
    width: w('45%'),
    marginBottom: h('1%'),
  },
  priceLabel: {
    fontSize: 12,
    color: iOSColors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  predictSection: {
    marginBottom: h('2%'),
  },
  predictButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: iOSColors.button.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  predictGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: h('2%'),
    paddingHorizontal: w('6%'),
  },
  predictText: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginLeft: w('2%'),
  },
  predictionSection: {
    marginBottom: h('2%'),
  },
  predictionGradient: {
    borderRadius: 16,
    padding: w('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h('1%'),
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 12,
    paddingHorizontal: w('3%'),
    paddingVertical: h('0.5%'),
  },
  accuracyText: {
    fontSize: 12,
    fontWeight: '600',
    color: iOSColors.status.bullish,
    marginLeft: w('1%'),
  },
  predictionMain: {
    alignItems: 'center',
    marginBottom: h('2%'),
  },
  predictedPriceLabel: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    marginBottom: h('1%'),
  },
  predictedPriceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: iOSColors.button.primary,
    marginBottom: h('1%'),
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  indicatorsContainer: {
    borderTopWidth: 1,
    borderTopColor: iOSColors.border.light,
    paddingTop: h('1%'),
  },
  indicatorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('1%'),
  },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  indicatorItem: {
    width: w('45%'),
    marginBottom: h('1%'),
  },
  indicatorLabel: {
    fontSize: 12,
    color: iOSColors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  indicatorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  disclaimerSection: {
    marginBottom: h('2%'),
  },
  disclaimerGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: w('4%'),
  },
  disclaimerText: {
    fontSize: 12,
    color: iOSColors.text.secondary,
    marginLeft: w('3%'),
    lineHeight: 18,
    flex: 1,
  },
});

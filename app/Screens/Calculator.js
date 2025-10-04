import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as w, heightPercentageToDP as h } from 'react-native-responsive-screen';
import iOSColors from '../Commponents/Colors';
import axios from 'axios';

const { width } = Dimensions.get('window');

const Calculator = () => {
  const [investment, setInvestment] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [positionSize, setPositionSize] = useState('');
  const [riskPercentage, setRiskPercentage] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [results, setResults] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [coinSearch, setCoinSearch] = useState('');
  const [popularCoins, setPopularCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [showCoinSelector, setShowCoinSelector] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    fetchPopularCoins();
  }, []);

  useEffect(() => {
    if (coinSearch.length > 0) {
      const filtered = popularCoins.filter(coin =>
        coin.name.toLowerCase().includes(coinSearch.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(coinSearch.toLowerCase())
      );
      setFilteredCoins(filtered);
    } else {
      setFilteredCoins(popularCoins.slice(0, 10)); // Show top 10 by default
    }
  }, [coinSearch, popularCoins]);

  const fetchPopularCoins = async () => {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      const data = response.data;

      // Get top coins by volume
      const topCoins = data
        .filter(coin => coin.symbol.endsWith('USDT') && parseFloat(coin.quoteVolume) > 5000000)
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 50)
        .map(coin => ({
          symbol: coin.symbol.replace('USDT', ''),
          name: getCoinName(coin.symbol.replace('USDT', '')),
          price: parseFloat(coin.lastPrice),
          change24h: parseFloat(coin.priceChangePercent)
        }));

      setPopularCoins(topCoins);
      setFilteredCoins(topCoins.slice(0, 10));
    } catch (error) {
      console.error('Error fetching coins:', error);
      // Fallback data
      const fallbackCoins = [
        { symbol: 'BTC', name: 'Bitcoin', price: 45000, change24h: 2.5 },
        { symbol: 'ETH', name: 'Ethereum', price: 2800, change24h: 1.8 },
        { symbol: 'BNB', name: 'Binance Coin', price: 320, change24h: -0.5 },
        { symbol: 'ADA', name: 'Cardano', price: 0.45, change24h: 3.2 },
        { symbol: 'SOL', name: 'Solana', price: 95, change24h: 4.1 },
      ];
      setPopularCoins(fallbackCoins);
      setFilteredCoins(fallbackCoins);
    }
  };

  const getCoinName = (symbol) => {
    const coinNames = {
      BTC: 'Bitcoin', ETH: 'Ethereum', BNB: 'Binance Coin', ADA: 'Cardano',
      SOL: 'Solana', DOT: 'Polkadot', DOGE: 'Dogecoin', AVAX: 'Avalanche',
      LTC: 'Litecoin', MATIC: 'Polygon', XRP: 'Ripple', LINK: 'Chainlink',
      UNI: 'Uniswap', ALGO: 'Algorand', VET: 'VeChain', ICP: 'Internet Computer',
      FIL: 'Filecoin', TRX: 'Tron', ETC: 'Ethereum Classic', XLM: 'Stellar'
    };
    return coinNames[symbol] || symbol;
  };

  const selectCoin = async (coin) => {
    setSelectedCoin(coin.symbol);
    setShowCoinSelector(false);
    setCoinSearch('');
    setIsLoadingPrice(true);

    try {
      // Fetch current price
      const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${coin.symbol}USDT`);
      const currentPrice = parseFloat(response.data.price);
      setCurrentPrice(currentPrice.toString());
    } catch (error) {
      console.error('Error fetching price:', error);
      Alert.alert('Error', 'Failed to fetch current price');
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const calculateProfitLoss = () => {
    const invest = parseFloat(investment);
    const current = parseFloat(currentPrice);
    const target = parseFloat(targetPrice);

    if (!invest || !current || !target) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const coins = invest / current;
    const targetValue = coins * target;
    const profitLoss = targetValue - invest;
    const percentage = ((target - current) / current) * 100;

    setResults({
      coins,
      targetValue,
      profitLoss,
      percentage,
      type: profitLoss >= 0 ? 'profit' : 'loss'
    });
    setShowResultsModal(true);
  };

  const calculatePositionSize = () => {
    const totalCapital = parseFloat(positionSize);
    const riskPercent = parseFloat(riskPercentage);
    const entryPrice = parseFloat(currentPrice);
    const stopPrice = parseFloat(stopLoss);

    if (!totalCapital || !riskPercent || !entryPrice || !stopPrice) {
      Alert.alert('Error', 'Please fill in all position size fields');
      return;
    }

    const riskAmount = (totalCapital * riskPercent) / 100;
    const riskPerCoin = Math.abs(entryPrice - stopPrice);
    const positionSizeCoins = riskAmount / riskPerCoin;
    const positionValue = positionSizeCoins * entryPrice;

    setResults({
      riskAmount,
      riskPerCoin,
      positionSizeCoins,
      positionValue,
      maxLoss: riskAmount,
      type: 'position'
    });
    setShowResultsModal(true);
  };

  const calculateBreakEven = () => {
    const buyPrice = parseFloat(currentPrice);
    const feePercentage = 0.1; // 0.1% trading fee

    if (!buyPrice) {
      Alert.alert('Error', 'Please enter current price');
      return;
    }

    const fee = (buyPrice * feePercentage) / 100;
    const breakEvenPrice = buyPrice + fee;

    setResults({
      buyPrice,
      fee,
      breakEvenPrice,
      profitToBreakEven: fee,
      type: 'breakeven'
    });
    setShowResultsModal(true);
  };

  const closeModal = () => {
    setShowResultsModal(false);
  };

  const clearResults = () => {
    setResults(null);
    setInvestment('');
    setCurrentPrice('');
    setTargetPrice('');
    setPositionSize('');
    setRiskPercentage('');
    setStopLoss('');
    setSelectedCoin('');
    setCoinSearch('');
    setShowCoinSelector(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const renderProfitLossResults = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>Profit/Loss Calculation</Text>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Coins Purchased:</Text>
        <Text style={styles.resultValue}>{results.coins.toFixed(6)}</Text>
      </View>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Target Value:</Text>
        <Text style={styles.resultValue}>{formatCurrency(results.targetValue)}</Text>
      </View>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Profit/Loss:</Text>
        <Text style={[
          styles.resultValue,
          { color: results.type === 'profit' ? iOSColors.status.bullish : iOSColors.status.bearish }
        ]}>
          {results.profitLoss >= 0 ? '+' : ''}{formatCurrency(results.profitLoss)}
        </Text>
      </View>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Percentage Change:</Text>
        <Text style={[
          styles.resultValue,
          { color: results.percentage >= 0 ? iOSColors.status.bullish : iOSColors.status.bearish }
        ]}>
          {results.percentage >= 0 ? '+' : ''}{results.percentage.toFixed(2)}%
        </Text>
      </View>
    </View>
  );

  const renderPositionSizeResults = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>Position Size Calculation</Text>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Risk Amount:</Text>
        <Text style={styles.resultValue}>{formatCurrency(results.riskAmount)}</Text>
      </View>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Risk per Coin:</Text>
        <Text style={styles.resultValue}>{formatCurrency(results.riskPerCoin)}</Text>
      </View>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Position Size:</Text>
        <Text style={styles.resultValue}>{results.positionSizeCoins.toFixed(6)} coins</Text>
      </View>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Position Value:</Text>
        <Text style={styles.resultValue}>{formatCurrency(results.positionValue)}</Text>
      </View>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Max Loss:</Text>
        <Text style={[styles.resultValue, { color: iOSColors.status.bearish }]}>
          -{formatCurrency(results.maxLoss)}
        </Text>
      </View>
    </View>
  );

  const renderBreakEvenResults = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>Break-Even Analysis</Text>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Buy Price:</Text>
        <Text style={styles.resultValue}>{formatCurrency(results.buyPrice)}</Text>
      </View>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Trading Fee (0.1%):</Text>
        <Text style={styles.resultValue}>{formatCurrency(results.fee)}</Text>
      </View>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Break-Even Price:</Text>
        <Text style={[styles.resultValue, { color: iOSColors.button.primary }]}>
          {formatCurrency(results.breakEvenPrice)}
        </Text>
      </View>
      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Profit to Break Even:</Text>
        <Text style={styles.resultValue}>{formatCurrency(results.profitToBreakEven)}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={iOSColors.gradients.background}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Trading Calculator</Text>
          <TouchableOpacity onPress={clearResults} style={styles.clearButton}>
            <LinearGradient
              colors={iOSColors.gradients.primary}
              style={styles.clearButtonGradient}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={24}
                color={iOSColors.text.primary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Coin Selector */}
        <Animated.View
          style={[
            styles.coinSelectorSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={iOSColors.gradients.card}
            style={styles.coinSelectorGradient}
          >
            <Text style={styles.coinSelectorTitle}>Select Trading Pair</Text>

            <TouchableOpacity
              onPress={() => setShowCoinSelector(!showCoinSelector)}
              style={styles.coinSelectorButton}
            >
              <LinearGradient
                colors={selectedCoin ? iOSColors.gradients.success : iOSColors.gradients.primary}
                style={styles.coinSelectorButtonGradient}
              >
                <Text style={styles.coinSelectorButtonText}>
                  {selectedCoin ? `${selectedCoin}/USDT` : 'Select Coin'}
                </Text>
                <MaterialCommunityIcons
                  name={showCoinSelector ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={iOSColors.text.primary}
                />
              </LinearGradient>
            </TouchableOpacity>

            {showCoinSelector && (
              <View style={styles.coinSearchContainer}>
                <TextInput
                  style={styles.coinSearchInput}
                  placeholder="Search coins..."
                  placeholderTextColor={iOSColors.text.tertiary}
                  value={coinSearch}
                  onChangeText={setCoinSearch}
                  autoCapitalize="none"
                />

                <FlatList
                  data={filteredCoins}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => selectCoin(item)}
                      style={styles.coinOption}
                    >
                      <View style={styles.coinOptionContent}>
                        <Text style={styles.coinOptionSymbol}>{item.symbol}</Text>
                        <Text style={styles.coinOptionName}>{item.name}</Text>
                      </View>
                      <View style={styles.coinOptionPrice}>
                        <Text style={styles.coinOptionPriceText}>${item.price.toFixed(4)}</Text>
                        <Text style={[
                          styles.coinOptionChange,
                          { color: item.change24h >= 0 ? iOSColors.status.bullish : iOSColors.status.bearish }
                        ]}>
                          {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.symbol}
                  showsVerticalScrollIndicator={false}
                  style={styles.coinOptionsList}
                  maxHeight={200}
                />
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Calculator Sections */}
        <View style={styles.calculatorContainer}>

          {/* Profit/Loss Calculator */}
          <Animated.View
            style={[
              styles.calculatorSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={iOSColors.gradients.card}
              style={styles.sectionGradient}
            >
              <Text style={styles.sectionTitle}>Profit/Loss Calculator</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Investment ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1000"
                  placeholderTextColor={iOSColors.text.tertiary}
                  value={investment}
                  onChangeText={setInvestment}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Current Price ($)</Text>
                <View style={styles.priceInputContainer}>
                  <TextInput
                    style={[styles.input, styles.priceInput]}
                    placeholder="45000"
                    placeholderTextColor={iOSColors.text.tertiary}
                    value={currentPrice}
                    onChangeText={setCurrentPrice}
                    keyboardType="decimal-pad"
                    editable={!isLoadingPrice}
                  />
                  {isLoadingPrice && (
                    <View style={styles.priceLoading}>
                      <MaterialCommunityIcons
                        name="loading"
                        size={20}
                        color={iOSColors.button.primary}
                      />
                    </View>
                  )}
                  {selectedCoin && !isLoadingPrice && (
                    <TouchableOpacity
                      onPress={() => selectCoin({ symbol: selectedCoin, name: getCoinName(selectedCoin) })}
                      style={styles.refreshPriceButton}
                    >
                      <MaterialCommunityIcons
                        name="refresh"
                        size={20}
                        color={iOSColors.button.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Target Price ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="50000"
                  placeholderTextColor={iOSColors.text.tertiary}
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <TouchableOpacity onPress={calculateProfitLoss} style={styles.calculateButton}>
                <LinearGradient
                  colors={iOSColors.gradients.primary}
                  style={styles.calculateButtonGradient}
                >
                  <Text style={styles.calculateButtonText}>Calculate P&L</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Position Size Calculator */}
          <Animated.View
            style={[
              styles.calculatorSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={iOSColors.gradients.card}
              style={styles.sectionGradient}
            >
              <Text style={styles.sectionTitle}>Position Size Calculator</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Total Capital ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10000"
                  placeholderTextColor={iOSColors.text.tertiary}
                  value={positionSize}
                  onChangeText={setPositionSize}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Risk Percentage (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  placeholderTextColor={iOSColors.text.tertiary}
                  value={riskPercentage}
                  onChangeText={setRiskPercentage}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Entry Price ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="45000"
                  placeholderTextColor={iOSColors.text.tertiary}
                  value={currentPrice}
                  onChangeText={setCurrentPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Stop Loss ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="42000"
                  placeholderTextColor={iOSColors.text.tertiary}
                  value={stopLoss}
                  onChangeText={setStopLoss}
                  keyboardType="decimal-pad"
                />
              </View>

              <TouchableOpacity onPress={calculatePositionSize} style={styles.calculateButton}>
                <LinearGradient
                  colors={iOSColors.gradients.primary}
                  style={styles.calculateButtonGradient}
                >
                  <Text style={styles.calculateButtonText}>Calculate Position</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* Break-Even Calculator */}
          <Animated.View
            style={[
              styles.calculatorSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={iOSColors.gradients.card}
              style={styles.sectionGradient}
            >
              <Text style={styles.sectionTitle}>Break-Even Calculator</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Buy Price ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="45000"
                  placeholderTextColor={iOSColors.text.tertiary}
                  value={currentPrice}
                  onChangeText={setCurrentPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <TouchableOpacity onPress={calculateBreakEven} style={styles.calculateButton}>
                <LinearGradient
                  colors={iOSColors.gradients.primary}
                  style={styles.calculateButtonGradient}
                >
                  <Text style={styles.calculateButtonText}>Calculate Break-Even</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </LinearGradient>

      {/* Results Modal */}
      <Modal
        visible={showResultsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={iOSColors.gradients.background}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Calculation Results</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={iOSColors.text.primary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                <LinearGradient
                  colors={iOSColors.gradients.card}
                  style={styles.modalResultsGradient}
                >
                  {results && (
                    <>
                      {results.type === 'profit' || results.type === 'loss' ? renderProfitLossResults() :
                       results.type === 'position' ? renderPositionSizeResults() :
                       renderBreakEvenResults()}
                    </>
                  )}
                </LinearGradient>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: iOSColors.background.primary,
  },
  background: {
    flex: 1,
    paddingHorizontal: w('5%'),
    paddingTop: h('2%'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h('3%'),
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: iOSColors.text.primary,
  },
  clearButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: iOSColors.button.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  clearButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinSelectorSection: {
    marginBottom: h('3%'),
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  coinSelectorGradient: {
    padding: w('5%'),
  },
  coinSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('2%'),
    textAlign: 'center',
  },
  coinSelectorButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  coinSelectorButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: h('2%'),
    paddingHorizontal: w('4%'),
  },
  coinSelectorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  coinSearchContainer: {
    marginTop: h('2%'),
  },
  coinSearchInput: {
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 8,
    padding: w('4%'),
    fontSize: 16,
    color: iOSColors.text.primary,
    borderWidth: 1,
    borderColor: iOSColors.border.light,
    marginBottom: h('2%'),
  },
  coinOptionsList: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  coinOption: {
    backgroundColor: iOSColors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: iOSColors.border.light,
    padding: w('4%'),
  },
  coinOptionContent: {
    flex: 1,
  },
  coinOptionSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: 2,
  },
  coinOptionName: {
    fontSize: 14,
    color: iOSColors.text.secondary,
  },
  coinOptionPrice: {
    alignItems: 'flex-end',
  },
  coinOptionPriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: 2,
  },
  coinOptionChange: {
    fontSize: 12,
  },
  calculatorContainer: {
    paddingBottom: h('5%'),
  },
  calculatorSection: {
    marginBottom: h('3%'),
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  sectionGradient: {
    padding: w('5%'),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('3%'),
    textAlign: 'center',
  },
  inputRow: {
    marginBottom: h('2%'),
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('1%'),
  },
  input: {
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 8,
    padding: w('4%'),
    fontSize: 16,
    color: iOSColors.text.primary,
    borderWidth: 1,
    borderColor: iOSColors.border.light,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
  },
  priceLoading: {
    position: 'absolute',
    right: w('4%'),
  },
  refreshPriceButton: {
    position: 'absolute',
    right: w('4%'),
    padding: 4,
  },
  calculateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: h('2%'),
    shadowColor: iOSColors.button.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calculateButtonGradient: {
    paddingVertical: h('2%'),
    alignItems: 'center',
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  resultsSection: {
    marginTop: h('2%'),
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  resultsGradient: {
    padding: w('5%'),
  },
  resultsContainer: {
    // Container for results
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('3%'),
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h('2%'),
    paddingVertical: h('1%'),
    borderBottomWidth: 1,
    borderBottomColor: iOSColors.border.light,
  },
  resultLabel: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    flex: 1,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: w('90%'),
    maxHeight: h('80%'),
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: w('5%'),
    paddingTop: h('3%'),
    paddingBottom: h('2%'),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: iOSColors.text.primary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: iOSColors.background.tertiary,
  },
  modalScrollView: {
    paddingHorizontal: w('5%'),
    paddingBottom: h('3%'),
  },
  modalResultsGradient: {
    borderRadius: 16,
    padding: w('5%'),
  },
});

export default Calculator;
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as w, heightPercentageToDP as h } from 'react-native-responsive-screen';
import iOSColors from '../Commponents/Colors';

const { width } = Dimensions.get('window');

const Calculator = () => {
  const [investment, setInvestment] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [positionSize, setPositionSize] = useState('');
  const [riskPercentage, setRiskPercentage] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [results, setResults] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
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
  }, []);

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
  };

  const clearResults = () => {
    setResults(null);
    setInvestment('');
    setCurrentPrice('');
    setTargetPrice('');
    setPositionSize('');
    setRiskPercentage('');
    setStopLoss('');
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

          {/* Results */}
          {results && (
            <Animated.View
              style={[
                styles.resultsSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={iOSColors.gradients.card}
                style={styles.resultsGradient}
              >
                {results.type === 'profit' || results.type === 'loss' ? renderProfitLossResults() :
                 results.type === 'position' ? renderPositionSizeResults() :
                 renderBreakEvenResults()}
              </LinearGradient>
            </Animated.View>
          )}
        </View>
      </LinearGradient>
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
});

export default Calculator;
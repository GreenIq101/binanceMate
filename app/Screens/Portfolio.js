import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as w, heightPercentageToDP as h } from 'react-native-responsive-screen';
import iOSColors from '../Commponents/Colors';
import { auth, db } from '../Firebase/fireConfig';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const Portfolio = () => {
  const [holdings, setHoldings] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');

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

    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, 'portfolio'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const portfolioData = [];
      let totalVal = 0;
      let totalInv = 0;

      for (const docSnap of querySnapshot.docs) {
        const holding = { id: docSnap.id, ...docSnap.data() };

        // Fetch current price (simplified - in real app, use API)
        const currentPrice = await fetchCurrentPrice(holding.symbol);

        const currentValue = holding.amount * currentPrice;
        const investedValue = holding.amount * holding.avgPrice;
        const pnl = currentValue - investedValue;
        const pnlPercentage = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;

        portfolioData.push({
          ...holding,
          currentPrice,
          currentValue,
          investedValue,
          pnl,
          pnlPercentage,
        });

        totalVal += currentValue;
        totalInv += investedValue;
      }

      setHoldings(portfolioData);
      setTotalValue(totalVal);
      setTotalInvested(totalInv);
      setTotalPnL(totalVal - totalInv);

    } catch (error) {
      console.error('Error loading portfolio:', error);
      Alert.alert('Error', 'Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentPrice = async (symbol) => {
    // Simplified price fetching - in real app, use actual crypto API
    const mockPrices = {
      'BTC': 45000,
      'ETH': 2800,
      'BNB': 320,
      'ADA': 0.45,
      'SOL': 95,
      'DOT': 7.2,
      'DOGE': 0.085,
      'AVAX': 35,
      'LTC': 75,
      'MATIC': 0.85,
    };
    return mockPrices[symbol] || 1;
  };

  const addHolding = async () => {
    Alert.prompt(
      'Add Holding',
      'Enter symbol, amount, and average price (comma separated)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (input) => {
            const [symbol, amount, avgPrice] = input.split(',');
            if (symbol && amount && avgPrice) {
              try {
                const user = auth.currentUser;
                await addDoc(collection(db, 'portfolio'), {
                  userId: user.uid,
                  symbol: symbol.toUpperCase().trim(),
                  amount: parseFloat(amount),
                  avgPrice: parseFloat(avgPrice),
                  dateAdded: new Date(),
                });
                loadPortfolio();
              } catch (error) {
                Alert.alert('Error', 'Failed to add holding');
              }
            }
          }
        }
      ]
    );
  };

  const removeHolding = async (holdingId) => {
    Alert.alert(
      'Remove Holding',
      'Are you sure you want to remove this holding?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'portfolio', holdingId));
              loadPortfolio();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove holding');
            }
          }
        }
      ]
    );
  };

  const renderHolding = ({ item }) => (
    <Animated.View
      style={[
        styles.holdingCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={iOSColors.gradients.card}
        style={styles.holdingGradient}
      >
        <View style={styles.holdingHeader}>
          <View style={styles.coinInfo}>
            <Text style={styles.coinSymbol}>{item.symbol}</Text>
            <Text style={styles.coinAmount}>{item.amount.toFixed(4)} coins</Text>
          </View>
          <TouchableOpacity
            onPress={() => removeHolding(item.id)}
            style={styles.removeButton}
          >
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={iOSColors.text.tertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.priceInfo}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Current Price:</Text>
            <Text style={styles.priceValue}>${item.currentPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Avg Price:</Text>
            <Text style={styles.priceValue}>${item.avgPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.pnlSection}>
          <View style={styles.pnlRow}>
            <Text style={styles.pnlLabel}>P&L:</Text>
            <Text style={[
              styles.pnlValue,
              { color: item.pnl >= 0 ? iOSColors.status.bullish : iOSColors.status.bearish }
            ]}>
              ${item.pnl.toFixed(2)} ({item.pnlPercentage >= 0 ? '+' : ''}{item.pnlPercentage.toFixed(2)}%)
            </Text>
          </View>
          <View style={styles.pnlRow}>
            <Text style={styles.pnlLabel}>Value:</Text>
            <Text style={styles.pnlValue}>${item.currentValue.toFixed(2)}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons
          name="loading"
          size={40}
          color={iOSColors.button.primary}
        />
        <Text style={styles.loadingText}>Loading Portfolio...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={iOSColors.gradients.background}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <TouchableOpacity onPress={addHolding} style={styles.addButton}>
            <LinearGradient
              colors={iOSColors.gradients.primary}
              style={styles.addButtonGradient}
            >
              <MaterialCommunityIcons
                name="plus"
                size={24}
                color={iOSColors.text.primary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Portfolio Summary */}
        <View style={styles.summaryContainer}>
          <LinearGradient
            colors={iOSColors.gradients.card}
            style={styles.summaryCard}
          >
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Value</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalValue)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Invested</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalInvested)}</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total P&L</Text>
                <Text style={[
                  styles.summaryValue,
                  { color: totalPnL >= 0 ? iOSColors.status.bullish : iOSColors.status.bearish }
                ]}>
                  {formatCurrency(totalPnL)} ({totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : '0.00'}%)
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Holdings</Text>
                <Text style={styles.summaryValue}>{holdings.length}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Holdings List */}
        <View style={styles.holdingsContainer}>
          <Text style={styles.sectionTitle}>Your Holdings</Text>
          {holdings.length > 0 ? (
            <FlatList
              data={holdings}
              renderItem={renderHolding}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.holdingsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="wallet-outline"
                size={60}
                color={iOSColors.text.tertiary}
              />
              <Text style={styles.emptyText}>No holdings yet</Text>
              <Text style={styles.emptySubtext}>Add your first crypto holding to get started</Text>
              <TouchableOpacity onPress={addHolding} style={styles.emptyButton}>
                <LinearGradient
                  colors={iOSColors.gradients.primary}
                  style={styles.emptyButtonGradient}
                >
                  <Text style={styles.emptyButtonText}>Add Holding</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: iOSColors.background.primary,
  },
  loadingText: {
    color: iOSColors.text.secondary,
    fontSize: 16,
    marginTop: 10,
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
  addButton: {
    borderRadius: 25,
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
  summaryContainer: {
    marginBottom: h('3%'),
  },
  summaryCard: {
    borderRadius: 16,
    padding: w('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: h('2%'),
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: iOSColors.text.tertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  holdingsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('2%'),
  },
  holdingsList: {
    paddingBottom: h('10%'),
  },
  holdingCard: {
    marginBottom: h('2%'),
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  holdingGradient: {
    padding: w('4%'),
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: h('2%'),
  },
  coinInfo: {
    flex: 1,
  },
  coinSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: iOSColors.text.primary,
    marginBottom: 2,
  },
  coinAmount: {
    fontSize: 14,
    color: iOSColors.text.secondary,
  },
  removeButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: iOSColors.background.tertiary,
  },
  priceInfo: {
    marginBottom: h('2%'),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: iOSColors.text.secondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  pnlSection: {
    borderTopWidth: 1,
    borderTopColor: iOSColors.border.light,
    paddingTop: h('2%'),
  },
  pnlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pnlLabel: {
    fontSize: 14,
    color: iOSColors.text.secondary,
  },
  pnlValue: {
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
    marginBottom: h('4%'),
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: iOSColors.button.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyButtonGradient: {
    paddingHorizontal: w('8%'),
    paddingVertical: h('2%'),
  },
  emptyButtonText: {
    color: iOSColors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Portfolio;
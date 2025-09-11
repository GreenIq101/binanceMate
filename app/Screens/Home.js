import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as w, heightPercentageToDP as h } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Pfour from './Pfour'
import iOSColors from '../Commponents/Colors'
import { auth, db } from '../Firebase/fireConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Home = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const navigation = useNavigation();

  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalPnL: 0,
    holdingsCount: 0
  });
  const [marketData, setMarketData] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [marketLoading, setMarketLoading] = useState(true);

  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();

    loadPortfolioSummary();
    fetchMarketData();

    // Refresh market data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPortfolioSummary = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, 'portfolio'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      let totalVal = 0;
      let totalInv = 0;
      let holdings = 0;

      for (const docSnap of querySnapshot.docs) {
        const item = docSnap.data();
        const mockPrice = getMockPrice(item.symbol);
        const currentValue = item.amount * mockPrice;
        const investedValue = item.amount * item.avgPrice;

        totalVal += currentValue;
        totalInv += investedValue;
        holdings++;
      }

      setPortfolioSummary({
        totalValue: totalVal,
        totalInvested: totalInv,
        totalPnL: totalVal - totalInv,
        holdingsCount: holdings
      });
    } catch (error) {
      console.error('Error loading portfolio summary:', error);
    }
  };

  const getMockPrice = (symbol) => {
    const prices = {
      'BTC': 45000, 'ETH': 2800, 'BNB': 320, 'ADA': 0.45,
      'SOL': 95, 'DOT': 7.2, 'DOGE': 0.085, 'AVAX': 35
    };
    return prices[symbol] || 1;
  };

  const fetchMarketData = async () => {
    try {
      setMarketLoading(true);

      // Fetch top cryptocurrencies from Binance
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      const data = response.data;

      // Filter for major coins and sort by volume
      const majorCoins = data
        .filter(coin => ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'LTCUSDT', 'MATICUSDT'].includes(coin.symbol))
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 6)
        .map(coin => ({
          symbol: coin.symbol.replace('USDT', ''),
          price: parseFloat(coin.lastPrice),
          change: parseFloat(coin.priceChangePercent),
          volume: parseFloat(coin.quoteVolume)
        }));

      setMarketData(majorCoins);

      // Get top gainers and losers
      const sortedByChange = data
        .filter(coin => parseFloat(coin.quoteVolume) > 1000000) // Filter by volume
        .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));

      const gainers = sortedByChange.slice(0, 5).map(coin => ({
        symbol: coin.symbol.replace('USDT', ''),
        change: parseFloat(coin.priceChangePercent),
        price: parseFloat(coin.lastPrice)
      }));

      const losers = sortedByChange.slice(-5).reverse().map(coin => ({
        symbol: coin.symbol.replace('USDT', ''),
        change: parseFloat(coin.priceChangePercent),
        price: parseFloat(coin.lastPrice)
      }));

      setTopGainers(gainers);
      setTopLosers(losers);

      // Set trending coins (high volume + price movement)
      const trending = data
        .filter(coin => parseFloat(coin.quoteVolume) > 5000000)
        .sort((a, b) => Math.abs(parseFloat(b.priceChangePercent)) - Math.abs(parseFloat(a.priceChangePercent)))
        .slice(0, 5)
        .map(coin => ({
          symbol: coin.symbol.replace('USDT', ''),
          change: parseFloat(coin.priceChangePercent),
          volume: parseFloat(coin.quoteVolume)
        }));

      setTrendingCoins(trending);

    } catch (error) {
      console.error('Error fetching market data:', error);
      // Fallback to mock data
      setMarketData([
        { symbol: 'BTC', price: 45000, change: 2.5 },
        { symbol: 'ETH', price: 2800, change: 1.8 },
        { symbol: 'BNB', price: 320, change: -0.5 },
        { symbol: 'ADA', price: 0.45, change: 1.2 },
        { symbol: 'SOL', price: 95, change: 3.1 },
        { symbol: 'DOT', price: 7.2, change: -0.8 },
      ]);
    } finally {
      setMarketLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
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
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons
                  name="bullseye"
                  size={32}
                  color={iOSColors.button.primary}
                />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Bull Master</Text>
                  <Text style={styles.headerSubtitle}>Your Crypto Trading Hub</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={styles.settingsButton}
              >
                <MaterialCommunityIcons
                  name="cog"
                  size={24}
                  color={iOSColors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Portfolio Summary */}
          <View style={styles.portfolioSummary}>
            <LinearGradient
              colors={iOSColors.gradients.card}
              style={styles.portfolioGradient}
            >
              <View style={styles.portfolioHeader}>
                <Text style={styles.portfolioTitle}>Portfolio Overview</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Portfolio')}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.portfolioStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Value</Text>
                  <Text style={styles.statValue}>{formatCurrency(portfolioSummary.totalValue)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>P&L</Text>
                  <Text style={[
                    styles.statValue,
                    { color: portfolioSummary.totalPnL >= 0 ? iOSColors.status.bullish : iOSColors.status.bearish }
                  ]}>
                    {portfolioSummary.totalPnL >= 0 ? '+' : ''}{formatCurrency(portfolioSummary.totalPnL)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Holdings</Text>
                  <Text style={styles.statValue}>{portfolioSummary.holdingsCount}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Market Overview */}
          <View style={styles.marketOverview}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="trending-up"
                size={24}
                color={iOSColors.button.primary}
              />
              <Text style={styles.sectionTitle}>Market Overview</Text>
            </View>

            <View style={styles.marketGrid}>
              {marketData.map((coin, index) => (
                <TouchableOpacity
                  key={coin.symbol}
                  onPress={() => navigation.navigate('Watchlist')}
                  style={styles.marketCard}
                >
                  <LinearGradient
                    colors={iOSColors.gradients.card}
                    style={styles.marketGradient}
                  >
                    <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                    <Text style={styles.coinPrice}>{formatCurrency(coin.price)}</Text>
                    <Text style={[
                      styles.coinChange,
                      { color: coin.change >= 0 ? iOSColors.status.bullish : iOSColors.status.bearish }
                    ]}>
                      {coin.change >= 0 ? '+' : ''}{coin.change}%
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Top Gainers, Losers & Trending */}
          <View style={styles.marketStatsContainer}>
            <View style={styles.marketStatsHeader}>
              <MaterialCommunityIcons
                name="chart-line"
                size={24}
                color={iOSColors.button.primary}
              />
              <Text style={styles.marketStatsTitle}>Market Statistics</Text>
            </View>

            <View style={styles.marketStatsGrid}>
              {/* Top Gainers */}
              <View style={styles.marketStatSection}>
                <LinearGradient
                  colors={iOSColors.gradients.success}
                  style={styles.marketStatGradient}
                >
                  <View style={styles.marketStatHeader}>
                    <MaterialCommunityIcons
                      name="trending-up"
                      size={20}
                      color={iOSColors.text.primary}
                    />
                    <Text style={styles.marketStatTitle}>Top Gainers</Text>
                  </View>
                  <View style={styles.marketStatList}>
                    {topGainers.slice(0, 3).map((coin, index) => (
                      <View key={coin.symbol} style={styles.marketStatItem}>
                        <Text style={styles.marketStatSymbol}>{coin.symbol}</Text>
                        <Text style={styles.marketStatChange}>+{coin.change.toFixed(2)}%</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </View>

              {/* Top Losers */}
              <View style={styles.marketStatSection}>
                <LinearGradient
                  colors={iOSColors.gradients.danger}
                  style={styles.marketStatGradient}
                >
                  <View style={styles.marketStatHeader}>
                    <MaterialCommunityIcons
                      name="trending-down"
                      size={20}
                      color={iOSColors.text.primary}
                    />
                    <Text style={styles.marketStatTitle}>Top Losers</Text>
                  </View>
                  <View style={styles.marketStatList}>
                    {topLosers.slice(0, 3).map((coin, index) => (
                      <View key={coin.symbol} style={styles.marketStatItem}>
                        <Text style={styles.marketStatSymbol}>{coin.symbol}</Text>
                        <Text style={styles.marketStatChange}>{coin.change.toFixed(2)}%</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </View>

              {/* Trending */}
              <View style={styles.marketStatSection}>
                <LinearGradient
                  colors={iOSColors.gradients.warning}
                  style={styles.marketStatGradient}
                >
                  <View style={styles.marketStatHeader}>
                    <MaterialCommunityIcons
                      name="fire"
                      size={20}
                      color={iOSColors.text.primary}
                    />
                    <Text style={styles.marketStatTitle}>Trending</Text>
                  </View>
                  <View style={styles.marketStatList}>
                    {trendingCoins.slice(0, 3).map((coin, index) => (
                      <View key={coin.symbol} style={styles.marketStatItem}>
                        <Text style={styles.marketStatSymbol}>{coin.symbol}</Text>
                        <Text style={styles.marketStatChange}>
                          {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Portfolio')}
                style={styles.quickActionButton}
              >
                <LinearGradient
                  colors={iOSColors.gradients.primary}
                  style={styles.quickActionGradient}
                >
                  <MaterialCommunityIcons
                    name="wallet"
                    size={28}
                    color={iOSColors.text.primary}
                  />
                  <Text style={styles.quickActionText}>Portfolio</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Watchlist')}
                style={styles.quickActionButton}
              >
                <LinearGradient
                  colors={iOSColors.gradients.success}
                  style={styles.quickActionGradient}
                >
                  <MaterialCommunityIcons
                    name="star"
                    size={28}
                    color={iOSColors.text.primary}
                  />
                  <Text style={styles.quickActionText}>Watchlist</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Alerts')}
                style={styles.quickActionButton}
              >
                <LinearGradient
                  colors={iOSColors.gradients.warning}
                  style={styles.quickActionGradient}
                >
                  <MaterialCommunityIcons
                    name="bell"
                    size={28}
                    color={iOSColors.text.primary}
                  />
                  <Text style={styles.quickActionText}>Alerts</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Calculator')}
                style={styles.quickActionButton}
              >
                <LinearGradient
                  colors={iOSColors.gradients.card}
                  style={styles.quickActionGradient}
                >
                  <MaterialCommunityIcons
                    name="calculator"
                    size={28}
                    color={iOSColors.text.secondary}
                  />
                  <Text style={styles.quickActionText}>Calculator</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Trading Tools */}
          <View style={styles.tradingTools}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="finance"
                size={24}
                color={iOSColors.button.primary}
              />
              <Text style={styles.sectionTitle}>Trading Tools</Text>
            </View>

            <View style={styles.toolsGrid}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Calculator')}
                style={styles.toolCard}
              >
                <LinearGradient
                  colors={iOSColors.gradients.card}
                  style={styles.toolGradient}
                >
                  <MaterialCommunityIcons
                    name="calculator-variant"
                    size={32}
                    color={iOSColors.button.primary}
                  />
                  <Text style={styles.toolTitle}>P&L Calculator</Text>
                  <Text style={styles.toolSubtitle}>Calculate profits & losses</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Alerts')}
                style={styles.toolCard}
              >
                <LinearGradient
                  colors={iOSColors.gradients.card}
                  style={styles.toolGradient}
                >
                  <MaterialCommunityIcons
                    name="bell-ring"
                    size={32}
                    color={iOSColors.button.primary}
                  />
                  <Text style={styles.toolTitle}>Price Alerts</Text>
                  <Text style={styles.toolSubtitle}>Get notified on price changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  homeContainer: {
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
    paddingBottom: h('12%'), // Extra padding for tab bar
  },
  headerContainer: {
    marginBottom: h('3%'),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: w('3%'),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: iOSColors.text.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    fontWeight: '500',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: iOSColors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioSummary: {
    marginBottom: h('3%'),
  },
  portfolioGradient: {
    borderRadius: 16,
    padding: w('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h('2%'),
  },
  portfolioTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  viewAllText: {
    fontSize: 14,
    color: iOSColors.button.primary,
    fontWeight: '600',
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: iOSColors.text.tertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  marketOverview: {
    marginBottom: h('3%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h('2%'),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginLeft: w('2%'),
  },
  marketGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  marketCard: {
    width: w('28%'),
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  marketGradient: {
    padding: w('3%'),
    alignItems: 'center',
  },
  coinSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: iOSColors.text.primary,
    marginBottom: 4,
  },
  coinPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: iOSColors.text.secondary,
    marginBottom: 2,
  },
  coinChange: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickActionsContainer: {
    marginBottom: h('3%'),
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('2%'),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: w('45%'),
    marginBottom: h('2%'),
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  quickActionGradient: {
    padding: w('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: h('12%'),
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginTop: h('1%'),
    textAlign: 'center',
  },
  marketStatsContainer: {
    marginBottom: h('3%'),
  },
  marketStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h('2%'),
  },
  marketStatsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginLeft: w('2%'),
  },
  marketStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  marketStatSection: {
    width: w('30%'),
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  marketStatGradient: {
    padding: w('4%'),
  },
  marketStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h('1.5%'),
  },
  marketStatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginLeft: w('2%'),
  },
  marketStatList: {
    // Container for list items
  },
  marketStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h('1%'),
  },
  marketStatSymbol: {
    fontSize: 12,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  marketStatChange: {
    fontSize: 11,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  tradingTools: {
    marginBottom: h('3%'),
  },
  toolsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: w('45%'),
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  toolGradient: {
    padding: w('5%'),
    alignItems: 'center',
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginTop: h('1%'),
    textAlign: 'center',
  },
  toolSubtitle: {
    fontSize: 12,
    color: iOSColors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 16,
  },
})

export default Home
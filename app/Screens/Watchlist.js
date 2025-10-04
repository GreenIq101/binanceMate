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
  TextInput,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as w, heightPercentageToDP as h } from 'react-native-responsive-screen';
import iOSColors from '../Commponents/Colors';
import { auth, db } from '../Firebase/fireConfig';
import { collection, addDoc, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';
import axios from 'axios';

const { width } = Dimensions.get('window');

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [popularCoins, setPopularCoins] = useState([]);
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const fetchPopularCoins = async () => {
    try {
      setIsLoadingCoins(true);
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      const data = response.data;

      // Get top 20 coins by volume that end with USDT
      const topCoins = data
        .filter(coin => coin.symbol.endsWith('USDT') && parseFloat(coin.quoteVolume) > 1000000)
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 20)
        .map(coin => ({
          symbol: coin.symbol.replace('USDT', ''),
          name: getCoinName(coin.symbol.replace('USDT', '')),
          price: parseFloat(coin.lastPrice),
          change24h: parseFloat(coin.priceChangePercent)
        }));

      setPopularCoins(topCoins);
    } catch (error) {
      console.error('Error fetching popular coins:', error);
      // Fallback to static data
      setPopularCoins([
        { symbol: 'BTC', name: 'Bitcoin', price: 45000, change24h: 2.5 },
        { symbol: 'ETH', name: 'Ethereum', price: 2800, change24h: 1.8 },
        { symbol: 'BNB', name: 'Binance Coin', price: 320, change24h: -0.5 },
        { symbol: 'ADA', name: 'Cardano', price: 0.45, change24h: 3.2 },
        { symbol: 'SOL', name: 'Solana', price: 95, change24h: 4.1 },
        { symbol: 'DOT', name: 'Polkadot', price: 7.2, change24h: 1.9 },
        { symbol: 'DOGE', name: 'Dogecoin', price: 0.085, change24h: -1.2 },
        { symbol: 'AVAX', name: 'Avalanche', price: 35, change24h: 2.8 },
        { symbol: 'LTC', name: 'Litecoin', price: 75, change24h: 0.9 },
        { symbol: 'MATIC', name: 'Polygon', price: 0.85, change24h: 1.5 },
      ]);
    } finally {
      setIsLoadingCoins(false);
    }
  };

  const getCoinName = (symbol) => {
    const coinNames = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      BNB: 'Binance Coin',
      ADA: 'Cardano',
      SOL: 'Solana',
      DOT: 'Polkadot',
      DOGE: 'Dogecoin',
      AVAX: 'Avalanche',
      LTC: 'Litecoin',
      MATIC: 'Polygon',
      XRP: 'Ripple',
      LINK: 'Chainlink',
      UNI: 'Uniswap',
      ALGO: 'Algorand',
      VET: 'VeChain',
      ICP: 'Internet Computer',
      FIL: 'Filecoin',
      TRX: 'Tron',
      ETC: 'Ethereum Classic',
      XLM: 'Stellar'
    };
    return coinNames[symbol] || symbol;
  };

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
    loadWatchlist();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = popularCoins.filter(coin =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadWatchlist = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, 'watchlist'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setWatchlist([]);
        setIsLoading(false);
        return;
      }

      // Get unique symbols for price fetching
      const symbols = [...new Set(querySnapshot.docs.map(doc => doc.data().symbol))];

      // Fetch real prices from Binance
      let currentPrices = {};
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbols=[${symbols.map(s => `"${s}USDT"`).join(',')}]`
        );
        response.data.forEach(item => {
          const symbol = item.symbol.replace('USDT', '');
          currentPrices[symbol] = parseFloat(item.price) || 0;
        });
      } catch (error) {
        console.error('Error fetching watchlist prices:', error);
        // Fallback to popular coins data
        popularCoins.forEach(coin => {
          currentPrices[coin.symbol] = coin.price;
        });
      }

      // Fetch 24h change data
      let changeData = {};
      try {
        const changeResponse = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        changeResponse.data.forEach(item => {
          if (symbols.includes(item.symbol.replace('USDT', ''))) {
            const symbol = item.symbol.replace('USDT', '');
            changeData[symbol] = parseFloat(item.priceChangePercent) || 0;
          }
        });
      } catch (error) {
        console.error('Error fetching change data:', error);
        // Fallback to popular coins data
        popularCoins.forEach(coin => {
          changeData[coin.symbol] = coin.change24h;
        });
      }

      const watchlistData = [];
      for (const docSnap of querySnapshot.docs) {
        const item = { id: docSnap.id, ...docSnap.data() };
        const currentPrice = currentPrices[item.symbol] || 0;
        const change24h = changeData[item.symbol] || 0;

        watchlistData.push({
          ...item,
          price: currentPrice,
          change24h: change24h,
          name: getCoinName(item.symbol)
        });
      }

      setWatchlist(watchlistData);
    } catch (error) {
      console.error('Error loading watchlist:', error);
      Alert.alert('Error', 'Failed to load watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  const addToWatchlist = async (coin) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Check if already in watchlist
      const existing = watchlist.find(item => item.symbol === coin.symbol);
      if (existing) {
        Alert.alert('Already Added', `${coin.name} is already in your watchlist`);
        return;
      }

      await addDoc(collection(db, 'watchlist'), {
        userId: user.uid,
        symbol: coin.symbol,
        name: coin.name,
        addedAt: new Date(),
      });

      loadWatchlist();
      setSearchQuery('');
      setShowSearch(false);
      Alert.alert('Success', `${coin.name} added to watchlist`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add to watchlist');
    }
  };

  const removeFromWatchlist = async (watchlistId, coinName) => {
    Alert.alert(
      'Remove from Watchlist',
      `Remove ${coinName} from your watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'watchlist', watchlistId));
              loadWatchlist();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove from watchlist');
            }
          }
        }
      ]
    );
  };

  const renderWatchlistItem = ({ item }) => (
    <Animated.View
      style={[
        styles.coinCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={iOSColors.gradients.card}
        style={styles.coinGradient}
      >
        <View style={styles.coinHeader}>
          <View style={styles.coinInfo}>
            <Text style={styles.coinSymbol}>{item.symbol}</Text>
            <Text style={styles.coinName}>{item.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => removeFromWatchlist(item.id, item.name)}
            style={styles.removeButton}
          >
            <MaterialCommunityIcons
              name="star"
              size={24}
              color={iOSColors.button.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <Text style={[
            styles.change,
            { color: item.change24h >= 0 ? iOSColors.status.bullish : iOSColors.status.bearish }
          ]}>
            {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      onPress={() => addToWatchlist(item)}
      style={styles.searchResult}
    >
      <View style={styles.searchResultContent}>
        <View style={styles.searchCoinInfo}>
          <Text style={styles.searchSymbol}>{item.symbol}</Text>
          <Text style={styles.searchName}>{item.name}</Text>
        </View>
        <View style={styles.searchPriceInfo}>
          <Text style={styles.searchPrice}>${item.price.toFixed(2)}</Text>
          <Text style={[
            styles.searchChange,
            { color: item.change24h >= 0 ? iOSColors.status.bullish : iOSColors.status.bearish }
          ]}>
            {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons
          name="loading"
          size={40}
          color={iOSColors.button.primary}
        />
        <Text style={styles.loadingText}>Loading Watchlist...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={iOSColors.gradients.background}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Watchlist</Text>
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            style={styles.searchButton}
          >
            <LinearGradient
              colors={iOSColors.gradients.primary}
              style={styles.searchButtonGradient}
            >
              <MaterialCommunityIcons
                name={showSearch ? "close" : "magnify"}
                size={24}
                color={iOSColors.text.primary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <Animated.View
            style={[
              styles.searchContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={iOSColors.gradients.card}
              style={styles.searchGradient}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={iOSColors.text.tertiary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search cryptocurrencies..."
                placeholderTextColor={iOSColors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </LinearGradient>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View style={styles.searchResultsContainer}>
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.symbol}
                  showsVerticalScrollIndicator={false}
                  style={styles.searchResultsList}
                />
              </View>
            )}
          </Animated.View>
        )}

        {/* Watchlist */}
        <View style={styles.watchlistContainer}>
          <Text style={styles.sectionTitle}>Your Watchlist</Text>
          {watchlist.length > 0 ? (
            <FlatList
              data={watchlist}
              renderItem={renderWatchlistItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.watchlistList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="star-outline"
                size={60}
                color={iOSColors.text.tertiary}
              />
              <Text style={styles.emptyText}>No coins in watchlist</Text>
              <Text style={styles.emptySubtext}>Add cryptocurrencies to track their prices</Text>
              <TouchableOpacity
                onPress={() => setShowSearch(true)}
                style={styles.emptyButton}
              >
                <LinearGradient
                  colors={iOSColors.gradients.primary}
                  style={styles.emptyButtonGradient}
                >
                  <Text style={styles.emptyButtonText}>Add Coins</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
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
  searchButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowRadius: 8,
    elevation: 8,
  },
  searchButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginBottom: h('3%'),
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: w('4%'),
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  searchIcon: {
    marginRight: w('3%'),
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: iOSColors.text.primary,
    paddingVertical: 0,
  },
  searchResultsContainer: {
    marginTop: h('2%'),
    maxHeight: h('40%'),
  },
  searchResultsList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchResult: {
    backgroundColor: iOSColors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: iOSColors.border.light,
  },
  searchResultContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: w('4%'),
  },
  searchCoinInfo: {
    flex: 1,
  },
  searchSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: 2,
  },
  searchName: {
    fontSize: 14,
    color: iOSColors.text.secondary,
  },
  searchPriceInfo: {
    alignItems: 'flex-end',
  },
  searchPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: 2,
  },
  searchChange: {
    fontSize: 14,
  },
  watchlistContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('2%'),
  },
  watchlistList: {
    paddingBottom: h('10%'),
  },
  coinCard: {
    marginBottom: h('2%'),
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  coinGradient: {
    padding: w('4%'),
  },
  coinHeader: {
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
  coinName: {
    fontSize: 14,
    color: iOSColors.text.secondary,
  },
  removeButton: {
    padding: 4,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: iOSColors.text.primary,
  },
  change: {
    fontSize: 16,
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

export default Watchlist;
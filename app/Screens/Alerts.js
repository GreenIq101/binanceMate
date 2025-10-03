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
  Switch,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as w, heightPercentageToDP as h } from 'react-native-responsive-screen';
import iOSColors from '../Commponents/Colors';
import { auth, db } from '../Firebase/fireConfig';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { usePriceMonitor } from '../Commponents/PriceMonitor';

const { width } = Dimensions.get('window');

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentPrices, setCurrentPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState('above'); // 'above' or 'below'
  const [isEnabled, setIsEnabled] = useState(true);
  const [coinSearch, setCoinSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customCoins, setCustomCoins] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Popular cryptocurrencies for alerts (Binance symbols)
  const availableCoins = [
    { symbol: 'BTC', name: 'Bitcoin', id: 'btc' },
    { symbol: 'ETH', name: 'Ethereum', id: 'eth' },
    { symbol: 'BNB', name: 'Binance Coin', id: 'bnb' },
    { symbol: 'ADA', name: 'Cardano', id: 'ada' },
    { symbol: 'SOL', name: 'Solana', id: 'sol' },
    { symbol: 'DOT', name: 'Polkadot', id: 'dot' },
    { symbol: 'DOGE', name: 'Dogecoin', id: 'doge' },
    { symbol: 'AVAX', name: 'Avalanche', id: 'avax' },
    { symbol: 'LTC', name: 'Litecoin', id: 'ltc' },
    { symbol: 'MATIC', name: 'Polygon', id: 'matic' },
  ];

  // Initialize price monitoring with all available coins
  const allCoins = [...availableCoins, ...customCoins];
  const priceMonitor = usePriceMonitor(allCoins);

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

    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      console.log('Starting loadAlerts...');
      setError(null);
      const user = auth.currentUser;
      console.log('Current user:', user ? user.uid : 'No user');

      if (!user) {
        console.log('No user found, skipping loadAlerts');
        setIsLoading(false);
        return;
      }

      // Fetch current prices including custom coins
      console.log('Fetching prices...');
      const allCoins = [...availableCoins, ...customCoins];
      console.log('All coins:', allCoins);
      const prices = await priceMonitor.fetchCurrentPrices(allCoins);
      console.log('Prices fetched:', prices);

      if (prices) {
        setCurrentPrices(prices);
      }

      // Load alerts
      console.log('Loading alerts from Firestore...');
      const alertsQuery = query(collection(db, 'alerts'), where('userId', '==', user.uid));
      const alertsSnapshot = await getDocs(alertsQuery);
      console.log('Alerts snapshot:', alertsSnapshot.size, 'documents');

      const alertsData = [];
      alertsSnapshot.forEach((docSnap) => {
        const alert = { id: docSnap.id, ...docSnap.data() };
        const currentPrice = prices ? prices[alert.symbol] : 0;
        alertsData.push({
          ...alert,
          currentPrice: currentPrice,
        });
      });

      console.log('Processed alerts:', alertsData.length);
      setAlerts(alertsData);

      // Load recent notifications
      console.log('Loading notifications...');
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      console.log('Notifications snapshot:', notificationsSnapshot.size, 'documents');

      const notificationsData = [];
      notificationsSnapshot.forEach((docSnap) => {
        notificationsData.push({ id: docSnap.id, ...docSnap.data() });
      });

      console.log('Processed notifications:', notificationsData.length);
      setNotifications(notificationsData);

      console.log('loadAlerts completed successfully');
    } catch (error) {
      console.error('Error loading alerts:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      setError('Failed to load alerts. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createAlert = async () => {
    if (!selectedCoin || !alertPrice) {
      Alert.alert('Error', 'Please select a coin and enter a price');
      return;
    }

    const price = parseFloat(alertPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, 'alerts'), {
        userId: user.uid,
        symbol: selectedCoin,
        targetPrice: price,
        type: alertType,
        isEnabled: isEnabled,
        createdAt: new Date(),
        triggered: false,
      });

      loadAlerts();
      resetForm();
      Alert.alert('Success', 'Price alert created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create alert');
    }
  };

  const toggleAlert = async (alertId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'alerts', alertId), {
        isEnabled: !currentStatus,
      });
      loadAlerts();
    } catch (error) {
      Alert.alert('Error', 'Failed to update alert');
    }
  };

  const deleteAlert = async (alertId) => {
    Alert.alert(
      'Delete Alert',
      'Are you sure you want to delete this alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'alerts', alertId));
              loadAlerts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete alert');
            }
          }
        }
      ]
    );
  };

  const searchCoins = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Get available trading pairs from Binance
      const exchangeInfoResponse = await fetch('https://api.binance.com/api/v3/exchangeInfo');
      const exchangeInfo = await exchangeInfoResponse.json();

      // Filter USDT pairs and search by symbol or base asset
      const usdtPairs = exchangeInfo.symbols
        .filter(symbol => symbol.symbol.endsWith('USDT') && symbol.status === 'TRADING')
        .filter(symbol =>
          symbol.symbol.toLowerCase().includes(query.toLowerCase()) ||
          symbol.baseAsset.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10)
        .map(symbol => ({
          symbol: symbol.baseAsset,
          name: symbol.baseAsset,
          id: symbol.baseAsset.toLowerCase(),
          pair: symbol.symbol
        }));

      setSearchResults(usdtPairs);
    } catch (error) {
      console.error('Error searching coins:', error);
      // Fallback to manual entry
      if (query.length >= 2) {
        setSearchResults([{
          symbol: query.toUpperCase(),
          name: query.toUpperCase(),
          id: query.toLowerCase(),
          pair: `${query.toUpperCase()}USDT`
        }]);
      } else {
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const addCustomCoin = (coin) => {
    const newCoin = {
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      id: coin.id,
    };

    // Check if coin already exists
    const exists = [...availableCoins, ...customCoins].find(
      c => c.symbol === newCoin.symbol
    );

    if (!exists) {
      setCustomCoins(prev => [...prev, newCoin]);
    }

    setSelectedCoin(newCoin.symbol);
    setCoinSearch('');
    setSearchResults([]);
  };

  const resetForm = () => {
    setSelectedCoin('');
    setAlertPrice('');
    setAlertType('above');
    setIsEnabled(true);
    setShowCreateAlert(false);
    setCoinSearch('');
    setSearchResults([]);
  };

  const renderAlert = ({ item }) => (
    <Animated.View
      style={[
        styles.alertCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={iOSColors.gradients.card}
        style={styles.alertGradient}
      >
        <View style={styles.alertHeader}>
          <View style={styles.alertInfo}>
            <Text style={styles.alertSymbol}>{item.symbol}</Text>
            <Text style={styles.alertType}>
              Alert when price goes {item.type} ${item.targetPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.alertActions}>
            <Switch
              value={item.isEnabled}
              onValueChange={() => toggleAlert(item.id, item.isEnabled)}
              trackColor={{ false: iOSColors.border.light, true: iOSColors.button.primary }}
              thumbColor={item.isEnabled ? iOSColors.text.primary : iOSColors.text.tertiary}
            />
            <TouchableOpacity
              onPress={() => deleteAlert(item.id)}
              style={styles.deleteButton}
            >
              <MaterialCommunityIcons
                name="delete"
                size={20}
                color={iOSColors.button.danger}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.alertStatus}>
          <Text style={styles.currentPrice}>Current: ${item.currentPrice.toFixed(2)}</Text>
          <Text style={[
            styles.statusText,
            {
              color: item.isEnabled ? iOSColors.status.bullish : iOSColors.text.tertiary
            }
          ]}>
            {item.isEnabled ? 'Active' : 'Disabled'}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderCoinOption = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedCoin(item.symbol)}
      style={[
        styles.coinOption,
        selectedCoin === item.symbol && styles.coinOptionSelected
      ]}
    >
      <Text style={[
        styles.coinOptionText,
        selectedCoin === item.symbol && styles.coinOptionTextSelected
      ]}>
        {item.symbol} - {item.name}
      </Text>
      <Text style={styles.coinOptionPrice}>
        ${currentPrices[item.symbol] ? currentPrices[item.symbol].toFixed(2) : 'Loading...'}
      </Text>
    </TouchableOpacity>
  );

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.read && styles.notificationUnread
      ]}
      onPress={() => markNotificationAsRead(item.id)}
    >
      <LinearGradient
        colors={!item.read ? iOSColors.gradients.primary : iOSColors.gradients.card}
        style={styles.notificationGradient}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <MaterialCommunityIcons
              name={item.type === 'price_alert' ? 'bell-ring' : 'information'}
              size={20}
              color={!item.read ? iOSColors.text.onPrimary : iOSColors.button.primary}
            />
          </View>
          <View style={styles.notificationContent}>
            <Text style={[styles.notificationTitle, !item.read && styles.notificationTitleUnread]}>
              {item.title}
            </Text>
            <Text style={[styles.notificationMessage, !item.read && styles.notificationMessageUnread]}>
              {item.message}
            </Text>
            <Text style={styles.notificationTime}>
              {new Date(item.createdAt.seconds * 1000).toLocaleString()}
            </Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const markNotificationAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
      });
      loadAlerts(); // Refresh data
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons
          name="loading"
          size={40}
          color={iOSColors.button.primary}
        />
        <Text style={styles.loadingText}>Loading Alerts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={60}
          color={iOSColors.button.danger}
        />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
            loadAlerts();
          }}
        >
          <LinearGradient
            colors={iOSColors.gradients.primary}
            style={styles.retryButtonGradient}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </LinearGradient>
        </TouchableOpacity>
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
          <Text style={styles.title}>Price Alerts</Text>
          <TouchableOpacity
            onPress={() => setShowCreateAlert(!showCreateAlert)}
            style={styles.addButton}
          >
            <LinearGradient
              colors={iOSColors.gradients.primary}
              style={styles.addButtonGradient}
            >
              <MaterialCommunityIcons
                name={showCreateAlert ? "close" : "bell-plus"}
                size={24}
                color={iOSColors.text.primary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Create Alert Form */}
        {showCreateAlert && (
          <Animated.View
            style={[
              styles.createAlertContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={iOSColors.gradients.card}
              style={styles.createAlertGradient}
            >
              <Text style={styles.formTitle}>Create Price Alert</Text>

              {/* Coin Selection */}
              <Text style={styles.formLabel}>Select Cryptocurrency</Text>

              {/* Search Input */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.coinSearchInput}
                  placeholder="Search for any cryptocurrency..."
                  placeholderTextColor={iOSColors.text.tertiary}
                  value={coinSearch}
                  onChangeText={(text) => {
                    setCoinSearch(text);
                    searchCoins(text);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {isSearching && (
                  <View style={styles.searchIndicator}>
                    <MaterialCommunityIcons
                      name="loading"
                      size={20}
                      color={iOSColors.button.primary}
                    />
                  </View>
                )}
              </View>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                  <Text style={styles.searchResultsTitle}>Search Results</Text>
                  <FlatList
                    data={searchResults}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.searchResultCard}
                        onPress={() => addCustomCoin(item)}
                      >
                        <View style={styles.searchResultContent}>
                          <Text style={styles.searchResultSymbol}>{item.symbol.toUpperCase()}</Text>
                          <Text style={styles.searchResultName}>{item.name}</Text>
                        </View>
                        <MaterialCommunityIcons
                          name="plus-circle"
                          size={24}
                          color={iOSColors.button.primary}
                        />
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    style={styles.searchResultsList}
                  />
                </View>
              )}

              {/* Popular Coins */}
              <Text style={styles.formLabel}>Popular Cryptocurrencies</Text>
              <FlatList
                data={[...availableCoins, ...customCoins]}
                renderItem={renderCoinOption}
                keyExtractor={(item) => item.symbol}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.coinSelector}
              />

              {/* Alert Type */}
              <Text style={styles.formLabel}>Alert Type</Text>
              <View style={styles.alertTypeContainer}>
                <TouchableOpacity
                  onPress={() => setAlertType('above')}
                  style={[
                    styles.alertTypeButton,
                    alertType === 'above' && styles.alertTypeButtonActive
                  ]}
                >
                  <Text style={[
                    styles.alertTypeText,
                    alertType === 'above' && styles.alertTypeTextActive
                  ]}>
                    Above
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAlertType('below')}
                  style={[
                    styles.alertTypeButton,
                    alertType === 'below' && styles.alertTypeButtonActive
                  ]}
                >
                  <Text style={[
                    styles.alertTypeText,
                    alertType === 'below' && styles.alertTypeTextActive
                  ]}>
                    Below
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Price Input */}
              <Text style={styles.formLabel}>Target Price (USD)</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Enter target price"
                placeholderTextColor={iOSColors.text.tertiary}
                value={alertPrice}
                onChangeText={setAlertPrice}
                keyboardType="decimal-pad"
              />

              {/* Create Button */}
              <TouchableOpacity
                onPress={createAlert}
                style={styles.createButton}
                disabled={!selectedCoin || !alertPrice}
              >
                <LinearGradient
                  colors={(!selectedCoin || !alertPrice) ? iOSColors.gradients.card : iOSColors.gradients.primary}
                  style={styles.createButtonGradient}
                >
                  <Text style={[
                    styles.createButtonText,
                    (!selectedCoin || !alertPrice) && { color: iOSColors.text.tertiary }
                  ]}>
                    Create Alert
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Alerts List */}
        <View style={styles.alertsContainer}>
          <Text style={styles.sectionTitle}>Your Alerts</Text>
          {alerts.length > 0 ? (
            <FlatList
              data={alerts}
              renderItem={renderAlert}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.alertsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={60}
                color={iOSColors.text.tertiary}
              />
              <Text style={styles.emptyText}>No price alerts</Text>
              <Text style={styles.emptySubtext}>Create alerts to get notified when prices hit your targets</Text>
              <TouchableOpacity
                onPress={() => setShowCreateAlert(true)}
                style={styles.emptyButton}
              >
                <LinearGradient
                  colors={iOSColors.gradients.primary}
                  style={styles.emptyButtonGradient}
                >
                  <Text style={styles.emptyButtonText}>Create Alert</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Notifications */}
        {notifications.length > 0 && (
          <View style={styles.notificationsContainer}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.notificationsList}
            />
          </View>
        )}
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
  createAlertContainer: {
    marginBottom: h('3%'),
  },
  createAlertGradient: {
    borderRadius: 16,
    padding: w('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('3%'),
    textAlign: 'center',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('2%'),
    marginTop: h('2%'),
  },
  coinSelector: {
    marginBottom: h('2%'),
  },
  coinOption: {
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 8,
    padding: w('3%'),
    marginRight: w('3%'),
    minWidth: w('25%'),
    alignItems: 'center',
  },
  coinOptionSelected: {
    backgroundColor: iOSColors.button.primary,
  },
  coinOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: iOSColors.text.secondary,
    marginBottom: 2,
  },
  coinOptionTextSelected: {
    color: iOSColors.text.primary,
  },
  coinOptionPrice: {
    fontSize: 10,
    color: iOSColors.text.tertiary,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    marginBottom: h('2%'),
  },
  alertTypeButton: {
    flex: 1,
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 8,
    padding: h('2%'),
    marginHorizontal: w('1%'),
    alignItems: 'center',
  },
  alertTypeButtonActive: {
    backgroundColor: iOSColors.button.primary,
  },
  alertTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: iOSColors.text.secondary,
  },
  alertTypeTextActive: {
    color: iOSColors.text.primary,
  },
  priceInput: {
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 8,
    padding: w('4%'),
    fontSize: 16,
    color: iOSColors.text.primary,
    marginBottom: h('3%'),
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingVertical: h('2%'),
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('2%'),
  },
  alertsList: {
    paddingBottom: h('10%'),
  },
  alertCard: {
    marginBottom: h('2%'),
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  alertGradient: {
    padding: w('4%'),
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: h('2%'),
  },
  alertInfo: {
    flex: 1,
  },
  alertSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: iOSColors.text.primary,
    marginBottom: 4,
  },
  alertType: {
    fontSize: 14,
    color: iOSColors.text.secondary,
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginLeft: w('2%'),
  },
  alertStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 14,
    color: iOSColors.text.secondary,
  },
  statusText: {
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
  notificationsContainer: {
    marginTop: h('3%'),
  },
  notificationsList: {
    paddingBottom: h('5%'),
  },
  notificationCard: {
    marginBottom: h('2%'),
    borderRadius: 12,
    overflow: 'hidden',
  },
  notificationUnread: {
    shadowColor: iOSColors.button.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  notificationGradient: {
    padding: w('4%'),
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: w('3%'),
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: 4,
  },
  notificationTitleUnread: {
    color: iOSColors.text.onPrimary,
  },
  notificationMessage: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationMessageUnread: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  notificationTime: {
    fontSize: 12,
    color: iOSColors.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: iOSColors.button.warning,
    marginTop: 6,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: h('2%'),
  },
  coinSearchInput: {
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 12,
    padding: w('4%'),
    paddingRight: w('12%'),
    fontSize: 16,
    color: iOSColors.text.primary,
    borderWidth: 1,
    borderColor: iOSColors.border.light,
  },
  searchIndicator: {
    position: 'absolute',
    right: w('4%'),
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  searchResultsContainer: {
    marginBottom: h('3%'),
    maxHeight: h('30%'),
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('2%'),
  },
  searchResultsList: {
    maxHeight: h('25%'),
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 12,
    padding: w('4%'),
    marginBottom: h('1%'),
    borderWidth: 1,
    borderColor: iOSColors.border.light,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: iOSColors.button.primary,
    marginBottom: 2,
  },
  searchResultName: {
    fontSize: 14,
    color: iOSColors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: iOSColors.background.primary,
    paddingHorizontal: w('10%'),
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: iOSColors.text.primary,
    marginTop: h('3%'),
    marginBottom: h('2%'),
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: iOSColors.text.secondary,
    textAlign: 'center',
    marginBottom: h('4%'),
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: iOSColors.button.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonGradient: {
    paddingHorizontal: w('8%'),
    paddingVertical: h('2%'),
  },
  retryButtonText: {
    color: iOSColors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Alerts;
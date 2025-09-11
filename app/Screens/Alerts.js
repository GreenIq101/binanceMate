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
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState('above'); // 'above' or 'below'
  const [isEnabled, setIsEnabled] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Popular cryptocurrencies for alerts
  const availableCoins = [
    { symbol: 'BTC', name: 'Bitcoin', currentPrice: 45000 },
    { symbol: 'ETH', name: 'Ethereum', currentPrice: 2800 },
    { symbol: 'BNB', name: 'Binance Coin', currentPrice: 320 },
    { symbol: 'ADA', name: 'Cardano', currentPrice: 0.45 },
    { symbol: 'SOL', name: 'Solana', currentPrice: 95 },
    { symbol: 'DOT', name: 'Polkadot', currentPrice: 7.2 },
    { symbol: 'DOGE', name: 'Dogecoin', currentPrice: 0.085 },
    { symbol: 'AVAX', name: 'Avalanche', currentPrice: 35 },
    { symbol: 'LTC', name: 'Litecoin', currentPrice: 75 },
    { symbol: 'MATIC', name: 'Polygon', currentPrice: 0.85 },
  ];

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
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, 'alerts'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const alertsData = [];
      for (const docSnap of querySnapshot.docs) {
        const alert = { id: docSnap.id, ...docSnap.data() };
        // Get current price data
        const coinData = availableCoins.find(coin => coin.symbol === alert.symbol);
        if (coinData) {
          alertsData.push({
            ...alert,
            currentPrice: coinData.currentPrice,
          });
        }
      }

      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
      Alert.alert('Error', 'Failed to load alerts');
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

  const resetForm = () => {
    setSelectedCoin('');
    setAlertPrice('');
    setAlertType('above');
    setIsEnabled(true);
    setShowCreateAlert(false);
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
      <Text style={styles.coinOptionPrice}>${item.currentPrice.toFixed(2)}</Text>
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
        <Text style={styles.loadingText}>Loading Alerts...</Text>
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
              <FlatList
                data={availableCoins}
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
});

export default Alerts;
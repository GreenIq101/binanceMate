import { useEffect, useRef } from 'react';
import { db, auth } from '../Firebase/fireConfig';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import axios from 'axios';

class PriceMonitorService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.lastPrices = {};
  }

  async fetchCurrentPrices(coins = []) {
    try {
      // Get all symbols (default + custom)
      const allSymbols = coins.map(coin => coin.symbol);

      if (allSymbols.length === 0) {
        return {};
      }

      // Use Binance API to get prices
      const symbolsParam = allSymbols.map(symbol => `"${symbol}USDT"`).join(',');
      const response = await axios.get(
        `https://api.binance.com/api/v3/ticker/price?symbols=[${symbolsParam}]`
      );

      const prices = {};

      // Process Binance response
      response.data.forEach(item => {
        const symbol = item.symbol.replace('USDT', ''); // Remove USDT suffix
        prices[symbol] = parseFloat(item.price) || 0;
      });

      return prices;
    } catch (error) {
      console.error('Error fetching prices from Binance:', error);
      // Fallback: try individual requests if batch fails
      return await this.fetchPricesIndividually(coins);
    }
  }

  async fetchPricesIndividually(coins = []) {
    const prices = {};

    for (const coin of coins) {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${coin.symbol}USDT`
        );
        prices[coin.symbol] = parseFloat(response.data.price) || 0;
      } catch (error) {
        console.error(`Error fetching price for ${coin.symbol}:`, error);
        prices[coin.symbol] = 0;
      }
    }

    return prices;
  }

  async checkAlerts(coins = []) {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const currentPrices = await this.fetchCurrentPrices(coins);
      if (!currentPrices) return;

      // Get all active alerts for the user
      const q = query(
        collection(db, 'alerts'),
        where('userId', '==', user.uid),
        where('isEnabled', '==', true),
        where('triggered', '==', false)
      );

      const querySnapshot = await getDocs(q);

      for (const docSnap of querySnapshot.docs) {
        const alert = { id: docSnap.id, ...docSnap.data() };
        const currentPrice = currentPrices[alert.symbol];

        if (currentPrice) {
          let isTriggered = false;

          if (alert.type === 'above' && currentPrice >= alert.targetPrice) {
            isTriggered = true;
          } else if (alert.type === 'below' && currentPrice <= alert.targetPrice) {
            isTriggered = true;
          }

          if (isTriggered) {
            // Mark alert as triggered
            await updateDoc(doc(db, 'alerts', alert.id), {
              triggered: true,
              triggeredAt: new Date(),
              triggeredPrice: currentPrice,
            });

            // Create notification
            await addDoc(collection(db, 'notifications'), {
              userId: user.uid,
              type: 'price_alert',
              title: `Price Alert Triggered`,
              message: `${alert.symbol} has reached $${currentPrice.toFixed(2)} (${alert.type} $${alert.targetPrice.toFixed(2)})`,
              alertId: alert.id,
              symbol: alert.symbol,
              targetPrice: alert.targetPrice,
              currentPrice: currentPrice,
              alertType: alert.type,
              createdAt: new Date(),
              read: false,
            });

            console.log(`Alert triggered for ${alert.symbol}: ${currentPrice} ${alert.type} ${alert.targetPrice}`);
          }
        }
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  startMonitoring(coins = []) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.currentCoins = coins;
    console.log('Starting price monitoring...');

    // Check immediately
    this.checkAlerts(coins);

    // Then check every 5 minutes (300,000 ms)
    this.intervalId = setInterval(() => {
      this.checkAlerts(coins);
    }, 300000); // 5 minutes
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Stopped price monitoring');
  }
}

// Singleton instance
const priceMonitor = new PriceMonitorService();

// React hook for using the price monitor
export const usePriceMonitor = (coins = []) => {
  const monitorRef = useRef(priceMonitor);

  useEffect(() => {
    const monitor = monitorRef.current;

    // Start monitoring when component mounts
    monitor.startMonitoring(coins);

    // Stop monitoring when component unmounts
    return () => {
      monitor.stopMonitoring();
    };
  }, [coins]);

  return monitorRef.current;
};

export default priceMonitor;
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';

const topCoins = [
  { name: 'PEPE', symbol: 'pepeusdt' },
  { name: 'Polkadot', symbol: 'dotusdt' },
  { name: 'STEPN', symbol: 'gmtusdt' },
  { name: 'Compound', symbol: 'compusdt' },
  { name: 'EOS', symbol: 'eosusdt' },
  { name: 'Kusama', symbol: 'ksmusdt' },
  { name: 'Secret', symbol: 'scrtusdt' },
  { name: 'Verge', symbol: 'xvgusdt' },
  { name: 'Metal', symbol: 'mtlusdt' },
  { name: 'PancakeSwap', symbol: 'cakeusdt' },
];

const Eye = () => {
  const [coinPrices, setCoinPrices] = useState({});

  useEffect(() => {
    const socket = new WebSocket('wss://stream.binance.com:9443/ws');

    socket.onopen = () => {
      // Subscribe to the ticker for each coin
      topCoins.forEach((coin) => {
        socket.send(JSON.stringify({
          method: 'SUBSCRIBE',
          params: [`${coin.symbol}@ticker`],
          id: 1,
        }));
      });
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === '24hrTicker') {
        const { s: symbol, c: price, p: priceChangePercent, v: volume } = data;
        setCoinPrices((prevPrices) => ({
          ...prevPrices,
          [symbol]: { price, priceChangePercent, volume },
        }));
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      {topCoins.map((coin, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.coinName}>{coin.name}</Text>
          <Text style={styles.coinPrice}>
            Price: ${coinPrices[`${coin.symbol}@ticker`] ? coinPrices[`${coin.symbol}@ticker`].price : 'Loading...'}
          </Text>
          <Text style={styles.coinMarketCap}>
            Market Cap: {/* You can fetch or calculate market cap here */}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coinName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  coinPrice: {
    fontSize: 16,
  },
  coinMarketCap: {
    fontSize: 14,
    color: '#6c757d',
  },
});

export default Eye;

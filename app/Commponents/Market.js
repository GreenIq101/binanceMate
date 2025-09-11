import { StyleSheet, Text, View, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';

const Market = () => {
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [topVolumePairs, setTopVolumePairs] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchTopGainersLosers = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();

        const sortedGainers = data.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
        const sortedLosers = data.sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent));
        const sortedVolumePairs = data.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));

        setTopGainers(sortedGainers.slice(0, 5)); // Top 5 gainers
        setTopLosers(sortedLosers.slice(0, 5)); // Top 5 losers
        setTopVolumePairs(sortedVolumePairs.slice(0, 5)); // Top 5 by volume
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchTopGainersLosers();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.itemText}>{item.symbol}</Text>
      <Text style={styles.itemPercent}>{item.priceChangePercent}%</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>24 Hours</Text>
      
      <Text style={styles.title}>Top Gainers</Text>
      <FlatList
        data={topGainers}
        renderItem={renderItem}
        keyExtractor={item => item.symbol}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
      
      <Text style={styles.title}>Top Losers</Text>
      <FlatList
        data={topLosers}
        renderItem={renderItem}
        keyExtractor={item => item.symbol}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.title}>Top Volume Pairs</Text>
      <FlatList
        data={topVolumePairs}
        renderItem={renderItem}
        keyExtractor={item => item.symbol}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </ScrollView>
  );
};

export default Market;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    elevation: 3, // For shadow on Android
    shadowColor: '#000', // For shadow on iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    alignItems: 'center', // Center the text
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPercent: {
    fontSize: 14,
    color: '#4caf50', // Green color for gainers
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

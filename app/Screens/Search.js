import { StyleSheet, TextInput, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { widthPercentageToDP as w, heightPercentageToDP as h } from 'react-native-responsive-screen';

const Search = () => {
  const [name, setName] = useState('btcusdt');
  const [price, setPrice] = useState('');
  const [cap, setCap] = useState('');
  const [color, setColor] = useState('');

  const searchData = () => {
    getPriceData();
    getCapData();
    getHistoricalData();
  };

  const getPriceData = () => {
    let price = 0;
    let old_price = 0;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${name}@trade`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrice(price);
      price = parseFloat(data.p).toFixed(10);

      if (!price) {
        console.log('Error fetching Data');
      } else if (price > old_price) {
        setColor('green');
      } else if (price === old_price) {
        setColor('gray');
      } else {
        setColor('red');
      }
      old_price = price;
    };
  };

  const getCapData = () => {
    let cap_price = 0;
    let cap_old_price = 0;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${name}@ticker/24hr`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      cap_price = parseFloat(data.p).toFixed(10);
      setCap(cap_price);

      if (!cap_price) {
        console.log('Error fetching Data');
      } else if (cap_price > cap_old_price) {
        setColor('green');
      } else if (cap_price === cap_old_price) {
        setColor('gray');
      } else {
        setColor('red');
      }
      cap_old_price = cap_price;
    };
  };

  const getHistoricalData = () => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${name}@kline_1h`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const historicalData = [
          {
            time: data.k.t,
            open: data.k.o,
            high: data.k.h,
            low: data.k.l,
            close: data.k.c,
            volume: data.k.v,
          },
        ];
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    };
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.mainContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons style={styles.searchIcon} name="credit-card-search" size={30} color="whitesmoke" />
          <TextInput
            style={styles.searchInp}
            value={name}
            onChangeText={setName}
            placeholder="Enter Crypto Pair"
            placeholderTextColor="gray"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={searchData}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultContainer}>
          <View style={styles.nameCard}>
            <Text style={styles.pairLabel}>{name.toUpperCase()}</Text>
          </View>
          <View style={styles.elementsContainer}>
            <View style={styles.element}>
              <Text style={styles.elementText}>Live Price</Text>
              <Text style={[styles.elementValue, { color }]}>{price}</Text>
            </View>
            <View style={styles.element}>
              <Text style={styles.elementText}>Market Cap</Text>
              <Text style={[styles.elementValue, { color }]}>{cap}</Text>
            </View>
          </View>
        </View>

        <View style={styles.historicalData}>
          {/* You can display the historical data here in future */}
        </View>
      </View>
    </ScrollView>
  );
};

export default Search;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
    padding: w('5%'),
    backgroundColor: '#1e1e1e',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingHorizontal: w('2%'),
    marginBottom: h('3%'),
  },
  searchIcon: {
    marginRight: w('2%'),
  },
  searchInp: {
    flex: 1,
    color: 'white',
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    padding: w('3%'),
    fontSize: 16,
  },
  searchBtn: {
    // backgroundColor: '#f4511e',
    paddingVertical: h('1.5%'),
    paddingHorizontal: w('4%'),
    borderRadius: 8,
  },
  searchBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    padding: h('2%'),
    borderRadius: 10,
  },
  nameCard: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    padding: h('2%'),
    borderRadius: 10,
  },
  pairLabel: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  elementsContainer: {
    justifyContent: 'space-around',
  },
  element: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#3a3a3a',
    padding: h('2%'),
    marginVertical: h('1%'),
    borderRadius: 8,
    width: w('45%'),
  },
  elementText: {
    color: 'white',
  },
  elementValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historicalData: {
    marginTop: h('3%'),
  },
});

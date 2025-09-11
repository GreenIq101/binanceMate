
import { StyleSheet, TextInput, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { widthPercentageToDP as w } from 'react-native-responsive-screen';
import axios from 'axios';
import moment from 'moment';

const Pretest = () => {
  const [name, setName] = useState('memeusdt');
  const [price, setPrice] = useState('');
  const [cap, setCap] = useState('');
  const [marketCap, setMarketCap] = useState('');
  const [historicalData, setHistoricalData] = useState([]);
  const [sma, setSma] = useState(null);
  const [ema, setEma] = useState(null);
  const [rsi, setRsi] = useState(null);
  const [color, setColor] = useState('gray');
  const [wsPrice, setWsPrice] = useState(null);
  const [wsCap, setWsCap] = useState(null);
  const [wsHistorical, setWsHistorical] = useState(null);
  const [timeFrame, setTimeFrame] = useState('1h'); // Default time frame
  const [predictedPrice, setPredictedPrice] = useState(null); // State to hold predicted price
  const [bollingerUpper, setBollingerUpper] = useState(null);
  const [bollingerLower, setBollingerLower] = useState(null);

  const searchData = () => {
    getPriceData();
    getCapData();
    getHistoricalData();
  };

  const calculateStandardDeviation = (data) => {
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    const squaredDiffs = data.map(value => (value - mean) ** 2);
    const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / data.length;
    return Math.sqrt(variance);
  };
  

  const getPriceData = () => {
    if (wsPrice) {
      wsPrice.close();
    }

    const newWsPrice = new WebSocket(`wss://stream.binance.com:9443/ws/${name}@trade`);
    setWsPrice(newWsPrice);

    let old_price = 0;

    newWsPrice.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const currentPrice = parseFloat(data.p).toFixed(10);
      setPrice(currentPrice);

      if (!currentPrice) {
        console.log('Error fetching Data');
      } else if (currentPrice > old_price) {
        setColor('green');
      } else if (currentPrice === old_price) {
        setColor('gray');
      } else {
        setColor('red');
      }
      old_price = currentPrice;
    };

    newWsPrice.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const getCapData = () => {
    if (wsCap) {
      wsCap.close();
    }

    const newWsCap = new WebSocket(`wss://stream.binance.com:9443/ws/${name}@ticker/24hr`);
    setWsCap(newWsCap);

    let cap_old_price = 0;

    newWsCap.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const cap_price = parseFloat(data.p).toFixed(10);
      setCap(cap_price);

      const circulatingSupply = 1000000; // Replace with actual value if known
      const marketCap = (cap_price * circulatingSupply).toFixed(10);
      setMarketCap(marketCap);

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

    newWsCap.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const getHistoricalData = () => {
    if (wsHistorical) {
      wsHistorical.close();
    }

    const newWsHistorical = new WebSocket(`wss://stream.binance.com:9443/ws/${name}@kline_${timeFrame}`); // Use the selected time frame
    setWsHistorical(newWsHistorical);

    newWsHistorical.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newHistoricalData = {
          time: data.k.t,
          open: data.k.o,
          high: data.k.h,
          low: data.k.l,
          close: data.k.c,
          volume: data.k.v,
          change: data.k.c - data.k.o,
          changePercent: ((data.k.c - data.k.o) / data.k.o) * 100,
        };

        setHistoricalData((prevData) => {
          const existingIndex = prevData.findIndex((item) => item.time === newHistoricalData.time);
          if (existingIndex !== -1) {
            const updatedData = [...prevData];
            updatedData[existingIndex] = newHistoricalData;
            return updatedData;
          } else {
            const updatedData = [...prevData, newHistoricalData];
            if (updatedData.length > 50) {
              return updatedData.slice(updatedData.length - 50);
            }
            return updatedData;
          }
        });

        // Calculate Technical Indicators after updating historical data
        calculateIndicators([...historicalData, newHistoricalData]);
      } catch (error) {
        console.error('Error parsing data:', error);
      }
    };

    newWsHistorical.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const calculateIndicators = async (data) => {
    // Fetch indicators data directly from Binance API
    try {
      const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${name.toUpperCase()}&interval=${timeFrame}&limit=100`);
      const klines = response.data;

      // Simple Moving Average (SMA)
      const smaPeriod = 14;
      const closePrices = klines.map(item => parseFloat(item[4])); // Close prices
      if (closePrices.length >= smaPeriod) {
        const sma = (closePrices.slice(-smaPeriod).reduce((a, b) => a + b, 0) / smaPeriod).toFixed(2);
        setSma(sma);
      }

      if (closePrices.length < smaPeriod) {
        console.log('Not enough closing prices for SMA calculation.');
        return;
    }

      // Exponential Moving Average (EMA)
      const emaPeriod = 14;
      const k = 2 / (emaPeriod + 1);
      const ema = closePrices.reduce((acc, val, index) => {
        if (index === 0) return val; // Initial EMA is the first closing price
        return ((val - acc) * k) + acc;
      }, 0).toFixed(10);
      setEma(ema);

      // Calculate Standard Deviation
    const standardDeviation = calculateStandardDeviation(closePrices.slice(-smaPeriod)); // Last 14 prices

    
    // Calculate Bollinger Bands
    const upperBand = (parseFloat(sma) + (2 * standardDeviation)).toFixed(2);
    const lowerBand = (parseFloat(sma) - (2 * standardDeviation)).toFixed(2);
    setBollingerUpper(upperBand);
    setBollingerLower(lowerBand);

      // Relative Strength Index (RSI)
      const rsiPeriod = 14;
      if (closePrices.length >= rsiPeriod) {
        let gains = 0;
        let losses = 0;

        for (let i = 1; i < rsiPeriod; i++) {
          const change = closePrices[closePrices.length - i] - closePrices[closePrices.length - (i + 1)];
          if (change > 0) gains += change;
          else losses -= change;
        }

        const averageGain = gains / rsiPeriod;
        const averageLoss = losses / rsiPeriod;
        const rs = averageLoss === 0 ? 0 : averageGain / averageLoss;
        const rsi = (100 - (100 / (1 + rs))).toFixed(2);
        setRsi(rsi);
      }
    } catch (error) {
      console.error('Error fetching indicators:', error);
    }
  };

  // Function to predict the price for the next hour
  const predictNextPrice = () => {
    const latestClosingPrice = parseFloat(price); // Live price
    const smaValue = parseFloat(sma); // SMA
    const emaValue = parseFloat(ema); // EMA

    // Calculate predicted price
    const predicted = (0.5 * latestClosingPrice) + (0.3 * smaValue) + (0.2 * emaValue);
    setPredictedPrice(predicted.toFixed(10)); // Set predicted price state
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
              <Text style={styles.elementText}>Supply</Text>
              <Text style={styles.elementValue}>{marketCap}</Text>
            </View>
            <View style={styles.element}>
              <Text style={styles.elementText}>Market Cap</Text>
              <Text style={styles.elementValue}>{marketCap}</Text>
            </View>
            <View style={styles.element}>
              <Text style={styles.elementText}>SMA</Text>
              <Text style={styles.elementValue}>{sma}</Text>
            </View>
            <View style={styles.element}>
              <Text style={styles.elementText}>EMA</Text>
              <Text style={styles.elementValue}>{ema}</Text>
            </View>
            <View style={styles.element}>
              <Text style={styles.elementText}>RSI</Text>
              <Text style={styles.elementValue}>{rsi}</Text>
            </View>
            
            <View style={styles.element}>
  <Text style={styles.elementText}>Bollinger Upper Band</Text>
  <Text style={styles.elementValue}>{bollingerUpper}</Text>
</View>
<View style={styles.element}>
  <Text style={styles.elementText}>Bollinger Lower Band</Text>
  <Text style={styles.elementValue}>{bollingerLower}</Text>
</View>
          </View>
        </View>

        <View style={styles.predictContainer}>
          <TouchableOpacity style={styles.predictButton} onPress={predictNextPrice}>
            <Text style={styles.predictButtonText}>Predict Price</Text>
          </TouchableOpacity>
          {predictedPrice && (
            <Text style={styles.predictedPriceText}>Predicted Price: {predictedPrice}</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  mainContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  searchBar: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInp: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    color: 'whitesmoke',
  },
  searchBtn: {
    backgroundColor: '#FF5722',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: 'white',
  },
  resultContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  nameCard: {
    marginBottom: 15,
  },
  pairLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'whitesmoke',
  },
  elementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  element: {
    width: '48%',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  elementText: {
    color: 'gray',
  },
  elementValue: {
    fontWeight: 'bold',
    color: 'whitesmoke',
  },
  predictContainer: {
    alignItems: 'center',
  },
  predictButton: {
    backgroundColor: '#FF5722',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  predictButtonText: {
    color: 'white',
  },
  predictedPriceText: {
    fontSize: 18,
    color: 'whitesmoke',
  },
});

export default Pretest;



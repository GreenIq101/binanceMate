import { StyleSheet, TextInput, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as w } from 'react-native-responsive-screen';
import axios from 'axios';
import moment from 'moment';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../Firebase/fireConfig';

  // const db = firestore(); // Get a reference to the Firestore database
  const pthree = () => {
    const [name, setName] = useState('memeusdt'); // Default symbol
    const [currentTime, setCurrentTime] = useState('');
    const [price, setPrice] = useState('');
    const [marketCap, setMarketCap] = useState('');
    const [sma, setSma] = useState('');
    const [ema, setEma] = useState('');
    const [rsi, setRsi] = useState('');
    const [predictedPrice, setPredictedPrice] = useState('');
    const [predictionTime, setPredictionTime] = useState('');
    const [resultTime, setResultTime] = useState(''); // Added result time state
    const [marketTrend, setMarketTrend] = useState('');
    const [timeFrame, setTimeFrame] = useState('1h');
    const [predictionDate, setPredictionDate] = useState(''); // New state for prediction date

    
    const fetchPriceData = async () => {
      try {
        const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${name.toUpperCase()}`);
        setPrice(res.data.price);
      } catch (error) {
        console.error("Error fetching price data:", error);
      }
    };
    

    const saveData = async () => {
      const data = {
        name: name,
        price: price,
        marketCap: marketCap,
        sma: sma,
        ema: ema,
        rsi: rsi,
        predictedPrice: predictedPrice,
        predictionTime: predictionTime,
        predictionDate: predictionDate,
        resultTime:resultTime,
        marketTrend: marketTrend,
      };
      await addDoc(collection(db, 'predictions'), data);
    };

    const fetchMarketCapData = async () => {
      try {
        const res = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${name.toUpperCase()}`);
        setMarketCap(res.data.quoteVolume);
        setMarketTrend(res.data.priceChangePercent > 0 ? 'Bullish' : 'Bearish');
      } catch (error) {
        console.error("Error fetching market cap data:", error);
      }
    };

    const calculateIndicators = (data) => {
      const closingPrices = data.map(item => parseFloat(item.close));
      
      const calculatedSma = calculateSMA(closingPrices, 14);
      const calculatedEma = calculateEMA(closingPrices, 14);
      const calculatedRsi = calculateRSI(closingPrices, 14);

      setSma(calculatedSma.toFixed(2));
      setEma(calculatedEma.toFixed(2));
      setRsi(calculatedRsi.toFixed(2));

      // Call prediction here after indicators are calculated
      predictNextPrice(calculatedSma, calculatedEma);
    };

    const predictNextPrice = (sma, ema) => {
      if (sma && ema) {
        const predicted = (parseFloat(sma) + parseFloat(ema)) / 2;
        setPredictedPrice(predicted.toFixed(9));
        setPredictionTime(moment().add(1, 'hours').format('HH:mm:ss'));
        setPredictionDate(moment().add(1, 'hours').format('YYYY-MM-DD')); // Calculate prediction date
      }
    };

    const getHistoricalData = async () => {
      try {
        const res = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${name.toUpperCase()}&interval=${timeFrame}&limit=100`);
        const data = res.data.map(item => ({
          open: item[1],
          high: item[2],
          low: item[3],
          close: item[4],
        }));
        calculateIndicators(data); // Remove await to ensure it runs synchronously
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
    };

    const searchData = () => {
      fetchPriceData();
      fetchMarketCapData();
      getHistoricalData();
    };

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(moment().format('HH:mm:ss'));
      }, 1000);

      // Fetch initial data
      searchData();

      return () => clearInterval(interval); // Cleanup interval on unmount
    }, [name, timeFrame]);

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.mainContainer}>
        <LinearGradient colors={['#2e2e2e', '#1b1b1b']} style={styles.gradientBackground}>
          <View style={styles.currentTimeContainer}>
            <Text style={styles.currentTimeText}>{currentTime}</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder='Enter Symbol (e.g., ogusdt)'
              placeholderTextColor="white"
            />
            <TouchableOpacity onPress={searchData} style={styles.button}>
              <MaterialCommunityIcons name="magnify" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.dataContainer}>
            <View style={styles.card}>
              <Text style={styles.priceText}>Current Price: {price}</Text>
              <Text style={[styles.marketCapText, { color: price > 0 ? 'green' : 'red' }]}>Market Cap: {marketCap}</Text>
              <Text style={styles.indicatorsText}>SMA: {sma}, EMA: {ema}, RSI: {rsi}</Text>
              <Text style={[styles.trendText, { color: marketTrend === 'Bullish' ? 'green' : 'red' }]}>Market Trend: {marketTrend}</Text>
              <Text style={styles.predictionText}>Predicted Price in 1 hour: {predictedPrice || 'Calculating...'}</Text>
              <Text style={styles.predictionTimeText}>Prediction Time: {predictionTime || 'Calculating...'}</Text>
              <Text style={styles.resultTimeText}>Result Time: {resultTime || 'Calculating...'}</Text> 
            </View>

          </View>

          <View style={styles.buttonContainer}>

          <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={saveData} style={styles.saveButton}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => { setTimeFrame('1h'); getHistoricalData(); }} 
              style={styles.timeFrameButton}
            >
              <Text style={styles.buttonText}>1h</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => { setTimeFrame('4h'); getHistoricalData(); }} 
              style={styles.timeFrameButton}
            >
              <Text style={styles.buttonText}>4h</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => { setTimeFrame('1d'); getHistoricalData(); }} 
              style={styles.timeFrameButton}
            >
              <Text style={styles.buttonText}>1d</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
      </ScrollView>
    );
  };

  // Helper Functions
  const calculateSMA = (data, period) => {
    const sum = data.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  };

  const calculateEMA = (data, period) => {
    const k = 2 / (period + 1);
    let ema = data[0];

    for (let i = 1; i < data.length; i++) {
      ema = (data[i] * k) + (ema * (1 - k));
    }
    return ema;
  };

  const calculateRSI = (data, period) => {
    let gain = 0;
    let loss = 0;

    for (let i = 1; i < period; i++) {
      const difference = data[i] - data[i - 1];
      if (difference >= 0) gain += difference;
      else loss -= difference; // loss is negative
    }

    gain /= period;
    loss /= period;

    const rs = gain / (loss === 0 ? 1 : loss); // Avoid division by zero
    return 100 - (100 / (1 + rs));
  };

  const styles = StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
    },
    mainContainer: {
      flex: 1,
      padding: 20,
    },
    gradientBackground: {
      flex: 1,
      borderRadius: 10,
      padding: 20,
      elevation: 5,
    },
    currentTimeContainer: {
      alignItems: 'center',
      marginBottom: 10,
    },
    currentTimeText: {
      color: 'white',
      fontSize: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    input: {
      flex: 1,
      backgroundColor: '#4a4a4a',
      borderRadius: 5,
      padding: 10,
      color: 'white',
    },
    button: {
      backgroundColor: '#1b1b1b',
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
      marginLeft: 10,
    },
    dataContainer: {
      marginBottom: 20,
    },
    card: {
      backgroundColor: '#3a3a3a',
      padding: 20,
      borderRadius: 10,
    },
    priceText: {
      fontSize: 20,
      color: 'white',
    },
    marketCapText: {
      fontSize: 16,
      color: 'white',
    },
    indicatorsText: {
      fontSize: 14,
      color: 'white',
    },
    trendText: {
      fontSize: 16,
      marginVertical: 10,
      color: 'white',
    },
    predictionText: {
      fontSize: 16,
      marginTop: 10,
      color: 'white',
    },
    predictionTimeText: {
      fontSize: 16,
      color: 'white',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timeFrameButton: {
      backgroundColor: '#1b1b1b',
      borderRadius: 5,
      padding: 10,
      flex: 1,
      marginHorizontal: 5,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
    },
    resultTimeText: {
      fontSize: 16,
      color: 'white',
    },
  });

  export default pthree;

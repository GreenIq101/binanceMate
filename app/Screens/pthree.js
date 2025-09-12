import { StyleSheet, TextInput, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as w } from 'react-native-responsive-screen';
import axios from 'axios';
import moment from 'moment';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../Firebase/fireConfig';

const pthree = () => {
  const [name, setName] = useState('memeusdt'); // Default symbol
  const [currentTime, setCurrentTime] = useState('');
  const [price, setPrice] = useState('');
  const [marketCap, setMarketCap] = useState('');
  const [sma, setSma] = useState('');
  const [ema, setEma] = useState('');
  const [rsi, setRsi] = useState('');
  const [priceChange, setPriceChange] = useState('');
  const [predictedPrice, setPredictedPrice] = useState('');
  const [predictionTime, setPredictionTime] = useState('');
  const [resultTime, setResultTime] = useState(''); // Added result time state
  const [marketTrend, setMarketTrend] = useState('');
  const [timeFrame, setTimeFrame] = useState('1h');
  const [predictionDate, setPredictionDate] = useState(''); // New state for prediction date

  const cryptos = ["BTCUSDT","LTCUSDT","PEPEUSDT","BOMEUSDT","BNBUSDT"];


  const NextCrypto = () =>
  
  {
    
  }

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
      resultTime: resultTime,
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
  
    // Pass the current time frame to the prediction function
    predictNextPrice(calculatedSma, calculatedEma, timeFrame);
  };
  

  const predictNextPrice = (sma, ema, timeFrame) => {
    const predicted = (parseFloat(sma) * 0.4 + parseFloat(ema) * 0.6); // More weight to EMA
    setPredictedPrice(predicted.toFixed(9));
  
    // Adjust the predicted time based on the selected time frame
    let timeOffset = 1; // Default to 1 hour
    if (timeFrame === '4h') {
      timeOffset = 4; // 4 hours prediction
    } else if (timeFrame === '1d') {
      timeOffset = 24; // 1 day prediction (24 hours)
    }
  
    setPredictionTime(moment().add(timeOffset, 'hours').format('HH:mm:ss'));
    setPredictionDate(moment().add(timeOffset, 'hours').format('YYYY-MM-DD'));
  
    // Calculate percentage change
    const percentageChange = ((predicted - price) / price) * 100;
    setPriceChange(percentageChange.toFixed(2));
  };
  

  const getHistoricalData = async () => {
    try {
      const res = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${name.toUpperCase()}&interval=${timeFrame}&limit=200`);
      const data = res.data.map(item => ({
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
      }));
      calculateIndicators(data);
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
              <Text style={styles.predictionText}>Predicted Price : {predictedPrice || 'Calculating...'} ({priceChange > 0 ? '+' : ''}{priceChange}%)</Text>
              <Text style={styles.predictionTimeText}>Prediction Time: {predictionTime || 'Calculating...'}</Text>
              <Text style={styles.resultTimeText}>Result Time: {resultTime || 'Calculating...'}</Text> 
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={saveData} style={styles.saveButton}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setTimeFrame('1h'); getHistoricalData(); }} style={styles.timeFrameButton}>
              <Text style={styles.buttonText}>1h</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setTimeFrame('4h'); getHistoricalData(); }} style={styles.timeFrameButton}>
              <Text style={styles.buttonText}>4h</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setTimeFrame('1d'); getHistoricalData(); }} style={styles.timeFrameButton}>
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
    fontSize: 24,
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: 'white',
    fontSize: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#444',
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
  },
  dataContainer: {
    flex: 1,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#444',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  priceText: {
    fontSize: 18,
    color: 'white',
  },
  marketCapText: {
    fontSize: 18,
  },
  indicatorsText: {
    fontSize: 16,
    color: 'white',
  },
  trendText: {
    fontSize: 18,
  },
  predictionText: {
    fontSize: 16,
    color: 'yellow',
  },
  predictionTimeText: {
    fontSize: 16,
    color: 'white',
  },
  resultTimeText: {
    fontSize: 16,
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    marginRight: 5,
  },
  timeFrameButton: {
    flex: 1,
    backgroundColor: '#388e3c',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default pthree;

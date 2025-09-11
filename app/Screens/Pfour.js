import { StyleSheet, TextInput, TouchableOpacity, View, Text, ScrollView, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as w, heightPercentageToDP as h } from 'react-native-responsive-screen';
import axios from 'axios';
import moment from 'moment';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../Firebase/fireConfig';
import iOSColors from '../Commponents/Colors';

const Pfour = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const coinPairs = ['ltcusdt', 'btcusdt', 'bomeusdt', 'memeusdt','pepeusdt','solusdt','dogeusdt','dogsusdt',
    'bnbusdt','wusdt','linausdt','troyusdt','laziousdt','ogusdt',"SLFUSDT","BTCUSDT","SNXUSDT","CAKEUSDT","WANUSDT", "ZENUSDT","NEARUSDT","FARMUSDT","IDUSDT","RENUSDT","RENDERUSDT","TRXUSDT","OGNUSDT", "DYMUSDT",,"CTXCUSDT","MOVRUSDT","KSMUSDT","VTHOUSDT","ZRXUSDT","PYRUSDT","ZROUSDT","NEIROUSDT", "WRXUSDT","VIDTUSDT","UFTUSDT","ALPHAUSDT","MANTAUSDT","LUMIAUSDT","SUSHIUSDT", "NTRNUSDT","KNCUSDT","OAXUSDT","NKNUSDT","ASTUSDT","BEAMXUSDT","GMTUSDT","SYNUSDT", "COMPUSDT","ELFUSDT","FISUSDT","ASRUSDT","NEXOUSDT","BNTUSDT","ARUSDT","DARUSDT", "PIXELUSDT","TUSDT","AKROUSDT","BIFIUSDT","ARDRUSDT","SANDUSDT","FORTHUSDT","AEURUSDT", "GNSUSDT","CFXUSDT","1INCHUSDT","FIROUSDT","GRTUSDT","RAYUSDT","CRVUSDT","ETHUSDT", "1000SATSUSDT","QUICKUSDT","BARUSDT","PROMUSDT","KAVAUSDT","IMXUSDT","BOMEUSDT", "AEVOUSDT","ZILUSDT","RONINUSDT","TIAUSDT","SYSUSDT","AMBUSDT","AIUSDT","BANDUSDT","GASUSDT","FETUSDT", "COMBOUSDT","SOLUSDT","JUVUSDT","VOXELUSDT","REQUSDT","HOOKUSDT","CVCUSDT","UMAUSDT","USDCUSDT", ,"FIOUSDT","RLCUSDT","POLUSDT","PEPEUSDT","SCRTUSDT","IDEXUSDT","FLOKIUSDT","LITUSDT","VIBUSDT","WUSDT","LSXUSDT","GALAUSDT",
    ,"DATAUSDT","SLFUSDT","BTCUSDT","SNXUSDT","CAKEUSDT","WANUSDT","ZENUSDT","NEARUSDT","FARMUSDT","IDUSDT","RENUSDT","RENDERUSDT","TRXUSDT","OGNUSDT","DYMUSDT","CTXCUSDT","MOVRUSDT","KSMUSDT","VTHOUSDT","ZRXUSDT","PYRUSDT","ZROUSDT","NEIROUSDT","WRXUSDT","VIDTUSDT","UFTUSDT","ALPHAUSDT","MANTAUSDT","LUMIAUSDT","SUSHIUSDT","NTRNUSDT","KNCUSDT","OAXUSDT","NKNUSDT","ASTUSDT","BEAMXUSDT","GMTUSDT","SYNUSDT","COMPUSDT","ELFUSDT","FISUSDT","ASRUSDT","NEXOUSDT","BNTUSDT","ARUSDT","DARUSDT","PIXELUSDT","TUSDT","AKROUSDT","BIFIUSDT","ARDRUSDT","SANDUSDT","FORTHUSDT","AEURUSDT","GNSUSDT","CFXUSDT","1INCHUSDT","FIROUSDT","GRTUSDT","RAYUSDT","CRVUSDT","ETHUSDT","1000SATSUSDT","QUICKUSDT","BARUSDT","PROMUSDT","KAVAUSDT","IMXUSDT","BOMEUSDT","AEVOUSDT","ZILUSDT","RONINUSDT","TIAUSDT","SYSUSDT","AMBUSDT","AIUSDT","BANDUSDT","GASUSDT","FETUSDT","COMBOUSDT","SOLUSDT","JUVUSDT","VOXELUSDT","REQUSDT","HOOKUSDT","CVCUSDT","UMAUSDT","USDCUSDT","FIOUSDT","RLCUSDT","POLUSDT","PEPEUSDT","SCRTUSDT","IDEXUSDT","FLOKIUSDT","LITUSDT","VIBUSDT","WUSDT","LSXUSDT","GALAUSDT","DATAUSDT","TONUSDT","AAVEUSDT","TAOUSDT","ONTUSDT"
    ,"WBTCUSDT","XECUSDT","CHRUSDT","SCUSDT","HIFIUSDT","DOTUSDT","CELRUSDT","AUDIOUSDT","RSRUSDT","GHSTUSDT","BNXUSDT","FLOWUSDT","BALUSDT","LQTYUSDT","AUCTIONUSDT","NMRUSDT","MEMEUSDT","HMSTRUSDT","ETCUSDT","AXLUSDT","RADUSDT","BLZUSDT","DODOUSDT","KP3RUSDT","LOKAUSDT","YGGUSDT","GMXUSDT","XVGUSDT","ARBUSDT","HARDUSDT","XIAUSDT","FILUSDT","NFPUSDT","TKOUSDT","RAREUSDT","PERPUSDT","MBLUSDT","JOEUSDT","KMDUSDT","CHZUSDT","UNFIUSDT","WIFUSDT","DOGSUSDT","LTOUSDT","EURIUSDT","GUSDT","SANTOSUSDT","FIDAUSDT","INJUSDT","WINGUSDT","DGBUSDT","BICOUSDT","SEIUSDT","OXTUSDT","CKBUSDT","BCHUSDT","ARPAUSDT","DOTUSDT","EOSUSDT","ROSEUSDT","IOTXUSDT","TROYUSDT","STRAXUSDT","JASMYUSDT","STXUSDT","REIUSDT","OMUSDT","ALICEUSDT","KDAUSDT","ONGUSDT","FUNUSDT","TRBUSDT","JUPUSDT","METISUSDT","VITEUSDT","TNSRUSDT","PONDUSDT","FLMUSDT","SXPUSDT","PHBUSDT","LDUUSDT","PENDLEUSDT","DIAUSDT","XVSUSDT","LAZIOUSDT","AERGOUSDT","TWTUSDT","RDNTUSDT","GLMUSDT","CYBERUSDT","1MBABYDOGEUSDT","SFPUSDT","ILVUSDT","ATMUSDT","CTKUSDT","IQUSDT","THETAUSDT","AVAUSDT","CITTYUSDT","BONKUSDT","DEXEUSDT","FDUSTUSDT","BNBUSDT","ALGOUSDT","PAXGUSDT","LUNCUSDT","STGUSDT","ENAUSDT","BADGERUSDT","ASTRUSDT","MASKUSDT","BATUSDT","STORJUSDT","NEOUSDT","WLDUSDT","XLMUSDT","DYDXUSDT","LRCUSDT","RVNUSDT","TUSDUSDT","TURBOUSDT","DASHUSDT","BBUSDT","ADAUSDT","PEOPLEUSDT","USDPUSDT","DEGOUSDT","VICUSDT","SUNUSDT","FLUXUSDT","PEPEUSDT","TLMUSDT","MTLUSDT","OPUSDT","ARKMUSDT","DAIUSDT","WOOUSDT","CHESSUSDT","ACHUSDT","XRPUSDT","LUNAUSDT","DENTUSDT","KEYUSDT","HBARUSDT","ONEUSDT","QKCUSDT","ENJUSDT","ALTUSDT","WBETHUSDT","ERNUSDT","SUIUSDT","DOGEUSDT","STEEMUSDT","RPLUSDT","PDAUSDT",
    "OMNIUSDT","LSKUSDT","MINAUSDT","MKRUSDT","VETUSDT","PYTHUSDT","LEVERUSDT","MDTUSDT","MBOXUSDT","ZECUSDT","FXSUSDT","DFUSDT","BNSOLUSDT","OSMOUSDT","OOKIUSDT","GLMRUSDT","XNOUSDT","UTKUSDT","BELUSDT","DCRUSDT","CELOUSDT","FTMUSDT","IOTAUSDT","AVAXUSDT","EDUUSDT","AXSUSDT","SAGAUSDT","ZKUSDT","SKLUSDT","COTIUSDT","EIGENUSDT","XTZUSDT","WINUSDT","HIVEUSDT","POLYXUSDT","QIUSDT","ICPUSDT","IOSTUSDT","VANRYUSDT","MAGICUSDT","RIFUSDT","LINAUSDT","UNIUSDT","BAKEUSDT","RUNEUSDT","QUTUSDT","CREAMUSDT","MLNUSDT","HFTUSDT","PSGUSDT","STRKUSDT","AGLDUSDT","API3USDT","STPTUSDT","CTSIUSDT","DUSKUSDT","PUNDIXUSDT","PHAUSDT","ICXUSDT","ANKRUSDT","ENSUSDT","BSWUSDT","SUPER","LISTAUSDT","ATOMUSDT","GFTUSDT","QTUMUSDT","LPTUSDT","EGLDUSDT","JSTUSDT","CVXUSDT","IRISUSDT","REZUSDT","ETHFIUSDT","BLURUSDT","SNTUSDT","C98USDT","PORTOUSDT","SCRUSDT","SSVUSDT","TRUUSDT","JTOUSDT","ATAUSDT","KLAYUSDT","IOUSDT","ACMUSDT","TFUELUSDT","PIVXUSDT","HIGHUSDT","PORTALUSDT","MAVUSDT","GTCUSDT","LTCUSDT","LINKUSDT","BETAUSDT","CLVUSDT","WAXPUSDT","ALPACAUSDT","USTCUSDT","ACEUSDT","ORDIUSDT","SHIBUSDT","CATIUSDT","BANANAUSDT","BTTCUSDT","STMXUSDT","APEUSDT","IDRTUSDT","COSUSDT","ARKUSDT","BURGERUSDT","ALPINEUSDT","MANAUSDT","ACAUSDT","OGUSDT","AMPUSDT","YFIUSDT","NULSUSDT","CITYUSDT","NOTUSDT","APTUSDT","SLPUSDT","GNOUSDT","HOTUSDT","PROSUSDT","ALCXUSDT","FTTUSDT","SUPERUSDT"
    ]; // Array of coin pairs
  const [currentIndex, setCurrentIndex] = useState(0);
  const [name, setName] = useState(coinPairs[currentIndex]);
  // const [name, setName] = useState('memeusdt'); // Default symbol
  const [currentTime, setCurrentTime] = useState('');
  const [price, setPrice] = useState('');
  const [marketCap, setMarketCap] = useState('');
  const [sma, setSma] = useState('');
  const [ema, setEma] = useState('');
  const [rsi, setRsi] = useState('');
  const [bbLower, setBbLower] = useState(''); // Bollinger Band Lower
  const [bbUpper, setBbUpper] = useState(''); // Bollinger Band Upper
  const [macd, setMacd] = useState(''); // MACD
  const [atr, setAtr] = useState(''); // ATR
  const [priceChange, setPriceChange] = useState('');
  const [predictedPrice, setPredictedPrice] = useState('');
  const [predictionTime, setPredictionTime] = useState('');
  const [resultTime, setResultTime] = useState('');
  const [marketTrend, setMarketTrend] = useState('');
  const [timeFrame, setTimeFrame] = useState('1h');
  const [predictionDate, setPredictionDate] = useState('');
  // Additional state variables for calculation
const [sellValue, setSellValue] = useState('');
const [predictedReturn, setPredictedReturn] = useState('');
const [accuracyReturn, setAccuracyReturn] = useState('');

  const fetchPriceData = async () => {
    try {
      const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${name.toUpperCase()}`);
      setPrice(res.data.price);
    } catch (error) {
      console.error("Error fetching price data:", error);
    }
  };

  const calculateReturn = () => {
    const livePrice = parseFloat(price);
    const predictedPrice = parseFloat(predictedPrice);
    const sellPercentage = 0.50; // 0.50% profit
  
    if (!isNaN(livePrice) && !isNaN(predictedPrice)) {
      // Calculate absolute difference
      const absoluteDifference = predictedPrice - livePrice;
  
      // Calculate percentage difference
      const percentageDifference = (absoluteDifference / livePrice) * 100;
  
      // Calculate selling price for 0.50% profit
      const sellingPrice = livePrice + (livePrice * sellPercentage / 100);
  
      // Update state variables
      setPredictedReturn(percentageDifference.toFixed(2) + '%');
      setAccuracyReturn(sellingPrice.toFixed(9));
      setSellValue(sellingPrice.toFixed(9));
    } else {
      alert("Please ensure live price and predicted price are valid numeric values.");
    }
  };
  const calculateProfit = () => {
    const livePrice = parseFloat(price);
    const profitPercentage = parseFloat(sellValue); // Get profit percentage from input
  
    if (!isNaN(livePrice) && !isNaN(profitPercentage)) {
      // Calculate selling price
      const sellingPrice = livePrice + (livePrice * profitPercentage / 100);
  
      // Update state variable
      setAccuracyReturn(sellingPrice.toFixed(9));
    } else {
      alert("Please enter a valid numeric value for profit percentage.");
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % coinPairs.length;
    setCurrentIndex(nextIndex);
    setName(coinPairs[nextIndex]);
    console.log("Array Items :  " + coinPairs.length.toString() );
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + coinPairs.length) % coinPairs.length;
    setCurrentIndex(prevIndex);
    setName(coinPairs[prevIndex]);
  };


  const saveData = async () => {
    const data = {
      name: name,
      price: price,
      marketCap: marketCap,
      sma: sma,
      ema: ema,
      rsi: rsi,
      bbLower: bbLower,
      bbUpper: bbUpper,
      macd: macd,
      atr: atr,
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
    const { lowerBand, upperBand } = calculateBollingerBands(closingPrices, 14);
    const calculatedMacd = calculateMACD(closingPrices, 12, 26, 9);
    const calculatedAtr = calculateATR(data, 14);
  
    setSma(calculatedSma.toFixed(2));
    setEma(calculatedEma.toFixed(2));
    setRsi(calculatedRsi.toFixed(2));
    setBbLower(lowerBand.toFixed(2));
    setBbUpper(upperBand.toFixed(2));
    setMacd(calculatedMacd.toFixed(2));
    setAtr(calculatedAtr.toFixed(2));
  
    predictNextPrice(calculatedSma, calculatedEma, timeFrame);
  };

  const predictNextPrice = (sma, ema, timeFrame) => {
    const predicted = (parseFloat(sma) * 0.4 + parseFloat(ema) * 0.6);
    setPredictedPrice(predicted.toFixed(9));
  
    let timeOffset = 1; 
    if (timeFrame === '4h') {
      timeOffset = 4;
    } else if (timeFrame === '1d') {
      timeOffset = 24;
    } else if (timeFrame === '3m') {
      timeOffset = 3 / 60;
    } else if (timeFrame === '5m') {
      timeOffset = 5 / 60;
    } else if (timeFrame === '30m') {
      timeOffset = 30 / 60;
    }
  
    setPredictionTime(moment().add(timeOffset, 'hours').format('HH:mm:ss'));
    setPredictionDate(moment().add(timeOffset, 'hours').format('YYYY-MM-DD'));
  
    const percentageChange = ((predicted - price) / price) * 100;
    setPriceChange(percentageChange.toFixed(2));
  };

  const getHistoricalData = async () => {
    try {
      const res = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${name.toUpperCase()}&interval=${timeFrame}&limit=400`);
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
    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();

    const interval = setInterval(() => {
      setCurrentTime(moment().format('HH:mm:ss'));
    }, 1000);

    searchData();

    return () => clearInterval(interval);
  }, [name, timeFrame]);

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={iOSColors.gradients.background} style={styles.background}>
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >

          <View style={styles.currentTimeContainer}>
            <Text style={styles.currentTimeText}>Server Time: {currentTime}</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder='Enter Symbol (e.g., ogusdt)'
              placeholderTextColor={iOSColors.text.tertiary}
            />
            <TouchableOpacity onPress={searchData} style={styles.button}>
              <MaterialCommunityIcons name="archive-search" size={24} color={iOSColors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.dataContainer}>
            <View style={styles.card}>
              <View style={styles.userDataCard} >
                <Text style={styles.priceText}>Current Price: {price}</Text>
                <Text style={styles.predictionText}>Predicted Price: {predictedPrice || 'Calculating...'} ({priceChange > 0 ? '+' : ''}{priceChange}%)</Text>
                <Text style={styles.predictionTimeText}>Prediction Time: {predictionTime || 'Calculating...'}</Text>
              </View>

               <View style={styles.marketDataCard} >
                <Text style={[styles.trendText, { color: marketTrend === 'Bullish' ? iOSColors.status.bullish : iOSColors.status.bearish }]}>Market Trend: {marketTrend}</Text>
                <Text style={[styles.marketCapText, { color: price > 0 ? iOSColors.status.bullish : iOSColors.status.bearish }]}>Market Cap: {marketCap}</Text>
                <Text style={styles.indicatorsText}>SMA: {sma}, EMA: {ema}, RSI: {rsi}</Text>
                <Text style={styles.indicatorsText}>BB Lower: {bbLower}, BB Upper: {bbUpper}</Text>
                <Text style={styles.indicatorsText}>MACD: {macd}, ATR: {atr}</Text>
              </View>

            </View>
          </View>

          <View style={styles.calculationContainer}>

          <TouchableOpacity onPress={handleNext} style={styles.nextBtn} >
              <Text style={styles.nextBtnText} > Next </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePrevious} style={styles.nextBtn} >
              <Text style={styles.nextBtnText} > Prev </Text>
            </TouchableOpacity>

          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={saveData} style={styles.saveButton}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setTimeFrame('5m'); searchData(); }} style={styles.timeButton}>
              <Text style={styles.buttonText}>5m</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setTimeFrame('30m'); searchData(); }} style={styles.timeButton}>
              <Text style={styles.buttonText}>30m</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setTimeFrame('1h'); searchData(); }} style={styles.timeButton}>
              <Text style={styles.buttonText}>1h</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setTimeFrame('4h'); searchData(); }} style={styles.timeButton}>
              <Text style={styles.buttonText}>4h</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setTimeFrame('1d'); searchData(); }} style={styles.timeButton}>
              <Text style={styles.buttonText}>1d</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
};

// Helper function to calculate MACD (Moving Average Convergence Divergence)
const calculateMACD = (data, shortPeriod, longPeriod, signalPeriod) => {
  const shortEMA = calculateEMA(data, shortPeriod);
  const longEMA = calculateEMA(data, longPeriod);
  const macdLine = shortEMA - longEMA;  // MACD Line is the difference between short EMA and long EMA
  const signalLine = calculateEMA(data.slice(-signalPeriod), signalPeriod); // Signal Line is the EMA of the MACD Line
  const macdHistogram = macdLine - signalLine; // Histogram is the difference between MACD Line and Signal Line

  return macdLine; // Return only the MACD Line (or you can return {macdLine, signalLine, macdHistogram} if needed)
};

const calculateBollingerBands = (data, period) => {
  const sma = calculateSMA(data, period); // Calculate the SMA as part of Bollinger Bands calculation
  const stdDev = Math.sqrt(
    data.slice(-period).reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period
  );

  const lowerBand = sma - (2 * stdDev); // Lower Bollinger Band is SMA - 2 * standard deviation
  const upperBand = sma + (2 * stdDev); // Upper Bollinger Band is SMA + 2 * standard deviation

  return {
    lowerBand,
    upperBand
  };
};

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

// Helper function to calculate ATR (Average True Range)
const calculateATR = (data, period) => {
  let trValues = []; // True Range values

  for (let i = 1; i < data.length; i++) {
    const currentHigh = parseFloat(data[i].high);
    const currentLow = parseFloat(data[i].low);
    const prevClose = parseFloat(data[i - 1].close);

    // True Range is the greatest of the following:
    const tr = Math.max(
      currentHigh - currentLow, // High - Low
      Math.abs(currentHigh - prevClose), // High - Previous Close
      Math.abs(currentLow - prevClose) // Low - Previous Close
    );

    trValues.push(tr);
  }

  // ATR is the Exponential Moving Average (EMA) of the True Range values
  const atr = calculateEMA(trValues, period);
  return atr;
};

const calculateRSI = (data, period) => {
  let gain = 0;
  let loss = 0;

  for (let i = 1; i < period; i++) {
    const difference = data[i] - data[i - 1];
    if (difference >= 0) gain += difference;
    else loss -= difference; // fixed typo: loss instead of los s
  }

  gain /= period;
  loss /= period;

  const rs = gain / (loss === 0 ? 1 : loss); // Avoid division by zero
  return 100 - (100 / (1 + rs));
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: iOSColors.background.primary,
  },
  background: {
    flex: 1,
    padding: w('5%'),
  },
  contentContainer: {
    flex: 1,
  },
  currentTimeContainer: {
    marginBottom: w('5%'),
    alignItems: 'center',
  },
  currentTimeText: {
    fontSize: 18,
    fontWeight: '600',
    color: iOSColors.text.primary,
    backgroundColor: iOSColors.background.tertiary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: w('5%'),
  },
  input: {
    width: w('70%'),
    height: 50,
    backgroundColor: iOSColors.background.tertiary,
    borderColor: iOSColors.border.light,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: w('4%'),
    color: iOSColors.text.primary,
    fontSize: 16,
  },
  button: {
    width: w('20%'),
    height: 50,
    backgroundColor: iOSColors.button.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: iOSColors.button.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dataContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: iOSColors.background.secondary,
    padding: w('5%'),
    borderRadius: 16,
    marginBottom: w('5%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  userDataCard: {
    marginBottom: w('5%'),
  },
  marketDataCard: {
    marginBottom: w('5%'),
  },
  calCard: {
    height: "30%",
    width: "100%",
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  priceText: {
    fontSize: 18,
    color: iOSColors.text.primary,
    fontWeight: '600',
  },
  predictionText: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.status.bullish,
    marginVertical: 4,
  },
  predictionTimeText: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    fontWeight: '500',
  },
  trendText: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 4,
  },
  marketCapText: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    fontWeight: '500',
  },
  indicatorsText: {
    fontSize: 13,
    color: iOSColors.text.tertiary,
    fontWeight: '400',
    marginVertical: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  saveButton: {
    width: w('20%'),
    height: 50,
    backgroundColor: iOSColors.button.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: iOSColors.button.success,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timeFrameButton: {
    flex: 0.18,
    backgroundColor: iOSColors.background.tertiary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 2,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: iOSColors.border.light,
  },
  buttonText: {
    color: iOSColors.text.primary,
    fontWeight: '600',
    fontSize: 14,
  },
    calculationContainer: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: w('5%'),
    },
    InputContainer: {
      width: w('40%'),
    },
  CalculateBtnContainer:
  {
    height:'100%',
    width:"30%",
  },
  resultContainer: {
    height:'100%',
    width:'30%',
    justifyContent:'space-evenly',
    alignItems:'center'
  },
  input: {
    backgroundColor: iOSColors.background.tertiary,
    color: iOSColors.text.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: iOSColors.border.light,
    fontSize: 16,
  },
  calculateButton: {
    backgroundColor: iOSColors.button.warning,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: iOSColors.button.warning,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultText: {
    color: iOSColors.text.primary,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  nextBtn:
  {
    height: 50,
    width:'90%',
    backgroundColor: iOSColors.button.warning,
    padding: 12,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: iOSColors.button.warning,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextBtnText:
  {
    color: iOSColors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  timeButton: {
    width: w('10%'),
    height: 50,
    backgroundColor: iOSColors.button.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: iOSColors.button.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

});


export default Pfour;

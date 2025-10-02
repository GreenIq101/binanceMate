"use client"

import { StyleSheet, TextInput, Pressable, View, Text, Animated, Modal } from "react-native"
import { useState, useEffect, useRef } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import axios from "axios"
import moment from "moment"
import { collection, addDoc } from "firebase/firestore"
import { db, auth } from "../Firebase/fireConfig"
import iOSColors from "../Commponents/Colors"

const Pfour = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  const coinPairs = [
    "ltcusdt",
    "btcusdt",
    "bomeusdt",
    "memeusdt",
    "pepeusdt",
    "solusdt",
    "dogeusdt",
    "dogsusdt",
    "bnbusdt",
    "wusdt",
    "linausdt",
    "troyusdt",
    "laziousdt",
    "ogusdt",
    "SLFUSDT",
    "BTCUSDT",
    "SNXUSDT",
    "CAKEUSDT",
    "WANUSDT",
    "ZENUSDT",
    "NEARUSDT",
    "FARMUSDT",
    "IDUSDT",
    "RENUSDT",
    "RENDERUSDT",
    "TRXUSDT",
    "OGNUSDT",
    "DYMUSDT",
    "CTXCUSDT",
    "MOVRUSDT",
    "KSMUSDT",
    "VTHOUSDT",
    "ZRXUSDT",
    "PYRUSDT",
    "ZROUSDT",
    "NEIROUSDT",
    "WRXUSDT",
    "VIDTUSDT",
    "UFTUSDT",
    "ALPHAUSDT",
    "MANTAUSDT",
    "LUMIAUSDT",
    "SUSHIUSDT",
    "NTRNUSDT",
    "KNCUSDT",
    "OAXUSDT",
    "NKNUSDT",
    "ASTUSDT",
    "BEAMXUSDT",
    "GMTUSDT",
    "SYNUSDT",
    "COMPUSDT",
    "ELFUSDT",
    "FISUSDT",
    "ASRUSDT",
    "NEXOUSDT",
    "BNTUSDT",
    "ARUSDT",
    "DARUSDT",
    "PIXELUSDT",
    "TUSDT",
    "AKROUSDT",
    "BIFIUSDT",
    "ARDRUSDT",
    "SANDUSDT",
    "FORTHUSDT",
    "AEURUSDT",
    "GNSUSDT",
    "CFXUSDT",
    "1INCHUSDT",
    "FIROUSDT",
    "GRTUSDT",
    "RAYUSDT",
    "CRVUSDT",
    "ETHUSDT",
    "1000SATSUSDT",
    "QUICKUSDT",
    "BARUSDT",
    "PROMUSDT",
    "KAVAUSDT",
    "IMXUSDT",
    "BOMEUSDT",
    "AEVOUSDT",
    "ZILUSDT",
    "RONINUSDT",
    "TIAUSDT",
    "SYSUSDT",
    "AMBUSDT",
    "AIUSDT",
    "BANDUSDT",
    "GASUSDT",
    "FETUSDT",
    "COMBOUSDT",
    "SOLUSDT",
    "JUVUSDT",
    "VOXELUSDT",
    "REQUSDT",
    "HOOKUSDT",
    "CVCUSDT",
    "UMAUSDT",
    "USDCUSDT",
    "FIOUSDT",
    "RLCUSDT",
    "POLUSDT",
    "PEPEUSDT",
    "SCRTUSDT",
    "IDEXUSDT",
    "FLOKIUSDT",
    "LITUSDT",
    "VIBUSDT",
    "WUSDT",
    "LSXUSDT",
    "GALAUSDT",
    "DATAUSDT",
    "TONUSDT",
    "AAVEUSDT",
    "TAOUSDT",
    "ONTUSDT",
    "WBTCUSDT",
    "XECUSDT",
    "CHRUSDT",
    "SCUSDT",
    "HIFIUSDT",
    "DOTUSDT",
    "CELRUSDT",
    "AUDIOUSDT",
    "RSRUSDT",
    "GHSTUSDT",
    "BNXUSDT",
    "FLOWUSDT",
    "BALUSDT",
    "LQTYUSDT",
    "AUCTIONUSDT",
    "NMRUSDT",
    "MEMEUSDT",
    "HMSTRUSDT",
    "ETCUSDT",
    "AXLUSDT",
    "RADUSDT",
    "BLZUSDT",
    "DODOUSDT",
    "KP3RUSDT",
    "LOKAUSDT",
    "YGGUSDT",
    "GMXUSDT",
    "XVGUSDT",
    "ARBUSDT",
    "HARDUSDT",
    "XIAUSDT",
    "FILUSDT",
    "NFPUSDT",
    "TKOUSDT",
    "RAREUSDT",
    "PERPUSDT",
    "MBLUSDT",
    "JOEUSDT",
    "KMDUSDT",
    "CHZUSDT",
    "UNFIUSDT",
    "WIFUSDT",
    "DOGSUSDT",
    "LTOUSDT",
    "EURIUSDT",
    "GUSDT",
    "SANTOSUSDT",
    "FIDAUSDT",
    "INJUSDT",
    "WINGUSDT",
    "DGBUSDT",
    "BICOUSDT",
    "SEIUSDT",
    "OXTUSDT",
    "CKBUSDT",
    "BCHUSDT",
    "ARPAUSDT",
    "EOSUSDT",
    "ROSEUSDT",
    "IOTXUSDT",
    "STRAXUSDT",
    "JASMYUSDT",
    "STXUSDT",
    "REIUSDT",
    "OMUSDT",
    "ALICEUSDT",
    "KDAUSDT",
    "ONGUSDT",
    "FUNUSDT",
    "TRBUSDT",
    "JUPUSDT",
    "METISUSDT",
    "VITEUSDT",
    "TNSRUSDT",
    "PONDUSDT",
    "FLMUSDT",
    "SXPUSDT",
    "PHBUSDT",
    "LDUUSDT",
    "PENDLEUSDT",
    "DIAUSDT",
    "XVSUSDT",
    "AERGOUSDT",
    "TWTUSDT",
    "RDNTUSDT",
    "GLMUSDT",
    "CYBERUSDT",
    "1MBABYDOGEUSDT",
    "SFPUSDT",
    "ILVUSDT",
    "ATMUSDT",
    "CTKUSDT",
    "IQUSDT",
    "THETAUSDT",
    "AVAUSDT",
    "CITTYUSDT",
    "BONKUSDT",
    "DEXEUSDT",
    "FDUSTUSDT",
    "ALGOUSDT",
    "PAXGUSDT",
    "LUNCUSDT",
    "STGUSDT",
    "ENAUSDT",
    "BADGERUSDT",
    "ASTRUSDT",
    "MASKUSDT",
    "BATUSDT",
    "STORJUSDT",
    "NEOUSDT",
    "WLDUSDT",
    "XLMUSDT",
    "DYDXUSDT",
    "LRCUSDT",
    "RVNUSDT",
    "TUSDUSDT",
    "TURBOUSDT",
    "DASHUSDT",
    "BBUSDT",
    "ADAUSDT",
    "PEOPLEUSDT",
    "USDPUSDT",
    "DEGOUSDT",
    "VICUSDT",
    "SUNUSDT",
    "FLUXUSDT",
    "TLMUSDT",
    "MTLUSDT",
    "OPUSDT",
    "ARKMUSDT",
    "DAIUSDT",
    "WOOUSDT",
    "CHESSUSDT",
    "ACHUSDT",
    "XRPUSDT",
    "LUNAUSDT",
    "DENTUSDT",
    "KEYUSDT",
    "HBARUSDT",
    "ONEUSDT",
    "QKCUSDT",
    "ENJUSDT",
    "ALTUSDT",
    "WBETHUSDT",
    "ERNUSDT",
    "SUIUSDT",
    "STEEMUSDT",
    "RPLUSDT",
    "PDAUSDT",
    "OMNIUSDT",
    "LSKUSDT",
    "MINAUSDT",
    "MKRUSDT",
    "VETUSDT",
    "PYTHUSDT",
    "LEVERUSDT",
    "MDTUSDT",
    "MBOXUSDT",
    "ZECUSDT",
    "FXSUSDT",
    "DFUSDT",
    "BNSOLUSDT",
    "OSMOUSDT",
    "OOKIUSDT",
    "GLMRUSDT",
    "XNOUSDT",
    "UTKUSDT",
    "BELUSDT",
    "DCRUSDT",
    "CELOUSDT",
    "FTMUSDT",
    "IOTAUSDT",
    "AVAXUSDT",
    "EDUUSDT",
    "AXSUSDT",
    "SAGAUSDT",
    "ZKUSDT",
    "SKLUSDT",
    "COTIUSDT",
    "EIGENUSDT",
    "XTZUSDT",
    "WINUSDT",
    "HIVEUSDT",
    "POLYXUSDT",
    "QIUSDT",
    "ICPUSDT",
    "IOSTUSDT",
    "VANRYUSDT",
    "MAGICUSDT",
    "RIFUSDT",
    "UNIUSDT",
    "BAKEUSDT",
    "RUNEUSDT",
    "QUTUSDT",
    "CREAMUSDT",
    "MLNUSDT",
    "HFTUSDT",
    "PSGUSDT",
    "STRKUSDT",
    "AGLDUSDT",
    "API3USDT",
    "STPTUSDT",
    "CTSIUSDT",
    "DUSKUSDT",
    "PUNDIXUSDT",
    "PHAUSDT",
    "ICXUSDT",
    "ANKRUSDT",
    "ENSUSDT",
    "BSWUSDT",
    "SUPER",
    "LISTAUSDT",
    "ATOMUSDT",
    "GFTUSDT",
    "QTUMUSDT",
    "LPTUSDT",
    "EGLDUSDT",
    "JSTUSDT",
    "CVXUSDT",
    "IRISUSDT",
    "REZUSDT",
    "ETHFIUSDT",
    "BLURUSDT",
    "SNTUSDT",
    "C98USDT",
    "PORTOUSDT",
    "SCRUSDT",
    "SSVUSDT",
    "TRUUSDT",
    "JTOUSDT",
    "ATAUSDT",
    "KLAYUSDT",
    "IOUSDT",
    "ACMUSDT",
    "TFUELUSDT",
    "PIVXUSDT",
    "HIGHUSDT",
    "PORTALUSDT",
    "MAVUSDT",
    "GTCUSDT",
    "LINKUSDT",
    "BETAUSDT",
    "CLVUSDT",
    "WAXPUSDT",
    "ALPACAUSDT",
    "USTCUSDT",
    "ACEUSDT",
    "ORDIUSDT",
    "SHIBUSDT",
    "CATIUSDT",
    "BANANAUSDT",
    "BTTCUSDT",
    "STMXUSDT",
    "APEUSDT",
    "IDRTUSDT",
    "COSUSDT",
    "ARKUSDT",
    "BURGERUSDT",
    "ALPINEUSDT",
    "MANAUSDT",
    "ACAUSDT",
    "AMPUSDT",
    "YFIUSDT",
    "NULSUSDT",
    "CITYUSDT",
    "NOTUSDT",
    "APTUSDT",
    "SLPUSDT",
    "GNOUSDT",
    "HOTUSDT",
    "PROSUSDT",
    "ALCXUSDT",
    "FTTUSDT",
    "SUPERUSDT",
  ]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [name, setName] = useState(coinPairs[currentIndex])
  const [currentTime, setCurrentTime] = useState("")
  const [price, setPrice] = useState("")
  const [marketCap, setMarketCap] = useState("")
  const [sma, setSma] = useState("")
  const [ema, setEma] = useState("")
  const [rsi, setRsi] = useState("")
  const [bbLower, setBbLower] = useState("")
  const [bbUpper, setBbUpper] = useState("")
  const [macd, setMacd] = useState("")
  const [atr, setAtr] = useState("")
  const [priceChange, setPriceChange] = useState("")
  const [predictedPrice, setPredictedPrice] = useState("")
  const [predictionTime, setPredictionTime] = useState("")
  const [resultTime, setResultTime] = useState("")
  const [marketTrend, setMarketTrend] = useState("")
  const [timeFrame, setTimeFrame] = useState("1h")
  const [predictionDate, setPredictionDate] = useState("")
  const [sellValue, setSellValue] = useState("")
  const [predictedReturn, setPredictedReturn] = useState("")
  const [accuracyReturn, setAccuracyReturn] = useState("")
  const [modalVisible, setModalVisible] = useState(false)

  const fetchPriceData = async () => {
    try {
      const res = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${name.toUpperCase()}`)
      setPrice(res.data.price)
    } catch (error) {
      console.error("Error fetching price data:", error)
    }
  }

  const calculateReturn = () => {
    const livePrice = Number.parseFloat(price)
    const sellPercentage = 0.5

    if (!isNaN(livePrice)) {
      const absoluteDifference = Number.parseFloat(predictedPrice) - livePrice
      const percentageDifference = (absoluteDifference / livePrice) * 100
      const sellingPrice = livePrice + (livePrice * sellPercentage) / 100

      setPredictedReturn(percentageDifference.toFixed(2) + "%")
      setAccuracyReturn(sellingPrice.toFixed(9))
      setSellValue(sellingPrice.toFixed(9))
    } else {
      alert("Please ensure live price is a valid numeric value.")
    }
  }

  const calculateProfit = () => {
    const livePrice = Number.parseFloat(price)
    const profitPercentage = Number.parseFloat(sellValue)

    if (!isNaN(livePrice) && !isNaN(profitPercentage)) {
      const sellingPrice = livePrice + (livePrice * profitPercentage) / 100
      setAccuracyReturn(sellingPrice.toFixed(9))
    } else {
      alert("Please enter a valid numeric value for profit percentage.")
    }
  }

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % coinPairs.length
    setCurrentIndex(nextIndex)
    setName(coinPairs[nextIndex])
  }

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + coinPairs.length) % coinPairs.length
    setCurrentIndex(prevIndex)
    setName(coinPairs[prevIndex])
  }

  const saveData = async () => {
    const user = auth.currentUser
    if (!user) {
      alert("Please log in to save predictions.")
      return
    }

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
      userId: user.uid,
      createdAt: new Date(),
    }
    await addDoc(collection(db, "predictions"), data)
    setModalVisible(true)
  }

  const fetchMarketCapData = async () => {
    try {
      const res = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${name.toUpperCase()}`)
      setMarketCap(res.data.quoteVolume)
      setMarketTrend(res.data.priceChangePercent > 0 ? "Bullish" : "Bearish")
    } catch (error) {
      console.error("Error fetching market cap data:", error)
    }
  }

  const calculateIndicators = (data) => {
    const closingPrices = data.map((item) => Number.parseFloat(item.close))

    const calculatedSma = calculateSMA(closingPrices, 14)
    const calculatedEma = calculateEMA(closingPrices, 14)
    const calculatedRsi = calculateRSI(closingPrices, 14)
    const { lowerBand, upperBand } = calculateBollingerBands(closingPrices, 14)
    const calculatedMacd = calculateMACD(closingPrices, 12, 26, 9)
    const calculatedAtr = calculateATR(data, 14)

    setSma(calculatedSma.toFixed(2))
    setEma(calculatedEma.toFixed(2))
    setRsi(calculatedRsi.toFixed(2))
    setBbLower(lowerBand.toFixed(2))
    setBbUpper(upperBand.toFixed(2))
    setMacd(calculatedMacd.toFixed(2))
    setAtr(calculatedAtr.toFixed(2))

    predictNextPrice(calculatedSma, calculatedEma, timeFrame)
  }

  const predictNextPrice = (sma, ema, timeFrame) => {
    const predicted = Number.parseFloat(sma) * 0.4 + Number.parseFloat(ema) * 0.6
    setPredictedPrice(predicted.toFixed(9))

    let timeOffset = 1
    if (timeFrame === "4h") {
      timeOffset = 4
    } else if (timeFrame === "1d") {
      timeOffset = 24
    } else if (timeFrame === "3m") {
      timeOffset = 3 / 60
    } else if (timeFrame === "5m") {
      timeOffset = 5 / 60
    } else if (timeFrame === "30m") {
      timeOffset = 30 / 60
    }

    setPredictionTime(moment().add(timeOffset, "hours").format("HH:mm:ss"))
    setPredictionDate(moment().add(timeOffset, "hours").format("YYYY-MM-DD"))

    const percentageChange = ((predicted - price) / price) * 100
    setPriceChange(percentageChange.toFixed(2))
  }

  const getHistoricalData = async () => {
    try {
      const res = await axios.get(
        `https://api.binance.com/api/v3/klines?symbol=${name.toUpperCase()}&interval=${timeFrame}&limit=400`,
      )
      const data = res.data.map((item) => ({
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
      }))
      calculateIndicators(data)
    } catch (error) {
      console.error("Error fetching historical data:", error)
    }
  }

  const searchData = () => {
    fetchPriceData()
    fetchMarketCapData()
    getHistoricalData()
  }

  useEffect(() => {
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
    ]).start()

    const interval = setInterval(() => {
      setCurrentTime(moment().format("HH:mm:ss"))
    }, 1000)

    searchData()

    return () => clearInterval(interval)
  }, [name, timeFrame])

  return (
    <View style={styles.container}>
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
              placeholder="Enter Symbol (e.g., ogusdt)"
              placeholderTextColor={iOSColors.text.tertiary}
            />
            <Pressable onPress={searchData} style={styles.button}>
              <MaterialCommunityIcons name="archive-search" size={24} color={iOSColors.text.primary} />
            </Pressable>
          </View>

          <View style={styles.dataContainer}>
            <View style={styles.card}>
              <View style={styles.userDataCard}>
                <Text style={styles.priceText}>Current Price: {price}</Text>
                <Text style={styles.predictionText}>
                  Predicted Price: {predictedPrice || "Calculating..."} ({priceChange > 0 ? "+" : ""}
                  {priceChange}%)
                </Text>
                <Text style={styles.predictionTimeText}>Prediction Time: {predictionTime || "Calculating..."}</Text>
              </View>

              <View style={styles.marketDataCard}>
                <Text
                  style={[
                    styles.trendText,
                    { color: marketTrend === "Bullish" ? iOSColors.status.bullish : iOSColors.status.bearish },
                  ]}
                >
                  Market Trend: {marketTrend}
                </Text>
                <Text
                  style={[
                    styles.marketCapText,
                    { color: price > 0 ? iOSColors.status.bullish : iOSColors.status.bearish },
                  ]}
                >
                  Market Cap: {marketCap}
                </Text>
                <Text style={styles.indicatorsText}>
                  SMA: {sma}, EMA: {ema}, RSI: {rsi}
                </Text>
                <Text style={styles.indicatorsText}>
                  BB Lower: {bbLower}, BB Upper: {bbUpper}
                </Text>
                <Text style={styles.indicatorsText}>
                  MACD: {macd}, ATR: {atr}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.calculationContainer}>
            <Pressable onPress={handlePrevious} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>Prev</Text>
            </Pressable>

            <Pressable onPress={handleNext} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>Next</Text>
            </Pressable>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable onPress={saveData} style={styles.saveButton}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setTimeFrame("5m")
                searchData()
              }}
              style={styles.timeButton}
            >
              <Text style={styles.buttonText}>5m</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setTimeFrame("30m")
                searchData()
              }}
              style={styles.timeButton}
            >
              <Text style={styles.buttonText}>30m</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setTimeFrame("1h")
                searchData()
              }}
              style={styles.timeButton}
            >
              <Text style={styles.buttonText}>1h</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setTimeFrame("4h")
                searchData()
              }}
              style={styles.timeButton}
            >
              <Text style={styles.buttonText}>4h</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setTimeFrame("1d")
                searchData()
              }}
              style={styles.timeButton}
            >
              <Text style={styles.buttonText}>1d</Text>
            </Pressable>
          </View>
        </Animated.View>
      </LinearGradient>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Prediction Saved Successfully!</Text>
            <Pressable onPress={() => setModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const calculateMACD = (data, shortPeriod, longPeriod, signalPeriod) => {
  const shortEMA = calculateEMA(data, shortPeriod)
  const longEMA = calculateEMA(data, longPeriod)
  const macdLine = shortEMA - longEMA
  const signalLine = calculateEMA(data.slice(-signalPeriod), signalPeriod)
  const macdHistogram = macdLine - signalLine

  return macdLine
}

const calculateBollingerBands = (data, period) => {
  const sma = calculateSMA(data, period)
  const stdDev = Math.sqrt(data.slice(-period).reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period)

  const lowerBand = sma - 2 * stdDev
  const upperBand = sma + 2 * stdDev

  return {
    lowerBand,
    upperBand,
  }
}

const calculateSMA = (data, period) => {
  const sum = data.slice(-period).reduce((acc, price) => acc + price, 0)
  return sum / period
}

const calculateEMA = (data, period) => {
  const k = 2 / (period + 1)
  let ema = data[0]

  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k)
  }
  return ema
}

const calculateATR = (data, period) => {
  const trValues = []

  for (let i = 1; i < data.length; i++) {
    const currentHigh = Number.parseFloat(data[i].high)
    const currentLow = Number.parseFloat(data[i].low)
    const prevClose = Number.parseFloat(data[i - 1].close)

    const tr = Math.max(currentHigh - currentLow, Math.abs(currentHigh - prevClose), Math.abs(currentLow - prevClose))

    trValues.push(tr)
  }

  const atr = calculateEMA(trValues, period)
  return atr
}

const calculateRSI = (data, period) => {
  let gain = 0
  let loss = 0

  for (let i = 1; i < period; i++) {
    const difference = data[i] - data[i - 1]
    if (difference >= 0) gain += difference
    else loss -= difference
  }

  gain /= period
  loss /= period

  const rs = gain / (loss === 0 ? 1 : loss)
  return 100 - 100 / (1 + rs)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: iOSColors.background.primary,
  },
  background: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  contentContainer: {
    width: "80%",
    maxWidth: 1200,
    paddingVertical: 20,
  },
  currentTimeContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  currentTimeText: {
    fontSize: 18,
    fontWeight: "600",
    color: iOSColors.text.primary,
    backgroundColor: iOSColors.background.tertiary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: iOSColors.background.tertiary,
    borderColor: iOSColors.border.light,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    color: iOSColors.text.primary,
    fontSize: 16,
  },
  button: {
    width: 120,
    height: 56,
    backgroundColor: iOSColors.button.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    boxShadow: `0px 4px 12px ${iOSColors.button.primary}40`,
  },
  dataContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: iOSColors.background.secondary,
    padding: 28,
    borderRadius: 16,
    boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.15)",
  },
  userDataCard: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: iOSColors.border.light,
  },
  marketDataCard: {
    marginBottom: 0,
  },
  priceText: {
    fontSize: 24,
    color: iOSColors.text.primary,
    fontWeight: "700",
    marginBottom: 12,
  },
  predictionText: {
    fontSize: 20,
    fontWeight: "600",
    color: iOSColors.status.bullish,
    marginBottom: 10,
  },
  predictionTimeText: {
    fontSize: 16,
    color: iOSColors.text.secondary,
    fontWeight: "500",
  },
  trendText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  marketCapText: {
    fontSize: 16,
    color: iOSColors.text.secondary,
    fontWeight: "500",
    marginBottom: 10,
  },
  indicatorsText: {
    fontSize: 15,
    color: iOSColors.text.tertiary,
    fontWeight: "400",
    marginBottom: 8,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  saveButton: {
    width: 140,
    height: 52,
    backgroundColor: iOSColors.button.success,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    boxShadow: `0px 4px 12px ${iOSColors.button.success}40`,
  },
  buttonText: {
    color: iOSColors.text.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  calculationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  nextBtn: {
    flex: 1,
    height: 52,
    backgroundColor: iOSColors.button.warning,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    boxShadow: `0px 4px 12px ${iOSColors.button.warning}40`,
  },
  nextBtnText: {
    color: iOSColors.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  timeButton: {
    minWidth: 80,
    height: 52,
    backgroundColor: iOSColors.button.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    boxShadow: `0px 4px 12px ${iOSColors.button.primary}40`,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: iOSColors.background.secondary,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    width: "80%",
    maxWidth: 300,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "600",
    color: iOSColors.text.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: iOSColors.button.success,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
  modalButtonText: {
    color: iOSColors.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
})

export default Pfour

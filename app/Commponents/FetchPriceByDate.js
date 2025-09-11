import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import axios from 'axios';

const FetchPriceByDate = () => {
  const [date, setDate] = useState('20241017'); // Input date
  const [time, setTime] = useState('165831'); // Input time
  const [name, setName] = useState('memeusdt'); // Input currency pair
  const [price, setPrice] = useState(''); // Fetched price
  const [prices, setPrices] = useState({}); // Fetched prices from multiple APIs

  const fetchPrice = async () => {
    try {
      // Binance API
      const resBinance = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${name.toUpperCase()}&interval=1h&startTime=${Date.parse(date) / 1000}&endTime=${Date.parse(date) / 1000}`);
      const priceBinance = resBinance.data[0][4];

      // Coinbase API
      const resCoinbase = await axios.get(`https://api.exchange.coinbase.com/prices/${name.toUpperCase()}/sell?date=${date}`);
      const priceCoinbase = resCoinbase.data.amount;

      // CoinMarketCap API
      const resCoinMarketCap = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/ohlcv?symbol=${name.toUpperCase()}&time_period=1h&time_start=${Date.parse(date) / 1000}`);
      const priceCoinMarketCap = resCoinMarketCap.data[0][4];

      // CoinGecko API
      const resCoinGecko = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${name.toLowerCase()}&vs_currencies=usd&include_24hr_change=true&date=${date}`);
      const priceCoinGecko = resCoinGecko.data[name.toLowerCase()].usd;

      setPrices({
        Binance: priceBinance,
        Coinbase: priceCoinbase,
        CoinMarketCap: priceCoinMarketCap,
        CoinGecko: priceCoinGecko,
      });
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter currency pair (e.g. BTCUSDT)"
        style={{ marginBottom: 10 }}
      />
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="Enter date (YYYY-MM-DD)"
        style={{ marginBottom: 10 }}
      />
      <TextInput
        value={time}
        onChangeText={setTime}
        placeholder="Enter time (HH:mm:ss)"
        style={{ marginBottom: 10 }}
      />
      <Button title="Search" onPress={fetchPrice} />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20 }}>
        Prices:
      </Text>
      {Object.keys(prices).map((api, index) => (
        <Text key={index} style={{ fontSize: 18 }}>
          {api}: {prices[api]}
        </Text>
      ))}
    </View>
  );
};

export default FetchPriceByDate;
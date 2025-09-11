import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../Firebase/fireConfig';

const DataDisplay = () => {
  const [data, setData] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'predictions'));
      console.log(querySnapshot);

      if (!querySnapshot.empty) {
        const dataList = [];
        querySnapshot.docs.forEach((doc) => {
          dataList.push({ id: doc.id, ...doc.data() });
          console.log("Found Data ");
        });
        setData(dataList);
        setTotalOrders(dataList.length);
      } else {
        console.log("No documents found");
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Total Predictions: {totalOrders}</Text>
      </View>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.nameText}>Currency: {item.name}</Text>
            <Text style={styles.priceText}>Price: {item.price}</Text>
            <Text style={styles.marketCapText}>Market Cap: {item.marketCap}</Text>
            <Text style={styles.indicatorsText}>
              SMA: {item.sma}, EMA: {item.ema}, RSI: {item.rsi}
            </Text>
            <Text style={styles.trendText}>Market Trend: {item.marketTrend}</Text>
            <Text style={styles.predictionText}>
              Predicted Price in 1 hour: {item.predictedPrice}
            </Text>
            <Text style={styles.predictionTimeText}>
              Prediction Time: {item.predictionTime}
            </Text>
            <Text style={styles.predictionTimeText}>
              Prediction Time: {item.predictionDate}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#3a3a3a',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: '#3a3a3a',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nameText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 16,
    color: '#fff',
  },
  marketCapText: {
    fontSize: 16,
    color: '#fff',
  },
  indicatorsText: {
    fontSize: 14,
    color: '#fff',
  },
  trendText: {
    fontSize: 16,
    color: '#fff',
  },
  predictionText: {
    fontSize: 16,
    color: '#fff',
  },
  predictionTimeText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default DataDisplay;
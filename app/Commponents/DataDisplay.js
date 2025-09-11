import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, ScrollView, Dimensions } from 'react-native';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../Firebase/fireConfig';
import iOSColors from './Colors';

const { width } = Dimensions.get('window'); // Get screen width

const DataDisplay = () => {
  const [savedData, setSavedData] = useState([]);
  const [unsavedData, setUnsavedData] = useState([]);
  const [orderMetrics, setOrderMetrics] = useState({
    totalOrders: 0,
    accuracy90: 0,
    accuracy80: 0,
    accuracy60: 0,
    accuracy50: 0,
    totalSaved: 0,
    totalUnsaved: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'predictions'));
        const savedList = [];
        const unsavedList = [];
        let accuracy90 = 0, accuracy80 = 0, accuracy60 = 0, accuracy50 = 0;

        querySnapshot.docs.forEach((doc) => {
          const dataItem = {
            id: doc.id,
            ...doc.data(),
            resultTime: '',
            price: doc.data().actualPrice || '',
            accuracy: doc.data().accuracy || null,
            saved: doc.data().saved || false,
          };

          if (dataItem.accuracy >= 90) accuracy90++;
          else if (dataItem.accuracy >= 80) accuracy80++;
          else if (dataItem.accuracy >= 60) accuracy60++;
          else if (dataItem.accuracy >= 50) accuracy50++;

          dataItem.saved ? savedList.push(dataItem) : unsavedList.push(dataItem);
        });

        setSavedData(savedList);
        setUnsavedData(unsavedList);
        setOrderMetrics({
          totalOrders: savedList.length + unsavedList.length,
          accuracy90,
          accuracy80,
          accuracy60,
          accuracy50,
          totalSaved: savedList.length,
          totalUnsaved: unsavedList.length,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const calculateAccuracy = (index, dataList, setDataList) => {
    const updatedData = [...dataList];
    const currentItem = updatedData[index];

    if (currentItem?.resultTime && currentItem?.price) {
      const actualPrice = parseFloat(currentItem.price);
      const predictedPrice = parseFloat(currentItem.predictedPrice);
      const accuracyPercent = (1 - Math.abs((actualPrice - predictedPrice) / actualPrice)) * 100;
      currentItem.accuracy = accuracyPercent.toFixed(2);
      setDataList(updatedData);
    } else {
      console.log("Please enter valid result time and price");
    }
  };

  const saveResults = async (index, dataList, setDataList) => {
    const updatedData = [...dataList];
    const currentItem = updatedData[index];

    if (currentItem.accuracy) {
      try {
        const predictionDocRef = doc(db, 'predictions', currentItem.id);
        await updateDoc(predictionDocRef, {
          resultTime: currentItem.resultTime,
          actualPrice: currentItem.price,
          accuracy: currentItem.accuracy,
          saved: true,
        });

        currentItem.saved = true;
        setDataList(updatedData);
      } catch (error) {
        console.error("Error saving results:", error);
      }
    } else {
      console.log("Please calculate accuracy before saving");
    }
  };

  const renderCard = ({ item, index, dataList, setDataList }) => (
    <View style={styles.card}>
      <Text style={styles.nameText}>Currency: {item.name}</Text>
      <Text style={styles.priceText}>Price: {item.price}</Text>
      <Text style={styles.marketCapText}>Market Cap: {item.marketCap}</Text>
      <Text style={styles.indicatorsText}>SMA: {item.sma}, EMA: {item.ema}, RSI: {item.rsi}</Text>
      <Text style={styles.trendText}>Market Trend: {item.marketTrend}</Text>
      <Text style={styles.predictionText}>Predicted Price: {item.predictedPrice}</Text>
      <Text style={styles.predictionTimeText}>Prediction Time: {item.predictionTime}</Text>
      <Text style={styles.predictionDateText}>Prediction Date: {item.predictionDate}</Text>

      {!item.saved && (
        <>
          <TextInput
            placeholder="Enter Result Time"
            style={styles.input}
            value={item.resultTime}
            onChangeText={(value) => {
              const updatedData = [...dataList];
              updatedData[index].resultTime = value;
              setDataList(updatedData);
            }}
          />
          <TextInput
            placeholder="Enter Actual Price"
            style={styles.input}
            value={item.price}
            onChangeText={(value) => {
              const updatedData = [...dataList];
              updatedData[index].price = value;
              setDataList(updatedData);
            }}
            keyboardType="numeric"
          />
          <Button title="Calculate Accuracy" onPress={() => calculateAccuracy(index, dataList, setDataList)} />
        </>
      )}

      {item.accuracy && (
        <View style={styles.accuracyContainer}>
          <Text style={styles.accuracyText}>Accuracy: {item.accuracy}%</Text>
        </View>
      )}

      {!item.saved && (
        <Button title="Save Results" onPress={() => saveResults(index, dataList, setDataList)} />
      )}

      {item.saved && (
        <Text style={styles.savedText}>Results saved!</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Order Metrics</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
          <View style={styles.metricContainer}>
            <Text style={styles.metricText}>Total Orders: {orderMetrics.totalOrders}</Text>
            <Text style={styles.metricText}>90% Accuracy: {orderMetrics.accuracy90}</Text>
            <Text style={styles.metricText}>80% Accuracy: {orderMetrics.accuracy80}</Text>
            <Text style={styles.metricText}>60% Accuracy: {orderMetrics.accuracy60}</Text>
            <Text style={styles.metricText}>50% Accuracy: {orderMetrics.accuracy50}</Text>
            <Text style={styles.metricText}>Saved Orders: {orderMetrics.totalSaved}</Text>
            <Text style={styles.metricText}>Unsaved Orders: {orderMetrics.totalUnsaved}</Text>
          </View>
        </ScrollView>
      </View>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.headerText}>Saved Predictions</Text>
      </View>

      <FlatList
        data={savedData}
        renderItem={({ item, index }) => renderCard({ item, index, dataList: savedData, setDataList: setSavedData })}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cardList}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.headerText}>Unsaved Predictions</Text>
      </View>

      <FlatList
        data={unsavedData}
        renderItem={({ item, index }) => renderCard({ item, index, dataList: unsavedData, setDataList: setUnsavedData })}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cardList}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: iOSColors.background.primary,
  },
  scrollContainer: {
    height: 60,
  },
  header: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: iOSColors.background.secondary,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: iOSColors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metricText: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    marginHorizontal: 8,
    marginVertical: 4,
    fontWeight: '500',
    backgroundColor: iOSColors.background.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sectionHeader: {
    marginBottom: 16,
    marginTop: 24,
  },
  cardList: {
    marginBottom: 24,
  },
  card: {
    width: width * 0.8,
    padding: 20,
    backgroundColor: iOSColors.background.secondary,
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: iOSColors.border.light,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    color: iOSColors.text.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  marketCapText: {
    fontSize: 16,
    color: iOSColors.text.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  indicatorsText: {
    fontSize: 14,
    color: iOSColors.text.tertiary,
    fontWeight: '400',
    marginBottom: 2,
  },
  trendText: {
    fontSize: 14,
    color: iOSColors.status.bullish,
    fontWeight: '500',
    marginBottom: 4,
  },
  predictionText: {
    fontSize: 16,
    color: iOSColors.button.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  predictionTimeText: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  predictionDateText: {
    fontSize: 14,
    color: iOSColors.text.tertiary,
    fontWeight: '400',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderColor: iOSColors.border.light,
    borderWidth: 1,
    borderRadius: 12,
    marginVertical: 6,
    paddingLeft: 16,
    backgroundColor: iOSColors.background.tertiary,
    color: iOSColors.text.primary,
    fontSize: 16,
  },
  accuracyContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: iOSColors.background.tertiary,
    borderRadius: 8,
  },
  accuracyText: {
    fontSize: 16,
    color: iOSColors.status.bullish,
    fontWeight: '600',
    textAlign: 'center',
  },
  savedText: {
    fontSize: 16,
    color: iOSColors.button.success,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default DataDisplay;

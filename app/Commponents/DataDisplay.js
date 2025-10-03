import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, Dimensions, ActivityIndicator } from 'react-native';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../Firebase/fireConfig';
import iOSColors from './Colors';
import { widthPercentageToDP as w, heightPercentageToDP as h } from 'react-native-responsive-screen';

const { width } = Dimensions.get('window'); // Get screen width

const DataDisplay = () => {
   const [savedData, setSavedData] = useState([]);
   const [unsavedData, setUnsavedData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [orderMetrics, setOrderMetrics] = useState({
     totalOrders: 0,
     accuracy90: 0,
     accuracy80: 0,
     accuracy60: 0,
     accuracy50: 0,
     totalSaved: 0,
     totalUnsaved: 0,
   });

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      console.log('Authentication status: User is', user ? `logged in (UID: ${user.uid})` : 'not logged in');
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(collection(db, 'predictions'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      console.log('Fetched querySnapshot:', querySnapshot.docs.length, 'documents');
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
        console.log('Processing dataItem:', dataItem);

        if (dataItem.accuracy >= 90) accuracy90++;
        else if (dataItem.accuracy >= 80) accuracy80++;
        else if (dataItem.accuracy >= 60) accuracy60++;
        else if (dataItem.accuracy >= 50) accuracy50++;

        dataItem.saved ? savedList.push(dataItem) : unsavedList.push(dataItem);
      });
      console.log('Final savedList length:', savedList.length, 'items:', savedList);
      console.log('Final unsavedList length:', unsavedList.length, 'items:', unsavedList);

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
      console.log('Error details:', error.message, error.stack);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const saveResults = async (index, dataList, setDataList, setSavedData) => {
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
        // Move the item from unsaved to saved
        setSavedData(prev => [...prev, currentItem]);
        setDataList(prev => prev.filter(item => item.id !== currentItem.id));
      } catch (error) {
        console.error("Error saving results:", error);
      }
    } else {
      console.log("Please calculate accuracy before saving");
    }
  };

  const renderCard = ({ item, index, dataList, setDataList, setSavedData }) => (
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
        <Button title="Save Results" onPress={() => saveResults(index, dataList, setDataList, setSavedData)} />
      )}

      {item.saved && (
        <Text style={styles.savedText}>Results saved!</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={iOSColors.button.primary} />
        <Text style={styles.loadingText}>Loading predictions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Order Metrics</Text>
        <View style={styles.scrollContainer}>
          <View style={styles.metricContainer}>
            <Text style={styles.metricText}>Total Orders: {orderMetrics.totalOrders}</Text>
            <Text style={styles.metricText}>90% Accuracy: {orderMetrics.accuracy90}</Text>
            <Text style={styles.metricText}>80% Accuracy: {orderMetrics.accuracy80}</Text>
            <Text style={styles.metricText}>60% Accuracy: {orderMetrics.accuracy60}</Text>
            <Text style={styles.metricText}>50% Accuracy: {orderMetrics.accuracy50}</Text>
            <Text style={styles.metricText}>Saved Orders: {orderMetrics.totalSaved}</Text>
            <Text style={styles.metricText}>Unsaved Orders: {orderMetrics.totalUnsaved}</Text>
          </View>
        </View>
        <Button title="Fetch Data" onPress={fetchData} disabled={loading} />
      </View>

      <FlatList
        data={[{ type: 'saved' }, { type: 'unsaved' }]}
        keyExtractor={(item) => item.type}
        renderItem={({ item }) => (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.headerText}>
                {item.type === 'saved' ? 'Saved Predictions' : 'Unsaved Predictions'}
              </Text>
            </View>
            <FlatList
              data={item.type === 'saved' ? savedData : unsavedData}
              renderItem={({ item: cardItem, index }) =>
                renderCard({
                  item: cardItem,
                  index,
                  dataList: item.type === 'saved' ? savedData : unsavedData,
                  setDataList: item.type === 'saved' ? setSavedData : setUnsavedData,
                  setSavedData: item.type === 'unsaved' ? setSavedData : null,
                })
              }
              keyExtractor={(cardItem) => cardItem.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.cardList}
              contentContainerStyle={{ minWidth: w('85%'), flexGrow: 1, minHeight: h('30%'), paddingHorizontal: w('2%') }}
              ListEmptyComponent={<Text style={{ color: iOSColors.text.tertiary, textAlign: 'center', padding: w('5%'), fontSize: 16 }}>No {item.type === 'saved' ? 'saved' : 'unsaved'} predictions.</Text>}
            />
          </View>
        )}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
   container: {
     flex: 1,
     paddingHorizontal: w('3%'),
     paddingTop: h('3%'),
     paddingBottom: h('5%'),
     backgroundColor: iOSColors.background.primary,
     minHeight: '100%',
   },
   scrollContainer: {
     height: h('8%'),
   },
   header: {
     marginBottom: h('3%'),
     padding: w('5%'),
     backgroundColor: iOSColors.background.secondary,
     borderRadius: 16,
     minHeight: h('15%'),
   },
   headerText: {
     fontSize: 24,
     fontWeight: '700',
     color: iOSColors.text.primary,
     textAlign: 'center',
     marginBottom: h('2%'),
   },
   metricContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     flexWrap: 'wrap',
     justifyContent: 'center',
   },
   metricText: {
     fontSize: 14,
     color: iOSColors.text.secondary,
     marginHorizontal: w('2%'),
     marginVertical: h('0.5%'),
     fontWeight: '500',
     backgroundColor: iOSColors.background.tertiary,
     paddingHorizontal: w('3%'),
     paddingVertical: h('1%'),
     borderRadius: 8,
   },
   sectionHeader: {
     marginBottom: h('2%'),
     marginTop: h('3%'),
   },
   cardList: {
     marginBottom: h('3%'),
   },
   card: {
     width: w('85%'),
     padding: w('5%'),
     backgroundColor: iOSColors.background.secondary,
     borderRadius: 16,
     marginRight: w('4%'),
     minHeight: h('35%'),
     borderWidth: 1,
     borderColor: iOSColors.border.light,
   },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('1%'),
  },
  priceText: {
    fontSize: 16,
    color: iOSColors.text.secondary,
    fontWeight: '500',
    marginBottom: h('0.5%'),
  },
  marketCapText: {
    fontSize: 16,
    color: iOSColors.text.secondary,
    fontWeight: '500',
    marginBottom: h('0.5%'),
  },
  indicatorsText: {
    fontSize: 14,
    color: iOSColors.text.tertiary,
    fontWeight: '400',
    marginBottom: h('0.3%'),
  },
  trendText: {
    fontSize: 14,
    color: iOSColors.status.bullish,
    fontWeight: '500',
    marginBottom: h('0.5%'),
  },
  predictionText: {
    fontSize: 16,
    color: iOSColors.button.primary,
    fontWeight: '600',
    marginBottom: h('0.5%'),
  },
  predictionTimeText: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    fontWeight: '500',
    marginBottom: h('0.3%'),
  },
  predictionDateText: {
    fontSize: 14,
    color: iOSColors.text.tertiary,
    fontWeight: '400',
    marginBottom: h('1%'),
  },
  input: {
    height: h('6%'),
    borderColor: iOSColors.border.light,
    borderWidth: 1,
    borderRadius: 12,
    marginVertical: h('1%'),
    paddingLeft: w('4%'),
    backgroundColor: iOSColors.background.tertiary,
    color: iOSColors.text.primary,
    fontSize: 16,
  },
  accuracyContainer: {
    marginTop: h('2%'),
    padding: w('3%'),
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
    marginTop: h('1%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: iOSColors.background.primary,
    paddingVertical: h('10%'),
  },
  loadingText: {
    color: iOSColors.text.secondary,
    fontSize: 16,
    marginTop: h('2%'),
  },
});

export default DataDisplay;

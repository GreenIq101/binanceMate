import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
    <LinearGradient
      colors={iOSColors.gradients.card}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.currencyContainer}>
          <MaterialCommunityIcons
            name="bitcoin"
            size={24}
            color={iOSColors.button.primary}
          />
          <Text style={styles.currencyName}>{item.name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.marketTrend === 'Bullish' ? iOSColors.status.bullish : iOSColors.status.bearish }]}>
          <Text style={styles.statusText}>{item.marketTrend}</Text>
        </View>
      </View>

      <ScrollView style={styles.cardContent} showsVerticalScrollIndicator={false}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Current Price</Text>
          <Text style={styles.priceValue}>${item.price}</Text>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Market Cap</Text>
            <Text style={styles.detailValue}>{item.marketCap}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Predicted</Text>
            <Text style={styles.detailValue}>${item.predictedPrice}</Text>
          </View>
        </View>

        <View style={styles.indicatorsSection}>
          <Text style={styles.sectionTitle}>Technical Indicators</Text>
          <View style={styles.indicatorsGrid}>
            <View style={styles.indicatorItem}>
              <Text style={styles.indicatorLabel}>SMA</Text>
              <Text style={styles.indicatorValue}>{item.sma}</Text>
            </View>
            <View style={styles.indicatorItem}>
              <Text style={styles.indicatorLabel}>EMA</Text>
              <Text style={styles.indicatorValue}>{item.ema}</Text>
            </View>
            <View style={styles.indicatorItem}>
              <Text style={styles.indicatorLabel}>RSI</Text>
              <Text style={styles.indicatorValue}>{item.rsi}</Text>
            </View>
          </View>
        </View>

        <View style={styles.predictionInfo}>
          <View style={styles.predictionDetail}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={iOSColors.text.tertiary} />
            <Text style={styles.predictionTime}>{item.predictionTime}</Text>
          </View>
          <View style={styles.predictionDetail}>
            <MaterialCommunityIcons name="calendar" size={16} color={iOSColors.text.tertiary} />
            <Text style={styles.predictionDate}>{item.predictionDate}</Text>
          </View>
        </View>

        {!item.saved && (
          <View style={styles.inputSection}>
            <TextInput
              placeholder="Result Time"
              style={styles.input}
              value={item.resultTime}
              onChangeText={(value) => {
                const updatedData = [...dataList];
                updatedData[index].resultTime = value;
                setDataList(updatedData);
              }}
              placeholderTextColor={iOSColors.text.tertiary}
            />
            <TextInput
              placeholder="Actual Price"
              style={styles.input}
              value={item.price}
              onChangeText={(value) => {
                const updatedData = [...dataList];
                updatedData[index].price = value;
                setDataList(updatedData);
              }}
              keyboardType="numeric"
              placeholderTextColor={iOSColors.text.tertiary}
            />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => calculateAccuracy(index, dataList, setDataList)}
            >
              <LinearGradient
                colors={iOSColors.gradients.primary}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Calculate Accuracy</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {item.accuracy && (
          <View style={styles.accuracyContainer}>
            <MaterialCommunityIcons
              name="target"
              size={20}
              color={parseFloat(item.accuracy) >= 80 ? iOSColors.status.bullish : iOSColors.status.bearish}
            />
            <Text style={[styles.accuracyText, {
              color: parseFloat(item.accuracy) >= 80 ? iOSColors.status.bullish : iOSColors.status.bearish
            }]}>
              {item.accuracy}% Accuracy
            </Text>
          </View>
        )}

        {!item.saved && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => saveResults(index, dataList, setDataList, setSavedData)}
          >
            <LinearGradient
              colors={iOSColors.gradients.success}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="content-save" size={18} color={iOSColors.text.onPrimary} />
              <Text style={styles.saveButtonText}>Save Results</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {item.saved && (
          <View style={styles.savedIndicator}>
            <MaterialCommunityIcons name="check-circle" size={20} color={iOSColors.button.success} />
            <Text style={styles.savedText}>Results Saved</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={iOSColors.gradients.background}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <MaterialCommunityIcons
              name="chart-line-variant"
              size={32}
              color={iOSColors.button.primary}
            />
            <Text style={styles.headerTitle}>Analysis Dashboard</Text>
          </View>
          <Text style={styles.headerSubtitle}>Track your prediction performance</Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="clipboard-list" size={24} color={iOSColors.button.primary} />
            <Text style={styles.metricValue}>{orderMetrics.totalOrders}</Text>
            <Text style={styles.metricLabel}>Total Orders</Text>
          </View>

          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="target" size={24} color={iOSColors.status.bullish} />
            <Text style={styles.metricValue}>{orderMetrics.accuracy90}</Text>
            <Text style={styles.metricLabel}>90%+ Accuracy</Text>
          </View>

          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="bullseye" size={24} color={iOSColors.button.warning} />
            <Text style={styles.metricValue}>{orderMetrics.accuracy80}</Text>
            <Text style={styles.metricLabel}>80%+ Accuracy</Text>
          </View>

          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="content-save" size={24} color={iOSColors.button.success} />
            <Text style={styles.metricValue}>{orderMetrics.totalSaved}</Text>
            <Text style={styles.metricLabel}>Saved Orders</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchData}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? iOSColors.gradients.secondary : iOSColors.gradients.primary}
            style={styles.refreshButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialCommunityIcons
              name={loading ? "loading" : "refresh"}
              size={20}
              color={iOSColors.text.onPrimary}
            />
            <Text style={styles.refreshButtonText}>
              {loading ? "Loading..." : "Refresh Data"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        {[{ type: 'saved' }, { type: 'unsaved' }].map((section) => (
          <View key={section.type} style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name={section.type === 'saved' ? 'check-circle' : 'clock-outline'}
                size={24}
                color={section.type === 'saved' ? iOSColors.button.success : iOSColors.button.warning}
              />
              <Text style={styles.sectionTitle}>
                {section.type === 'saved' ? 'Saved Predictions' : 'Pending Analysis'}
              </Text>
              <View style={[styles.sectionBadge, {
                backgroundColor: section.type === 'saved' ? iOSColors.button.success : iOSColors.button.warning
              }]}>
                <Text style={styles.sectionBadgeText}>
                  {(section.type === 'saved' ? savedData : unsavedData).length}
                </Text>
              </View>
            </View>

            {(section.type === 'saved' ? savedData : unsavedData).length > 0 ? (
              <FlatList
                data={section.type === 'saved' ? savedData : unsavedData}
                renderItem={({ item: cardItem, index }) =>
                  renderCard({
                    item: cardItem,
                    index,
                    dataList: section.type === 'saved' ? savedData : unsavedData,
                    setDataList: section.type === 'saved' ? setSavedData : setUnsavedData,
                    setSavedData: section.type === 'unsaved' ? setSavedData : null,
                  })
                }
                keyExtractor={(cardItem) => cardItem.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardList}
                snapToInterval={width * 0.69}
                decelerationRate="fast"
              />
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name={section.type === 'saved' ? 'check-circle-outline' : 'clipboard-text-outline'}
                  size={48}
                  color={iOSColors.text.tertiary}
                />
                <Text style={styles.emptyStateText}>
                  {section.type === 'saved'
                    ? 'No saved predictions yet'
                    : 'No predictions pending analysis'
                  }
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {section.type === 'saved'
                    ? 'Complete analysis on pending predictions to see them here'
                    : 'Your analyzed predictions will appear here'
                  }
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: iOSColors.background.primary,
  },
  header: {
    paddingHorizontal: w('5%'),
    paddingTop: h('6%'),
    paddingBottom: h('4%'),
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: h('2%'),
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: h('3%'),
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h('1%'),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: iOSColors.text.primary,
    marginLeft: w('3%'),
  },
  headerSubtitle: {
    fontSize: 16,
    color: iOSColors.text.secondary,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: h('3%'),
  },
  metricCard: {
    width: w('22%'),
    backgroundColor: iOSColors.background.secondary,
    borderRadius: 16,
    padding: w('4%'),
    alignItems: 'center',
    marginBottom: h('2%'),
    borderWidth: 1,
    borderColor: iOSColors.border.light,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: iOSColors.text.primary,
    marginTop: h('1%'),
  },
  metricLabel: {
    fontSize: 12,
    color: iOSColors.text.secondary,
    textAlign: 'center',
    marginTop: h('0.5%'),
  },
  refreshButton: {
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  refreshButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w('6%'),
    paddingVertical: h('1.5%'),
  },
  refreshButtonText: {
    color: iOSColors.text.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: w('2%'),
  },
  content: {
    paddingHorizontal: w('5%'),
    paddingBottom: h('5%'),
  },
  section: {
    marginBottom: h('4%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h('3%'),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginLeft: w('4%'),
    flex: 1,
  },
  sectionBadge: {
    paddingHorizontal: w('3%'),
    paddingVertical: h('0.5%'),
    borderRadius: 12,
    marginLeft: w('2%'),
  },
  sectionBadgeText: {
    color: iOSColors.text.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  cardList: {
    paddingRight: w('5%'),
  },
  card: {
    width: width * 0.65,
    height: h('50%'),
    borderRadius: 16,
    marginRight: w('4%'),
    padding: w('3%'),
    borderWidth: 1,
    borderColor: iOSColors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h('3%'),
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyName: {
    fontSize: 18,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginLeft: w('3%'),
  },
  statusBadge: {
    paddingHorizontal: w('3%'),
    paddingVertical: h('0.5%'),
    borderRadius: 12,
  },
  statusText: {
    color: iOSColors.text.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    flex: 1,
    paddingBottom: h('2%'),
  },
  priceSection: {
    marginBottom: h('3%'),
  },
  priceLabel: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    marginBottom: h('0.5%'),
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: iOSColors.button.primary,
  },
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: h('3%'),
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: iOSColors.text.tertiary,
    marginBottom: h('0.5%'),
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
  },
  indicatorsSection: {
    marginBottom: h('3%'),
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('1%'),
  },
  indicatorsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indicatorItem: {
    alignItems: 'center',
    marginHorizontal: w('1%'),
  },
  indicatorLabel: {
    fontSize: 12,
    color: iOSColors.text.tertiary,
    marginBottom: h('0.5%'),
  },
  indicatorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: iOSColors.text.secondary,
  },
  predictionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: h('3%'),
  },
  predictionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictionTime: {
    fontSize: 12,
    color: iOSColors.text.tertiary,
    marginLeft: w('2%'),
  },
  predictionDate: {
    fontSize: 12,
    color: iOSColors.text.tertiary,
    marginLeft: w('2%'),
  },
  inputSection: {
    marginBottom: h('2%'),
  },
  input: {
    height: h('6%'),
    borderWidth: 1,
    borderColor: iOSColors.border.light,
    borderRadius: 12,
    marginBottom: h('1%'),
    paddingHorizontal: w('4%'),
    backgroundColor: iOSColors.background.primary,
    color: iOSColors.text.primary,
    fontSize: 16,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: h('1%'),
  },
  buttonGradient: {
    paddingVertical: h('1.5%'),
    alignItems: 'center',
  },
  buttonText: {
    color: iOSColors.text.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: iOSColors.background.primary,
    padding: w('3%'),
    borderRadius: 12,
    marginBottom: h('2%'),
  },
  accuracyText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: w('3%'),
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonText: {
    color: iOSColors.text.onPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: w('2%'),
  },
  savedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: iOSColors.background.primary,
    padding: w('3%'),
    borderRadius: 12,
  },
  savedText: {
    color: iOSColors.button.success,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: w('3%'),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: h('8%'),
    backgroundColor: iOSColors.background.secondary,
    borderRadius: 16,
    marginTop: h('2%'),
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginTop: h('2%'),
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: iOSColors.text.secondary,
    marginTop: h('1%'),
    textAlign: 'center',
    paddingHorizontal: w('10%'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: iOSColors.background.primary,
  },
  loadingText: {
    color: iOSColors.text.secondary,
    fontSize: 16,
    marginTop: h('2%'),
  },
});

export default DataDisplay;

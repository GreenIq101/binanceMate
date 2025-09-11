import { StyleSheet, Text, View, FlatList } from 'react-native';
import React from 'react';

const data = [
  { model: "Ptow", predicted: 62959.43, testResult: 62889.48 },
  { model: "Ptow", predicted: 2468.25, testResult: 2467.34 },
  { model: "Ptow", predicted: 146.31, testResult: 146.67 },
  { model: "Ptow", predicted: 575.53, testResult: 574.60 },
  { model: "Ptow", predicted: 7.86, testResult: 9.28 },
  { model: "Ptow", predicted: 65.91, testResult: 65.51 },
  { model: "Pretest", predicted: 0.010735, testResult: 0.01 },
  { model: "Pretest", predicted: 8.13, testResult: 8.422 },
  { model: "Ptow", predicted: 7.84, testResult: 9.28 },
  { model: "Pretest", predicted: 62854.99, testResult: 62760 },
  { model: "Ptow", predicted: 62943.93, testResult: 62761.54 },
  { model: "Pretest", predicted: 2464.488, testResult: 2460.5 },
  { model: "Ptow", predicted: 2468.11, testResult: 2460.94 },
  { model: "Ptow", predicted: 574.952, testResult: 573 },
  { model: "Ptow", predicted: 573.4, testResult: 574.14},
  { model: "Pretest", predicted: 0.78775, testResult: 0.7855},
  { model: "Ptow", predicted: 0.7784, testResult: 0.7855},
];

const calculateAccuracy = (data) => {
  const accuracy = {};

  data.forEach(({ model, predicted, testResult }) => {
    const isCorrect = Math.abs(predicted - testResult) / testResult <= 0.01; // 1% margin
    if (!accuracy[model]) {
      accuracy[model] = { correct: 0, total: 0 };
    }
    accuracy[model].total++;
    if (isCorrect) {
      accuracy[model].correct++;
    }
  });

  // Calculate accuracy rates
  for (const model in accuracy) {
    accuracy[model].rate = (accuracy[model].correct / accuracy[model].total) * 100;
  }

  return accuracy;
};

const Cal = () => {
  const accuracyRates = calculateAccuracy(data);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Model Accuracy Rates</Text>
      <FlatList
        data={Object.keys(accuracyRates)}
        renderItem={({ item }) => {
          const model = accuracyRates[item];
          return (
            <View style={styles.item}>
              <Text style={styles.modelText}>{item}</Text>
              <Text style={styles.accuracyText}>Accuracy: {model.rate.toFixed(2)}%</Text>
              <Text style={styles.accuracyText}>Correct Predictions: {model.correct}</Text>
              <Text style={styles.accuracyText}>Total Predictions: {model.total}</Text>
            </View>
          );
        }}
        keyExtractor={(item) => item}
      />
    </View>
  );
};

export default Cal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  modelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  accuracyText: {
    fontSize: 16,
  },
});


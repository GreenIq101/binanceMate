import React from 'react';
import { View, StyleSheet } from 'react-native';
import DataDisplay from '../Commponents/DataDisplay';

const Analysis = () => {
  return (
    <View style={styles.container}>
      <DataDisplay />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
});

export default Analysis;

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Market from '../Commponents/Market'
import FetchPriceByDate from '../Commponents/FetchPriceByDate'


const Home = () => {
  return (
    <View style={styles.homeContainer}>
      <View style={styles.cardContainer}>
        <Text style={styles.title}>Data by Time </Text>
          <FetchPriceByDate></FetchPriceByDate>
      </View>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#181a20',
    padding: 16, // Add some padding for better spacing
  },
  cardContainer: {
    marginTop: 10,
    height: '90%', // Increase height for better visibility
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12, // Rounded corners
    shadowColor: '#000', // Shadow properties
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5, // Android shadow
    padding: 16, // Add padding inside the card
    justifyContent: 'center',
  },
  title: {
    fontSize: 24, // Increased font size for title
    fontWeight: 'bold',
    color: '#333', // Darker color for better contrast
    marginBottom: 10, // Spacing below the title
  },
})
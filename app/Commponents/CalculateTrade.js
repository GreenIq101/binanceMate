import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-web'

const CalculateTrade = () => {
  return (
    <View style={styles.mainContainer} >
      <View style={styles.inpContainer} >
        <Text>Input Data</Text>
        <TextInput placeholder='Price' ></TextInput>        
        <TextInput placeholder='Valume' ></TextInput>        
        <TextInput placeholder='sell' ></TextInput>        
      </View>
      <View style={styles.outputContainer} >
        <Text>Results</Text>

      </View>
    </View>
  )
}

export default CalculateTrade

const styles = StyleSheet.create({
    mainContainer:

    {
        flex:1,
        backgroundColor:'tomato',
        alignItems:'center',
        justifyContent:'space-around',
        flexDirection:'row'
    },
    inpContainer:
    {
        backgroundColor:'whitesmoke',
        alignItems:'center',
        justifyContent:'space-around',
        height:'80%',
        width:'45%'
    },
    outputContainer:
    {
        backgroundColor:'whitesmoke',
        alignItems:'center',
        justifyContent:'space-around',
        height:'80%',
        width:'45%'
    },
})
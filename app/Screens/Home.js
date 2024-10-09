import { StyleSheet, Text, View } from 'react-native'
import React from 'react'


const Home = () => {
  return (
    <View style={styles.homeContainer} >
        <View style={styles.CardContainer} >
        <Text>Here will the data of top coins </Text>
        </View>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
    homeContainer:
    {
        flex:1,
        backgroundColor:'#181a20'
    },
    
    CardContainer:
    {
        marginTop:5,
        height:'48%',
        width:'100%',
        backgroundColor:'whitesmoke',
        justifyContent:'space-evenly',
        alignItems:'center'
    },
})
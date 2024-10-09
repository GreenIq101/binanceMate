import { StyleSheet, Text, View,TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Signup = () => {
  return (
    <View  style={styles.SignupFormContainer} >
      <View style={styles.FormOutline} >
      <View style={styles.SignupHeaderTextContainer}  >
            <Text style={styles.SignupHeaderText} >Let's Signup </Text>
        </View>
        <View style={styles.SignupinpContainer}  >
            <TextInput style={styles.Signupinp}  placeholder='Enter Full name' ></TextInput>
            <TextInput style={styles.Signupinp}  placeholder='Enter Username' ></TextInput>
            <TextInput style={styles.Signupinp}  placeholder='Enter Email' ></TextInput>
            <TextInput style={styles.Signupinp}  placeholder='Enter Phone' ></TextInput>
            <TextInput style={styles.Signupinp}  placeholder='Enter Password' ></TextInput>
            <TextInput style={styles.Signupinp}  placeholder='Enter Retype Password' ></TextInput>
        </View>
        <View style={styles.SignupBtnContainer}  >
            <TouchableOpacity style={styles.SignupBtn} >
                <MaterialCommunityIcons name='account-multiple-plus' size={50} color='lightblue'  />                
            </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Signup

const styles = StyleSheet.create({
  SignupFormContainer:
  {
      flex:1,
      justifyContent:'space-evenly',
      alignItems:'center',
      // backgroundColor:'tomato',
      resizeMode:'cover',
      fontFamily:"Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif"
  },
  FormOutline:
  {
      height:'80%',
      width:'100%',
      backgroundColor:'whitesmoke',
      justifyContent:'space-evenly',
      alignItems:'center',
  },
  SignupHeaderTextContainer:
    {
        height:'10%',
        width:'100%',
        justifyContent:'space-evenly',
        alignItems:'center'
    }
    ,
    SignupHeaderText:
    {
        fontSize:42,
        color:'dodgerblue'
    },
    SignupinpContainer:

    {
        height:'68%',
        width:'100%',
        justifyContent:'space-evenly',
        alignItems:'center',
        // backgroundColor:'orange'
    },
    Signupinp:
    {
        height:'12%',
        width:'80%',
        textAlign:'center',
        // backgroundColor:'whitesmoke',
        border:'none',
        outlineStyle:'none',
        shadowColor:'black',
        shadowOpacity:"50",
        shadowOffset:"50",
        shadowRadius:"50"
    },
    SignupBtnContainer:
    {
        height:'15%',
        width:'100%',
        justifyContent:'space-evenly',
        alignItems:'center',
        // backgroundColor:'orange'
    },
    SignupBtn:

    {
        height:'100%',
        width:'80%',
        justifyContent:'space-evenly',
        alignItems:'center',
        backgroundColor:'dodgerblue'
    }
})
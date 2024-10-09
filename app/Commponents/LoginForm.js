import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';


const LoginForm = () => {

  return (
    <View  style={styles.LoginFormContainer} >
      <View style={styles.FormOutline} >
        <View style={styles.LoginHeaderTextContainer}  >
            <Text style={styles.LoginHeaderText} >Let's Login </Text>
        </View>
        <View style={styles.LogininpContainer}  >
            <TextInput style={styles.Logininp}  placeholder='Enter Username' ></TextInput>
            <TextInput style={styles.Logininp}  placeholder='Enter Password' ></TextInput>
        </View>
        <View style={styles.LoginBtnContainer}  >
            <TouchableOpacity style={styles.LoginBtn} >
                <MaterialCommunityIcons name='login' size={50} color='lightgreen'  />                
            </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default LoginForm

const styles = StyleSheet.create({
    LoginFormContainer:
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
        height:'60%',
        width:'100%',
        // backgroundColor:'whitesmoke',
        justifyContent:'space-evenly',
        alignItems:'center',
    },
    LoginHeaderTextContainer:
    {
        height:'20%',
        width:'100%',
        justifyContent:'space-evenly',
        alignItems:'center'
    }
    ,
    LoginHeaderText:
    {
        fontSize:42,
        color:'green'
    },
    LogininpContainer:

    {
        height:'45%',
        width:'100%',
        justifyContent:'space-evenly',
        alignItems:'center',
        // backgroundColor:'orange'
    },
    Logininp:
    {
        height:'30%',
        width:'80%',
        textAlign:'center',
        backgroundColor:'whitesmoke',
        border:'none',
        outlineStyle:'none',
        shadowColor:'black',
        shadowOpacity:"50",
        shadowOffset:"50",
        shadowRadius:"50"
    },
    LoginBtnContainer:
    {
        height:'20%',
        width:'100%',
        justifyContent:'space-evenly',
        alignItems:'center',
        // backgroundColor:'orange'
    },
    LoginBtn:

    {
        height:'100%',
        width:'80%',
        justifyContent:'space-evenly',
        alignItems:'center',
        backgroundColor:'green'
    }
})
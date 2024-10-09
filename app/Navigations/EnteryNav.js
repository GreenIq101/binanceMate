import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Login from '../Screens/Login';
import Signup from '../Screens/Signup';
import Home from '../Screens/Home';


const Tab = createBottomTabNavigator();


const EnteryNav = () => {
  return (
    <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;
    
              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'Signup') {
                iconName = 'account-lock';
              } else if (route.name === 'Login') {
                iconName = 'account-lock-open';
              } 
              // Return the corresponding icon component
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
          })}shadow
        >
          <Tab.Screen options={{headerShown:false}} name="Login" component={Login} />
          <Tab.Screen options={{headerShown:false}} name="Signup"component={Signup} />
          
        </Tab.Navigator>
  )
}

export default EnteryNav

const styles = StyleSheet.create({})
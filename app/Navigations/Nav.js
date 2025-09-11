import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';


import Home from '../Screens/Home';
import Search from '../Screens/Search';
import Pretest from '../Screens/Pretest';
import Ptwo from '../Screens/Ptwo';
import cal from '../Screens/cal';
import Pthree from '../Screens/pthree';
import Eye from '../Screens/Eye';
import Test from '../Screens/Test';
import DataDisplay from '../Commponents/DataDisplay';
const Tab = createBottomTabNavigator();


const Nav = () => {
    return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;
    
              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'Signup') {
                iconName = 'account-lock';
              } else if (route.name === 'Search') {
                iconName = 'cloud-search';
              } else if (route.name === 'PT_0.1') {
                iconName = 'alien-outline';
              } else if (route.name === 'cal') {
                iconName = 'calculator-variant-outline';
              } else if (route.name === 'Ptwo') {
                iconName = 'alien';
              } else if (route.name === 'pthree') {
                iconName = 'alien';
              } else if (route.name === 'Eye') {
                iconName = 'eye';
              } else if (route.name === 'Test') {
                iconName = 'pin';
              }  else if (route.name === 'DataDisplay') {
                iconName = 'eye';
              } 
              
              // Return the corresponding icon component
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
          })}shadow
        >
          <Tab.Screen options={{headerShown:false}} name="pthree"component={Pthree} />
          <Tab.Screen options={{headerShown:false}} name="Search"component={Search} />
          <Tab.Screen options={{headerShown:false}} name="Home"component={Home} />
          {/* <Tab.Screen options={{headerShown:false}} name="PT_0.1"component={Pretest} /> */}
          {/* <Tab.Screen options={{headerShown:false}} name="Ptwo"component={Ptwo} /> */}
          {/* <Tab.Screen options={{headerShown:false}} name="Eye"component={Eye} /> */}
          {/* <Tab.Screen options={{headerShown:false}} name="cal"component={cal} /> */}
          <Tab.Screen options={{headerShown:false}} name="DataDisplay"component={DataDisplay} />
          {/* <Tab.Screen options={{headerShown:false}} name="Test"component={Test} /> */}
          
        </Tab.Navigator>
      );
    };
export default Nav

const styles = StyleSheet.create({})
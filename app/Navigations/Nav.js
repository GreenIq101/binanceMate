import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';


import Home from '../Screens/Home';
import Search from '../Screens/Search';
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
              } 
              // Return the corresponding icon component
              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
          })}shadow
        >
          <Tab.Screen options={{headerShown:false}} name="Search"component={Search} />
          <Tab.Screen options={{headerShown:false}} name="Home"component={Home} />
          
        </Tab.Navigator>
      );
    };
export default Nav

const styles = StyleSheet.create({})
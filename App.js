import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native'
import 'react-native-gesture-handler';
import Nav from './app/Navigations/Nav';
import Home from './app/Screens/Home';
import EnteryNav from './app/Navigations/EnteryNav';

const Stack = createStackNavigator();

export default function App() {

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen options={{headerShown:false}} name="Navigation" component={Nav} />
            <Stack.Screen options={{headerShown:false}} name="EnteryNav" component={EnteryNav} />
            <Stack.Screen options={{headerShown:false}} name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

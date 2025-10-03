import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Login from '../Screens/Login';
import Signup from '../Screens/Signup';
import Landing from '../Screens/Landing';

const Stack = createStackNavigator();

const EnteryNav = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
  <Stack.Screen name="Landing" component={Landing} />
  <Stack.Screen name="Login" component={Login} />
  <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
};

export default EnteryNav;
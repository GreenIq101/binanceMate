import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import iOSColors from '../Commponents/Colors';

import Login from '../Screens/Login';
import Signup from '../Screens/Signup';

const Tab = createBottomTabNavigator();

// Custom Tab Bar Component for Auth screens
const AuthTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={iOSColors.gradients.background}
        style={styles.tabBarGradient}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let iconName;
            let displayLabel;

            if (route.name === 'Login') {
              iconName = 'login';
              displayLabel = 'Login';
            } else if (route.name === 'Signup') {
              iconName = 'account-plus';
              displayLabel = 'Sign Up';
            }

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
              >
                <View style={[
                  styles.tabIconContainer,
                  isFocused && styles.tabIconContainerActive
                ]}>
                  <MaterialCommunityIcons
                    name={iconName}
                    size={22}
                    color={isFocused ? iOSColors.text.primary : iOSColors.text.tertiary}
                  />
                </View>
                <Text style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive
                ]}>
                  {displayLabel}
                </Text>
                {isFocused && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

const EnteryNav = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <AuthTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Login" component={Login} />
      <Tab.Screen name="Signup" component={Signup} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingBottom: 20,
  },
  tabBarGradient: {
    flex: 1,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  tabIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    backgroundColor: 'transparent',
  },
  tabIconContainerActive: {
    backgroundColor: iOSColors.button.primary,
    shadowColor: iOSColors.button.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: iOSColors.text.tertiary,
  },
  tabLabelActive: {
    color: iOSColors.text.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 25,
    height: 2.5,
    backgroundColor: iOSColors.button.primary,
    borderRadius: 1.25,
  },
});

export default EnteryNav;
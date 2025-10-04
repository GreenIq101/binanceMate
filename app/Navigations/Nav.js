import React from 'react';
import { StyleSheet, View, Text, Animated, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import iOSColors from '../Commponents/Colors';

import Analysis from '../Screens/Analysis';
import Home from '../Screens/Home';
import Portfolio from '../Screens/Portfolio';
import Watchlist from '../Screens/Watchlist';
import Alerts from '../Screens/Alerts';
import Calculator from '../Screens/Calculator';
import Eye from '../Screens/Eye';
import Pfour from '../Screens/Pfour';
import Settings from '../Screens/Settings';

const Tab = createBottomTabNavigator();

// Custom Tab Bar Component with iOS styling
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <LinearGradient
        colors={iOSColors.gradients.background}
        style={styles.tabBarGradient}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

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

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            let iconName;
            let displayLabel;

            if (route.name === 'Home') {
              iconName = 'home';
              displayLabel = 'Home';
            } else if (route.name === 'Portfolio') {
              iconName = 'wallet';
              displayLabel = 'Portfolio';
            } else if (route.name === 'Watchlist') {
              iconName = 'star';
              displayLabel = 'Watchlist';
            } else if (route.name === 'Alerts') {
              iconName = 'bell';
              displayLabel = 'Alerts';
            } else if (route.name === 'Eye') {
              iconName = 'eye';
              displayLabel = 'Market Eye';
            } else if (route.name === 'Pfour') {
              iconName = 'brain';
              displayLabel = 'AI Predict';
            } else if (route.name === 'Analysis') {
              iconName = 'chart-bar';
              displayLabel = 'Analysis';
            } else if (route.name === 'Calculator') {
              iconName = 'calculator';
              displayLabel = 'Calculator';
            } else if (route.name === 'Settings') {
              iconName = 'cog';
              displayLabel = 'Settings';
            }

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
              >
                <Animated.View style={[
                  styles.tabIconContainer,
                  isFocused && styles.tabIconContainerActive
                ]}>
                  <MaterialCommunityIcons
                    name={iconName}
                    size={24}
                    color={isFocused ? iOSColors.text.primary : iOSColors.text.tertiary}
                  />
                </Animated.View>
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

const Nav = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={Portfolio}
        options={{
          tabBarLabel: 'Portfolio',
        }}
      />
      <Tab.Screen
        name="Watchlist"
        component={Watchlist}
        options={{
          tabBarLabel: 'Watchlist',
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={Alerts}
        options={{
          tabBarLabel: 'Alerts',
        }}
      />
      <Tab.Screen
        name="Eye"
        component={Eye}
        options={{
          tabBarLabel: 'Market Eye',
        }}
      />
      <Tab.Screen
        name="Pfour"
        component={Pfour}
        options={{
          tabBarLabel: 'AI Predict',
        }}
      />
      <Tab.Screen
        name="Analysis"
        component={Analysis}
        options={{
          tabBarLabel: 'Analysis',
        }}
      />
      <Tab.Screen
        name="Calculator"
        component={Calculator}
        options={{
          tabBarLabel: 'Calculator',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    paddingBottom: 20, // Safe area padding
  },
  tabBarGradient: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  tabIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  tabIconContainerActive: {
    backgroundColor: iOSColors.button.primary,
    shadowColor: iOSColors.button.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: iOSColors.text.tertiary,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: iOSColors.text.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 30,
    height: 3,
    backgroundColor: iOSColors.button.primary,
    borderRadius: 2,
  },
});

export default Nav;
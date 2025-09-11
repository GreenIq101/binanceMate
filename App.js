import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';
import Nav from './app/Navigations/Nav';
import Home from './app/Screens/Home';
import EnteryNav from './app/Navigations/EnteryNav';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './app/Firebase/fireConfig';
import iOSColors from './app/Commponents/Colors';

const Stack = createStackNavigator();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <PaperProvider theme={paperTheme}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={iOSColors.background.primary}
                translucent={false}
            />
            <NavigationContainer
                theme={{
                    dark: true,
                    colors: {
                        primary: iOSColors.button.primary,
                        background: iOSColors.background.primary,
                        card: iOSColors.background.secondary,
                        text: iOSColors.text.primary,
                        border: iOSColors.border.light,
                        notification: iOSColors.button.danger,
                    },
                }}
            >
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: iOSColors.background.secondary,
                            borderBottomColor: iOSColors.border.light,
                            borderBottomWidth: 0.5,
                            shadowColor: 'transparent',
                            elevation: 0,
                        },
                        headerTintColor: iOSColors.text.primary,
                        headerTitleStyle: {
                            fontWeight: '600',
                            fontSize: 17,
                        },
                        cardStyle: {
                            backgroundColor: iOSColors.background.primary,
                        },
                    }}
                >
                    {isLoggedIn ? (
                        <>
                            <Stack.Screen
                                options={{ headerShown: false }}
                                name="Navigation"
                                component={Nav}
                            />
                            <Stack.Screen
                                options={{
                                    headerShown: false,
                                    title: 'Home'
                                }}
                                name="Home"
                                component={Home}
                            />
                        </>
                    ) : (
                        <Stack.Screen
                            options={{ headerShown: false }}
                            name="EnteryNav"
                            component={EnteryNav}
                        />
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}

// Custom Paper theme for iOS dark mode
const paperTheme = {
    dark: true,
    roundness: 12,
    colors: {
        primary: iOSColors.button.primary,
        accent: iOSColors.button.success,
        background: iOSColors.background.primary,
        surface: iOSColors.background.secondary,
        error: iOSColors.button.danger,
        text: iOSColors.text.primary,
        onSurface: iOSColors.text.primary,
        disabled: iOSColors.text.tertiary,
        placeholder: iOSColors.text.tertiary,
        backdrop: 'rgba(0, 0, 0, 0.5)',
        notification: iOSColors.button.warning,
    },
    fonts: {
        regular: {
            fontFamily: 'System',
            fontWeight: '400',
        },
        medium: {
            fontFamily: 'System',
            fontWeight: '500',
        },
        light: {
            fontFamily: 'System',
            fontWeight: '300',
        },
        thin: {
            fontFamily: 'System',
            fontWeight: '100',
        },
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: iOSColors.background.primary,
    },
});

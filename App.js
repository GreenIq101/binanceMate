import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';
import Nav from './app/Navigations/Nav';
import Home from './app/Screens/Home';
import EnteryNav from './app/Navigations/EnteryNav';
import { onAuthStateChanged } from 'firebase/auth'; // Import this to check auth state
import { auth } from './app/Firebase/fireConfig'; // Make sure the path is correct

const Stack = createStackNavigator();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true); // User is signed in
            } else {
                setIsLoggedIn(false); // User is signed out
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <PaperProvider>
            <NavigationContainer>
                <Stack.Navigator>
                    {isLoggedIn ? (
                        <>
                            <Stack.Screen options={{ headerShown: false }} name="Navigation" component={Nav} />
                            <Stack.Screen options={{ headerShown: false }} name="Home" component={Home} />
                        </>
                    ) : (
                        <Stack.Screen options={{ headerShown: false }} name="EnteryNav" component={EnteryNav} />
                    )}
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

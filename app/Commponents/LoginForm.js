import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../Firebase/fireConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Automatically login if user is already authenticated
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, handle successful login (e.g., navigate to home)
                console.log('User is logged in:', user);
                // You can navigate to the home screen here
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Handle successful login (e.g., navigate to home)
            navigation.navigate('Home'); 
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <View style={styles.LoginFormContainer}>
            <View style={styles.FormOutline}>
                <View style={styles.LoginHeaderTextContainer}>
                    <Text style={styles.LoginHeaderText}>Let's Login</Text>
                </View>
                <View style={styles.LogininpContainer}>
                    <TextInput
                        style={styles.Logininp}
                        placeholder='Enter Email'
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        style={styles.Logininp}
                        placeholder='Enter Password'
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>
                <View style={styles.LoginBtnContainer}>
                    <TouchableOpacity style={styles.LoginBtn} onPress={handleLogin}>
                        <MaterialCommunityIcons name='login' size={50} color='lightgreen' />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default LoginForm;

const styles = StyleSheet.create({
    LoginFormContainer: {
        flex: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        resizeMode: 'cover',
        fontFamily: "Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif"
    },
    FormOutline: {
        height: '60%',
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    LoginHeaderTextContainer: {
        height: '20%',
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    LoginHeaderText: {
        fontSize: 42,
        color: 'green'
    },
    LogininpContainer: {
        height: '45%',
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    Logininp: {
        height: '30%',
        width: '80%',
        textAlign: 'center',
        backgroundColor: 'whitesmoke',
        border: 'none',
        outlineStyle: 'none',
        shadowColor: 'black',
        shadowOpacity: "50",
        shadowOffset: "50",
        shadowRadius: "50"
    },
    LoginBtnContainer: {
        height: '20%',
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    LoginBtn: {
        height: '100%',
        width: '80%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: 'green'
    }
});

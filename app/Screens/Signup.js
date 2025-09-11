import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../Firebase/fireConfig';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const Signup = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Automatically login if user is already authenticated
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, navigate to the home screen
            navigation.navigate('Home'); // Replace 'Home' with your actual home screen name
        }
    });

    const handleSignup = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Handle successful signup (e.g., navigate to home)
            navigation.navigate('Home'); // Navigate to home screen after successful signup
        } catch (error) {
            console.error('Signup error:', error);
            // Optionally show an error message to the user
        }
    };

    return (
        <View style={styles.SignupFormContainer}>
            <View style={styles.FormOutline}>
                <View style={styles.SignupHeaderTextContainer}>
                    <Text style={styles.SignupHeaderText}>Let's Signup</Text>
                </View>
                <View style={styles.SignupinpContainer}>
                    <TextInput
                        style={styles.Signupinp}
                        placeholder='Enter Email'
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        style={styles.Signupinp}
                        placeholder='Enter Password'
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>
                <View style={styles.SignupBtnContainer}>
                    <TouchableOpacity style={styles.SignupBtn} onPress={handleSignup}>
                        <MaterialCommunityIcons name='account-multiple-plus' size={50} color='lightblue' />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default Signup;

const styles = StyleSheet.create({
    SignupFormContainer: {
        flex: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        resizeMode: 'cover',
        fontFamily: "Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif"
    },
    FormOutline: {
        height: '80%',
        width: '100%',
        backgroundColor: 'whitesmoke',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    SignupHeaderTextContainer: {
        height: '10%',
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    SignupHeaderText: {
        fontSize: 42,
        color: 'dodgerblue'
    },
    SignupinpContainer: {
        height: '68%',
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    Signupinp: {
        height: '12%',
        width: '80%',
        textAlign: 'center',
        border: 'none',
        outlineStyle: 'none',
        shadowColor: 'black',
        shadowOpacity: "50",
        shadowOffset: "50",
        shadowRadius: "50"
    },
    SignupBtnContainer: {
        height: '15%',
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    SignupBtn: {
        height: '100%',
        width: '80%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: 'dodgerblue'
    }
});

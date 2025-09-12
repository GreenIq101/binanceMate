import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Platform, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../Firebase/fireConfig';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import iOSColors from '../Commponents/Colors';
import WebOptimizedInput from '../Commponents/WebOptimizedInput';
import GoogleLoginButton from '../Commponents/GoogleLoginButton';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigation = useNavigation();

    // Animation values
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(50);

    useEffect(() => {
        // Start entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Navigation is handled by App.js auth state listener
    }, []);

    const validateForm = () => {
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('Error', 'Please enter a valid email address');
            return false;
        }

        return true;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email.trim(), password);
            Alert.alert('Success', 'Account created successfully!');
            // Navigation will be handled by auth state change
        } catch (error) {
            let errorMessage = 'Signup failed. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'An account with this email already exists.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak.';
            }
            Alert.alert('Signup Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={iOSColors.gradients.background}
                style={styles.background}
            >
                <Animated.View
                    style={[
                        styles.formContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Header Section */}
                    <View style={styles.headerContainer}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons
                                name="account-plus"
                                size={60}
                                color={iOSColors.button.primary}
                            />
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join us and start trading</Text>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.inputContainer}>
                        <WebOptimizedInput
                            placeholder="Email address"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            iconName="email"
                            returnKeyType="next"
                        />

                        <WebOptimizedInput
                            placeholder="Password (min. 6 characters)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                            iconName="lock"
                            showPasswordToggle={true}
                            returnKeyType="next"
                        />

                        <WebOptimizedInput
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={true}
                            iconName="lock-check"
                            showPasswordToggle={true}
                            returnKeyType="done"
                        />
                    </View>

                    {/* Signup Button */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={isLoading ? iOSColors.gradients.card : iOSColors.gradients.primary}
                                style={styles.buttonGradient}
                            >
                                {isLoading ? (
                                    <MaterialCommunityIcons
                                        name="loading"
                                        size={24}
                                        color={iOSColors.text.secondary}
                                    />
                                ) : (
                                    <>
                                        <Text style={styles.signupButtonText}>Create Account</Text>
                                        <MaterialCommunityIcons
                                            name="arrow-right"
                                            size={20}
                                            color={iOSColors.text.primary}
                                        />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Google Login Button */}
                    <View style={styles.googleButtonContainer}>
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>
                        <GoogleLoginButton />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Already have an account?{' '}
                            <Text
                                style={styles.loginLink}
                                onPress={() => navigation.navigate('Login')}
                            >
                                Sign in
                            </Text>
                        </Text>
                    </View>
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...(Platform.OS === 'web' && {
            minHeight: '100vh',
            overflow: 'hidden',
        }),
    },
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
        ...(Platform.OS === 'web' && {
            minHeight: '100vh',
        }),
    },
    formContainer: {
        width: '100%',
        maxWidth: 350,
        backgroundColor: iOSColors.background.secondary,
        borderRadius: 20,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: iOSColors.background.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: iOSColors.button.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: iOSColors.text.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: iOSColors.text.secondary,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 30,
        width: '100%',
    },
    buttonContainer: {
        marginBottom: 30,
    },
    signupButton: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: iOSColors.button.primary,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    signupButtonDisabled: {
        opacity: 0.6,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    signupButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: iOSColors.text.primary,
        marginRight: 8,
    },
    googleButtonContainer: {
        marginBottom: 20,
        width: '100%',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: iOSColors.border.light,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: iOSColors.text.tertiary,
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: iOSColors.text.secondary,
    },
    loginLink: {
        color: iOSColors.button.primary,
        fontWeight: '600',
    },
});

export default Signup;

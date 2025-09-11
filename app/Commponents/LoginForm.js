import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../Firebase/fireConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import iOSColors from './Colors';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigation = useNavigation();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const loadingAnim1 = useRef(new Animated.Value(0)).current;
    const loadingAnim2 = useRef(new Animated.Value(0)).current;
    const loadingAnim3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: false,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: false,
            }),
        ]).start();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('User is logged in:', user);
            }
        });

        return () => unsubscribe();
    }, []);

    // Loading animation effect
    useEffect(() => {
        if (isLoading) {
            const animateDots = () => {
                Animated.sequence([
                    Animated.timing(loadingAnim1, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: false,
                    }),
                    Animated.timing(loadingAnim2, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: false,
                    }),
                    Animated.timing(loadingAnim3, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: false,
                    }),
                ]).start(() => {
                    // Reset and repeat
                    loadingAnim1.setValue(0);
                    loadingAnim2.setValue(0);
                    loadingAnim3.setValue(0);
                    if (isLoading) {
                        animateDots();
                    }
                });
            };
            animateDots();
        } else {
            loadingAnim1.setValue(0);
            loadingAnim2.setValue(0);
            loadingAnim3.setValue(0);
        }
    }, [isLoading]);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            // Navigation will be handled by App.js auth state change
        } catch (error) {
            let errorMessage = 'Login failed. Please try again.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            }
            Alert.alert('Login Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
                                name="shield-check"
                                size={60}
                                color={iOSColors.button.primary}
                            />
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to your account</Text>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons
                                name="email"
                                size={20}
                                color={iOSColors.text.tertiary}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor={iOSColors.text.tertiary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons
                                name="lock"
                                size={20}
                                color={iOSColors.text.tertiary}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={iOSColors.text.tertiary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <MaterialCommunityIcons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color={iOSColors.text.tertiary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Login Button */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={isLoading ? iOSColors.gradients.card : iOSColors.gradients.primary}
                                style={styles.buttonGradient}
                            >
                                {isLoading ? (
                                    <Animated.View style={styles.loadingContainer}>
                                        <Animated.View style={[styles.loadingDot, {
                                            transform: [{
                                                scale: loadingAnim1.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.5, 1.2],
                                                }),
                                            }],
                                            opacity: loadingAnim1.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.3, 1],
                                            }),
                                        }]} />
                                        <Animated.View style={[styles.loadingDot, {
                                            transform: [{
                                                scale: loadingAnim2.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.5, 1.2],
                                                }),
                                            }],
                                            opacity: loadingAnim2.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.3, 1],
                                            }),
                                        }]} />
                                        <Animated.View style={[styles.loadingDot, {
                                            transform: [{
                                                scale: loadingAnim3.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.5, 1.2],
                                                }),
                                            }],
                                            opacity: loadingAnim3.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.3, 1],
                                            }),
                                        }]} />
                                    </Animated.View>
                                ) : (
                                    <>
                                        <Text style={styles.loginButtonText}>Sign In</Text>
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

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Don't have an account?{' '}
                            <Text
                                style={styles.signupLink}
                                onPress={() => navigation.navigate('Signup')}
                            >
                                Sign up
                            </Text>
                        </Text>
                    </View>
                </Animated.View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
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
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: iOSColors.background.tertiary,
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: iOSColors.border.light,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: iOSColors.text.primary,
        paddingVertical: 0,
    },
    eyeIcon: {
        padding: 4,
    },
    buttonContainer: {
        marginBottom: 30,
    },
    loginButton: {
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
    loginButtonDisabled: {
        opacity: 0.6,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: iOSColors.text.primary,
        marginRight: 8,
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: iOSColors.text.secondary,
    },
    signupLink: {
        color: iOSColors.button.primary,
        fontWeight: '600',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: iOSColors.button.primary,
        marginHorizontal: 2,
    },
});

export default LoginForm;

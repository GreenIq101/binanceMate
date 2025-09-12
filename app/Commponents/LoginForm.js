import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Platform, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../Firebase/fireConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import iOSColors from './Colors';
import WebOptimizedInput from './WebOptimizedInput';
import GoogleLoginButton from './GoogleLoginButton';

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
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Navigation is handled by App.js auth state listener
    }, [navigation]);

    // Loading animation effect
    useEffect(() => {
        if (isLoading) {
            const animateDots = () => {
                Animated.sequence([
                    Animated.timing(loadingAnim1, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(loadingAnim2, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(loadingAnim3, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
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
                        <WebOptimizedInput
                            placeholder="Email address"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            iconName="email"
                            returnKeyType="next"
                        />

                        <WebOptimizedInput
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                            iconName="lock"
                            showPasswordToggle={true}
                            returnKeyType="done"
                        />
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
    loginButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: iOSColors.button.primary,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.1)',
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

import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../Firebase/fireConfig';
import { useNavigation } from '@react-navigation/native';
import iOSColors from './Colors';

const GoogleLoginButton = ({ style }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      let result;
      
      if (Platform.OS === 'web') {
        // For web, try popup first, fallback to redirect
        try {
          result = await signInWithPopup(auth, googleProvider);
        } catch (popupError) {
          if (popupError.code === 'auth/popup-blocked') {
            // Fallback to redirect if popup is blocked
            await signInWithRedirect(auth, googleProvider);
            return; // Exit here, redirect will handle the rest
          }
          throw popupError;
        }
      } else {
        // For mobile platforms, you would need to use a different approach
        // like @react-native-google-signin/google-signin
        Alert.alert(
          'Google Sign-In',
          'Google Sign-In is currently available on web only. Please use email/password authentication on mobile.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      if (result && result.user) {
        // Navigation will be handled by the auth state listener in App.js
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      
      Alert.alert('Google Sign-In Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle redirect result on component mount (for web)
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      getRedirectResult(auth)
        .then((result) => {
          if (result && result.user) {
            // Google redirect sign-in successful
          }
        })
        .catch((error) => {
          console.error('Google redirect error:', error);
        });
    }
  }, []);

  return (
    <TouchableOpacity
      style={[styles.googleButton, style]}
      onPress={handleGoogleLogin}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.buttonGradient}
      >
        <View style={styles.buttonContent}>
          {isLoading ? (
            <MaterialCommunityIcons
              name="loading"
              size={20}
              color="#4285f4"
              style={styles.loadingIcon}
            />
          ) : (
            <MaterialCommunityIcons
              name="google"
              size={20}
              color="#4285f4"
              style={styles.googleIcon}
            />
          )}
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#dadce0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    marginRight: 12,
  },
  loadingIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3c4043',
    textAlign: 'center',
  },
});

export default GoogleLoginButton;
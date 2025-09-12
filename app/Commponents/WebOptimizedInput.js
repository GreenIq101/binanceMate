import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import iOSColors from './Colors';

const WebOptimizedInput = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false, 
  keyboardType = 'default',
  iconName,
  showPasswordToggle = false,
  returnKeyType = 'next'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputProps = {
    style: [styles.input, isFocused && styles.inputFocused],
    placeholder,
    placeholderTextColor: iOSColors.text.tertiary,
    value,
    onChangeText,
    autoCapitalize: 'none',
    autoCorrect: false,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    ...(Platform.OS === 'web' ? {
      // Web-specific props
      autoComplete: keyboardType === 'email-address' ? 'email' : secureTextEntry ? 'current-password' : 'off',
    } : {
      // Mobile-specific props
      keyboardType,
      returnKeyType,
      blurOnSubmit: false,
    })
  };

  if (secureTextEntry && showPasswordToggle) {
    inputProps.secureTextEntry = !showPassword;
  } else if (secureTextEntry) {
    inputProps.secureTextEntry = true;
  }

  return (
    <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
      <MaterialCommunityIcons
        name={iconName}
        size={20}
        color={isFocused ? iOSColors.button.primary : iOSColors.text.tertiary}
        style={styles.inputIcon}
      />
      <TextInput {...inputProps} />
      {showPasswordToggle && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <MaterialCommunityIcons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color={isFocused ? iOSColors.button.primary : iOSColors.text.tertiary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    ...(Platform.OS === 'web' && {
      // Web-specific styles to prevent layout issues
      position: 'relative',
      zIndex: 1,
    }),
  },
  inputWrapperFocused: {
    borderColor: iOSColors.button.primary,
    borderWidth: 2,
    shadowColor: iOSColors.button.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
      flex: 1,
      fontSize: 16,
      color: iOSColors.text.primary,
      paddingVertical: 0,
      ...(Platform.OS === 'web' && {
          // Web-specific input styles
          outlineStyle: 'none',
          borderStyle: 'none',
          backgroundColor: 'transparent',
      }),
  },
  inputFocused: {
    color: iOSColors.text.primary,
  },
  eyeIcon: {
    padding: 4,
  },
});

export default WebOptimizedInput;
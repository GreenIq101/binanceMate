import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as w, heightPercentageToDP as h } from 'react-native-responsive-screen';
import iOSColors from '../Commponents/Colors';
import { auth, db } from '../Firebase/fireConfig';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
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
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              // Navigation will be handled by App.js auth state change
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const updateUserPreference = async (preference, value) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          [preference]: value,
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  const handleNotificationToggle = (value) => {
    setNotifications(value);
    updateUserPreference('notifications', value);
  };

  const handlePriceAlertsToggle = (value) => {
    setPriceAlerts(value);
    updateUserPreference('priceAlerts', value);
  };

  const handleBiometricToggle = (value) => {
    setBiometricAuth(value);
    updateUserPreference('biometricAuth', value);
  };

  const handleAutoRefreshToggle = (value) => {
    setAutoRefresh(value);
    updateUserPreference('autoRefresh', value);
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your portfolio, watchlist, and alert data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Feature Coming Soon', 'Data clearing functionality will be available in the next update.');
          }
        }
      ]
    );
  };

  const exportData = () => {
    Alert.alert('Export Data', 'Data export functionality will be available in the next update.');
  };

  const contactSupport = () => {
    Alert.alert('Contact Support', 'support@bullmaster.app\n\nWe\'re here to help!');
  };

  const aboutApp = () => {
    Alert.alert(
      'About Bull Master',
      'Version 1.0.0\n\nYour ultimate crypto trading companion with portfolio tracking, price alerts, and advanced analytics.\n\n© 2024 Bull Master',
      [{ text: 'OK' }]
    );
  };

  const SettingItem = ({ title, subtitle, rightComponent, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.settingItem}
      disabled={!onPress}
    >
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={iOSColors.gradients.background}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* User Profile Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={iOSColors.gradients.card}
            style={styles.sectionGradient}
          >
            <View style={styles.userProfile}>
              <View style={styles.userAvatar}>
                <MaterialCommunityIcons
                  name="account"
                  size={40}
                  color={iOSColors.button.primary}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {auth.currentUser?.displayName || 'User'}
                </Text>
                <Text style={styles.userEmail}>
                  {auth.currentUser?.email}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={iOSColors.gradients.card}
            style={styles.sectionGradient}
          >
            <Text style={styles.sectionTitle}>Preferences</Text>

            <SettingItem
              title="Push Notifications"
              subtitle="Receive notifications for important updates"
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: iOSColors.border.light, true: iOSColors.button.primary }}
                  thumbColor={notifications ? iOSColors.text.primary : iOSColors.text.tertiary}
                />
              }
            />

            <SettingItem
              title="Price Alerts"
              subtitle="Get notified when prices hit your targets"
              rightComponent={
                <Switch
                  value={priceAlerts}
                  onValueChange={handlePriceAlertsToggle}
                  trackColor={{ false: iOSColors.border.light, true: iOSColors.button.primary }}
                  thumbColor={priceAlerts ? iOSColors.text.primary : iOSColors.text.tertiary}
                />
              }
            />

            <SettingItem
              title="Biometric Authentication"
              subtitle="Use fingerprint or face ID to login"
              rightComponent={
                <Switch
                  value={biometricAuth}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: iOSColors.border.light, true: iOSColors.button.primary }}
                  thumbColor={biometricAuth ? iOSColors.text.primary : iOSColors.text.tertiary}
                />
              }
            />

            <SettingItem
              title="Auto Refresh"
              subtitle="Automatically refresh prices every 30 seconds"
              rightComponent={
                <Switch
                  value={autoRefresh}
                  onValueChange={handleAutoRefreshToggle}
                  trackColor={{ false: iOSColors.border.light, true: iOSColors.button.primary }}
                  thumbColor={autoRefresh ? iOSColors.text.primary : iOSColors.text.tertiary}
                />
              }
            />
          </LinearGradient>
        </Animated.View>

        {/* Data Management Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={iOSColors.gradients.card}
            style={styles.sectionGradient}
          >
            <Text style={styles.sectionTitle}>Data Management</Text>

            <SettingItem
              title="Export Data"
              subtitle="Download your portfolio and transaction data"
              onPress={exportData}
              rightComponent={
                <MaterialCommunityIcons
                  name="download"
                  size={24}
                  color={iOSColors.text.tertiary}
                />
              }
            />

            <SettingItem
              title="Clear All Data"
              subtitle="Remove all your data from the app"
              onPress={clearAllData}
              rightComponent={
                <MaterialCommunityIcons
                  name="delete-sweep"
                  size={24}
                  color={iOSColors.button.danger}
                />
              }
            />
          </LinearGradient>
        </Animated.View>

        {/* Support Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={iOSColors.gradients.card}
            style={styles.sectionGradient}
          >
            <Text style={styles.sectionTitle}>Support</Text>

            <SettingItem
              title="Contact Support"
              subtitle="Get help with any issues"
              onPress={contactSupport}
              rightComponent={
                <MaterialCommunityIcons
                  name="help-circle"
                  size={24}
                  color={iOSColors.text.tertiary}
                />
              }
            />

            <SettingItem
              title="About Bull Master"
              subtitle="Version 1.0.0"
              onPress={aboutApp}
              rightComponent={
                <MaterialCommunityIcons
                  name="information"
                  size={24}
                  color={iOSColors.text.tertiary}
                />
              }
            />
          </LinearGradient>
        </Animated.View>

        {/* Sign Out Button */}
        <Animated.View
          style={[
            styles.signOutSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <LinearGradient
              colors={[iOSColors.button.danger, '#FF6B6B']}
              style={styles.signOutButtonGradient}
            >
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color={iOSColors.text.primary}
              />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: iOSColors.background.primary,
  },
  background: {
    flex: 1,
    paddingHorizontal: w('5%'),
    paddingTop: h('2%'),
  },
  header: {
    marginBottom: h('3%'),
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: iOSColors.text.primary,
  },
  section: {
    marginBottom: h('3%'),
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  sectionGradient: {
    padding: w('5%'),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: h('2%'),
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: iOSColors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: w('4%'),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: iOSColors.text.secondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: h('2%'),
    borderBottomWidth: 1,
    borderBottomColor: iOSColors.border.light,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: iOSColors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: iOSColors.text.secondary,
  },
  signOutSection: {
    marginTop: h('2%'),
    marginBottom: h('5%'),
  },
  signOutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: iOSColors.button.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signOutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: h('2%'),
    paddingHorizontal: w('6%'),
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginLeft: w('2%'),
  },
});

export default Settings;
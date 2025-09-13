import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import iOSColors from '../Commponents/Colors';

const { width } = Dimensions.get('window');

const features = [
  {
    title: 'Smart Predictions',
    description: 'Get AI-powered predictions for various assets with detailed analytics and accuracy metrics.',
    icon: require('../../assets/icon.png'),
  },
  {
    title: 'Portfolio Tracking',
    description: 'Track your investments and performance in real-time with easy-to-read charts and summaries.',
    icon: require('../../assets/logo.png'),
  },
  {
    title: 'Market Analysis',
    description: 'Analyze market trends using advanced indicators like SMA, EMA, and RSI.',
    icon: require('../../assets/favicon.png'),
  },
  {
    title: 'Secure Authentication',
    description: 'Sign up and log in securely to access personalized features and save your predictions.',
    icon: require('../../assets/splash.png'),
  },
  {
    title: 'Saved Predictions',
    description: 'Review your saved predictions and analyze their accuracy over time.',
    icon: require('../../assets/adasda.png'),
  },
];

const Landing = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Welcome to Master the Bull </Text>
      <Text style={styles.subtitle}>Your AI-powered trading companion</Text>
      <Image source={require('../../assets/adasda.png')} style={styles.heroImage} />
      <View style={styles.featuresSection}>
        {features.map((feature, idx) => (
          <View key={idx} style={styles.featureCard}>
            <Image source={feature.icon} style={styles.featureIcon} />
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDesc}>{feature.description}</Text>
          </View>
        ))}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: iOSColors.background.primary,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: iOSColors.text.primary,
    marginTop: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: iOSColors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  heroImage: {
    width: width * 0.7,
    height: width * 0.4,
    resizeMode: 'contain',
    marginBottom: 32,
    borderRadius: 16,
  },
  featuresSection: {
    width: '100%',
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: iOSColors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: iOSColors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 15,
    color: iOSColors.text.secondary,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 16,
  },
  button: {
    backgroundColor: iOSColors.button.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: iOSColors.text.onPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Landing;

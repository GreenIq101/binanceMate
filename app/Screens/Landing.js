"use client"

import { useRef, useEffect } from "react"
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import iOSColors from "../Commponents/Colors"

const { width } = Dimensions.get("window")

const features = [
  {
    title: "Smart Predictions",
    description: "Get AI-powered predictions for various assets with detailed analytics and accuracy metrics.",
    icon: "brain",
  },
  {
    title: "Portfolio Tracking",
    description: "Track your investments and performance in real-time with easy-to-read charts and summaries.",
    icon: "wallet",
  },
  {
    title: "Market Analysis",
    description: "Analyze market trends using advanced indicators like SMA, EMA, and RSI.",
    icon: "chart-line",
  },
  {
    title: "Secure Authentication",
    description: "Sign up and log in securely to access personalized features and save your predictions.",
    icon: "shield-check",
  },
  {
    title: "Saved Predictions",
    description: "Review your saved predictions and analyze their accuracy over time.",
    icon: "bookmark",
  },
]

const Landing = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
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
    ]).start()
  }, [])

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient colors={iOSColors.gradients.background} style={styles.background}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="bullseye-arrow" size={80} color={iOSColors.text.onPrimary} />
            </View>
            <Text style={styles.title}>Master the Bull</Text>
            <Text style={styles.subtitle}>Your AI-powered crypto trading companion</Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            {features.map((feature, idx) => (
              <View key={idx} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <MaterialCommunityIcons name={feature.icon} size={32} color={iOSColors.button.primary} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.description}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={() => navigation.navigate("Login")}>
              <LinearGradient colors={["#FFFFFF", "#F5F5F5"]} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Login</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={iOSColors.button.primary} />
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.button} onPress={() => navigation.navigate("Signup")}>
              <LinearGradient colors={["#FFFFFF", "#F5F5F5"]} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Sign Up</Text>
                <MaterialCommunityIcons name="account-plus" size={20} color={iOSColors.button.primary} />
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: iOSColors.background.primary,
  },
  background: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: iOSColors.text.onPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "500",
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: iOSColors.background.secondary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(196, 30, 92, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: iOSColors.text.primary,
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 15,
    color: iOSColors.text.secondary,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  buttonText: {
    color: iOSColors.button.primary,
    fontSize: 18,
    fontWeight: "600",
  },
})

export default Landing

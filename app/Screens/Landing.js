"use client"

import { useRef, useEffect } from "react"
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Animated, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import iOSColors from "../Commponents/Colors"

const { width } = Dimensions.get("window")


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
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Master the Bull</Text>
            <Text style={styles.subtitle}>Your AI-powered crypto trading companion</Text>
          </View>


          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={() => navigation.navigate("EnteryNav", { screen: "Login" })}>
              <LinearGradient colors={["#FFFFFF", "#F5F5F5"]} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Login</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={iOSColors.button.primary} />
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.button} onPress={() => navigation.navigate("EnteryNav", { screen: "Signup" })}>
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
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    alignSelf: 'center',
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

"use client"

import { useRef, useEffect, useState } from "react"
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Animated, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import iOSColors from "../Commponents/Colors"
import { auth, db } from "../Firebase/fireConfig"
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore'

const { width } = Dimensions.get("window")


const Landing = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const [recentNotifications, setRecentNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [portfolioSummary, setPortfolioSummary] = useState(null)

  const fetchPortfolioSummary = async (user) => {
    try {
      const portfolioQuery = query(collection(db, 'portfolio'), where('userId', '==', user.uid))
      const portfolioSnapshot = await getDocs(portfolioQuery)

      if (portfolioSnapshot.empty) {
        setPortfolioSummary(null)
        return
      }

      let totalValue = 0
      let totalInvested = 0
      let holdingsCount = 0

      // Get unique symbols for batch price fetching
      const symbols = [...new Set(portfolioSnapshot.docs.map(doc => doc.data().symbol))]

      // Fetch current prices from Binance
      const prices = {}
      for (const symbol of symbols) {
        try {
          const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`)
          const data = await response.json()
          prices[symbol] = parseFloat(data.price) || 0
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error)
          prices[symbol] = 0
        }
      }

      // Calculate portfolio totals
      portfolioSnapshot.forEach((doc) => {
        const holding = doc.data()
        const currentPrice = prices[holding.symbol] || 0
        const currentValue = holding.amount * currentPrice
        const investedValue = holding.amount * holding.avgPrice

        totalValue += currentValue
        totalInvested += investedValue
        holdingsCount++
      })

      const totalPnL = totalValue - totalInvested
      const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

      setPortfolioSummary({
        totalValue,
        totalInvested,
        totalPnL,
        totalPnLPercentage,
        holdingsCount
      })
    } catch (error) {
      console.error('Error fetching portfolio summary:', error)
      setPortfolioSummary(null)
    }
  }

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

    // Set up real-time listener for notifications if user is logged in
    const user = auth.currentUser
    if (user) {
      // Fetch portfolio summary
      fetchPortfolioSummary(user)

      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      )

      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const notifications = []
        let unread = 0

        snapshot.forEach((doc) => {
          const notification = { id: doc.id, ...doc.data() }
          notifications.push(notification)
          if (!notification.read) unread++
        })

        setRecentNotifications(notifications)
        setUnreadCount(unread)
      })

      return () => unsubscribe()
    }
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

          {/* Alerts Section */}
          {auth.currentUser && (
            <View style={styles.alertsSection}>
              <View style={styles.alertsHeader}>
                <MaterialCommunityIcons name="bell" size={24} color={iOSColors.button.primary} />
                <Text style={styles.alertsTitle}>Recent Alerts</Text>
                {unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{unreadCount}</Text>
                  </View>
                )}
              </View>

              {recentNotifications.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.notificationsScroll}>
                  {recentNotifications.slice(0, 3).map((notification) => (
                    <View key={notification.id} style={[styles.notificationCard, !notification.read && styles.notificationUnread]}>
                      <View style={styles.notificationIcon}>
                        <MaterialCommunityIcons
                          name={notification.type === 'price_alert' ? 'trending-up' : 'information'}
                          size={16}
                          color={iOSColors.button.primary}
                        />
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle} numberOfLines={1}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationMessage} numberOfLines={2}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {new Date(notification.createdAt.seconds * 1000).toLocaleDateString()}
                        </Text>
                      </View>
                      {!notification.read && <View style={styles.unreadIndicator} />}
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noAlertsContainer}>
                  <MaterialCommunityIcons name="bell-outline" size={32} color={iOSColors.text.tertiary} />
                  <Text style={styles.noAlertsText}>No recent alerts</Text>
                </View>
              )}

              <Pressable
                style={styles.viewAllButton}
                onPress={() => navigation.navigate("Navigation", { screen: "Alerts" })}
              >
                <Text style={styles.viewAllText}>View All Alerts</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color={iOSColors.button.primary} />
              </Pressable>
            </View>
          )}

          {/* Portfolio Section */}
          {auth.currentUser && portfolioSummary && (
            <View style={styles.portfolioSection}>
              <View style={styles.portfolioHeader}>
                <MaterialCommunityIcons name="wallet" size={24} color={iOSColors.button.primary} />
                <Text style={styles.portfolioTitle}>Portfolio Summary</Text>
              </View>

              <View style={styles.portfolioStats}>
                <View style={styles.portfolioStat}>
                  <Text style={styles.portfolioStatLabel}>Total Value</Text>
                  <Text style={styles.portfolioStatValue}>
                    ${portfolioSummary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>

                <View style={styles.portfolioStat}>
                  <Text style={styles.portfolioStatLabel}>Total P&L</Text>
                  <Text style={[styles.portfolioStatValue, {
                    color: portfolioSummary.totalPnL >= 0 ? iOSColors.status.bullish : iOSColors.status.bearish
                  }]}>
                    {portfolioSummary.totalPnL >= 0 ? '+' : ''}${portfolioSummary.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    ({portfolioSummary.totalPnLPercentage >= 0 ? '+' : ''}{portfolioSummary.totalPnLPercentage.toFixed(2)}%)
                  </Text>
                </View>

                <View style={styles.portfolioStat}>
                  <Text style={styles.portfolioStatLabel}>Holdings</Text>
                  <Text style={styles.portfolioStatValue}>{portfolioSummary.holdingsCount}</Text>
                </View>
              </View>

              <Pressable
                style={styles.viewAllButton}
                onPress={() => navigation.navigate("Navigation", { screen: "Portfolio" })}
              >
                <Text style={styles.viewAllText}>View Full Portfolio</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color={iOSColors.button.primary} />
              </Pressable>
            </View>
          )}
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
  alertsSection: {
    marginTop: 40,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  alertsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  alertsTitle: {
    color: iOSColors.text.onPrimary,
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: iOSColors.button.warning,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    color: iOSColors.text.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  notificationsScroll: {
    marginBottom: 16,
  },
  notificationCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 200,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    position: "relative",
  },
  notificationUnread: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderColor: iOSColors.button.primary,
  },
  notificationIcon: {
    marginBottom: 8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: iOSColors.text.onPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  notificationMessage: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  notificationTime: {
    color: iOSColors.text.tertiary,
    fontSize: 10,
  },
  unreadIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: iOSColors.button.warning,
  },
  noAlertsContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noAlertsText: {
    color: iOSColors.text.tertiary,
    fontSize: 14,
    marginTop: 8,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  viewAllText: {
    color: iOSColors.button.primary,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  portfolioSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  portfolioHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  portfolioTitle: {
    color: iOSColors.text.onPrimary,
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  portfolioStats: {
    marginBottom: 16,
  },
  portfolioStat: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  portfolioStatLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  portfolioStatValue: {
    color: iOSColors.text.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
})

export default Landing

# Bull Master - Crypto Trading Assistant

A comprehensive React Native crypto trading application with advanced AI predictions, real-time market data, and professional iOS-style design.

## 🚀 Features

### 🧠 AI Prediction Engine (Pfour)
- **Advanced Technical Analysis**: SMA, EMA, RSI, Bollinger Bands, MACD, ATR
- **Real-Time Price Predictions**: Live Binance API integration
- **Multi-Timeframe Analysis**: 5m, 30m, 1h, 4h, 1d periods
- **200+ Cryptocurrency Pairs**: Comprehensive coin database
- **Firebase Data Persistence**: Save predictions to user collections

### 📊 Complete Trading Suite
- **Portfolio Management**: Real-time holdings and P&L tracking
- **Watchlist**: Favorite coins with live price monitoring
- **Price Alerts**: Custom notification system
- **Trading Calculator**: Professional calculation tools
- **Market Eye**: Multi-pair technical analysis

### 🎨 Professional Design
- **iOS-Style Interface**: Modern glassmorphism with yellow/black theme
- **Smooth Animations**: Entrance and interaction effects
- **Responsive Layout**: Optimized for all screen sizes
- **High Contrast**: Excellent text visibility and accessibility

### 📈 Real-Time Data
- **Live Market Updates**: Continuous Binance API integration
- **Auto-Refresh**: Real-time price updates every second
- **Market Statistics**: Top gainers, losers, and trending coins
- **Server Time Display**: Real-time clock synchronization

## 🛠️ Technology Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development and build platform
- **Firebase**: Backend services and data persistence
- **Binance API**: Real-time cryptocurrency data
- **React Navigation**: Navigation and routing
- **TensorFlow.js**: AI/ML capabilities

## 📱 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GreenIq101/binanceMate.git
   cd binanceMate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device/emulator:**
   ```bash
   # For iOS
   npm run ios

   # For Android
   npm run android

   # For Web
   npm run web
   ```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore Database
3. Add your Firebase configuration to `app/Firebase/fireConfig.js`

### Binance API
The app uses Binance's public API endpoints for real-time market data. No API key is required for basic market data access.

## 📁 Project Structure

```
app/
├── app/
│   ├── Screens/
│   │   ├── Home.js          # Main dashboard
│   │   ├── Pfour.js         # AI prediction engine
│   │   ├── Eye.js           # Market analysis
│   │   ├── Portfolio.js     # Portfolio management
│   │   ├── Watchlist.js     # Favorite coins
│   │   ├── Alerts.js        # Price alerts
│   │   ├── Calculator.js    # Trading calculator
│   │   └── Settings.js      # App settings
│   ├── Navigations/
│   │   ├── Nav.js           # Main navigation
│   │   └── EnteryNav.js     # Authentication navigation
│   ├── Commponents/
│   │   ├── Colors.js        # iOS color scheme
│   │   ├── LoginForm.js     # Authentication form
│   │   └── DataDisplay.js   # Data visualization
│   └── Firebase/
│       └── fireConfig.js    # Firebase configuration
├── assets/                  # Images and icons
└── package.json            # Dependencies and scripts
```

## 🎯 Key Features

### AI Prediction Engine (Pfour)
- **Technical Indicators**: Complete set of trading indicators
- **Price Forecasting**: Advanced prediction algorithms
- **Market Analysis**: Bullish/bearish trend detection
- **Data Persistence**: Firebase integration for saving predictions

### Real-Time Market Data
- **Live Prices**: Continuous price updates from Binance
- **Market Statistics**: Volume, market cap, price changes
- **Top Movers**: Gainers, losers, and trending coins
- **Multi-Pair Support**: Extensive cryptocurrency coverage

### Professional UI/UX
- **iOS Design Language**: Native iOS-style components
- **Smooth Animations**: Polished entrance and interaction effects
- **Dark Theme**: Professional yellow/black color scheme
- **Responsive Design**: Optimized for all device sizes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**GreenIq101**
- GitHub: [@GreenIq101](https://github.com/GreenIq101)
- Repository: [Bull Master](https://github.com/GreenIq101/binanceMate)

## 🙏 Acknowledgments

- Binance API for real-time market data
- Firebase for backend services
- Expo for React Native development platform
- React Native community for excellent documentation and support

---

**Bull Master** - Your ultimate crypto trading companion with AI-powered predictions and professional-grade tools! 🚀📈
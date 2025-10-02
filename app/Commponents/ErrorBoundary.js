import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import iOSColors from './Colors';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong.</Text>
          <Text style={styles.message}>
            We're sorry for the inconvenience. Please try refreshing the app.
          </Text>
          <Text style={styles.error}>{this.state.error?.toString()}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: iOSColors.background.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: iOSColors.text.primary,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: iOSColors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    fontSize: 12,
    color: iOSColors.text.tertiary,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
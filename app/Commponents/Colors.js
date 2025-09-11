const iOSColors = {
  // Yellow and Black Theme Colors
  background: {
    primary: '#000000',      // Pure black background
    secondary: '#1a1a1a',     // Dark gray for cards/containers
    tertiary: '#2a2a2a',      // Slightly lighter gray
    accent: '#333333',       // Accent background
  },

  // Text Colors - Yellow theme
  text: {
    primary: '#FFD700',      // Bright yellow for primary text
    secondary: '#FFA500',    // Orange for secondary text
    tertiary: '#888888',     // Medium gray for tertiary text
    accent: '#FFD700',       // Yellow for accent text
  },

  // Button Colors - Yellow and Black theme
  button: {
    primary: '#FFD700',      // Bright yellow for primary actions
    secondary: '#333333',    // Dark gray
    success: '#FFA500',      // Orange for success
    danger: '#FF4500',       // Red-orange for danger
    warning: '#FF8C00',      // Dark orange for warnings
  },

  // Gradients for glossy effects - Yellow theme
  gradients: {
    primary: ['#FFD700', '#FFA500'],
    success: ['#FFA500', '#FF8C00'],
    background: ['#000000', '#1a1a1a'],
    card: ['#2a2a2a', '#1a1a1a'],
    warning: ['#FF8C00', '#FF4500'],
    danger: ['#FF4500', '#CC3300'],
    secondary: ['#1a1a1a', '#2a2a2a'],
    tertiary: ['#333333', '#2a2a2a'],
  },

  // Border and Shadow Colors
  border: {
    light: '#FFD700',        // Yellow border
    dark: '#FFA500',         // Orange border
  },

  // Status Colors - Yellow theme
  status: {
    bullish: '#FFD700',      // Yellow for bullish
    bearish: '#FF4500',      // Red-orange for bearish
    neutral: '#FF8C00',      // Orange for neutral
  },

  // Legacy colors for backward compatibility
  o: "#FFD700",  // Yellow
  b: "#FFA500",  // Orange
  r: "#FF4500",  // Red-orange
};

export default iOSColors;
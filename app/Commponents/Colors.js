const iOSColors = {
  // Background Colors - Dark but breathable
  background: {
    primary: '#0d0d0d',      // Deep black (slightly softened)
    secondary: '#1c1c1e',    // Modern dark gray for cards
    tertiary: '#2c2c2e',     // Lighter gray for separation
    accent: '#3a3a3c',       // Accent background
  },

  // Text Colors - Softer yellow + crisp neutrals
  text: {
    primary: '#FFE066',      // Softer golden yellow (easy on eyes)
    secondary: '#FFB84D',    // Warm amber for secondary text
    tertiary: '#A1A1AA',     // Neutral gray for muted text
    accent: '#FFFFFF',       // White for high contrast cases
  },

  // Button Colors - High contrast and accessible
  button: {
    primary: '#FFE066',      // Golden yellow for main actions
    secondary: '#2c2c2e',    // Subtle gray buttons
    success: '#34C759',      // Modern green success (iOS style)
    danger: '#FF3B30',       // Bright red danger
    warning: '#FF9500',      // Orange warning
  },

  // Gradients - Modern soft blends
  gradients: {
    primary: ['#FFE066', '#FFB84D'],
    success: ['#34C759', '#248A3D'],
    background: ['#0d0d0d', '#1c1c1e'],
    card: ['#2c2c2e', '#1c1c1e'],
    warning: ['#FFB84D', '#FF9500'],
    danger: ['#FF5E57', '#CC1C13'],
    secondary: ['#1c1c1e', '#2c2c2e'],
    tertiary: ['#3a3a3c', '#2c2c2e'],
  },

  // Border and Shadows - Subtle but visible
  border: {
    light: '#FFE066',        // Soft golden border
    dark: '#3a3a3c',         // Dark neutral border
  },

  // Status Colors - Fresh, readable
  status: {
    bullish: '#34C759',      // Green bullish
    bearish: '#FF3B30',      // Red bearish
    neutral: '#FFB84D',      // Warm amber neutral
  },

  // Legacy colors (updated to match new scheme)
  o: "#FFE066",  // Golden yellow
  b: "#FFB84D",  // Amber
  r: "#FF3B30",  // Red
};

export default iOSColors;

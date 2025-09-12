const iOSColors = {
  // Background Colors - Dark but breathable
  background: {
    primary: '#0d0d0d',      // Deep black (slightly softened)
    secondary: '#1c1c1e',    // Modern dark gray for cards
    tertiary: '#2c2c2e',     // Lighter gray for separation
    accent: '#3a3a3c',       // Accent background
  },

  // Text Colors - Improved accessibility and reduced eye strain
  text: {
    primary: '#F5F5F7',      // Soft white for primary text (better contrast)
    secondary: '#D1D1D6',    // Light gray for secondary text
    tertiary: '#8E8E93',     // Medium gray for muted text
    accent: '#FFFFFF',       // Pure white for high contrast cases
  },

  // Button Colors - Improved accessibility and visual appeal
  button: {
    primary: '#FFD700',      // Rich gold for main actions (less bright)
    secondary: '#2c2c2e',    // Subtle gray buttons
    success: '#30D158',      // Modern green success (iOS style)
    danger: '#FF453A',       // Accessible red danger
    warning: '#FF9F0A',      // Accessible orange warning
  },

  // Gradients - Subtle and accessible blends
  gradients: {
    primary: ['#FFD700', '#FFA500'],
    success: ['#30D158', '#28A745'],
    background: ['#0d0d0d', '#1a1a1a'],
    card: ['#2c2c2e', '#252526'],
    warning: ['#FF9F0A', '#E8890B'],
    danger: ['#FF453A', '#D63027'],
    secondary: ['#1a1a1a', '#2c2c2e'],
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

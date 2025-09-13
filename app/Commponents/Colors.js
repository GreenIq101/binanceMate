
const iOSColors = {
  // Background Colors - Crypto dark theme
  background: {
    primary: '#101622',      // Deep blue-black (crypto dark)
    secondary: '#181F2A',    // Card dark blue
    tertiary: '#232B3B',     // Slightly lighter for separation
    accent: '#1B2232',       // Accent background
  },

  // Text Colors - High contrast for dark
  text: {
    primary: '#F8FAFC',      // Bright white for primary text
    secondary: '#AEB8C4',    // Cool gray for secondary text
    tertiary: '#5C6A82',     // Muted blue-gray for hints
    accent: '#FFD700',       // Gold accent for highlights
    onPrimary: '#101622',    // For text on gold buttons
  },

  // Button Colors - Crypto accent
  button: {
    primary: '#FFD700',      // Gold for main actions
    secondary: '#232B3B',    // Card blue for secondary
    success: '#16C784',      // Crypto green (bullish)
    danger: '#EA3943',       // Crypto red (bearish)
    warning: '#FFB92A',      // Orange warning
  },

  // Gradients - Crypto style
  gradients: {
    primary: ['#FFD700', '#FFB92A'],
    success: ['#16C784', '#0EAD69'],
    background: ['#101622', '#181F2A'],
    card: ['#232B3B', '#181F2A'],
    warning: ['#FFB92A', '#FF8C00'],
    danger: ['#EA3943', '#B71C1C'],
    secondary: ['#181F2A', '#232B3B'],
    tertiary: ['#1B2232', '#232B3B'],
  },

  // Border Colors
  border: {
    light: '#FFD700',        // Gold border
    dark: '#232B3B',         // Card border
  },

  // Status Colors - Crypto
  status: {
    bullish: '#16C784',      // Green bullish
    bearish: '#EA3943',      // Red bearish
    neutral: '#FFB92A',      // Orange neutral
  },

  // Legacy colors (updated to match new scheme)
  o: "#FFD700",  // Gold
  b: "#FFB92A",  // Orange
  r: "#EA3943",  // Red
};

export default iOSColors;

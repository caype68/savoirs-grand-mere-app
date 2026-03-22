// Design tokens from UI Kit - Savoirs de Grand-Mère
import { Platform } from 'react-native';

export const colors = {
  // Backgrounds
  background: '#0F1115',
  surface: '#151922',
  surfaceElevated: '#1A1F29',
  surfaceCard: '#1A1F29',
  surfaceInput: '#121720',
  surfaceHighlight: '#1E2430',
  
  // Text
  textPrimary: '#F2F4F7',
  textSecondary: '#B7BEC9',
  textMuted: '#7E8795',
  
  // Accents - Herb (vert) & Amber (doré)
  accentPrimary: '#78A686', // Herb green
  accentPrimaryMuted: 'rgba(120, 166, 134, 0.15)',
  accentPrimarySoft: '#5F8770',
  accentSecondary: '#C49B61', // Amber gold
  accentSecondaryMuted: 'rgba(196, 155, 97, 0.15)',
  accentSecondarySoft: '#9B7748',
  
  // Semantic
  success: '#76B58B',
  warning: '#D2A565',
  error: '#C36B6B',
  info: '#7B9FB8',
  
  // Tertiary accent
  accentTertiary: '#9B7748',
  accentTertiaryMuted: 'rgba(155, 119, 72, 0.15)',
  
  // Borders
  border: '#262D38',
  borderStrong: '#313A48',
  borderLight: '#1E2530',
  borderAccent: 'rgba(120, 166, 134, 0.3)',
  borderGold: 'rgba(196, 155, 97, 0.4)',
  
  // Gradients
  gradientDark: ['rgba(15, 17, 21, 0)', 'rgba(15, 17, 21, 0.95)'],
  gradientCard: ['rgba(26, 31, 41, 0.6)', 'rgba(15, 17, 21, 0.95)'],
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  
  // Confidence/Reliability
  confidenceHigh: '#76B58B',
  confidenceMedium: '#D2A565',
  confidenceLow: '#C36B6B',
  
  // Chips
  chipBackground: 'rgba(255, 255, 255, 0.06)',
  chipBackgroundActive: 'rgba(120, 166, 134, 0.15)',
  chipBorder: '#262D38',
  chipBorderActive: 'rgba(120, 166, 134, 0.4)',
  
  // Effects
  cardShadow: 'rgba(0, 0, 0, 0.22)',
  softShadow: 'rgba(0, 0, 0, 0.16)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Border radius from UI Kit tokens
export const borderRadius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
};

// Shadows from UI Kit tokens - Compatible web & native
const createShadow = (offsetY: number, opacity: number, radius: number, elevation: number) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    };
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: elevation,
  };
};

export const shadows = {
  soft: createShadow(8, 0.16, 18, 4),
  card: createShadow(12, 0.22, 32, 8),
  sm: createShadow(2, 0.12, 4, 2),
  md: createShadow(6, 0.18, 12, 4),
  lg: createShadow(12, 0.22, 24, 8),
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  captionSmall: {
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

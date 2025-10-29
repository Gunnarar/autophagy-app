const palette = {
  carnivoreRed: '#d4183d',
  carnivoreRedDark: '#9c1230',
  carnivoreRedMuted: '#fda4af',
  emberOrange: '#f97316',
  deepNavy: '#1B3B4B',
  midnight: '#030213',
  skyBackground: '#F5F7FA',
  mistSurface: '#EEF5F7',
  snowSurface: '#FFFFFF',
  frostSurface: '#F9FBFD',
  border: '#D5E3EA',
  outline: '#C4D4DD',
  tealAccent: '#4FB0C6',
  indigoAccent: '#3b82f6',
  emerald: '#22c55e',
  amber: '#fbbf24',
  crimson: '#ef4444',
  slateText: '#1B3B4B',
  slateSubdued: '#5A7684',
  slateMuted: '#7F97A5',
};

const colors = {
  // surfaces & backgrounds
  backgroundPrimary: palette.skyBackground,
  backgroundSecondary: palette.frostSurface,
  surfacePrimary: palette.snowSurface,
  surfaceMuted: palette.mistSurface,
  surfaceHighlight: palette.carnivoreRed,

  // brand & accents
  brandPrimary: palette.carnivoreRed,
  brandPrimaryDark: palette.carnivoreRedDark,
  brandSecondary: palette.deepNavy,
  brandHighlight: palette.emberOrange,
  brandMuted: palette.carnivoreRedMuted,

  // text
  textPrimary: palette.slateText,
  textSecondary: palette.slateSubdued,
  textMuted: palette.slateMuted,
  textOnPrimary: palette.snowSurface,

  // state
  success: palette.emerald,
  warning: palette.amber,
  error: palette.crimson,
  info: palette.indigoAccent,

  border: palette.border,
  outline: palette.outline,
  disabledBackground: '#E1E8ED',
  disabledText: '#9AA9B5',

  // legacy aliases (will be phased out)
  primary: palette.carnivoreRed,
  accent: palette.emberOrange,
  blueLight: '#b3c7f7',
  blueMedium: '#8babf1',
  blueVeryLight: '#d9e4ff',
  background: palette.skyBackground,
  card: palette.snowSurface,
  text: palette.slateText,
  warningLegacy: '#f7b731',
  errorLegacy: '#e74c3c',
  successLegacy: '#89ce00',
  shadow: '#132535',
  disabled: '#ccc',
};

const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  sizes: {
    display: 32,
    title: 24,
    headline: 20,
    body: 16,
    caption: 14,
    label: 12,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

const spacingBase = {
  xl: 32,
  lg: 24,
  md: 20,
  sm: 16,
  xs: 12,
  xxs: 8,
  tiny: 4,
};

const spacing = {
  ...spacingBase,
  xlarge: spacingBase.xl,
  large: spacingBase.lg,
  medium: spacingBase.md,
  regular: spacingBase.sm,
  small: spacingBase.xs,
  xsmall: spacingBase.xxs,
};

const radiusBase = {
  xl: 28,
  lg: 20,
  md: 16,
  sm: 12,
  xs: 8,
  pill: 999,
};

const radius = {
  ...radiusBase,
  large: radiusBase.lg,
  medium: radiusBase.md,
  regular: radiusBase.sm,
  round: 48,
};

const fontSizes = {
  xlarge: 28,
  large: 24,
  medium: 18,
  regular: 16,
  small: 14,
  xsmall: 12,
};

const shadow = {
  soft: {
    color: 'rgba(19, 37, 53, 0.08)',
    offset: { width: 0, height: 6 },
    opacity: 1,
    radius: 12,
    elevation: 3,
  },
  medium: {
    color: 'rgba(19, 37, 53, 0.12)',
    offset: { width: 0, height: 8 },
    opacity: 1,
    radius: 18,
    elevation: 5,
  },
};

const overlay = {
  scrim: 'rgba(3, 2, 19, 0.45)',
  scrimLight: 'rgba(3, 2, 19, 0.3)',
};

export const theme = {
  palette,
  colors,
  typography,
  spacing,
  radius,
  shadow,
  fontSizes,
  borderRadius: radius,
  overlay,
};

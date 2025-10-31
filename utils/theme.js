import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

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
  peach100: '#fef2f2',
  peach200: '#fde68a',
  apricot100: '#fff7ed',
  apricot200: '#fed7aa',
  sky100: '#eff6ff',
  sky200: '#bfdbfe',
  mint100: '#ecfdf5',
  mint200: '#a7f3d0',
  midnightBase: '#030213',
  midnightSurface: '#0b1a24',
  midnightOverlay: '#112533',
  midnightSurfaceMuted: '#152b3a',
  midnightSurfaceElevated: '#1e3444',
  midnightOutline: '#294658',
  midnightTextPrimary: '#f8fafc',
  midnightTextSecondary: '#cbd5f5',
  blueMidnight: '#0b1827',
  blueDeep: '#12263b',
  blueSlate: '#1c2f45',
  blueSteel: '#274461',
  blueAccent: '#3f6386',
  blueHighlight: '#5b84a7',
  blueBright: '#76a1c4',
  blueSoft: '#9fb8ce',
  blueMist: '#c9d6e2',
  blueSnow: '#eef3f8',
  blueAqua: '#6cb7d6',
  redMidnight: '#160307',
  redDeep: '#24050c',
  redSurface: '#361018',
  redSurfaceMuted: '#451620',
  redSurfaceElevated: '#561b28',
  redAccent: '#f87171',
  redAmber: '#fb923c',
  redHighlight: '#fbbf24',
  redTextPrimary: '#fde7eb',
  redTextSecondary: '#fbcdd4',
  redOutline: '#6b2834',
};

const lightColors = {
  backgroundPrimary: palette.skyBackground,
  backgroundSecondary: palette.frostSurface,
  surfacePrimary: palette.snowSurface,
  surfaceMuted: palette.mistSurface,
  surfaceElevated: palette.snowSurface,
  surfaceHighlight: palette.carnivoreRed,
  brandPrimary: palette.carnivoreRed,
  brandPrimaryDark: palette.carnivoreRedDark,
  brandSecondary: palette.deepNavy,
  brandHighlight: palette.emberOrange,
  brandMuted: palette.carnivoreRedMuted,
  textPrimary: palette.slateText,
  textSecondary: palette.slateSubdued,
  textMuted: palette.slateMuted,
  textOnPrimary: palette.snowSurface,
  textOnMuted: palette.slateText,
  textOnSurfaceMuted: palette.slateText,
  success: palette.emerald,
  warning: palette.amber,
  error: palette.crimson,
  info: palette.indigoAccent,
  border: palette.border,
  outline: palette.outline,
  disabledBackground: '#E1E8ED',
  disabledText: '#9AA9B5',
  chartAxis: '#94a3b8',
  chartGrid: '#d8e3eb',
  chartFasting: palette.carnivoreRed,
  chartMeals: palette.emberOrange,
  chartSymptoms: palette.indigoAccent,
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

const darkColors = {
  backgroundPrimary: palette.midnightBase,
  backgroundSecondary: palette.midnightSurface,
  surfacePrimary: palette.midnightSurface,
  surfaceMuted: palette.midnightSurfaceMuted,
  surfaceElevated: palette.midnightSurfaceElevated,
  surfaceHighlight: palette.carnivoreRedDark,
  brandPrimary: palette.carnivoreRed,
  brandPrimaryDark: palette.carnivoreRedDark,
  brandSecondary: palette.midnightOverlay,
  brandHighlight: palette.emberOrange,
  brandMuted: '#ff8ea1',
  textPrimary: palette.midnightTextPrimary,
  textSecondary: palette.midnightTextSecondary,
  textMuted: 'rgba(203, 213, 225, 0.7)',
  textOnPrimary: palette.snowSurface,
  textOnMuted: palette.midnightTextPrimary,
  textOnSurfaceMuted: 'rgba(248, 250, 252, 0.85)',
  success: '#34d399',
  warning: '#facc15',
  error: '#f87171',
  info: '#60a5fa',
  border: '#1f3342',
  outline: palette.midnightOutline,
  disabledBackground: 'rgba(148, 163, 184, 0.18)',
  disabledText: 'rgba(148, 163, 184, 0.55)',
  chartAxis: 'rgba(148, 163, 184, 0.7)',
  chartGrid: 'rgba(148, 163, 184, 0.3)',
  chartFasting: '#fb7185',
  chartMeals: '#f59e0b',
  chartSymptoms: '#93c5fd',
  primary: palette.carnivoreRed,
  accent: palette.emberOrange,
  blueLight: '#60a5fa',
  blueMedium: '#3b82f6',
  blueVeryLight: '#1d4ed8',
  background: palette.midnightBase,
  card: palette.midnightSurface,
  text: palette.midnightTextPrimary,
  warningLegacy: '#fbbf24',
  errorLegacy: '#f87171',
  successLegacy: '#22d3ee',
  shadow: 'rgba(3, 102, 214, 0.25)',
  disabled: 'rgba(148, 163, 184, 0.4)',
};

const blueColors = {
  backgroundPrimary: palette.blueMidnight,
  backgroundSecondary: palette.blueDeep,
  surfacePrimary: palette.blueSlate,
  surfaceMuted: '#223751',
  surfaceElevated: '#2b4661',
  surfaceHighlight: palette.blueAccent,
  brandPrimary: palette.blueAccent,
  brandPrimaryDark: palette.blueSteel,
  brandSecondary: palette.blueHighlight,
  brandHighlight: palette.blueAqua,
  brandMuted: '#43617d',
  textPrimary: palette.blueSnow,
  textSecondary: palette.blueMist,
  textMuted: 'rgba(201, 214, 226, 0.7)',
  textOnPrimary: palette.blueSnow,
  textOnMuted: palette.blueSnow,
  textOnSurfaceMuted: 'rgba(238, 243, 248, 0.85)',
  success: '#4ade80',
  warning: '#facc15',
  error: '#f87171',
  info: '#7dd3fc',
  border: 'rgba(84, 118, 148, 0.5)',
  outline: '#3a5773',
  disabledBackground: 'rgba(86, 116, 144, 0.28)',
  disabledText: 'rgba(197, 210, 224, 0.6)',
  chartAxis: 'rgba(160, 185, 210, 0.7)',
  chartGrid: 'rgba(160, 185, 210, 0.3)',
  chartFasting: '#60a5fa',
  chartMeals: '#4f83a6',
  chartSymptoms: '#93c5fd',
  primary: palette.blueAccent,
  accent: palette.blueAqua,
  blueLight: '#90b7d4',
  blueMedium: '#5c86ad',
  blueVeryLight: '#2b4f75',
  background: palette.blueMidnight,
  card: palette.blueSlate,
  text: palette.blueSnow,
  warningLegacy: '#fbbf24',
  errorLegacy: '#f87171',
  successLegacy: '#5eead4',
  shadow: 'rgba(9, 17, 28, 0.45)',
  disabled: 'rgba(107, 137, 164, 0.4)',
};

const redColors = {
  backgroundPrimary: palette.redMidnight,
  backgroundSecondary: palette.redDeep,
  surfacePrimary: palette.redSurface,
  surfaceMuted: palette.redSurfaceMuted,
  surfaceElevated: palette.redSurfaceElevated,
  surfaceHighlight: palette.carnivoreRedDark,
  brandPrimary: palette.carnivoreRed,
  brandPrimaryDark: '#9f1028',
  brandSecondary: palette.redAccent,
  brandHighlight: palette.redAmber,
  brandMuted: '#fda4af',
  textPrimary: palette.redTextPrimary,
  textSecondary: palette.redTextSecondary,
  textMuted: 'rgba(251, 205, 212, 0.7)',
  textOnPrimary: palette.redTextPrimary,
  textOnMuted: palette.redTextPrimary,
  textOnSurfaceMuted: 'rgba(253, 231, 235, 0.85)',
  success: '#facc15',
  warning: palette.redHighlight,
  error: '#fecaca',
  info: '#fca5a5',
  border: 'rgba(128, 35, 47, 0.6)',
  outline: palette.redOutline,
  disabledBackground: 'rgba(253, 202, 210, 0.25)',
  disabledText: 'rgba(253, 202, 210, 0.6)',
  chartAxis: 'rgba(250, 204, 211, 0.7)',
  chartGrid: 'rgba(250, 204, 211, 0.3)',
  chartFasting: palette.carnivoreRed,
  chartMeals: '#fb7185',
  chartSymptoms: '#fda4af',
  primary: palette.carnivoreRed,
  accent: palette.redAccent,
  blueLight: '#fba4b4',
  blueMedium: '#f87171',
  blueVeryLight: '#fca5a5',
  background: palette.redMidnight,
  card: palette.redSurface,
  text: palette.redTextPrimary,
  warningLegacy: '#fbbf24',
  errorLegacy: '#f87171',
  successLegacy: '#facc15',
  shadow: 'rgba(64, 10, 22, 0.45)',
  disabled: 'rgba(253, 202, 210, 0.45)',
};

const gradients = {
  hero: [palette.carnivoreRed, palette.carnivoreRedDark],
  statCards: {
    meals: [palette.peach100, palette.peach200],
    symptoms: [palette.apricot100, palette.apricot200],
    ketone: [palette.sky100, palette.sky200],
    streak: [palette.mint100, palette.mint200],
  },
};

const darkGradientOverrides = {
  hero: [palette.midnightSurface, palette.carnivoreRedDark],
  statCards: {
    meals: ['#2f3c4a', '#24303a'],
    symptoms: ['#43273a', '#331c2d'],
    ketone: ['#1f2f3d', '#162430'],
    streak: ['#1f3a30', '#173025'],
  },
};

const blueGradientOverrides = {
  hero: [palette.blueDeep, palette.blueAccent],
  statCards: {
    meals: ['#1a3048', '#254666'],
    symptoms: ['#1d2f45', '#314c69'],
    ketone: ['#153751', '#245b80'],
    streak: ['#142f44', '#1f4460'],
  },
};

const redGradientOverrides = {
  hero: [palette.redDeep, palette.carnivoreRed],
  statCards: {
    meals: ['#321018', '#4b1b26'],
    symptoms: ['#35121b', '#551c29'],
    ketone: ['#38151d', '#5b1f2f'],
    streak: ['#2f1017', '#4a1a25'],
  },
};

const DEFAULT_MODES = ['light', 'dark', 'blue', 'red'];

const themeVariants = {
  light: {
    appearance: 'light',
    colors: lightColors,
    gradients: {
      hero: gradients.hero,
      statCards: gradients.statCards,
    },
  },
  dark: {
    appearance: 'dark',
    colors: darkColors,
    gradients: darkGradientOverrides,
  },
  blue: {
    appearance: 'dark',
    colors: blueColors,
    gradients: blueGradientOverrides,
  },
  red: {
    appearance: 'dark',
    colors: redColors,
    gradients: redGradientOverrides,
  },
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

const baseTheme = {
  palette,
  gradients,
  typography,
  spacing,
  radius,
  shadow,
  fontSizes,
  borderRadius: radius,
  overlay,
};

const createTheme = (mode = 'light') => {
  const variant = themeVariants[mode] || themeVariants.light;
  const heroGradient = variant.gradients?.hero ?? gradients.hero;
  const statCardGradients = variant.gradients?.statCards ?? gradients.statCards;

  return {
    ...baseTheme,
    mode,
    appearance: variant.appearance,
    isDark: variant.appearance === 'dark',
    colors: variant.colors,
    gradients: {
      ...gradients,
      hero: heroGradient,
      statCards: {
        ...gradients.statCards,
        ...statCardGradients,
      },
    },
  };
};

export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');
export const blueTheme = createTheme('blue');
export const theme = lightTheme;

const ThemeContext = createContext({
  theme: lightTheme,
  mode: 'light',
  appearance: 'light',
  isDark: false,
  setMode: () => {},
  toggleMode: () => {},
  availableModes: DEFAULT_MODES,
});

export const ThemeProvider = ({
  children,
  initialMode = 'light',
  value,
}) => {
  const availableModes = value?.availableModes ?? DEFAULT_MODES;
  const normalizeMode = useCallback(
    next => (availableModes.includes(next) ? next : availableModes[0]),
    [availableModes],
  );

  const uncontrolled = typeof value === 'undefined';
  const initialResolvedMode = normalizeMode(value?.mode ?? initialMode);

  const [internalMode, setInternalMode] = useState(initialResolvedMode);

  const externalMode = value?.mode;
  const mode = uncontrolled ? internalMode : normalizeMode(externalMode);

  const setMode = uncontrolled
    ? updater => {
        setInternalMode(prev => {
          const nextValue = typeof updater === 'function' ? updater(prev) : updater;
          return normalizeMode(nextValue);
        });
      }
    : value.setMode;

  const toggleMode = useCallback(() => {
    setMode(prev => {
      const currentIndex = availableModes.indexOf(prev);
      const nextIndex = (currentIndex + 1) % availableModes.length;
      return availableModes[nextIndex];
    });
  }, [availableModes, setMode]);

  const resolvedTheme = useMemo(() => createTheme(mode), [mode]);
  const contextValue = useMemo(
    () => ({
      theme: resolvedTheme,
      mode,
      appearance: resolvedTheme.appearance,
      isDark: resolvedTheme.isDark,
      setMode,
      toggleMode,
      availableModes,
    }),
    [resolvedTheme, mode, setMode, toggleMode, availableModes],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

export const useThemeMode = () => {
  const { mode, setMode, toggleMode, availableModes } = useTheme();
  return { mode, setMode, toggleMode, availableModes };
};

export const AVAILABLE_THEME_MODES = DEFAULT_MODES;

export const ThemeContextInstance = ThemeContext;

export const useThemedStyles = createStyles => {
  const { theme: currentTheme } = useTheme();
  return useMemo(() => createStyles(currentTheme), [createStyles, currentTheme]);
};

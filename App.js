import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Home, NotebookPen, Sparkles, UserRound } from 'lucide-react-native';

import { LogsProvider } from './contexts/LogsContext';
import { ModalActionProvider } from './contexts/ModalActionContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { AVAILABLE_THEME_MODES, ThemeProvider, useTheme } from './utils/theme';
import { loadString, saveString } from './utils/storage';

import HomeScreen from './screens/HomeScreen';
import LogsScreen from './screens/LogsScreen';
import ProfileScreen from './screens/ProfileScreen';
import InfoScreen from './screens/InfoScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import FastingProgramsScreen from './screens/FastingProgramsScreen';
import ProfileDetailsScreen from './screens/ProfileDetailsScreen';
import DietLogScreen from './screens/DietLogScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const APPEARANCE_STORAGE_KEY = 'appearance.theme';

function ThemePersistenceProvider({ children }) {
  const systemMode = useColorScheme();
  const defaultSystemMode = systemMode === 'dark' ? 'dark' : 'light';
  const initialMode = AVAILABLE_THEME_MODES.includes(defaultSystemMode)
    ? defaultSystemMode
    : AVAILABLE_THEME_MODES[0];
  const [mode, setModeState] = useState(initialMode);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const stored = await loadString(APPEARANCE_STORAGE_KEY);
      if (!isMounted) {
        return;
      }
      if (stored && AVAILABLE_THEME_MODES.includes(stored)) {
        setModeState(stored);
      } else if (systemMode && AVAILABLE_THEME_MODES.includes(systemMode)) {
        setModeState(systemMode);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [systemMode]);

  const setMode = useCallback(updater => {
    setModeState(prev => {
      const nextValue = typeof updater === 'function' ? updater(prev) : updater;
      const normalized = AVAILABLE_THEME_MODES.includes(nextValue) ? nextValue : prev;
      if (AVAILABLE_THEME_MODES.includes(normalized)) {
        saveString(APPEARANCE_STORAGE_KEY, normalized);
      }
      return normalized;
    });
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, availableModes: AVAILABLE_THEME_MODES }),
    [mode, setMode],
  );

  return (
    <ThemeProvider value={value} initialMode={mode}>
      {children}
    </ThemeProvider>
  );
}

function renderTabIcon(routeName, focused, color, size) {
  const iconProps = {
    color,
    size,
    strokeWidth: focused ? 2.4 : 2,
  };

  switch (routeName) {
    case 'Home':
      return <Home {...iconProps} />;
    case 'Logs':
      return <NotebookPen {...iconProps} />;
    case 'Info':
      return <Sparkles {...iconProps} />;
    case 'Profile':
      return <UserRound {...iconProps} />;
    default:
      return null;
  }
}

function MainTabs() {
  const { theme: currentTheme } = useTheme();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: currentTheme.colors.brandPrimary,
        tabBarInactiveTintColor: currentTheme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: currentTheme.colors.surfacePrimary,
          borderTopColor: currentTheme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth * 2,
          height: 64,
          paddingVertical: currentTheme.spacing.tiny,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: currentTheme.typography.weights.medium,
        },
        tabBarIcon: ({ focused, color, size }) => renderTabIcon(route.name, focused, color, size),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Logs" component={LogsScreen} />
      <Tab.Screen name="Info" component={InfoScreen} options={{ title: 'Insights' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { theme: currentTheme } = useTheme();
  const { user, loading } = useUser();
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.colors.backgroundPrimary }]}>
        <Text style={[styles.loadingText, { color: currentTheme.colors.textPrimary }]}>Loading...</Text>
      </View>
    );
  }
  if (!user || !user.onboarded) {
    return <OnboardingScreen />;
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="FastingPrograms" component={FastingProgramsScreen} options={{ headerShown: true, title: 'Fasting Programs' }} />
      <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} options={{ headerShown: true, title: 'Profile Details' }} />
      <Stack.Screen name="DietLog" component={DietLogScreen} options={{ headerShown: true, title: 'Diet Log' }} />
    </Stack.Navigator>
  );
}

function AppNavigation() {
  const { theme: currentTheme } = useTheme();

  const navigationTheme = useMemo(
    () => ({
      dark: currentTheme.isDark,
      colors: {
        primary: currentTheme.colors.brandPrimary,
        background: currentTheme.colors.backgroundPrimary,
        card: currentTheme.colors.surfacePrimary,
        text: currentTheme.colors.textPrimary,
        border: currentTheme.colors.border,
        notification: currentTheme.colors.brandHighlight,
      },
      fonts: {
        regular: {
          fontFamily: currentTheme.typography.fontFamily.regular,
          fontWeight: currentTheme.typography.weights.regular,
        },
        medium: {
          fontFamily: currentTheme.typography.fontFamily.medium,
          fontWeight: currentTheme.typography.weights.medium,
        },
        bold: {
          fontFamily: currentTheme.typography.fontFamily.bold,
          fontWeight: currentTheme.typography.weights.bold,
        },
        heavy: {
          fontFamily: currentTheme.typography.fontFamily.bold,
          fontWeight: currentTheme.typography.weights.bold,
        },
      },
    }),
    [currentTheme],
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.backgroundPrimary }]}>
        <Root />
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemePersistenceProvider>
        <UserProvider>
          <ModalActionProvider>
            <LogsProvider>
              <AppNavigation />
            </LogsProvider>
          </ModalActionProvider>
        </UserProvider>
      </ThemePersistenceProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  safeArea: {
    flex: 1,
  },
});

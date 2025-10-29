import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { LogsProvider } from './contexts/LogsContext';
import { ModalActionProvider } from './contexts/ModalActionContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { theme } from './utils/theme';

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

function renderTabIcon(routeName, focused, color, size) {
  switch (routeName) {
    case 'Home':
      return <MaterialCommunityIcons name={focused ? 'home-variant' : 'home-variant-outline'} size={size} color={color} />;
    case 'Logs':
      return <MaterialCommunityIcons name={focused ? 'notebook' : 'notebook-outline'} size={size} color={color} />;
    case 'Info':
      return <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={size} color={color} />;
    case 'Profile':
      return <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />;
    default:
      return null;
  }
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.brandPrimary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surfacePrimary,
          borderTopColor: theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth * 2,
          height: 64,
          paddingVertical: theme.spacing.tiny,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: theme.typography.weights.medium,
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
  const { user, loading } = useUser();
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
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

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <ModalActionProvider>
          <LogsProvider>
            <NavigationContainer>
              <SafeAreaView style={styles.safeArea}>
                <Root />
              </SafeAreaView>
            </NavigationContainer>
          </LogsProvider>
        </ModalActionProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
});

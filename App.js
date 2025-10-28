import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

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

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={() => ({
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
        tabBarLabelStyle: { fontWeight: 'bold', fontSize: 14 },
        tabBarShowIcon: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Logs" component={LogsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Info" component={InfoScreen} />
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

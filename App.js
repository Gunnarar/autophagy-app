import * as React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, TouchableWithoutFeedback, TextInput, ScrollView, Animated, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useEffect, useState } from 'react';
import { LogsProvider, useLogs } from './contexts/LogsContext';
import { LinearGradient } from 'expo-linear-gradient';
import HomeScreen from './screens/HomeScreen';
import SymptomsScreen from './screens/SymptomsScreen';
import LogsScreen from './screens/LogsScreen';
import ProfileScreen from './screens/ProfileScreen';
import InfoScreen from './screens/InfoScreen';
import { formatTimeHMS, formatTimeHM, FAST_GOAL_SECONDS, MILESTONES, MILESTONE_INFO, SYMPTOM_TYPES, SEVERITIES } from './utils/constants';
import { ModalActionProvider } from './contexts/ModalActionContext';
import { UserProvider, useUser } from './contexts/UserContext';
import OnboardingScreen from './screens/OnboardingScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FastingProgramsScreen from './screens/FastingProgramsScreen';
import ProfileDetailsScreen from './screens/ProfileDetailsScreen';
import DietLogScreen from './screens/DietLogScreen';
import { theme } from './utils/theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
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
  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>;
  if (!user || !user.onboarded) return <OnboardingScreen />;
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
              <SafeAreaView style={{ flex: 1 }}>
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
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.regular,
  },
  title: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.medium,
    color: theme.colors.text,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.regular,
    marginBottom: theme.spacing.regular,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: '600',
    marginBottom: theme.spacing.xsmall,
    color: theme.colors.text,
  },
  cardText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.tiny,
  },
  fastingTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xsmall,
  },
  progressBarBg: {
    width: '100%',
    height: 18,
    backgroundColor: theme.colors.border,
    borderRadius: 9,
    marginVertical: theme.spacing.small,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 9,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: theme.spacing.small,
  },
  milestoneCol: {
    alignItems: 'center',
    flex: 1,
  },
  milestoneDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.border,
    marginBottom: 4,
  },
  milestoneDotActive: {
    backgroundColor: theme.colors.primary,
  },
  milestoneLabel: {
    fontSize: theme.fontSizes.xsmall,
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: 24,
    width: 300,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.colors.text,
  },
  modalDesc: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.regular,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  foodTypeButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.regular,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  foodTypeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  symptomLogEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  symptomLogTime: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    maxWidth: 180,
    textAlign: 'center',
  },
  symptomLogNote: {
    fontSize: 13,
    color: theme.colors.primary,
    marginBottom: 2,
    maxWidth: 180,
    textAlign: 'center',
  },
});

import * as React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, TouchableWithoutFeedback, TextInput, ScrollView, Animated, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useEffect, useState } from 'react';
import { FastingProvider, useFasting } from './contexts/FastingContext';
import { LogsProvider, useLogs } from './contexts/LogsContext';
import { LinearGradient } from 'expo-linear-gradient';
import HomeScreen from './screens/HomeScreen';
import FastingScreen from './screens/FastingScreen';
import SymptomsScreen from './screens/SymptomsScreen';
import LogsScreen from './screens/LogsScreen';
import ProfileScreen from './screens/ProfileScreen';
import InfoScreen from './screens/InfoScreen';
import { formatTimeHMS, formatTimeHM, FAST_GOAL_SECONDS, MILESTONES, MILESTONE_INFO, SYMPTOM_TYPES, SEVERITIES } from './utils/constants';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <LogsProvider>
      <FastingProvider>
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: '#6bb3b6',
              tabBarInactiveTintColor: '#888',
              tabBarStyle: { height: 60, paddingBottom: 8 },
              tabBarIcon: ({ color, size }) => {
                if (route.name === 'Home') {
                  return <Ionicons name="home" size={size} color={color} />;
                } else if (route.name === 'Logs') {
                  return <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />;
                } else if (route.name === 'Profile') {
                  return <Ionicons name="person" size={size} color={color} />;
                } else if (route.name === 'Info') {
                  return <MaterialCommunityIcons name="information" size={size} color={color} />;
                }
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Logs" component={LogsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
            <Tab.Screen name="Info" component={InfoScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </FastingProvider>
    </LogsProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eaf6f6',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d4d4d',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2d4d4d',
  },
  cardText: {
    fontSize: 16,
    color: '#4d6d6d',
    marginBottom: 4,
  },
  fastingTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6bb3b6',
    marginBottom: 8,
  },
  progressBarBg: {
    width: '100%',
    height: 18,
    backgroundColor: '#e0e0e0',
    borderRadius: 9,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6bb3b6',
    borderRadius: 9,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  milestoneCol: {
    alignItems: 'center',
    flex: 1,
  },
  milestoneDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e0e0e0',
    marginBottom: 4,
  },
  milestoneDotActive: {
    backgroundColor: '#6bb3b6',
  },
  milestoneLabel: {
    fontSize: 12,
    color: '#4d6d6d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2d4d4d',
  },
  modalDesc: {
    fontSize: 16,
    color: '#4d6d6d',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#6bb3b6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  foodTypeButton: {
    flex: 1,
    backgroundColor: '#eaf6f6',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6bb3b6',
  },
  foodTypeButtonActive: {
    backgroundColor: '#6bb3b6',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#6bb3b6',
    borderRadius: 12,
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
    color: '#4d6d6d',
    marginBottom: 2,
    maxWidth: 180,
    textAlign: 'center',
  },
  symptomLogNote: {
    fontSize: 13,
    color: '#6bb3b6',
    marginBottom: 2,
    maxWidth: 180,
    textAlign: 'center',
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLogs } from '../contexts/LogsContext';

const RECOMMENDATIONS = [
  { key: 'meditation', label: 'Try a meditation session', emoji: '🧘' },
  { key: 'exercise', label: 'Do gentle exercise', emoji: '🚶' },
  { key: 'meal', label: 'Log your next meal', emoji: '🍽️' },
  { key: 'hydration', label: 'Drink water', emoji: '💧' },
];

export default function InfoScreen() {
  const { useAutophagyStatus } = useLogs();
  const { nextChallenge, currentLevel } = useAutophagyStatus();
  const [done, setDone] = React.useState({});
  // Pick a recommendation not done today
  const today = new Date().toISOString().slice(0, 10);
  const available = RECOMMENDATIONS.filter(r => !done[`${r.key}-${today}`]);
  const rec = available.length > 0 ? available[0] : null;
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#101c23', '#182c34']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.title}>Info</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Next Autophagy Challenge</Text>
          {nextChallenge ? (
            <Text style={styles.cardText}>Your next challenge: <Text style={{ fontWeight: 'bold' }}>{nextChallenge}h fast</Text> ({currentLevel} level)</Text>
          ) : (
            <Text style={styles.cardText}>All challenges complete! 🎉</Text>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recommended Activity</Text>
          {rec ? (
            <Pressable onPress={() => setDone({ ...done, [`${rec.key}-${today}`]: true })} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, backgroundColor: '#eaf6f6', marginTop: 8 }} accessibilityLabel={`Mark ${rec.label} as done`}>
              <Text style={{ fontSize: 24, marginRight: 8 }}>{rec.emoji}</Text>
              <Text style={{ fontSize: 16, color: '#2d4d4d' }}>{rec.label}</Text>
              <Text style={{ marginLeft: 12, color: '#89ce00', fontWeight: 'bold' }}>Mark as done</Text>
            </Pressable>
          ) : (
            <Text style={styles.cardText}>All recommended activities completed for today!</Text>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>Personalized information and education will appear here based on your logs and schedule.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d4d4d',
  },
  cardText: {
    fontSize: 16,
    color: '#4d6d6d',
    marginBottom: 4,
  },
}); 
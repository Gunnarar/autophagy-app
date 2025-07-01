import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useUser } from '../contexts/UserContext';

const DIET_TYPES = [
  { key: 'standard', label: 'Standard' },
  { key: 'animal', label: 'Animal' },
];

function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday as week start
  return d.toISOString().slice(0, 10);
}

export default function DietLogScreen() {
  const { user, saveUser } = useUser();
  const [meatPounds, setMeatPounds] = useState('');
  const [carbNotes, setCarbNotes] = useState('');
  const [dietType, setDietType] = useState(user?.dietType || 'standard');
  const today = new Date().toISOString().slice(0, 10);
  const weekStart = getWeekStart(today);

  // Filter logs for this week
  const animalMeatLog = user?.animalMeatLog || [];
  const carbMealLog = user?.carbMealLog || [];
  const thisWeekMeat = animalMeatLog.filter(e => getWeekStart(e.date) === weekStart);
  const thisWeekCarbs = carbMealLog.filter(e => getWeekStart(e.date) === weekStart);
  const totalMeat = thisWeekMeat.reduce((sum, e) => sum + (parseFloat(e.pounds) || 0), 0);
  const carbCount = thisWeekCarbs.length;

  const handleLogMeat = async () => {
    const entry = { date: today, pounds: meatPounds };
    await saveUser({
      ...user,
      animalMeatLog: [...animalMeatLog, entry],
    });
    setMeatPounds('');
  };

  const handleLogCarb = async () => {
    const entry = { date: today, notes: carbNotes };
    await saveUser({
      ...user,
      carbMealLog: [...carbMealLog, entry],
    });
    setCarbNotes('');
  };

  const handleDietType = async (type) => {
    setDietType(type);
    await saveUser({ ...user, dietType: type });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Diet Log</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diet Type</Text>
        <View style={styles.dietTypeRow}>
          {DIET_TYPES.map(dt => (
            <TouchableOpacity
              key={dt.key}
              style={[styles.dietTypeButton, dietType === dt.key && styles.dietTypeButtonActive]}
              onPress={() => handleDietType(dt.key)}
            >
              <Text style={dietType === dt.key ? styles.dietTypeTextActive : styles.dietTypeText}>{dt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Log Animal Meat (lbs)</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={meatPounds}
            onChangeText={setMeatPounds}
            placeholder="Pounds"
            keyboardType="numeric"
          />
          <Button title="Log" onPress={handleLogMeat} disabled={!meatPounds} />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Log Carb Meal</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={carbNotes}
            onChangeText={setCarbNotes}
            placeholder="Notes (optional)"
          />
          <Button title="Log" onPress={handleLogCarb} />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week's Summary</Text>
        <Text style={styles.summaryText}>Total Animal Meat: <Text style={{ color: '#89ce00', fontWeight: 'bold' }}>{totalMeat} lbs</Text></Text>
        <Text style={styles.summaryText}>Carb Meals: <Text style={{ color: '#b3c7f7', fontWeight: 'bold' }}>{carbCount}</Text></Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 24, backgroundColor: '#d9e4ff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: '#2d4d4d' },
  section: { width: '100%', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#4d6d6d', marginBottom: 8 },
  dietTypeRow: { flexDirection: 'row', marginBottom: 8 },
  dietTypeButton: {
    flex: 1,
    backgroundColor: '#eaf6f6',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6bb3b6',
  },
  dietTypeButtonActive: {
    backgroundColor: '#6bb3b6',
  },
  dietTypeText: { color: '#4d6d6d', fontWeight: 'bold' },
  dietTypeTextActive: { color: '#fff', fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, marginRight: 8, flex: 1, backgroundColor: '#fff' },
  summaryText: { fontSize: 16, color: '#2d4d4d', marginTop: 4 },
}); 
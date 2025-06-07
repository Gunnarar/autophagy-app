import * as React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, TouchableWithoutFeedback, TextInput, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useEffect, useState } from 'react';
import { FastingProvider, useFasting } from './FastingContext';
import { LogsProvider, useLogs } from './LogsContext';

const Tab = createBottomTabNavigator();

function formatTimeHMS(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function formatTimeHM(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

const FAST_GOAL_SECONDS = 16 * 3600; // 16 hours
const MILESTONES = [0, 2, 4, 6, 8, 12, 16, 24]; // hours

const MILESTONE_INFO = {
  0: {
    title: '0 hours',
    description: 'Fasting started. Take medication as prescribed. Monitor for hunger or low energy.',
    icon: 'pill',
    emoji: '💊',
  },
  2: {
    title: '2 hours',
    description: 'Some may notice tremor or slowness if medication is wearing off. Stay hydrated.',
    icon: null,
    emoji: '🤲',
  },
  4: {
    title: '4 hours',
    description: 'Energy may dip. If you feel weak, consider a rest or gentle movement.',
    icon: 'walk',
    emoji: '🚶',
  },
  6: {
    title: '6 hours',
    description: 'Monitor for fatigue or mood changes. Log any symptoms.',
    icon: 'emoticon-sad',
    emoji: '😔',
  },
  8: {
    title: '8 hours',
    description: 'Blood sugar drops, fat burning begins. Some may feel more alert, others may feel tired.',
    icon: 'fire',
    emoji: '🔥',
  },
  12: {
    title: '12 hours',
    description: 'Ketosis may start. If you feel unwell, break your fast safely.',
    icon: 'water',
    emoji: '💧',
  },
  16: {
    title: '16 hours',
    description: 'Autophagy increases. Continue to monitor symptoms.',
    icon: null,
    emoji: '🦠',
  },
  24: {
    title: '24 hours',
    description: 'Deep autophagy. Only attempt prolonged fasting with medical supervision.',
    icon: null,
    emoji: '👨‍⚕️',
  },
};

// Add symptom types and severities
const SYMPTOM_TYPES = [
  { key: 'tremor', label: 'Tremor', emoji: '🤲' },
  { key: 'slowness', label: 'Slowness', emoji: '🐢' },
  { key: 'stiffness', label: 'Stiffness', emoji: '🦵' },
  { key: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { key: 'mood', label: 'Mood', emoji: '🙂' },
  { key: 'other', label: 'Other', emoji: '❓' },
];
const SEVERITIES = [
  { key: 'mild', label: 'Mild' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'severe', label: 'Severe' },
];

function HomeScreen() {
  // Fasting timer state from context
  const { isFasting, fastElapsed, startFast, stopFast, FAST_GOAL_SECONDS } = useFasting();
  const [fastModalVisible, setFastModalVisible] = useState(false);

  // Food log state
  const { foodLog, setFoodLog } = useLogs();
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [foodType, setFoodType] = useState('meal');
  const [foodNote, setFoodNote] = useState('');
  const [foodTime, setFoodTime] = useState(new Date());
  const [showFoodPicker, setShowFoodPicker] = useState(false);

  // Symptom log state
  const { symptomLog, setSymptomLog } = useLogs();
  const [symptomModalVisible, setSymptomModalVisible] = useState(false);
  const [symptomType, setSymptomType] = useState('tremor');
  const [severity, setSeverity] = useState('mild');
  const [symptomNote, setSymptomNote] = useState('');

  // Fasting timer display
  const progress = Math.min(fastElapsed / FAST_GOAL_SECONDS, 1);
  const remaining = Math.max(FAST_GOAL_SECONDS - fastElapsed, 0);

  // Calculate today's date string
  const today = new Date().toISOString().slice(0, 10);
  const todaysMeals = foodLog.filter(e => e.type === 'meal' && e.time && e.time.slice(0, 10) === today);
  const todaysSnacks = foodLog.filter(e => e.type === 'snack' && e.time && e.time.slice(0, 10) === today);
  const todaysSymptoms = symptomLog.filter(e => e.time && e.time.slice(0, 10) === today);

  // Calculate ketone and autophagy status
  const ketoneReached = fastElapsed >= 12 * 3600;
  const autophagyReached = fastElapsed >= 16 * 3600;

  // Save food entry
  const handleSaveFood = () => {
    const entry = {
      type: foodType,
      time: new Date().toISOString(),
      note: foodNote,
      id: Date.now(),
    };
    setFoodLog([entry, ...foodLog]);
    setFoodModalVisible(false);
    setFoodType('meal');
    setFoodNote('');
  };

  // Save symptom entry
  const handleSaveSymptom = () => {
    const entry = {
      type: symptomType,
      severity,
      time: new Date().toISOString(),
      note: symptomNote,
      id: Date.now(),
    };
    setSymptomLog([entry, ...symptomLog]);
    setSymptomModalVisible(false);
    setSymptomType('tremor');
    setSeverity('mild');
    setSymptomNote('');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#eaf6f6' }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={styles.title}>Dashboard</Text>
      {/* Fasting Timer + Milestones Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fasting</Text>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Text style={styles.fastingTime}>{formatTimeHM(fastElapsed)}</Text>
          <Text style={styles.cardText}>Elapsed</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.cardText}>{formatTimeHM(remaining)} remaining</Text>
          {isFasting ? (
            <Pressable style={[styles.modalButton, { marginTop: 16 }]} onPress={stopFast}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Stop Fasting</Text>
            </Pressable>
          ) : (
            <Pressable style={[styles.modalButton, { marginTop: 16 }]} onPress={() => setFastModalVisible(true)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Start Fasting</Text>
            </Pressable>
          )}
        </View>
        {/* Milestones/stepper */}
        <View style={styles.milestoneRow}>
          {MILESTONES.map((h, i) => (
            <View key={h} style={styles.milestoneCol}>
              {MILESTONE_INFO[h].icon && ['pill','walk','emoticon-sad','fire','water'].includes(MILESTONE_INFO[h].icon) ? (
                <MaterialCommunityIcons
                  name={MILESTONE_INFO[h].icon}
                  size={32}
                  color={fastElapsed >= h * 3600 ? '#6bb3b6' : '#e0e0e0'}
                  style={{ marginBottom: 4 }}
                />
              ) : (
                <Text style={{ fontSize: 32, marginBottom: 4, color: fastElapsed >= h * 3600 ? '#6bb3b6' : '#e0e0e0' }}>
                  {MILESTONE_INFO[h].emoji}
                </Text>
              )}
              <Text style={[styles.milestoneLabel, { fontWeight: 'bold', color: fastElapsed >= h * 3600 ? '#2d4d4d' : '#aaa', fontSize: 16 }]}>{h}h</Text>
            </View>
          ))}
        </View>
      </View>
      {/* Quick Actions Row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Pressable style={[styles.quickActionButton, { marginRight: 8 }]} onPress={() => setFoodModalVisible(true)}>
          <Text style={styles.quickActionText}>🍽️ Add Meal</Text>
        </Pressable>
        <Pressable style={[styles.quickActionButton, { marginRight: 8 }]} onPress={() => setSymptomModalVisible(true)}>
          <Text style={styles.quickActionText}>🩺 Add Symptom</Text>
        </Pressable>
      </View>
      {/* Today's Overview Row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, marginTop: 8 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24 }}>🍽️</Text>
          <Text style={{ fontWeight: 'bold', color: '#2d4d4d' }}>{todaysMeals.length}</Text>
          <Text style={{ fontSize: 12, color: '#4d6d6d' }}>Meals</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24 }}>🥪</Text>
          <Text style={{ fontWeight: 'bold', color: '#2d4d4d' }}>{todaysSnacks.length}</Text>
          <Text style={{ fontSize: 12, color: '#4d6d6d' }}>Snacks</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24 }}>🩺</Text>
          <Text style={{ fontWeight: 'bold', color: '#2d4d4d' }}>{todaysSymptoms.length}</Text>
          <Text style={{ fontSize: 12, color: '#4d6d6d' }}>Symptoms</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24 }}>{isFasting ? '⏱️' : '✅'}</Text>
          <Text style={{ fontWeight: 'bold', color: '#2d4d4d' }}>{isFasting ? 'Fasting' : 'Done'}</Text>
          <Text style={{ fontSize: 12, color: '#4d6d6d' }}>Fasting</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, color: ketoneReached ? '#6bb3b6' : '#e0e0e0' }}>💧</Text>
          <Text style={{ fontWeight: 'bold', color: ketoneReached ? '#2d4d4d' : '#aaa' }}>{ketoneReached ? 'Yes' : 'No'}</Text>
          <Text style={{ fontSize: 12, color: '#4d6d6d' }}>Ketone</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, color: autophagyReached ? '#6bb3b6' : '#e0e0e0' }}>🦠</Text>
          <Text style={{ fontWeight: 'bold', color: autophagyReached ? '#2d4d4d' : '#aaa' }}>{autophagyReached ? 'Yes' : 'No'}</Text>
          <Text style={{ fontSize: 12, color: '#4d6d6d' }}>Autophagy</Text>
        </View>
      </View>
      {/* Food Modal */}
      <Modal visible={foodModalVisible} transparent animationType="fade" onRequestClose={() => setFoodModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setFoodModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Meal</Text>
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Type:</Text>
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <Pressable style={[styles.foodTypeButton, foodType === 'meal' && styles.foodTypeButtonActive]} onPress={() => setFoodType('meal')} accessibilityLabel="Meal">
                    <Text style={{ fontSize: 20 }}>🍽️ Meal</Text>
                  </Pressable>
                  <Pressable style={[styles.foodTypeButton, foodType === 'snack' && styles.foodTypeButtonActive]} onPress={() => setFoodType('snack')} accessibilityLabel="Snack">
                    <Text style={{ fontSize: 20 }}>🥪 Snack</Text>
                  </Pressable>
                </View>
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Note (optional):</Text>
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <TextInput
                    style={{ borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40 }}
                    numberOfLines={1}
                    onChangeText={setFoodNote}
                    value={foodNote}
                    placeholder="e.g. high carb, keto, protein shake"
                    accessibilityLabel="Food note input"
                  />
                </View>
                <Pressable style={styles.modalButton} onPress={handleSaveFood} accessibilityLabel="Save meal entry">
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setFoodModalVisible(false)} accessibilityLabel="Cancel">
                  <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Cancel</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Symptom Modal */}
      <Modal visible={symptomModalVisible} transparent animationType="fade" onRequestClose={() => setSymptomModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setSymptomModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Symptom</Text>
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Symptom:</Text>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  marginBottom: 8,
                  width: '100%',
                  paddingHorizontal: 8
                }}>
                  {SYMPTOM_TYPES.map(t => (
                    <Pressable
                      key={t.key}
                      style={[
                        {
                          borderRadius: 18,
                          width: 36,
                          height: 36,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: symptomType === t.key ? '#eaf6f6' : 'transparent',
                          borderWidth: symptomType === t.key ? 2 : 0,
                          borderColor: symptomType === t.key ? '#6bb3b6' : 'transparent'
                        }
                      ]}
                      onPress={() => setSymptomType(t.key)}
                      accessibilityLabel={t.label}
                    >
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>{t.emoji}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={{ textAlign: 'center', fontSize: 16, color: '#2d4d4d', marginBottom: 12 }}>
                  {SYMPTOM_TYPES.find(t => t.key === symptomType)?.label}
                </Text>
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Severity:</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  {SEVERITIES.map(s => (
                    <Pressable
                      key={s.key}
                      style={[styles.foodTypeButton, severity === s.key && styles.foodTypeButtonActive]}
                      onPress={() => setSeverity(s.key)}
                      accessibilityLabel={s.label}
                    >
                      <Text style={{ fontSize: 16 }}>{s.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Note (optional):</Text>
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <TextInput
                    style={{ borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40 }}
                    numberOfLines={1}
                    onChangeText={setSymptomNote}
                    value={symptomNote}
                    placeholder="e.g. after exercise, before meds"
                    accessibilityLabel="Symptom note input"
                  />
                </View>
                <Pressable style={styles.modalButton} onPress={handleSaveSymptom} accessibilityLabel="Save symptom entry">
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setSymptomModalVisible(false)} accessibilityLabel="Cancel">
                  <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Cancel</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}

function FastingScreen() {
  // Only show log/history and allow adding/editing/deleting past fasts
  const { fastLog, setFastLog } = useLogs();
  const [modalVisible, setModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [fastStart, setFastStart] = useState(new Date());
  const [fastEnd, setFastEnd] = useState(new Date());
  const [fastNote, setFastNote] = useState('');
  const [pickerMode, setPickerMode] = useState(null); // 'start' | 'end' | null

  // Add or edit fast entry
  const handleSave = () => {
    const entry = {
      start: fastStart.toISOString(),
      end: fastEnd.toISOString(),
      note: fastNote,
      id: editIndex !== null ? fastLog[editIndex].id : Date.now(),
    };
    let updated;
    if (editIndex !== null) {
      updated = [...fastLog];
      updated[editIndex] = entry;
    } else {
      updated = [entry, ...fastLog];
    }
    setFastLog(updated);
    setModalVisible(false);
    setEditIndex(null);
    setFastStart(new Date());
    setFastEnd(new Date());
    setFastNote('');
  };

  // Edit entry
  const handleEdit = idx => {
    const entry = fastLog[idx];
    setEditIndex(idx);
    setFastStart(new Date(entry.start));
    setFastEnd(new Date(entry.end));
    setFastNote(entry.note);
    setModalVisible(true);
  };

  // Delete entry
  const handleDelete = idx => {
    const updated = [...fastLog];
    updated.splice(idx, 1);
    setFastLog(updated);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Fasting Log</Text>
      <View style={styles.card}>
        <Pressable style={[styles.modalButton, { marginBottom: 12 }]} onPress={() => setModalVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Fast</Text>
        </Pressable>
        {fastLog.length === 0 ? (
          <Text style={styles.cardText}>No fasts logged.</Text>
        ) : (
          fastLog.map((entry, idx) => (
            <Pressable
              key={entry.id}
              onPress={() => handleEdit(idx)}
              onLongPress={() => handleDelete(idx)}
              style={{ paddingVertical: 6 }}
              accessibilityLabel={`Edit or delete fast entry: ${new Date(entry.start).toLocaleString()} - ${new Date(entry.end).toLocaleString()}`}
            >
              <View style={{ marginBottom: 2 }}>
                <Text style={styles.cardText}>
                  Start: {new Date(entry.start).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.cardText}>
                  End: {new Date(entry.end).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </Text>
                {entry.note ? (
                  <Text style={styles.cardText}>Note: {entry.note}</Text>
                ) : null}
              </View>
            </Pressable>
          ))
        )}
      </View>
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{editIndex !== null ? 'Edit Fast' : 'Add Fast'}</Text>
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Start Time:</Text>
                <Pressable style={[styles.modalButton, { marginBottom: 8 }]} onPress={() => setPickerMode('start')}>
                  <Text style={{ color: '#fff' }}>{fastStart.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</Text>
                </Pressable>
                <DateTimePickerModal
                  isVisible={pickerMode === 'start'}
                  mode="datetime"
                  date={fastStart}
                  onConfirm={date => { setFastStart(date); setPickerMode(null); }}
                  onCancel={() => setPickerMode(null)}
                  is24Hour={true}
                />
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>End Time:</Text>
                <Pressable style={[styles.modalButton, { marginBottom: 8 }]} onPress={() => setPickerMode('end')}>
                  <Text style={{ color: '#fff' }}>{fastEnd.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</Text>
                </Pressable>
                <DateTimePickerModal
                  isVisible={pickerMode === 'end'}
                  mode="datetime"
                  date={fastEnd}
                  onConfirm={date => { setFastEnd(date); setPickerMode(null); }}
                  onCancel={() => setPickerMode(null)}
                  is24Hour={true}
                />
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Note (optional):</Text>
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <TextInput
                    style={{ borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40 }}
                    numberOfLines={1}
                    onChangeText={setFastNote}
                    value={fastNote}
                    placeholder="e.g. long fast, interrupted, etc."
                    accessibilityLabel="Fast note input"
                  />
                </View>
                <Pressable style={styles.modalButton} onPress={handleSave} accessibilityLabel="Save fast entry">
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setModalVisible(false)} accessibilityLabel="Cancel">
                  <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Cancel</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function FastingScreenContent() {
  const [startTime, setStartTime] = React.useState(null);
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('fastingStart');
      if (stored) {
        setStartTime(Number(stored));
      }
    })();
  }, []);
  React.useEffect(() => {
    let interval;
    if (startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [startTime]);
  const progress = Math.min(elapsed / FAST_GOAL_SECONDS, 1);
  const remaining = Math.max(FAST_GOAL_SECONDS - elapsed, 0);
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.fastingTime}>{formatTimeHM(elapsed)}</Text>
      <Text style={styles.cardText}>Elapsed</Text>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.cardText}>{formatTimeHM(remaining)} remaining</Text>
      <View style={styles.milestoneRow}>
        {MILESTONES.map((h, i) => (
          <View key={h} style={styles.milestoneCol}>
            {MILESTONE_INFO[h].icon && ['pill','walk','emoticon-sad','fire','water'].includes(MILESTONE_INFO[h].icon) ? (
              <MaterialCommunityIcons
                name={MILESTONE_INFO[h].icon}
                size={28}
                color={elapsed >= h * 3600 ? '#6bb3b6' : '#e0e0e0'}
                style={{ marginBottom: 4 }}
              />
            ) : (
              <Text style={{ fontSize: 28, marginBottom: 4 }}>
                {MILESTONE_INFO[h].emoji}
              </Text>
            )}
            <Text style={styles.milestoneLabel}>{h}h</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SymptomsScreen() {
  const { symptomLog, setSymptomLog } = useLogs();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState(null);
  const [symptomType, setSymptomType] = React.useState('tremor');
  const [severity, setSeverity] = React.useState('mild');
  const [symptomTime, setSymptomTime] = React.useState(new Date());
  const [symptomNote, setSymptomNote] = React.useState('');
  const [pickerMode, setPickerMode] = React.useState(false); // for time picker

  // Add or edit symptom entry
  const handleSave = () => {
    const entry = {
      type: symptomType,
      severity,
      time: symptomTime.toISOString(),
      note: symptomNote,
      id: (editIndex !== null && symptomLog[editIndex]) ? symptomLog[editIndex].id : Date.now(),
    };
    let updated;
    if (editIndex !== null && symptomLog[editIndex]) {
      updated = [...symptomLog];
      updated[editIndex] = entry;
    } else {
      updated = [entry, ...symptomLog];
    }
    setSymptomLog(updated);
    setModalVisible(false);
    setEditIndex(null);
    setSymptomType('tremor');
    setSeverity('mild');
    setSymptomTime(new Date());
    setSymptomNote('');
  };

  // Edit entry
  const handleEdit = idx => {
    const entry = symptomLog[idx];
    setEditIndex(idx);
    setSymptomType(entry.type);
    setSeverity(entry.severity);
    setSymptomTime(new Date(entry.time));
    setSymptomNote(entry.note);
    setModalVisible(true);
  };

  // Delete entry
  const handleDelete = idx => {
    const updated = [...symptomLog];
    updated.splice(idx, 1);
    setSymptomLog(updated);
  };

  // Today's entries
  const today = new Date().toISOString().slice(0, 10);
  const todaysEntries = symptomLog.filter(e => e.time.slice(0, 10) === today);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Symptoms</Text>
      <View style={styles.card}>
        <Pressable style={[styles.modalButton, { marginBottom: 12 }]} onPress={() => setModalVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Symptom</Text>
        </Pressable>
        {todaysEntries.length === 0 ? (
          <Text style={styles.cardText}>No symptoms logged today.</Text>
        ) : (
          todaysEntries.map((entry, idx) => {
            const typeObj = SYMPTOM_TYPES.find(t => t.key === entry.type);
            return (
              <Pressable
                key={entry.id}
                onPress={() => handleEdit(symptomLog.findIndex(e => e.id === entry.id))}
                onLongPress={() => handleDelete(symptomLog.findIndex(e => e.id === entry.id))}
                style={{ paddingVertical: 6 }}
                accessibilityLabel={`Edit or delete symptom entry: ${typeObj ? typeObj.label : entry.type} at ${new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              >
                <View style={{ marginBottom: 2, alignItems: 'center' }}>
                  <Text style={styles.symptomLogEmoji}>
                    {typeObj ? typeObj.emoji : ''}
                  </Text>
                  <Text style={styles.symptomLogTime}>{entry.severity} — {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  {entry.note ? (
                    <Text style={styles.symptomLogNote}>{entry.note}</Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })
        )}
      </View>
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{editIndex !== null ? 'Edit Symptom' : 'Add Symptom'}</Text>
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Symptom:</Text>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  marginBottom: 8,
                  width: '100%',
                  paddingHorizontal: 8
                }}>
                  {SYMPTOM_TYPES.map(t => (
                    <Pressable
                      key={t.key}
                      style={[
                        {
                          borderRadius: 18,
                          width: 36,
                          height: 36,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: symptomType === t.key ? '#eaf6f6' : 'transparent',
                          borderWidth: symptomType === t.key ? 2 : 0,
                          borderColor: symptomType === t.key ? '#6bb3b6' : 'transparent'
                        }
                      ]}
                      onPress={() => setSymptomType(t.key)}
                      accessibilityLabel={t.label}
                    >
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>{t.emoji}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={{ textAlign: 'center', fontSize: 16, color: '#2d4d4d', marginBottom: 12 }}>
                  {SYMPTOM_TYPES.find(t => t.key === symptomType)?.label}
                </Text>
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Severity:</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  {SEVERITIES.map(s => (
                    <Pressable
                      key={s.key}
                      style={[styles.foodTypeButton, severity === s.key && styles.foodTypeButtonActive]}
                      onPress={() => setSeverity(s.key)}
                      accessibilityLabel={s.label}
                    >
                      <Text style={{ fontSize: 16 }}>{s.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable
                  style={[styles.modalButton, { marginBottom: 12 }]}
                  onPress={() => setPickerMode(true)}
                  accessibilityLabel="Edit time"
                >
                  <Text style={{ color: '#fff' }}>Time: {symptomTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </Pressable>
                <DateTimePickerModal
                  isVisible={pickerMode}
                  mode="time"
                  date={symptomTime}
                  onConfirm={date => { setSymptomTime(date); setPickerMode(false); }}
                  onCancel={() => setPickerMode(false)}
                  is24Hour={true}
                />
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Note (optional):</Text>
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <TextInput
                    style={{
                      borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40
                    }}
                    numberOfLines={1}
                    onChangeText={setSymptomNote}
                    value={symptomNote}
                    placeholder="e.g. after exercise, before meds"
                    accessibilityLabel="Symptom note input"
                  />
                </View>
                <Pressable style={styles.modalButton} onPress={handleSave} accessibilityLabel="Save symptom entry">
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setModalVisible(false)} accessibilityLabel="Cancel">
                  <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Cancel</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function LogsScreen() {
  const [filterType, setFilterType] = React.useState('all');
  const [filterDate, setFilterDate] = React.useState('today');

  const { foodLog, setFoodLog, symptomLog, setSymptomLog, fastLog, setFastLog } = useLogs();

  // Add state for modal: type (food, symptom, fast), mode (add/edit), entry data, and modal visibility
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalType, setModalType] = React.useState(null); // 'meal', 'snack', 'symptom', 'fast'
  const [modalMode, setModalMode] = React.useState('add'); // 'add' or 'edit'
  const [modalData, setModalData] = React.useState({});
  const [pickerMode, setPickerMode] = React.useState(null); // for fast/symptom time pickers

  // Helper to open modal for add
  const openAddModal = (type) => {
    if (type === 'food') {
      setModalType('meal'); // default to 'meal' so the modal UI works
      setModalMode('add');
      setModalData({
        type: 'meal',
        time: new Date(),
        note: '',
      });
    } else if (type === 'symptom') {
      setModalType('symptom');
      setModalMode('add');
      setModalData({
        type: 'tremor',
        severity: 'mild',
        time: new Date(),
        note: '',
      });
    } else if (type === 'fast') {
      setModalType('fast');
      setModalMode('add');
      setModalData({
        start: new Date(),
        end: new Date(),
        note: '',
      });
    }
    setModalVisible(true);
  };
  // Helper to open modal for edit
  const openEditModal = (entry) => {
    setModalType(entry.logType === 'food' ? entry.type : entry.logType);
    setModalMode('edit');
    setModalData({ ...entry });
    setModalVisible(true);
  };
  // Save handler
  const handleSave = () => {
    if (modalType === 'meal' || modalType === 'snack') {
      const entry = {
        ...modalData,
        time: modalData.time.toISOString(),
        id: modalMode === 'edit' ? modalData.id : Date.now(),
        logType: 'food',
      };
      let updated = [...foodLog];
      if (modalMode === 'edit') {
        const idx = foodLog.findIndex(e => e.id === entry.id);
        updated[idx] = entry;
      } else {
        updated = [entry, ...foodLog];
      }
      setFoodLog(updated);
    } else if (modalType === 'symptom') {
      const entry = {
        ...modalData,
        time: modalData.time.toISOString(),
        id: modalMode === 'edit' ? modalData.id : Date.now(),
        logType: 'symptom',
      };
      let updated = [...symptomLog];
      if (modalMode === 'edit') {
        const idx = symptomLog.findIndex(e => e.id === entry.id);
        updated[idx] = entry;
      } else {
        updated = [entry, ...symptomLog];
      }
      setSymptomLog(updated);
    } else if (modalType === 'fast') {
      const entry = {
        ...modalData,
        start: modalData.start.toISOString(),
        end: modalData.end.toISOString(),
        id: modalMode === 'edit' ? modalData.id : Date.now(),
        logType: 'fast',
      };
      let updated = [...fastLog];
      if (modalMode === 'edit') {
        const idx = fastLog.findIndex(e => e.id === entry.id);
        updated[idx] = entry;
      } else {
        updated = [entry, ...fastLog];
      }
      setFastLog(updated);
    }
    setModalVisible(false);
    setModalData({});
  };
  // Delete handler
  const handleDelete = () => {
    if (modalType === 'meal' || modalType === 'snack') {
      setFoodLog(foodLog.filter(e => e.id !== modalData.id));
    } else if (modalType === 'symptom') {
      setSymptomLog(symptomLog.filter(e => e.id !== modalData.id));
    } else if (modalType === 'fast') {
      setFastLog(fastLog.filter(e => e.id !== modalData.id));
    }
    setModalVisible(false);
    setModalData({});
  };
  // Duplicate handler
  const handleDuplicate = () => {
    if (modalType === 'meal' || modalType === 'snack') {
      const entry = {
        ...modalData,
        time: new Date().toISOString(),
        id: Date.now(),
        logType: 'food',
      };
      setFoodLog([entry, ...foodLog]);
    } else if (modalType === 'symptom') {
      const entry = {
        ...modalData,
        time: new Date().toISOString(),
        id: Date.now(),
        logType: 'symptom',
      };
      setSymptomLog([entry, ...symptomLog]);
    } else if (modalType === 'fast') {
      const entry = {
        ...modalData,
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        id: Date.now(),
        logType: 'fast',
      };
      setFastLog([entry, ...fastLog]);
    }
    setModalVisible(false);
    setModalData({});
  };

  // Migrate old foodLog entries to have a 'time' property if missing
  React.useEffect(() => {
    if (foodLog.length > 0 && foodLog.some(e => !e.time)) {
      setFoodLog(foodLog.map(e => ({
        ...e,
        time: e.time || (e.id ? new Date(e.id).toISOString() : new Date().toISOString()),
      })));
    }
  }, [foodLog, setFoodLog]);

  // Filtering
  const today = new Date().toISOString().slice(0, 10);
  const filterByDate = entry => {
    if (!entry.time) return filterDate !== 'today'; // skip if missing time for 'today', include for 'all'
    if (filterDate === 'today') return entry.time.slice(0, 10) === today;
    return true;
  };
  const logs = [
    ...foodLog.map(e => ({ ...e, logType: 'food' })),
    ...symptomLog.map(e => ({ ...e, logType: 'symptom' })),
  ].filter(e => (filterType === 'all' || e.logType === filterType) && filterByDate(e));
  logs.sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Logs</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Pressable style={[styles.quickActionButton, { marginRight: 8 }]} onPress={() => openAddModal('food')}>
          <Text style={styles.quickActionText}>🍽️ Add Food</Text>
        </Pressable>
        <Pressable style={[styles.quickActionButton, { marginRight: 8 }]} onPress={() => openAddModal('symptom')}>
          <Text style={styles.quickActionText}>🩺 Add Symptom</Text>
        </Pressable>
        <Pressable style={styles.quickActionButton} onPress={() => openAddModal('fast')}>
          <Text style={styles.quickActionText}>⏱️ Add Fast</Text>
        </Pressable>
      </View>
      {logs.length === 0 ? (
        <Text style={styles.cardText}>No log entries.</Text>
      ) : (
        logs.map(entry => (
          <View key={entry.id} style={styles.card}>
            <Text style={styles.cardText}>
              {entry.logType === 'food'
                ? `${entry.type === 'meal' ? '🍽️ Meal' : '🥪 Snack'} at ${new Date(entry.time).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}${entry.note ? ` — ${entry.note}` : ''}`
                : <View style={{ alignItems: 'center' }}>
                    <Text style={styles.symptomLogEmoji}>
                      {(SYMPTOM_TYPES.find(t => t.key === entry.type) || { emoji: '' }).emoji}
                    </Text>
                    <Text style={styles.symptomLogTime}>{entry.severity} — {new Date(entry.time).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</Text>
                    {entry.note ? (
                      <Text style={styles.symptomLogNote}>{entry.note}</Text>
                    ) : null}
                  </View>
              }
            </Text>
          </View>
        ))
      )}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {modalType === 'meal' || modalType === 'snack'
                    ? (modalMode === 'edit' ? 'Edit Food Entry' : 'Add Food Entry')
                    : modalType === 'symptom'
                      ? (modalMode === 'edit' ? 'Edit Symptom' : 'Add Symptom')
                      : modalType === 'fast'
                        ? (modalMode === 'edit' ? 'Edit Fast' : 'Add Fast')
                        : (modalMode === 'edit' ? 'Edit Entry' : 'Add Entry')
                  }
                </Text>
                {(modalType === 'meal' || modalType === 'snack') && (
                  <>
                    <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Type:</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                      <Pressable style={[styles.foodTypeButton, modalType === 'meal' && styles.foodTypeButtonActive]} onPress={() => setModalType('meal')} accessibilityLabel="Meal">
                        <Text style={{ fontSize: 20 }}>🍽️ Meal</Text>
                      </Pressable>
                      <Pressable style={[styles.foodTypeButton, modalType === 'snack' && styles.foodTypeButtonActive]} onPress={() => setModalType('snack')} accessibilityLabel="Snack">
                        <Text style={{ fontSize: 20 }}>🥪 Snack</Text>
                      </Pressable>
                    </View>
                    <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Time:</Text>
                    <Pressable
                      style={[styles.modalButton, { marginBottom: 12 }]}
                      onPress={() => setPickerMode('foodTime')}
                      accessibilityLabel="Edit date and time"
                    >
                      <Text style={{ color: '#fff' }}>
                        {(modalData.time instanceof Date ? modalData.time : new Date(modalData.time)).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </Pressable>
                    <DateTimePickerModal
                      isVisible={pickerMode === 'foodTime'}
                      mode="datetime"
                      date={modalData.time instanceof Date ? modalData.time : new Date(modalData.time)}
                      onConfirm={date => { setModalData(prev => ({ ...prev, time: date })); setPickerMode(null); }}
                      onCancel={() => setPickerMode(null)}
                      is24Hour={true}
                    />
                  </>
                )}
                {modalType === 'symptom' ? (
                  <>
                    <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Symptom:</Text>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-evenly',
                      alignItems: 'center',
                      marginBottom: 8,
                      width: '100%',
                      paddingHorizontal: 8
                    }}>
                      {SYMPTOM_TYPES.map(t => (
                        <Pressable
                          key={t.key}
                          style={[
                            {
                              borderRadius: 18,
                              width: 36,
                              height: 36,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: modalType === t.key ? '#eaf6f6' : 'transparent',
                              borderWidth: modalType === t.key ? 2 : 0,
                              borderColor: modalType === t.key ? '#6bb3b6' : 'transparent'
                            }
                          ]}
                          onPress={() => setModalType(t.key)}
                          accessibilityLabel={t.label}
                        >
                          <Text style={{ fontSize: 20, textAlign: 'center' }}>{t.emoji}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                ) : null}
                {modalType === 'fast' && (
                  <>
                    <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Start Time:</Text>
                    <Pressable style={[styles.modalButton, { marginBottom: 8 }]} onPress={() => setPickerMode('start')}>
                      <Text style={{ color: '#fff' }}>{(modalData.start instanceof Date ? modalData.start : new Date(modalData.start)).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    </Pressable>
                    <DateTimePickerModal
                      isVisible={pickerMode === 'start'}
                      mode="datetime"
                      date={modalData.start instanceof Date ? modalData.start : new Date(modalData.start)}
                      onConfirm={date => { setModalData(prev => ({ ...prev, start: date })); setPickerMode(null); }}
                      onCancel={() => setPickerMode(null)}
                      is24Hour={true}
                    />
                    <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>End Time:</Text>
                    <Pressable style={[styles.modalButton, { marginBottom: 8 }]} onPress={() => setPickerMode('end')}>
                      <Text style={{ color: '#fff' }}>{(modalData.end instanceof Date ? modalData.end : new Date(modalData.end)).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    </Pressable>
                    <DateTimePickerModal
                      isVisible={pickerMode === 'end'}
                      mode="datetime"
                      date={modalData.end instanceof Date ? modalData.end : new Date(modalData.end)}
                      onConfirm={date => { setModalData(prev => ({ ...prev, end: date })); setPickerMode(null); }}
                      onCancel={() => setPickerMode(null)}
                      is24Hour={true}
                    />
                  </>
                )}
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Note (optional):</Text>
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <TextInput
                    style={{ borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40 }}
                    numberOfLines={1}
                    onChangeText={text => setModalData(prev => ({ ...prev, note: text }))}
                    value={modalData.note}
                    placeholder="e.g. high carb, keto, protein shake"
                    accessibilityLabel="Food note input"
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                  {modalMode === 'edit' && (
                    <>
                      <Pressable style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={handleDelete} accessibilityLabel="Delete">
                        <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Delete</Text>
                      </Pressable>
                      <Pressable style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={handleDuplicate} accessibilityLabel="Duplicate">
                        <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Duplicate</Text>
                      </Pressable>
                    </>
                  )}
                  <Pressable style={styles.modalButton} onPress={handleSave} accessibilityLabel="Save">
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{modalMode === 'edit' ? 'Update' : 'Add'}</Text>
                  </Pressable>
                </View>
                <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setModalVisible(false)} accessibilityLabel="Cancel">
                  <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Cancel</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function ProfileScreen() {
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [fastingSchedule, setFastingSchedule] = useState(null);
  const SCHEDULES = [
    { label: '12:12 (12h fast, 12h eating)', value: '12:12', color: '#6bb3b6' },
    { label: '14:10 (14h fast, 10h eating)', value: '14:10', color: '#4d6d6d' },
    { label: '16:8 (16h fast, 8h eating)', value: '16:8', color: '#2d4d4d' },
    { label: '18:6 (18h fast, 6h eating)', value: '18:6', color: '#1a2323' },
    { label: '20:4 (20h fast, 4h eating)', value: '20:4', color: '#000' },
  ];
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('fastingSchedule');
      if (stored) setFastingSchedule(stored);
    })();
  }, []);
  useEffect(() => {
    if (fastingSchedule) AsyncStorage.setItem('fastingSchedule', fastingSchedule);
  }, [fastingSchedule]);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#eaf6f6' }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fasting Schedule</Text>
        <Text style={styles.cardText}>
          {fastingSchedule ? `Selected: ${SCHEDULES.find(s => s.value === fastingSchedule)?.label || fastingSchedule}` : 'No schedule selected'}
        </Text>
        <Pressable style={styles.modalButton} onPress={() => setScheduleModalVisible(true)} accessibilityLabel="Set fasting schedule">
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{fastingSchedule ? 'Change' : 'Set'} Schedule</Text>
        </Pressable>
      </View>
      <Modal visible={scheduleModalVisible} transparent animationType="fade" onRequestClose={() => setScheduleModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setScheduleModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Pick a Fasting Schedule</Text>
                {SCHEDULES.map(s => (
                  <Pressable
                    key={s.value}
                    style={[styles.modalButton, {
                      marginBottom: 12,
                      backgroundColor: fastingSchedule === s.value ? s.color : '#eaf6f6',
                    }]}
                    onPress={() => { setFastingSchedule(s.value); setScheduleModalVisible(false); }}
                    accessibilityLabel={`Select ${s.label}`}
                  >
                    <Text style={{ color: fastingSchedule === s.value ? '#fff' : '#2d4d4d', fontWeight: 'bold', fontSize: 18 }}>{s.label}</Text>
                  </Pressable>
                ))}
                <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setScheduleModalVisible(false)} accessibilityLabel="Cancel">
                  <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Cancel</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}

function InfoScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#eaf6f6' }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={styles.title}>Info</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>Personalized information and education will appear here based on your logs and schedule.</Text>
      </View>
    </ScrollView>
  );
}

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

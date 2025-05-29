import * as React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, TouchableWithoutFeedback, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [foodLog, setFoodLog] = React.useState([]);
  const [foodModalVisible, setFoodModalVisible] = React.useState(false);
  const [foodType, setFoodType] = React.useState('meal');
  const [foodTime, setFoodTime] = React.useState(new Date());
  const [foodNote, setFoodNote] = React.useState('');
  const [showFoodPicker, setShowFoodPicker] = React.useState(false);

  // For quick add symptom
  const [symptomLog, setSymptomLog] = React.useState([]);
  const [symptomModalVisible, setSymptomModalVisible] = React.useState(false);
  const [symptomType, setSymptomType] = React.useState('tremor');
  const [severity, setSeverity] = React.useState('mild');
  const [symptomTime, setSymptomTime] = React.useState(new Date());
  const [symptomNote, setSymptomNote] = React.useState('');
  const [showSymptomPicker, setShowSymptomPicker] = React.useState(false);

  // Load logs from storage
  React.useEffect(() => {
    (async () => {
      const storedFood = await AsyncStorage.getItem('foodLog');
      if (storedFood) setFoodLog(JSON.parse(storedFood));
      const storedSymptom = await AsyncStorage.getItem('symptomLog');
      if (storedSymptom) setSymptomLog(JSON.parse(storedSymptom));
    })();
  }, []);

  // Save logs to storage
  React.useEffect(() => {
    AsyncStorage.setItem('foodLog', JSON.stringify(foodLog));
  }, [foodLog]);
  React.useEffect(() => {
    AsyncStorage.setItem('symptomLog', JSON.stringify(symptomLog));
  }, [symptomLog]);

  // Add food entry
  const handleSaveFood = () => {
    const entry = {
      type: foodType,
      time: foodTime.toISOString(),
      note: foodNote,
      id: Date.now(),
    };
    setFoodLog([entry, ...foodLog]);
    setFoodModalVisible(false);
    setFoodType('meal');
    setFoodTime(new Date());
    setFoodNote('');
  };

  // Add symptom entry
  const handleSaveSymptom = () => {
    const entry = {
      type: symptomType,
      severity,
      time: symptomTime.toISOString(),
      note: symptomNote,
      id: Date.now(),
    };
    setSymptomLog([entry, ...symptomLog]);
    setSymptomModalVisible(false);
    setSymptomType('tremor');
    setSeverity('mild');
    setSymptomTime(new Date());
    setSymptomNote('');
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Good afternoon, User</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fasting Progress</Text>
        <FastingScreenContent />
      </View>
      {/* Quick action buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Pressable style={[styles.quickActionButton, { marginRight: 8 }]} onPress={() => setFoodModalVisible(true)}>
          <Text style={styles.quickActionText}>🍽️ Add Food</Text>
        </Pressable>
        <Pressable style={styles.quickActionButton} onPress={() => setSymptomModalVisible(true)}>
          <Text style={styles.quickActionText}>🩺 Add Symptom</Text>
        </Pressable>
      </View>
      {/* Food modal */}
      <Modal visible={foodModalVisible} transparent animationType="fade" onRequestClose={() => setFoodModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setFoodModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Food Entry</Text>
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <Pressable
                    style={[styles.foodTypeButton, foodType === 'meal' && styles.foodTypeButtonActive]}
                    onPress={() => setFoodType('meal')}
                    accessibilityLabel="Meal"
                  >
                    <Text style={{ fontSize: 20 }}>🍽️ Meal</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.foodTypeButton, foodType === 'snack' && styles.foodTypeButtonActive]}
                    onPress={() => setFoodType('snack')}
                    accessibilityLabel="Snack"
                  >
                    <Text style={{ fontSize: 20 }}>🥪 Snack</Text>
                  </Pressable>
                </View>
                <Pressable
                  style={[styles.modalButton, { marginBottom: 12 }]}
                  onPress={() => setShowFoodPicker(true)}
                  accessibilityLabel="Edit time"
                >
                  <Text style={{ color: '#fff' }}>Time: {foodTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </Pressable>
                {showFoodPicker && (
                  <DateTimePicker
                    value={foodTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(e, date) => {
                      setShowFoodPicker(false);
                      if (date) setFoodTime(date);
                    }}
                  />
                )}
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Note (optional):</Text>
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <TextInput
                    style={{
                      borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40
                    }}
                    numberOfLines={1}
                    onChangeText={setFoodNote}
                    value={foodNote}
                    placeholder="e.g. high carb, keto, protein shake"
                    accessibilityLabel="Food note input"
                  />
                </View>
                <Pressable style={styles.modalButton} onPress={handleSaveFood} accessibilityLabel="Save food entry">
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
      {/* Symptom modal */}
      <Modal visible={symptomModalVisible} transparent animationType="fade" onRequestClose={() => setSymptomModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setSymptomModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Symptom</Text>
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Symptom:</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
                  {SYMPTOM_TYPES.map(t => (
                    <Pressable
                      key={t.key}
                      style={[
                        {
                          marginHorizontal: 4,
                          borderRadius: 18,
                          width: 36,
                          height: 36,
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                        symptomType === t.key && { backgroundColor: '#eaf6f6', borderWidth: 2, borderColor: '#6bb3b6' }
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
                  onPress={() => setShowSymptomPicker(true)}
                  accessibilityLabel="Edit time"
                >
                  <Text style={{ color: '#fff' }}>Time: {symptomTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </Pressable>
                {showSymptomPicker && (
                  <DateTimePicker
                    value={symptomTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(e, date) => {
                      setShowSymptomPicker(false);
                      if (date) setSymptomTime(date);
                    }}
                  />
                )}
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
    </View>
  );
}

function FastingScreen() {
  const [startTime, setStartTime] = React.useState(null); // timestamp in ms
  const [elapsed, setElapsed] = React.useState(0);
  const [isFasting, setIsFasting] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedMilestone, setSelectedMilestone] = React.useState(null);

  // Load fasting state from storage on mount
  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('fastingStart');
      if (stored) {
        setStartTime(Number(stored));
        setIsFasting(true);
      }
    })();
  }, []);

  // Timer interval
  React.useEffect(() => {
    let interval;
    if (isFasting && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      // Set initial elapsed
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isFasting, startTime]);

  // Start fasting
  const handleStart = async () => {
    const now = Date.now();
    await AsyncStorage.setItem('fastingStart', String(now));
    setStartTime(now);
    setIsFasting(true);
  };

  // Stop fasting
  const handleStop = async () => {
    await AsyncStorage.removeItem('fastingStart');
    setStartTime(null);
    setIsFasting(false);
    setElapsed(0);
  };

  const progress = Math.min(elapsed / FAST_GOAL_SECONDS, 1);
  const remaining = Math.max(FAST_GOAL_SECONDS - elapsed, 0);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Fasting</Text>
      <View style={[styles.card, { alignItems: 'center' }]}> 
        {isFasting ? (
          <>
            <Text style={styles.fastingTime}>{formatTimeHM(elapsed)}</Text>
            <Text style={styles.cardText}>Elapsed</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.cardText}>{formatTimeHM(remaining)} remaining</Text>
            <Pressable style={[styles.modalButton, { marginTop: 16 }]} onPress={handleStop}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Stop Fasting</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={[styles.modalButton, { marginTop: 16 }]} onPress={handleStart}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Start Fasting</Text>
          </Pressable>
        )}
        {/* Milestone/stepper */}
        <View style={styles.milestoneRow}>
          {MILESTONES.map((h, i) => (
            <View key={h} style={styles.milestoneCol}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedMilestone(h);
                  setModalVisible(true);
                }}
                accessibilityLabel={`Milestone ${h} hours`}
              >
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
              </TouchableOpacity>
              <Text style={styles.milestoneLabel}>{h}h</Text>
            </View>
          ))}
        </View>
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedMilestone ? MILESTONE_INFO[selectedMilestone].title : ''}</Text>
              <Text style={styles.modalDesc}>{selectedMilestone ? MILESTONE_INFO[selectedMilestone].description : ''}</Text>
              <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Beginner plans</Text>
        <Text style={styles.cardText}>13:12, 13:11, 14:10</Text>
      </View>
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
  const [symptomLog, setSymptomLog] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState(null);
  const [symptomType, setSymptomType] = React.useState('tremor');
  const [severity, setSeverity] = React.useState('mild');
  const [symptomTime, setSymptomTime] = React.useState(new Date());
  const [symptomNote, setSymptomNote] = React.useState('');
  const [showPicker, setShowPicker] = React.useState(false);

  // Load symptom log from storage
  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('symptomLog');
      if (stored) setSymptomLog(JSON.parse(stored));
    })();
  }, []);

  // Save symptom log to storage
  React.useEffect(() => {
    AsyncStorage.setItem('symptomLog', JSON.stringify(symptomLog));
  }, [symptomLog]);

  // Add or edit symptom entry
  const handleSave = () => {
    const entry = {
      type: symptomType,
      severity,
      time: symptomTime.toISOString(),
      note: symptomNote,
      id: editIndex !== null ? symptomLog[editIndex].id : Date.now(),
    };
    let updated;
    if (editIndex !== null) {
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
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
                  {SYMPTOM_TYPES.map(t => (
                    <Pressable
                      key={t.key}
                      style={[
                        {
                          marginHorizontal: 6,
                          borderRadius: 24,
                          width: 48,
                          height: 48,
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                        symptomType === t.key && { backgroundColor: '#eaf6f6', borderWidth: 2, borderColor: '#6bb3b6' }
                      ]}
                      onPress={() => setSymptomType(t.key)}
                      accessibilityLabel={t.label}
                    >
                      <Text style={{ fontSize: 28, textAlign: 'center' }}>{t.emoji}</Text>
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
                  onPress={() => setShowPicker(true)}
                  accessibilityLabel="Edit time"
                >
                  <Text style={{ color: '#fff' }}>Time: {symptomTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </Pressable>
                {showPicker && (
                  <DateTimePicker
                    value={symptomTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(e, date) => {
                      setShowPicker(false);
                      if (date) setSymptomTime(date);
                    }}
                  />
                )}
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
  const [foodLog, setFoodLog] = React.useState([]);
  const [symptomLog, setSymptomLog] = React.useState([]);
  const [filterType, setFilterType] = React.useState('all');
  const [filterDate, setFilterDate] = React.useState('today');

  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('foodLog');
      if (stored) setFoodLog(JSON.parse(stored));
      const storedS = await AsyncStorage.getItem('symptomLog');
      if (storedS) setSymptomLog(JSON.parse(storedS));
    })();
  }, []);

  // Filtering
  const today = new Date().toISOString().slice(0, 10);
  const filterByDate = entry => {
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
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <Pressable style={[styles.foodTypeButton, filterType === 'all' && styles.foodTypeButtonActive]} onPress={() => setFilterType('all')}><Text>All</Text></Pressable>
        <Pressable style={[styles.foodTypeButton, filterType === 'food' && styles.foodTypeButtonActive]} onPress={() => setFilterType('food')}><Text>Food</Text></Pressable>
        <Pressable style={[styles.foodTypeButton, filterType === 'symptom' && styles.foodTypeButtonActive]} onPress={() => setFilterType('symptom')}><Text>Symptom</Text></Pressable>
        <Pressable style={[styles.foodTypeButton, filterDate === 'today' && styles.foodTypeButtonActive]} onPress={() => setFilterDate('today')}><Text>Today</Text></Pressable>
        <Pressable style={[styles.foodTypeButton, filterDate !== 'today' && styles.foodTypeButtonActive]} onPress={() => setFilterDate('all')}><Text>All Dates</Text></Pressable>
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
    </View>
  );
}

export default function App() {
  return (
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
            } else if (route.name === 'Fasting') {
              return <MaterialCommunityIcons name="progress-clock" size={size} color={color} />;
            } else if (route.name === 'Symptoms') {
              return <MaterialCommunityIcons name="heart-pulse" size={size} color={color} />;
            } else if (route.name === 'Logs') {
              return <MaterialCommunityIcons name="clipboard-list" size={size} color={color} />;
            }
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Fasting" component={FastingScreen} />
        <Tab.Screen name="Symptoms" component={SymptomsScreen} />
        <Tab.Screen name="Logs" component={LogsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
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

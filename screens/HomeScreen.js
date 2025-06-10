import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback, TextInput, ScrollView, Animated, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLogs } from '../contexts/LogsContext';
import { formatTimeHM, MILESTONES, MILESTONE_INFO, SYMPTOM_TYPES, SEVERITIES, AUTOPHAGY_LEVELS } from '../utils/constants';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const { foodLog, setFoodLog, symptomLog, setSymptomLog, fastLog, setFastLog, useAutophagyStatus } = useLogs();
  const navigation = useNavigation();
  const { currentLevel, nextChallenge, completed } = useAutophagyStatus();
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [foodType, setFoodType] = useState('meal');
  const [foodNote, setFoodNote] = useState('');
  const [symptomModalVisible, setSymptomModalVisible] = useState(false);
  const [symptomType, setSymptomType] = useState('tremor');
  const [severity, setSeverity] = useState('mild');
  const [symptomNote, setSymptomNote] = useState('');
  const scale = useRef(new Animated.Value(1)).current;
  const [fastStopModalVisible, setFastStopModalVisible] = useState(false);
  const [fastStopTime, setFastStopTime] = useState(new Date());
  const [showFastStopPicker, setShowFastStopPicker] = useState(false);
  const [fastStopNote, setFastStopNote] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addTime, setAddTime] = useState(new Date());
  const [showAddTimePicker, setShowAddTimePicker] = useState(false);
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [scale]);

  // Calculate fastingStart as the time of the last meal/snack in foodLog (or app start if none), and fastingElapsed as now - fastingStart.
  const fastingStart = foodLog.length > 0 ? new Date(foodLog[0].time) : new Date();
  const fastingElapsed = Math.floor((Date.now() - fastingStart) / 1000);

  // Calculate today's date string
  const today = new Date().toISOString().slice(0, 10);
  const todaysMeals = foodLog.filter(e => e.type === 'meal' && e.time && e.time.slice(0, 10) === today);
  const todaysSnacks = foodLog.filter(e => e.type === 'snack' && e.time && e.time.slice(0, 10) === today);
  const todaysSymptoms = symptomLog.filter(e => e.time && e.time.slice(0, 10) === today);

  // Calculate ketone and autophagy status
  const ketoneReached = fastingElapsed >= 12 * 3600;
  const autophagyReached = fastingElapsed >= 16 * 3600;

  // Determine if badge should be shown (after first challenge)
  const badgeVisible = Object.values(completed).some(arr => arr.length > 0);
  // Find progress toward next challenge
  let progress = 0;
  if (nextChallenge) {
    // Find the longest fast in fastLog
    const maxFast = fastLog.reduce((max, entry) => {
      const start = new Date(entry.start);
      const end = new Date(entry.end);
      const durationHrs = (end - start) / 3600000;
      return Math.max(max, durationHrs);
    }, 0);
    progress = Math.min(1, maxFast / nextChallenge);
  }

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

  // Save food entry with time
  const handleSaveFoodWithTime = () => {
    const entry = {
      type: foodType,
      time: addTime.toISOString(),
      note: foodNote,
      id: Date.now(),
    };
    setFoodLog([entry, ...foodLog]);
    setFoodModalVisible(false);
    setFoodType('meal');
    setFoodNote('');
    setAddTime(new Date());
  };

  // Save symptom entry with time
  const handleSaveSymptomWithTime = () => {
    const entry = {
      type: symptomType,
      severity,
      time: addTime.toISOString(),
      note: symptomNote,
      id: Date.now(),
    };
    setSymptomLog([entry, ...symptomLog]);
    setSymptomModalVisible(false);
    setSymptomType('tremor');
    setSeverity('mild');
    setSymptomNote('');
    setAddTime(new Date());
  };

  // Save fast entry
  const handleSaveFast = () => {
    setFastLog([
      {
        start: new Date(fastingStart).toISOString(),
        end: new Date().toISOString(),
        note: fastStopNote,
        id: Date.now(),
      },
      ...fastLog,
    ]);
    setFastStopModalVisible(false);
    setFastStopNote('');
  };

  // Save fast entry with time
  const handleSaveFastWithTime = () => {
    setFastLog([
      {
        start: addTime.toISOString(),
        end: new Date().toISOString(),
        note: fastStopNote,
        id: Date.now(),
      },
      ...fastLog,
    ]);
    setFastStopModalVisible(false);
    setFastStopNote('');
    setAddTime(new Date());
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#101c23', '#182c34']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
          <Animated.Image
            source={require('../assets/cell1.png')}
            style={{ width: 220, height: 220, transform: [{ scale }] }}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Dashboard</Text>
        {/* Autophagy Badge */}
        {badgeVisible && (
          <Pressable
            style={{ alignSelf: 'center', marginBottom: 16, alignItems: 'center' }}
            onPress={() => navigation.navigate('Profile')}
            accessibilityLabel="View autophagy level details"
          >
            <View style={{
              backgroundColor: '#6bb3b6',
              borderRadius: 48,
              padding: 16,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
              minWidth: 120,
            }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{currentLevel} Autophagy</Text>
              {nextChallenge && (
                <View style={{ width: 80, height: 8, backgroundColor: '#eaf6f6', borderRadius: 4, marginTop: 8, marginBottom: 4 }}>
                  <View style={{ width: `${progress * 80}px`, height: 8, backgroundColor: '#89ce00', borderRadius: 4 }} />
                </View>
              )}
              {nextChallenge && (
                <Text style={{ color: '#fff', fontSize: 12 }}>Next: {nextChallenge}h fast</Text>
              )}
              {!nextChallenge && (
                <Text style={{ color: '#fff', fontSize: 12 }}>All challenges complete!</Text>
              )}
            </View>
          </Pressable>
        )}
        {/* Fasting Timer + Milestones Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fasting</Text>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.fastingTime}>{formatTimeHM(fastingElapsed)}</Text>
            <Text style={styles.cardText}>Elapsed</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${fastingElapsed / (16 * 3600) * 100}%` }]} />
            </View>
            <Text style={styles.cardText}>{formatTimeHM(16 * 3600 - fastingElapsed)} remaining</Text>
          </View>
          {/* Milestones/stepper */}
          <View style={styles.milestoneRow}>
            {MILESTONES.map((h, i) => (
              <View key={h} style={styles.milestoneCol}>
                {MILESTONE_INFO[h].icon && ['pill','walk','emoticon-sad','fire','water'].includes(MILESTONE_INFO[h].icon) ? (
                  <MaterialCommunityIcons
                    name={MILESTONE_INFO[h].icon}
                    size={32}
                    color={fastingElapsed >= h * 3600 ? '#6bb3b6' : '#e0e0e0'}
                    style={{ marginBottom: 4 }}
                  />
                ) : (
                  <Text style={{ fontSize: 32, marginBottom: 4, color: fastingElapsed >= h * 3600 ? '#6bb3b6' : '#e0e0e0' }}>
                    {MILESTONE_INFO[h].emoji}
                  </Text>
                )}
                <Text style={[styles.milestoneLabel, { fontWeight: 'bold', color: fastingElapsed >= h * 3600 ? '#2d4d4d' : '#aaa', fontSize: 16 }]}>{h}h</Text>
              </View>
            ))}
          </View>
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
                  <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Time:</Text>
                  <Pressable
                    style={[styles.modalButton, { marginBottom: 12 }]}
                    onPress={() => setShowAddTimePicker(true)}
                    accessibilityLabel="Edit date and time"
                  >
                    <Text style={{ color: '#fff' }}>{addTime.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                  </Pressable>
                  <DateTimePickerModal
                    isVisible={showAddTimePicker}
                    mode="datetime"
                    date={addTime}
                    onConfirm={date => { setAddTime(date); setShowAddTimePicker(false); }}
                    onCancel={() => setShowAddTimePicker(false)}
                    is24Hour={true}
                  />
                  <Pressable style={styles.modalButton} onPress={handleSaveFoodWithTime} accessibilityLabel="Save meal entry">
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
                  <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Time:</Text>
                  <Pressable
                    style={[styles.modalButton, { marginBottom: 12 }]}
                    onPress={() => setShowAddTimePicker(true)}
                    accessibilityLabel="Edit date and time"
                  >
                    <Text style={{ color: '#fff' }}>{addTime.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                  </Pressable>
                  <DateTimePickerModal
                    isVisible={showAddTimePicker}
                    mode="datetime"
                    date={addTime}
                    onConfirm={date => { setAddTime(date); setShowAddTimePicker(false); }}
                    onCancel={() => setShowAddTimePicker(false)}
                    is24Hour={true}
                  />
                  <Pressable style={styles.modalButton} onPress={handleSaveSymptomWithTime} accessibilityLabel="Save symptom entry">
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
        {/* Fasting Stop Modal */}
        <Modal visible={fastStopModalVisible} transparent animationType="fade" onRequestClose={() => setFastStopModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setFastStopModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Stop Fasting</Text>
                  <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Start Time:</Text>
                  <Pressable
                    style={[styles.modalButton, { marginBottom: 12 }]}
                    onPress={() => setShowAddTimePicker(true)}
                    accessibilityLabel="Edit start time"
                  >
                    <Text style={{ color: '#fff' }}>{addTime.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                  </Pressable>
                  <DateTimePickerModal
                    isVisible={showAddTimePicker}
                    mode="datetime"
                    date={addTime}
                    onConfirm={date => { setAddTime(date); setShowAddTimePicker(false); }}
                    onCancel={() => setShowAddTimePicker(false)}
                    is24Hour={true}
                  />
                  <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Note (optional):</Text>
                  <View style={{ width: '100%', marginBottom: 16 }}>
                    <TextInput
                      style={{ borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40 }}
                      numberOfLines={1}
                      onChangeText={setFastStopNote}
                      value={fastStopNote}
                      placeholder="e.g. interrupted, completed, etc."
                      accessibilityLabel="Fast note input"
                    />
                  </View>
                  <Pressable style={styles.modalButton} onPress={handleSaveFastWithTime} accessibilityLabel="Stop fasting">
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Stop</Text>
                  </Pressable>
                  <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setFastStopModalVisible(false)} accessibilityLabel="Cancel">
                    <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Cancel</Text>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
      {/* Floating + button */}
      <Pressable
        style={{
          position: 'absolute',
          right: 24,
          bottom: 36,
          backgroundColor: '#6bb3b6',
          borderRadius: 32,
          width: 64,
          height: 64,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
        onPress={() => setAddModalVisible(true)}
        accessibilityLabel="Add log entry"
      >
        <Ionicons name="add" size={36} color="#fff" />
      </Pressable>
      {/* Bottom action sheet/modal for add options */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setAddModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2d4d4d', marginBottom: 16, textAlign: 'center' }}>Add Entry</Text>
                {[
                  { key: 'meal', label: 'Meal', icon: <MaterialCommunityIcons name="food" size={28} color="#6bb3b6" />, onPress: () => { setFoodType('meal'); setFoodModalVisible(true); setAddModalVisible(false); } },
                  { key: 'snack', label: 'Snack', icon: <MaterialCommunityIcons name="food-apple" size={28} color="#6bb3b6" />, onPress: () => { setFoodType('snack'); setFoodModalVisible(true); setAddModalVisible(false); } },
                  { key: 'symptom', label: 'Symptom', icon: <MaterialCommunityIcons name="stethoscope" size={28} color="#6bb3b6" />, onPress: () => { setSymptomModalVisible(true); setAddModalVisible(false); } },
                  { key: 'fast', label: 'Fast', icon: <MaterialCommunityIcons name="timer-sand" size={28} color="#6bb3b6" />, onPress: () => { setFastStopModalVisible(true); setAddModalVisible(false); } },
                ].map(opt => (
                  <Pressable
                    key={opt.key}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}
                    onPress={opt.onPress}
                    accessibilityLabel={`Add ${opt.label}`}
                  >
                    {opt.icon}
                    <Text style={{ fontSize: 18, color: '#2d4d4d', marginLeft: 16 }}>{opt.label}</Text>
                  </Pressable>
                ))}
                <Pressable style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setAddModalVisible(false)} accessibilityLabel="Cancel add entry">
                  <Text style={{ color: '#6bb3b6', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
}); 
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback, TextInput, ScrollView, Animated, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFasting } from '../contexts/FastingContext';
import { useLogs } from '../contexts/LogsContext';
import { formatTimeHM, MILESTONES, MILESTONE_INFO, SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';

export default function HomeScreen() {
  const { isFasting, fastElapsed, startFast, stopFast, FAST_GOAL_SECONDS } = useFasting();
  const [fastModalVisible, setFastModalVisible] = useState(false);
  const { foodLog, setFoodLog, symptomLog, setSymptomLog } = useLogs();
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [foodType, setFoodType] = useState('meal');
  const [foodNote, setFoodNote] = useState('');
  const [symptomModalVisible, setSymptomModalVisible] = useState(false);
  const [symptomType, setSymptomType] = useState('tremor');
  const [severity, setSeverity] = useState('mild');
  const [symptomNote, setSymptomNote] = useState('');
  const scale = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [scale]);

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
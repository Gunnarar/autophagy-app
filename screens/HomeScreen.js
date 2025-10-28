import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback, TextInput, ScrollView, Animated, Image, TouchableOpacity, Button, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLogs } from '../contexts/LogsContext';
import { MILESTONES, MILESTONE_INFO, AUTOPHAGY_LEVELS } from '../utils/constants';
import { useNavigation } from '@react-navigation/native';
import StatusPill from '../components/StatusPill';
import { useModalAction } from '../contexts/ModalActionContext';
import { useUser } from '../contexts/UserContext';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { theme } from '../utils/theme';
import LogEntryModal from '../components/LogEntryModal';
import FastingSummaryCard from '../components/FastingSummaryCard';
import AutophagyKetoneCard from '../components/AutophagyKetoneCard';
import KetoneLogModal from '../components/KetoneLogModal';
import SymptomLogModal from '../components/SymptomLogModal';
import { differenceInDays } from 'date-fns';
import { loadString, saveString } from '../utils/storage';

export default function HomeScreen() {
  const { foodLog, setFoodLog, symptomLog, setSymptomLog, fastLog, setFastLog, useAutophagyStatus, useUnifiedFastRecommendation } = useLogs();
  const navigation = useNavigation();
  const { currentLevel, nextChallenge, completed } = useAutophagyStatus();
  const [symptomModalVisible, setSymptomModalVisible] = useState(false);
  const [symptomType, setSymptomType] = useState('tremor');
  const [severity, setSeverity] = useState('mild');
  const [symptomNote, setSymptomNote] = useState('');
  const [addTime, setAddTime] = useState(new Date());
  const [showAddTimePicker, setShowAddTimePicker] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const [showFastStopPicker, setShowFastStopPicker] = useState(false);
  const { setModalActionHandler } = useModalAction();
  const [fastingGoalHours, setFastingGoalHours] = useState(16);
  const [lastMealTime, setLastMealTime] = useState(null);
  const [fastingStreak, setFastingStreak] = useState(0);
  const [statusOverride, setStatusOverride] = useState(null);
  const [fastingPlan, setFastingPlan] = useState({ hours: 16, label: '16:8' });
  const [dietPreference, setDietPreference] = useState('Standard');
  const { user, saveUser } = useUser();
  const today = new Date().toISOString().slice(0, 10);
  const unifiedRec = useUnifiedFastRecommendation();
  const [fastRecDismissed, setFastRecDismissed] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const mealAnim = useRef(new Animated.Value(0)).current;
  const symptomAnim = useRef(new Animated.Value(0)).current;
  const [logModal, setLogModal] = useState(null);
  const { ketoneLog, setKetoneLog } = useLogs();

  function getWeekStart(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  }
  const weekStart = getWeekStart(today);
  const animalMeatLog = user?.animalMeatLog || [];
  const carbMealLog = user?.carbMealLog || [];
  const thisWeekMeat = animalMeatLog.filter(e => getWeekStart(e.date) === weekStart);
  const thisWeekCarbs = carbMealLog.filter(e => getWeekStart(e.date) === weekStart);
  const totalMeat = thisWeekMeat.reduce((sum, e) => sum + (parseFloat(e.pounds) || 0), 0);
  const carbCount = thisWeekCarbs.length;

  function getWeekStartDate(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  }
  const weeks = [];
  let d = new Date();
  for (let i = 0; i < 4; i++) {
    const weekStart = getWeekStartDate(d);
    const weekMeat = animalMeatLog.filter(e => getWeekStartDate(e.date) === weekStart);
    const weekCarbs = carbMealLog.filter(e => getWeekStartDate(e.date) === weekStart);
    weeks.unshift({
      label: `W${4 - i}`,
      meat: weekMeat.reduce((sum, e) => sum + (parseFloat(e.pounds) || 0), 0),
      carbs: weekCarbs.length,
    });
    d.setDate(d.getDate() - 7);
  }

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [scale]);

  useEffect(() => {
    const handler = (action) => {
      if (action === 'logSymptom') {
        setSymptomModalVisible(true);
      }
    };
    setModalActionHandler(handler);
    return () => setModalActionHandler(null);
  }, [setModalActionHandler]);

  useEffect(() => {
    (async () => {
      const stored = await loadString('fastingSchedule');
      let hours = 16, label = '16:8';
      if (stored && stored.match(/^(\d+):(\d+)/)) {
        hours = parseInt(stored.split(':')[0], 10);
        label = stored;
      }
      setFastingPlan({ hours, label });
      setFastingGoalHours(hours);
    })();
  }, []);

  useEffect(() => {
    if (foodLog.length > 0) {
      setLastMealTime(new Date(foodLog[0].time));
    } else {
      setLastMealTime(null);
    }
  }, [foodLog]);

  useEffect(() => {
    let streak = 0;
    let d = new Date();
    for (let i = 0; i < 7; i++) {
      const dayStr = d.toISOString().slice(0, 10);
      const fasts = fastLog.filter(entry => {
        const start = new Date(entry.start);
        const end = new Date(entry.end);
        const duration = (end - start) / 3600000;
        return duration >= fastingGoalHours && end.toISOString().slice(0, 10) === dayStr;
      });
      if (fasts.length > 0) {
        streak++;
      }
      d.setDate(d.getDate() - 1);
    }
    setFastingStreak(streak);
  }, [fastLog, fastingGoalHours]);

  // Find ongoing fast (no end time)
  const ongoingFast = fastLog.find(f => !f.end);

  // Calculate fastingElapsed: use ongoingFast if present, else fallback to time since last meal
  let fastingElapsed = 0;
  if (ongoingFast) {
    const start = new Date(ongoingFast.start);
    fastingElapsed = Math.floor((Date.now() - start.getTime()) / 1000);
  } else if (foodLog.length > 0) {
    const lastMeal = new Date(foodLog[0].time);
    fastingElapsed = Math.floor((Date.now() - lastMeal.getTime()) / 1000);
  }

  const mealTypes = ['meal', 'animalMeat', 'carbMeal'];
  const todaysMeals = foodLog.filter(e => mealTypes.includes(e.type) && e.time && e.time.slice(0, 10) === today);
  const todaysSnacks = foodLog.filter(e => e.type === 'snack' && e.time && e.time.slice(0, 10) === today);
  const todaysSymptoms = symptomLog.filter(e => e.time && e.time.slice(0, 10) === today);
  const allKetoOrCarnivore = todaysMeals.length > 0 && todaysMeals.every(e => e.dietType === 'Keto' || e.dietType === 'Carnivore');

  const fastingGoal = fastingPlan.hours;
  const dietRelax = (dietPreference === 'Keto' || dietPreference === 'Carnivore' || allKetoOrCarnivore) ? 4 : 0;
  const autophagyThreshold = Math.max(16, fastingGoal - dietRelax);
  const ketoneThreshold = Math.max(12, fastingGoal - 4 - dietRelax);

  let fastingStatus = 'bad';
  if (fastingElapsed >= fastingGoal * 3600) {
    fastingStatus = 'good';
  } else if (lastMealTime) {
    const sinceMeal = (Date.now() - lastMealTime.getTime()) / 3600000;
    if (fastingStreak >= 3 && sinceMeal < 6) {
      fastingStatus = 'warning';
    } else if (sinceMeal < 1) {
      fastingStatus = 'warning';
    } else {
      fastingStatus = 'bad';
    }
  } else {
    fastingStatus = 'warning';
  }

  let ketoneStatus = 'bad';
  if (fastingElapsed >= ketoneThreshold * 3600) {
    ketoneStatus = 'good';
  } else if (fastingElapsed >= (ketoneThreshold - 4) * 3600) {
    ketoneStatus = 'warning';
  } else {
    ketoneStatus = 'bad';
  }

  let autophagyStatus = 'bad';
  if (fastingElapsed >= autophagyThreshold * 3600) {
    autophagyStatus = 'good';
  } else if (fastingElapsed >= (autophagyThreshold - 4) * 3600) {
    autophagyStatus = 'warning';
  } else {
    autophagyStatus = 'bad';
  }

  const badgeVisible = Object.values(completed).some(arr => arr.length > 0);
  let progress = 0;
  if (nextChallenge) {
    const maxFast = fastLog.reduce((max, entry) => {
      const start = new Date(entry.start);
      const end = new Date(entry.end);
      const durationHrs = (end - start) / 3600000;
      return Math.max(max, durationHrs);
    }, 0);
    progress = Math.min(1, maxFast / nextChallenge);
  }

  const pillStatuses = [
    fastingStatus === 'good' ? 'good' : fastingStatus === 'warning' ? 'warning' : 'bad',
    todaysMeals.length > 0 ? 'good' : 'warning',
    ketoneStatus === 'good' ? 'good' : ketoneStatus === 'warning' ? 'warning' : 'bad',
    autophagyStatus === 'good' ? 'good' : autophagyStatus === 'warning' ? 'warning' : 'bad',
    todaysSymptoms.length === 0 ? 'good' : 'warning',
  ];
  let bgColors;
  if (pillStatuses.includes('bad')) {
    bgColors = ['#ffeaea', '#ffd6d6'];
  } else if (pillStatuses.includes('warning')) {
    bgColors = ['#fffbe5', '#fff3c4'];
  } else {
    bgColors = ['#eaf6f6', '#b3c7f7'];
  }

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

  useEffect(() => {
    (async () => {
      const storedDiet = await loadString('dietPreference');
      if (storedDiet) setDietPreference(storedDiet);
    })();
  }, []);

  const handleDietType = async (type) => {
    await saveUser({ ...user, dietType: type });
  };

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const dismissed = await loadString('fastRecDismissed');
      setFastRecDismissed(dismissed === today);
    })();
  }, []);

  const handleDismissFastRec = async () => {
    const today = new Date().toISOString().slice(0, 10);
    await saveString('fastRecDismissed', today);
    setFastRecDismissed(true);
  };

  const activelyFasting = fastingElapsed > 0 && fastingElapsed < fastingGoal * 3600;

  useEffect(() => {
    if (fabOpen) {
      Animated.stagger(50, [
        Animated.spring(mealAnim, { toValue: 1, useNativeDriver: true }),
        Animated.spring(symptomAnim, { toValue: 1, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.stagger(50, [
        Animated.spring(symptomAnim, { toValue: 0, useNativeDriver: true }),
        Animated.spring(mealAnim, { toValue: 0, useNativeDriver: true }),
      ]).start();
    }
  }, [fabOpen]);

  function handleAddMeal() {
    setFabOpen(false);
    setLogModal({ mode: 'meal', visible: true });
  }
  function handleAddSymptom() {
    setFabOpen(false);
    setLogModal({ mode: 'symptom', visible: true });
  }
  function handleSaveLog(entry) {
    if (logModal?.mode === 'meal') {
      setFoodLog([
        {
          id: Date.now().toString(),
          type: 'animalMeat',
          time: entry.time.toISOString(),
          pounds: entry.pounds,
          dietType: entry.dietType,
          note: entry.note,
          logType: 'food',
        },
        ...foodLog,
      ]);
    } else if (logModal?.mode === 'symptom') {
      setSymptomLog([
        {
          id: Date.now().toString(),
          type: entry.type,
          severity: entry.severity,
          time: entry.time.toISOString(),
          note: entry.note,
        },
        ...symptomLog,
      ]);
    }
    setLogModal(null);
    setFabOpen(false);
  }
  function handleCancelLog() {
    setLogModal(null);
    setFabOpen(false);
  }

  // Start/Stop Fast logic using fastLog
  function handleStartFast() {
    setFastLog([
      {
        id: Date.now().toString(),
        start: new Date().toISOString(),
        method: 'manual',
        note: '',
      },
      ...fastLog,
    ]);
  }
  function handleStopFast() {
    if (!ongoingFast) return;
    setFastLog(fastLog.map(f =>
      f === ongoingFast ? { ...f, end: new Date().toISOString() } : f
    ));
  }

  // Calculate autophagy windows (X/365) from completed fasts
  const now = new Date();
  let autophagyDays = 0;
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 3600 * 1000);
  fastLog.forEach(fast => {
    if (!fast.end) return;
    const start = new Date(fast.start);
    const end = new Date(fast.end);
    if (end > oneYearAgo) {
      const fastHours = (end - start) / 3600000;
      autophagyDays += Math.floor(fastHours / 24);
    }
  });

  // Current fast timer
  let fastTimer = null;
  if (ongoingFast) {
    const start = new Date(ongoingFast.start);
    const elapsed = Math.floor((Date.now() - start.getTime()) / 1000);
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    fastTimer = `${h}h ${m}m elapsed`;
  }

  // Helper to get most recent ketone entry
  const sortedKetones = [...ketoneLog].filter(e => e.value != null).sort((a, b) => new Date(b.time) - new Date(a.time));
  const latestKetone = sortedKetones[0];
  const ketoneInKetosis = latestKetone && latestKetone.value >= 0.5;
  const ketoneColor = ketoneInKetosis ? theme.colors.primary : theme.colors.border;
  const ketoneHistory = sortedKetones.slice(0, 5);

  const [ketoneModalVisible, setKetoneModalVisible] = useState(false);
  const [ketoneValue, setKetoneValue] = useState('');
  const [ketoneUnit, setKetoneUnit] = useState('mmol/L');
  const [ketoneTime, setKetoneTime] = useState(new Date());
  const [ketoneNote, setKetoneNote] = useState('');

  function handleSaveKetone() {
    if (!ketoneValue) return;
    setKetoneLog([
      {
        id: Date.now().toString(),
        value: parseFloat(ketoneValue),
        unit: ketoneUnit,
        time: ketoneTime.toISOString(),
        note: ketoneNote,
      },
      ...ketoneLog,
    ]);
    setKetoneModalVisible(false);
    setKetoneValue('');
    setKetoneNote('');
    setKetoneTime(new Date());
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={bgColors}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.title}>Dashboard</Text>
        <FastingSummaryCard
          fastingElapsedSeconds={fastingElapsed}
          recommendedProgram={unifiedRec.recommendedProgram}
          reason={unifiedRec.reason}
          benefits={unifiedRec.benefits}
          whatToExpect={unifiedRec.whatToExpect}
          challengeMsg={unifiedRec.challengeMsg}
          caution={unifiedRec.caution}
          planNextMsg={unifiedRec.planNextMsg}
          hasOngoingFast={Boolean(ongoingFast)}
          onStartFast={handleStartFast}
          onStopFast={handleStopFast}
        />
        <AutophagyKetoneCard
          autophagyDays={autophagyDays}
          hasOngoingFast={Boolean(ongoingFast)}
          fastingTimerLabel={fastTimer}
          latestKetone={latestKetone}
          ketoneInKetosis={ketoneInKetosis}
          ketoneColor={ketoneColor}
          ketoneHistory={ketoneHistory}
          onLogKetone={() => setKetoneModalVisible(true)}
        />
        <KetoneLogModal
          visible={ketoneModalVisible}
          value={ketoneValue}
          unit={ketoneUnit}
          time={ketoneTime}
          note={ketoneNote}
          onChangeValue={setKetoneValue}
          onSelectUnit={setKetoneUnit}
          onSetTimeToNow={() => setKetoneTime(new Date())}
          onChangeNote={setKetoneNote}
          onSave={handleSaveKetone}
          onCancel={() => setKetoneModalVisible(false)}
        />
        <SymptomLogModal
          visible={symptomModalVisible}
          symptomType={symptomType}
          severity={severity}
          note={symptomNote}
          time={addTime}
          isTimePickerVisible={showAddTimePicker}
          onSelectSymptom={setSymptomType}
          onSelectSeverity={setSeverity}
          onChangeNote={setSymptomNote}
          onOpenTimePicker={() => setShowAddTimePicker(true)}
          onCloseTimePicker={() => setShowAddTimePicker(false)}
          onConfirmTime={date => { setAddTime(date); setShowAddTimePicker(false); }}
          onSave={handleSaveSymptomWithTime}
          onCancel={() => setSymptomModalVisible(false)}
        />
        {/* LogEntryModal for Add Meal or Add Symptom */}
        <LogEntryModal
          mode={logModal?.mode}
          visible={!!logModal}
          onSave={handleSaveLog}
          onCancel={handleCancelLog}
        />
      </ScrollView>
      {/* Speed Dial FAB */}
      <View style={{ position: 'absolute', right: 24, bottom: 36, alignItems: 'center', zIndex: 100 }} pointerEvents="box-none">
        {/* Add Symptom Button (animates diagonally up-left) */}
        <Animated.View style={{
          position: 'absolute',
          right: 36,
          bottom: 0,
          opacity: symptomAnim,
          transform: [
            { translateX: symptomAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -36] }) },
            { translateY: symptomAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -36] }) },
            { scale: symptomAnim },
          ],
          zIndex: 101,
        }} pointerEvents={fabOpen ? 'auto' : 'none'}>
          <Pressable
            style={styles.fabMini}
            onPress={handleAddSymptom}
            accessibilityLabel="Add symptom"
          >
            <Text style={styles.fabMiniIcon}>🧠</Text>
          </Pressable>
          <Text style={styles.fabMiniLabel}>Add Symptom</Text>
        </Animated.View>
        {/* Add Meal Button (animates up) */}
        <Animated.View style={{
          position: 'absolute',
          right: 0,
          bottom: 48,
          opacity: mealAnim,
          transform: [
            { translateY: mealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -48] }) },
            { scale: mealAnim },
          ],
          zIndex: 101,
        }} pointerEvents={fabOpen ? 'auto' : 'none'}>
          <Pressable
            style={styles.fabMini}
            onPress={handleAddMeal}
            accessibilityLabel="Add meal"
          >
            <Text style={styles.fabMiniIcon}>🍽️</Text>
          </Pressable>
          <Text style={styles.fabMiniLabel}>Add Meal</Text>
        </Animated.View>
        {/* Main FAB */}
        <Pressable
          style={styles.fab}
          onPress={() => setFabOpen(open => !open)}
          accessibilityLabel={fabOpen ? 'Close menu' : 'Add log entry'}
        >
          <Animated.View style={{ transform: [{ rotate: fabOpen ? '45deg' : '0deg' }] }}>
            <Ionicons name="add" size={36} color="#fff" />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  challengeText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.tiny,
  },
  statusText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.tiny,
  },
  learnMoreBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.regular,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  learnMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.tiny,
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.regular,
    paddingVertical: 10,
    paddingHorizontal: 24,
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
  headerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: theme.spacing.regular },
  dietTypeRow: { flexDirection: 'row', marginBottom: 8 },
  dietTypeText: { color: theme.colors.textSecondary, fontWeight: 'bold' },
  dietTypeTextActive: { color: '#fff', fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, marginRight: 8, flex: 1, backgroundColor: '#fff' },
  section: { width: '100%', marginBottom: theme.spacing.large },
  sectionTitle: { fontSize: theme.fontSizes.medium, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: theme.spacing.xsmall },
  summaryText: { fontSize: theme.fontSizes.regular, color: theme.colors.text, marginTop: 4 },
  statusCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.regular,
    marginBottom: theme.spacing.regular,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fastingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.regular,
    marginBottom: theme.spacing.regular,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressBarBgPolished: {
    width: '100%',
    height: 18,
    backgroundColor: theme.colors.border,
    borderRadius: 9,
    marginVertical: theme.spacing.small,
    overflow: 'hidden',
  },
  progressBarFillPolished: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 9,
  },
  goalReached: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginBottom: theme.spacing.tiny,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.tiny,
  },
  learnMoreBtnPolished: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.regular,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  learnMoreTextPolished: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    backgroundColor: theme.colors.primary,
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabMini: {
    backgroundColor: theme.colors.primary,
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMiniIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  fabMiniLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  emojiRowImproved: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emojiCircle: {
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  emojiCircleActive: {
    borderColor: theme.colors.primary,
  },
  emoji: {
    fontSize: 20,
    textAlign: 'center',
  },
  selectedLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  severityRowImproved: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityPill: {
    backgroundColor: 'transparent',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  severityPillActive: {
    borderColor: theme.colors.primary,
  },
  severityPillText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  severityPillTextActive: {
    color: theme.colors.primary,
  },
  noteInput: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: '#2d4d4d',
    backgroundColor: '#f8f8f8',
    minHeight: 40,
  },
}); 

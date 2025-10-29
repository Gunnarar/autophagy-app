import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SEVERITIES } from '../utils/constants';
import { useLogs } from '../contexts/LogsContext';
import { useModalAction } from '../contexts/ModalActionContext';
import { theme } from '../utils/theme';
import LogEntryModal from '../components/LogEntryModal';
import FastingSummaryCard from '../components/FastingSummaryCard';
import AutophagyKetoneCard from '../components/AutophagyKetoneCard';
import KetoneLogModal from '../components/KetoneLogModal';
import SymptomLogModal from '../components/SymptomLogModal';
import QuickActionFAB from '../components/QuickActionFAB';
import InsightChart from '../components/InsightChart';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function HomeScreen() {
  const { foodLog, setFoodLog, symptomLog, setSymptomLog, fastLog, setFastLog, useUnifiedFastRecommendation, ketoneLog, setKetoneLog } = useLogs();
  const { user } = useUser();
  const [symptomModalVisible, setSymptomModalVisible] = useState(false);
  const [symptomType, setSymptomType] = useState('tremor');
  const [severity, setSeverity] = useState('mild');
  const [symptomNote, setSymptomNote] = useState('');
  const [addTime, setAddTime] = useState(new Date());
  const [showAddTimePicker, setShowAddTimePicker] = useState(false);
  const { setModalActionHandler } = useModalAction();
  const [fastingStreak, setFastingStreak] = useState(0);
  const today = new Date().toISOString().slice(0, 10);
  const unifiedRec = useUnifiedFastRecommendation();
  const fastingGoalHours = unifiedRec?.recommendedProgram?.duration || 16;
  const [fabOpen, setFabOpen] = useState(false);
  const mealAnim = useRef(new Animated.Value(0)).current;
  const symptomAnim = useRef(new Animated.Value(0)).current;
  const [logModal, setLogModal] = useState(null);


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
  const todaysSymptoms = symptomLog.filter(e => e.time && e.time.slice(0, 10) === today);

  // Legacy status pills removed; keep supporting calculations inline.

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
  }, [fabOpen, mealAnim, symptomAnim]);

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
    if (!ongoingFast) {return;}
    setFastLog(fastLog.map(f =>
      f === ongoingFast ? { ...f, end: new Date().toISOString() } : f
    ));
  }

  // Calculate autophagy windows (X/365) from completed fasts
  const now = new Date();
  let autophagyDays = 0;
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 3600 * 1000);
  fastLog.forEach(fast => {
    if (!fast.end) {return;}
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

  const hasOngoingFast = Boolean(ongoingFast);
  const fastingHours = fastingElapsed / 3600;
  const formattedFastingHours = fastingHours > 0 ? fastingHours.toFixed(1) : '0.0';
  const greetingName = user?.name?.split(' ')[0] || 'there';
  const nextProgram = unifiedRec?.recommendedProgram;
  const heroSubtitle = hasOngoingFast
    ? `Current fast · ${formattedFastingHours}h elapsed`
    : nextProgram
    ? `Next goal · ${nextProgram.duration}h fast`
    : 'Plan your next fast to stay on track';
  const heroDetail = unifiedRec?.challengeMsg
    || unifiedRec?.planNextMsg
    || 'Track meals, symptoms, and ketones to understand your day.';
  const latestKetoneValue = latestKetone ? latestKetone.value.toFixed(1) : '—';
  const latestKetoneUnit = latestKetone?.unit || 'mmol/L';
  const todaysMeat = todaysMeals
    .filter(entry => entry.type === 'animalMeat' && entry.pounds)
    .reduce((sum, entry) => sum + parseFloat(entry.pounds), 0);
  const todaysMeatLabel = `${todaysMeat > 0 ? todaysMeat.toFixed(1) : '0'} lbs`;
  const mealsLabel = `${todaysMeals.length} ${todaysMeals.length === 1 ? 'meal' : 'meals'}`;
  const symptomsLabel = `${todaysSymptoms.length} ${todaysSymptoms.length === 1 ? 'log' : 'logs'}`;
  const heroPrimaryAction = hasOngoingFast ? handleStopFast : handleStartFast;
  const heroPrimaryLabel = hasOngoingFast ? 'Stop fast' : 'Start fast';

  const trendData = React.useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const dayKey = day.toISOString().slice(0, 10);

      const ketonesForDay = sortedKetones.filter(entry => entry.time && entry.time.slice(0, 10) === dayKey);
      const avgKetone = ketonesForDay.length
        ? ketonesForDay.reduce((sum, entry) => sum + entry.value, 0) / ketonesForDay.length
        : null;

      const symptomsForDay = symptomLog.filter(entry => entry.time && entry.time.slice(0, 10) === dayKey);
      const avgSeverity = symptomsForDay.length
        ? symptomsForDay.reduce((sum, entry) => {
            if (entry.severity && typeof entry.severity === 'number') {return sum + entry.severity;}
            const severityIndex = SEVERITIES.findIndex(s => s.key === entry.severity);
            return severityIndex >= 0 ? sum + severityIndex : sum;
          }, 0) / symptomsForDay.length
        : null;

      const meatForDay = foodLog
        .filter(entry => entry.type === 'animalMeat' && entry.time && entry.time.slice(0, 10) === dayKey && entry.pounds)
        .reduce((sum, entry) => sum + parseFloat(entry.pounds), 0);

      days.push({
        date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ketones: avgKetone,
        symptoms: avgSeverity,
        redMeat: meatForDay,
      });
    }
    return days;
  }, [sortedKetones, symptomLog, foodLog]);

  function handleSaveKetone() {
    if (!ketoneValue) {return;}
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
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={[theme.colors.brandPrimary, theme.colors.brandPrimaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroOverline}>Daily snapshot</Text>
            <Text style={styles.heroTitle}>Welcome back, {greetingName}</Text>
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
            <Text style={styles.heroCaption}>{heroDetail}</Text>
            <View style={styles.heroActions}>
              <Button
                label={heroPrimaryLabel}
                variant={hasOngoingFast ? 'danger' : 'primary'}
                size="md"
                onPress={heroPrimaryAction}
                style={styles.heroActionPrimary}
              />
              <Button
                label="Log meal"
                variant="secondary"
                size="md"
                onPress={handleAddMeal}
                style={styles.heroActionSecondary}
              />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          <Card variant="outline" style={styles.statCard}>
            <Text style={styles.statLabel}>Meals today</Text>
            <Text style={styles.statValue}>{todaysMeals.length}</Text>
            <Text style={styles.statMeta}>{mealsLabel}</Text>
            <Text style={styles.statMetaAccent}>Animal meat · {todaysMeatLabel}</Text>
          </Card>
          <Card variant="outline" style={styles.statCard}>
            <Text style={styles.statLabel}>Symptoms logged</Text>
            <Text style={styles.statValue}>{todaysSymptoms.length}</Text>
            <Text style={styles.statMeta}>{symptomsLabel}</Text>
            <Text style={styles.statMetaMuted}>Keep tracking trends to spot improvements.</Text>
          </Card>
          <Card variant="outline" style={styles.statCard}>
            <Text style={styles.statLabel}>Ketone level</Text>
            <Text style={styles.statValue}>{latestKetoneValue}</Text>
            <Text style={styles.statMeta}>{latestKetoneValue === '—' ? 'No data yet' : latestKetoneUnit}</Text>
            <Button
              label="Log ketone"
              variant="ghost"
              size="sm"
              onPress={() => setKetoneModalVisible(true)}
              style={styles.statButton}
            />
          </Card>
          <Card variant="outline" style={styles.statCard}>
            <Text style={styles.statLabel}>Fasting streak</Text>
            <Text style={styles.statValue}>{fastingStreak}</Text>
            <Text style={styles.statMeta}>{fastingStreak === 1 ? 'day completed' : 'days completed'}</Text>
            <Text style={styles.statMetaMuted}>Consistent streaks boost progress.</Text>
          </Card>
        </View>

        <Card variant="outline" style={styles.insightCard}>
          <Text style={styles.sectionLabel}>7-day trend</Text>
          <InsightChart data={trendData} />
        </Card>

        <FastingSummaryCard
          fastingElapsedSeconds={fastingElapsed}
          recommendedProgram={unifiedRec.recommendedProgram}
          reason={unifiedRec.reason}
          benefits={unifiedRec.benefits}
          whatToExpect={unifiedRec.whatToExpect}
          challengeMsg={unifiedRec.challengeMsg}
          caution={unifiedRec.caution}
          planNextMsg={unifiedRec.planNextMsg}
        />
        <AutophagyKetoneCard
          autophagyDays={autophagyDays}
          hasOngoingFast={hasOngoingFast}
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
      <QuickActionFAB
        open={fabOpen}
        onToggle={() => setFabOpen(open => !open)}
        onAddMeal={handleAddMeal}
        onAddSymptom={handleAddSymptom}
        mealAnim={mealAnim}
        symptomAnim={symptomAnim}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  heroWrapper: {
    marginBottom: theme.spacing.lg,
  },
  heroCard: {
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  heroOverline: {
    color: theme.colors.textOnPrimary,
    opacity: 0.85,
    fontSize: theme.typography.sizes.caption,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroTitle: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.sizes.display,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
  },
  heroSubtitle: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.sizes.body,
    marginBottom: theme.spacing.xs,
  },
  heroCaption: {
    color: theme.colors.textOnPrimary,
    opacity: 0.85,
    fontSize: theme.typography.sizes.caption,
    marginBottom: theme.spacing.sm,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroActionPrimary: {
    marginRight: theme.spacing.xs,
    minWidth: 140,
  },
  heroActionSecondary: {},
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    width: '48%',
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: theme.typography.sizes.title,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.bold,
  },
  statMeta: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statMetaAccent: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.brandSecondary,
    marginTop: theme.spacing.tiny,
  },
  statMetaMuted: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.tiny,
  },
  statButton: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  sectionLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightCard: {
    marginBottom: theme.spacing.lg,
  },
  statusCard: {
    marginBottom: theme.spacing.lg,
  },
});

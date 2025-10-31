import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SEVERITIES } from '../utils/constants';
import { useLogs } from '../contexts/LogsContext';
import { useModalAction } from '../contexts/ModalActionContext';
import { useTheme, useThemedStyles } from '../utils/theme';
import LogEntryModal from '../components/LogEntryModal';
import FastingSummaryCard from '../components/FastingSummaryCard';
import AutophagyKetoneCard from '../components/AutophagyKetoneCard';
import KetoneLogModal from '../components/KetoneLogModal';
import SymptomLogModal from '../components/SymptomLogModal';
import InsightChart from '../components/InsightChart';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function HomeScreen() {
  const { foodLog, setFoodLog, symptomLog, setSymptomLog, fastLog, setFastLog, useUnifiedFastRecommendation, ketoneLog, setKetoneLog } = useLogs();
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
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
  const [logModal, setLogModal] = useState(null);
  const [editFastStartVisible, setEditFastStartVisible] = useState(false);
  const [ketoneModalVisible, setKetoneModalVisible] = useState(false);
  const [ketoneValue, setKetoneValue] = useState('');
  const [ketoneUnit, setKetoneUnit] = useState('mmol/L');
  const [ketoneTime, setKetoneTime] = useState(new Date());
  const [ketoneNote, setKetoneNote] = useState('');


  useEffect(() => {
    const handler = (action) => {
      if (action === 'logSymptom') {
        setLogModal({ mode: 'symptom', visible: true });
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

  const fastingHours = fastingElapsed / 3600;
  const metabolicState = (() => {
    if (fastingHours < 4) {
      return { label: 'Fed state', icon: 'restaurant-outline', color: currentTheme.colors.textSecondary };
    }
    if (fastingHours < 8) {
      return { label: 'Early fasting', icon: 'time-outline', color: currentTheme.colors.info };
    }
    if (fastingHours < 12) {
      return { label: 'Fat burning', icon: 'flame-outline', color: currentTheme.colors.brandHighlight };
    }
    if (fastingHours < 24) {
      return { label: 'Autophagy active', icon: 'shield-checkmark-outline', color: currentTheme.colors.success };
    }
    return { label: 'Deep autophagy', icon: 'sparkles-outline', color: currentTheme.colors.brandPrimary };
  })();

  const todaysMeat = todaysMeals
    .filter(entry => entry.type === 'animalMeat' && entry.pounds)
    .reduce((sum, entry) => sum + parseFloat(entry.pounds), 0);

  const sortedKetones = React.useMemo(
    () => [...ketoneLog].filter(e => e.value != null).sort((a, b) => new Date(b.time) - new Date(a.time)),
    [ketoneLog],
  );
  const latestKetone = sortedKetones[0];
  const latestKetoneValue = latestKetone ? latestKetone.value.toFixed(1) : '—';
  const latestKetoneUnit = latestKetone?.unit || 'mmol/L';
  const ketoneInKetosis = latestKetone ? latestKetone.value >= 0.5 : false;
  const ketoneColor = ketoneInKetosis ? currentTheme.colors.brandPrimary : currentTheme.colors.textSecondary;
  const ketoneHistory = sortedKetones.slice(0, 5);

  const statCards = React.useMemo(() => {
    const isDarkMode = currentTheme.isDark;
    const mutedText = currentTheme.colors.textOnSurfaceMuted || currentTheme.colors.textSecondary;

    return [
      {
        key: 'meals',
        title: 'Meals today',
        value: todaysMeals.length.toString(),
        meta: `${todaysMeals.length === 1 ? 'entry' : 'entries'} logged`,
        footer: `${todaysMeat.toFixed(1)} lbs animal meat`,
        footerColor: isDarkMode ? mutedText : currentTheme.colors.brandSecondary,
        icon: <MaterialCommunityIcons name="silverware-fork-knife" size={22} color={isDarkMode ? mutedText : currentTheme.colors.brandSecondary} />,
        gradient: currentTheme.gradients.statCards.meals,
      },
      {
        key: 'symptoms',
        title: 'Symptoms logged',
        value: todaysSymptoms.length.toString(),
        meta: todaysSymptoms.length === 0 ? 'All clear today' : `${todaysSymptoms.length} noted`,
        footer: todaysSymptoms.length === 0 ? 'Great job staying mindful' : 'Log notable changes',
        footerColor: isDarkMode ? mutedText : currentTheme.colors.brandHighlight,
        icon: <MaterialCommunityIcons name="stethoscope" size={22} color={isDarkMode ? mutedText : currentTheme.colors.error} />,
        gradient: currentTheme.gradients.statCards.symptoms,
      },
      {
        key: 'ketone',
        title: 'Latest ketone',
        value: latestKetoneValue,
        meta: latestKetoneValue === '—' ? 'No data yet' : latestKetoneUnit,
        footer: ketoneInKetosis ? 'Optimal ketosis' : 'Add a reading',
        footerColor: isDarkMode ? mutedText : (ketoneInKetosis ? currentTheme.colors.success : currentTheme.colors.textSecondary),
        icon: <MaterialCommunityIcons name="water" size={22} color={isDarkMode ? mutedText : currentTheme.colors.info} />,
        gradient: currentTheme.gradients.statCards.ketone,
      },
      {
        key: 'streak',
        title: 'Fasting streak',
        value: fastingStreak.toString(),
        meta: fastingStreak === 1 ? 'day completed' : 'days completed',
        footer: fastingStreak >= 3 ? 'Momentum is building' : 'Stay consistent',
        footerColor: isDarkMode ? mutedText : currentTheme.colors.brandPrimary,
        icon: <MaterialCommunityIcons name="calendar-check" size={22} color={isDarkMode ? mutedText : currentTheme.colors.brandPrimary} />,
        gradient: currentTheme.gradients.statCards.streak,
      },
    ];
  }, [todaysMeals.length, todaysMeat, todaysSymptoms.length, latestKetoneValue, latestKetoneUnit, ketoneInKetosis, fastingStreak, currentTheme]);


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

  function handleAddMeal() {
    setLogModal({ mode: 'meal', visible: true });
  }
  function handleAddSymptom() {
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
  }
  function handleCancelLog() {
    setLogModal(null);
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

  function handleEditFastStart() {
    if (!ongoingFast) {return;}
    setEditFastStartVisible(true);
  }

  function handleConfirmFastStart(date) {
    if (!ongoingFast) {
      setEditFastStartVisible(false);
      return;
    }
    setFastLog(current => current.map(f =>
      f === ongoingFast ? { ...f, start: date.toISOString() } : f
    ));
    setEditFastStartVisible(false);
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

  const hasOngoingFast = Boolean(ongoingFast);
  const formattedFastingHours = fastingHours > 0 ? fastingHours.toFixed(1) : '0.0';
  const greetingName = user?.name?.split(' ')[0] || 'there';
  const nextProgram = unifiedRec?.recommendedProgram;
  const heroSubtitle = hasOngoingFast
    ? `Current fast · ${formattedFastingHours}h elapsed`
    : nextProgram
    ? `Next goal · ${nextProgram.duration}h fast`
    : 'Plan your next fast to stay on track';
  const heroDetail = hasOngoingFast
    ? 'Log how you feel to spot trends.'
    : unifiedRec?.reason || 'Set up your next fast to stay on track.';
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

      const fastHoursForDay = fastLog
        .filter(entry => entry.end && entry.end.slice(0, 10) === dayKey)
        .reduce((sum, entry) => {
          const start = new Date(entry.start);
          const end = new Date(entry.end);
          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {return sum;}
          const duration = (end - start) / 3600000;
          return duration > 0 ? sum + duration : sum;
        }, 0);

      const isToday = dayKey === today;
      let todayFastHours = fastHoursForDay;
      if (isToday && hasOngoingFast) {
        const ongoingStart = new Date(ongoingFast.start);
        if (!Number.isNaN(ongoingStart.getTime())) {
          todayFastHours += (Date.now() - ongoingStart.getTime()) / 3600000;
        }
      }

      const fastDays = todayFastHours ? Number((todayFastHours / 24).toFixed(2)) : null;

      days.push({
        date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ketones: avgKetone,
        symptoms: avgSeverity,
        fastDays,
        redMeat: meatForDay,
      });
    }
    return days;
  }, [sortedKetones, symptomLog, foodLog, fastLog, hasOngoingFast, ongoingFast, today]);

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
            colors={currentTheme.gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroOverline}>Daily snapshot</Text>
            <Text style={styles.heroTitle}>Welcome back, {greetingName}</Text>
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
            <Text style={styles.heroCaption}>{heroDetail}</Text>
            <View style={styles.heroBadge}>
              <Ionicons name={metabolicState.icon} size={18} color={metabolicState.color} />
              <Text style={[styles.heroBadgeText, { color: metabolicState.color }]}>
                {metabolicState.label}
              </Text>
            </View>
            <View style={styles.heroActions}>
              <Button
                label={heroPrimaryLabel}
                variant={hasOngoingFast ? 'danger' : 'primary'}
                size="md"
                onPress={heroPrimaryAction}
                style={styles.heroActionPrimary}
              />
            </View>
          </LinearGradient>
        </View>


        <View style={styles.statsGrid}>
          {statCards.map(card => (
            <Pressable
              key={card.key}
              style={styles.statPressable}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.08)' }}
              onPress={() => {
                if (card.key === 'meals') {
                  handleAddMeal();
                } else if (card.key === 'symptoms') {
                  handleAddSymptom();
                } else if (card.key === 'ketone') {
                  setKetoneModalVisible(true);
                } else if (card.key === 'streak') {
                  if (hasOngoingFast) {
                    handleStopFast();
                  } else {
                    handleStartFast();
                  }
                }
              }}
            >
              <LinearGradient
                colors={card.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statGradient}
              >
                <View style={styles.statHeader}>
                  {card.icon}
                  <Text style={styles.statLabel}>{card.title}</Text>
                </View>
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statMeta}>{card.meta}</Text>
                <Text style={[styles.statMetaAccent, { color: card.footerColor }]}>{card.footer}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        <Card variant="outline" style={styles.insightCard}>
          <Text style={styles.sectionLabel}>7-day trend</Text>
          <InsightChart data={trendData} />
        </Card>

        <FastingSummaryCard
          fastingElapsedSeconds={fastingElapsed}
          recommendedProgram={unifiedRec?.recommendedProgram}
          reason={unifiedRec?.reason}
          benefits={unifiedRec?.benefits}
          whatToExpect={unifiedRec?.whatToExpect}
          challengeMsg={unifiedRec?.challengeMsg}
          caution={unifiedRec?.caution}
          planNextMsg={unifiedRec?.planNextMsg}
          hasOngoingFast={hasOngoingFast}
          onEditStart={handleEditFastStart}
        />
        <AutophagyKetoneCard
          autophagyDays={autophagyDays}
          hasOngoingFast={hasOngoingFast}
          fastingTimerLabel={fastTimer}
          latestKetone={latestKetone}
          ketoneInKetosis={ketoneInKetosis}
          ketoneColor={ketoneColor}
          ketoneHistory={ketoneHistory}
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
        <DateTimePickerModal
          isVisible={editFastStartVisible}
          mode="datetime"
          onConfirm={handleConfirmFastStart}
          onCancel={() => setEditFastStartVisible(false)}
        />
      </ScrollView>
    </View>
  );
}

const createStyles = currentTheme =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: currentTheme.colors.backgroundPrimary,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: currentTheme.spacing.lg,
      paddingBottom: currentTheme.spacing.xl,
      paddingTop: currentTheme.spacing.lg,
    },
    heroWrapper: {
      marginBottom: currentTheme.spacing.lg,
    },
    heroCard: {
      borderRadius: currentTheme.radius.xl,
      paddingVertical: currentTheme.spacing.lg,
      paddingHorizontal: currentTheme.spacing.lg,
    },
    heroOverline: {
      color: currentTheme.colors.textOnPrimary,
      opacity: 0.85,
      fontSize: currentTheme.typography.sizes.caption,
      marginBottom: currentTheme.spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 1.1,
    },
    heroTitle: {
      color: currentTheme.colors.textOnPrimary,
      fontSize: currentTheme.typography.sizes.display,
      fontWeight: currentTheme.typography.weights.bold,
      marginBottom: currentTheme.spacing.xs,
    },
    heroSubtitle: {
      color: currentTheme.colors.textOnPrimary,
      fontSize: currentTheme.typography.sizes.body,
      marginBottom: currentTheme.spacing.xs,
    },
    heroCaption: {
      color: currentTheme.colors.textOnPrimary,
      opacity: 0.85,
      fontSize: currentTheme.typography.sizes.caption,
      marginBottom: currentTheme.spacing.sm,
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: currentTheme.spacing.tiny,
      alignSelf: 'flex-start',
      backgroundColor: currentTheme.colors.surfacePrimary,
      borderRadius: currentTheme.radius.pill,
      paddingHorizontal: currentTheme.spacing.sm,
      paddingVertical: currentTheme.spacing.tiny,
      marginBottom: currentTheme.spacing.md,
    },
    heroBadgeText: {
      fontSize: currentTheme.typography.sizes.caption,
      fontWeight: currentTheme.typography.weights.semibold,
    },
    heroActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    heroActionPrimary: {
      marginRight: currentTheme.spacing.xs,
      minWidth: 140,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: currentTheme.spacing.lg,
    },
    statPressable: {
      width: '48%',
      minWidth: 160,
      marginBottom: currentTheme.spacing.sm,
      borderRadius: currentTheme.radius.lg,
    },
    statGradient: {
      flex: 1,
      borderRadius: currentTheme.radius.lg,
      padding: currentTheme.spacing.md,
      overflow: 'hidden',
    },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: currentTheme.spacing.xs,
      marginBottom: currentTheme.spacing.xs,
    },
    statLabel: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.isDark ? currentTheme.colors.textOnSurfaceMuted : currentTheme.colors.textSecondary,
      marginBottom: currentTheme.spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statValue: {
      fontSize: currentTheme.typography.sizes.headline,
      color: currentTheme.isDark ? currentTheme.colors.textOnSurfaceMuted : currentTheme.colors.textPrimary,
      fontWeight: currentTheme.typography.weights.bold,
    },
    statMeta: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.isDark ? currentTheme.colors.textOnSurfaceMuted : currentTheme.colors.textSecondary,
      marginTop: currentTheme.spacing.xs,
    },
    statMetaAccent: {
      fontSize: currentTheme.typography.sizes.caption,
      marginTop: currentTheme.spacing.tiny,
      color: currentTheme.isDark ? currentTheme.colors.textOnSurfaceMuted : undefined,
    },
    sectionLabel: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      marginBottom: currentTheme.spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    insightCard: {
      marginBottom: currentTheme.spacing.lg,
    },
    statusCard: {
      marginBottom: currentTheme.spacing.lg,
    },
  });

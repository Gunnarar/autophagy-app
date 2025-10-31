import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2 } from 'lucide-react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';
import { useLogs } from '../contexts/LogsContext';
import { deleteItem } from '../utils/storage';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { useTheme, useThemeMode, useThemedStyles } from '../utils/theme';

const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?name=Genesis+User&background=b3c7f7&color=fff&size=128';

export default function ProfileScreen({ navigation }) {
  const { user, saveUser } = useUser();
  const {
    foodLog,
    symptomLog,
    fastLog,
    ketoneLog,
    setFoodLog,
    setSymptomLog,
    setFastLog,
    setKetoneLog,
  } = useLogs();
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { mode, setMode, availableModes } = useThemeMode();
  const themeLabels = React.useMemo(
    () => ({
      light: 'Light',
      dark: 'Dark',
      blue: 'Blue',
      red: 'Red',
    }),
    [],
  );
  const themeOptions = React.useMemo(
    () =>
      availableModes.map(key => ({
        key,
        label: themeLabels[key] || key.charAt(0).toUpperCase() + key.slice(1),
      })),
    [availableModes, themeLabels],
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  const handleResetData = () => {
    Alert.alert(
      'Reset app data',
      'This will remove all logs, notifications, and profile details. You will be taken back to onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setFoodLog([]);
            setSymptomLog([]);
            setFastLog([]);
            setKetoneLog([]);

            await Promise.all([
              deleteItem('foodLog'),
              deleteItem('symptomLog'),
              deleteItem('fastLog'),
              deleteItem('ketoneLog'),
              deleteItem('autophagyProgress'),
              deleteItem('notificationDone'),
              deleteItem('notificationFastingDismissedUntil'),
              deleteItem('fastRecDismissed'),
              deleteItem('userProfile'),
            ]);

            await saveUser({ onboarded: false });
          },
        },
      ],
    );
  };

  const firstName = user.name?.split(' ')[0] || 'Genesis user';
  const weeklyInsights = React.useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);

    const fastsCompleted = fastLog.filter(entry => entry?.end && new Date(entry.end) >= start).length;

    const recentKetones = ketoneLog
      .filter(entry => entry?.time && entry?.value != null && new Date(entry.time) >= start);
    const avgKetone = recentKetones.length
      ? (recentKetones.reduce((sum, entry) => sum + Number(entry.value || 0), 0) / recentKetones.length).toFixed(1)
      : '—';

    const symptomCount = symptomLog.filter(entry => entry?.time && new Date(entry.time) >= start).length;

    return {
      fastsCompleted,
      avgKetone,
      symptomCount,
    };
  }, [fastLog, ketoneLog, symptomLog]);
  const profileActions = React.useMemo(() => [
    {
      key: 'fastingPrograms',
      title: 'Fasting programs',
      subtitle: 'Browse structured plans and challenges',
      icon: <MaterialCommunityIcons name="timer-sand" size={22} color={currentTheme.colors.info} />,
      onPress: () => navigation.navigate('FastingPrograms'),
    },
  ], [currentTheme, navigation]);

  const secondaryActions = [
    {
      key: 'notifications',
      title: 'Notifications & reminders',
      subtitle: 'Plan meal windows, meds, and fast alerts',
      icon: <Ionicons name="notifications" size={22} color={currentTheme.colors.brandSecondary} />,
      onPress: null,
    },
    {
      key: 'integrations',
      title: 'Integrations',
      subtitle: 'Connect HealthKit, Google Fit, or ketone meters',
      icon: <MaterialCommunityIcons name="link-variant" size={22} color={currentTheme.colors.brandSecondary} />,
      onPress: null,
    },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.heroWrapper}>
        <LinearGradient
          colors={[currentTheme.colors.brandPrimary, currentTheme.colors.brandPrimaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <Image source={{ uri: AVATAR_PLACEHOLDER }} style={styles.avatar} />
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroOverline}>Account</Text>
              <Text style={styles.heroTitle}>{firstName}</Text>
              <Text style={styles.heroSubtitle}>{user.email || 'No email on file'}</Text>
              <Text style={styles.heroCaption}>Member since {new Date().getFullYear()}</Text>
            </View>
          </View>
          <View style={styles.heroCTA}>
            <Button
              label="Edit profile"
              variant="primary"
              size="sm"
              onPress={() => navigation.navigate('ProfileDetails')}
              style={styles.heroPrimaryButton}
            />
            <Button
              label="Contact support"
              variant="secondary"
              size="sm"
              onPress={() => {}}
            />
          </View>
        </LinearGradient>
      </View>

      <Card variant="outline" style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Weekly highlights</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{weeklyInsights.fastsCompleted}</Text>
            <Text style={styles.summaryLabel}>Fasts completed</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{weeklyInsights.avgKetone}</Text>
            <Text style={styles.summaryLabel}>Avg ketones</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{weeklyInsights.symptomCount}</Text>
            <Text style={styles.summaryLabel}>Symptom logs</Text>
          </View>
        </View>
      </Card>

      <View style={styles.sectionGroup}>
        {profileActions.map(action => (
          <TouchableOpacity
            key={action.key}
            onPress={action.onPress}
            style={styles.actionCard}
            accessibilityRole="button"
          >
            <View style={styles.actionIcon}>{action.icon}</View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={currentTheme.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <Card variant="tinted" style={styles.sectionIntroCard}>
        <Text style={styles.sectionTitle}>Personalization & safety</Text>
        <Text style={styles.sectionBody}>Configure reminders, accessibility, and connected services to tailor Genesis4PD to your routine.</Text>
      </Card>

      <Card variant="outline" style={styles.appearanceCard}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Text style={styles.preferenceSubtitle}>Choose the theme that feels most comfortable while you track your progress.</Text>
        <View style={styles.themeSelector}>
          {themeOptions.map(option => (
            <Chip
              key={option.key}
              label={option.label}
              size="md"
              active={mode === option.key}
              onPress={() => setMode(option.key)}
              style={styles.themeChip}
              textStyle={styles.themeChipLabel}
              accessibilityLabel={`${option.label} theme`}
            />
          ))}
        </View>
      </Card>

      <View style={styles.sectionGroup}>
        {secondaryActions.map(action => (
          <TouchableOpacity
            key={action.key}
            onPress={action.onPress || (() => {})}
            style={[styles.actionCard, !action.onPress && styles.actionCardDisabled]}
            accessibilityRole="button"
            disabled={!action.onPress}
          >
            <View style={styles.actionIcon}>{action.icon}</View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={currentTheme.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <Card variant="outline" style={styles.helpCard}>
        <Text style={styles.helpTitle}>Need a hand?</Text>
        <Text style={styles.helpSubtitle}>Email support@genesis4pd.com and we’ll respond within one business day.</Text>
        <Button label="Email support" variant="primary" size="sm" onPress={() => {}} style={styles.helpButton} />
      </Card>

      <Card variant="outline" style={styles.dangerCard}>
        <Text style={styles.dangerTitle}>Danger zone</Text>
        <Text style={styles.dangerSubtitle}>Remove all locally stored data and restart onboarding. This cannot be undone.</Text>
        <Button
          label="Reset app data"
          variant="danger"
          size="sm"
          leftIcon={<Trash2 color={currentTheme.colors.textOnPrimary} size={18} strokeWidth={2} />}
          onPress={handleResetData}
          style={styles.dangerButton}
        />
      </Card>
    </ScrollView>
  );
}

const createStyles = currentTheme =>
  StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: currentTheme.colors.backgroundPrimary,
    },
    content: {
      paddingHorizontal: currentTheme.spacing.lg,
      paddingBottom: currentTheme.spacing.xl,
      paddingTop: currentTheme.spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: currentTheme.colors.backgroundPrimary,
    },
    loadingText: {
      color: currentTheme.colors.textSecondary,
      fontSize: currentTheme.typography.sizes.body,
    },
    heroWrapper: {
      marginBottom: currentTheme.spacing.lg,
    },
    heroCard: {
      borderRadius: currentTheme.radius.xl,
      paddingVertical: currentTheme.spacing.lg,
      paddingHorizontal: currentTheme.spacing.lg,
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: currentTheme.spacing.md,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.surfacePrimary,
      marginRight: currentTheme.spacing.md,
    },
    heroTextBlock: {
      flex: 1,
    },
    heroOverline: {
      color: currentTheme.colors.textOnPrimary,
      opacity: 0.75,
      fontSize: currentTheme.typography.sizes.caption,
      marginBottom: currentTheme.spacing.tiny,
      textTransform: 'uppercase',
      letterSpacing: 1.1,
    },
    heroTitle: {
      color: currentTheme.colors.textOnPrimary,
      fontSize: currentTheme.typography.sizes.headline,
      fontWeight: currentTheme.typography.weights.bold,
      marginBottom: currentTheme.spacing.tiny,
    },
    heroSubtitle: {
      color: currentTheme.colors.textOnPrimary,
      fontSize: currentTheme.typography.sizes.caption,
      marginBottom: currentTheme.spacing.tiny,
    },
    heroCaption: {
      color: currentTheme.colors.textOnPrimary,
      opacity: 0.75,
      fontSize: currentTheme.typography.sizes.caption,
    },
    heroCTA: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    heroPrimaryButton: {
      marginRight: currentTheme.spacing.xs,
      minWidth: 140,
    },
    summaryCard: {
      marginBottom: currentTheme.spacing.lg,
    },
    sectionTitle: {
      fontSize: currentTheme.typography.sizes.body,
      fontWeight: currentTheme.typography.weights.semibold,
      color: currentTheme.colors.textPrimary,
      marginBottom: currentTheme.spacing.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: currentTheme.typography.sizes.title,
      fontWeight: currentTheme.typography.weights.bold,
      color: currentTheme.colors.textPrimary,
    },
    summaryLabel: {
      marginTop: currentTheme.spacing.tiny,
      color: currentTheme.colors.textSecondary,
      fontSize: currentTheme.typography.sizes.caption,
      textAlign: 'center',
    },
    summaryDivider: {
      width: StyleSheet.hairlineWidth,
      height: 46,
      backgroundColor: currentTheme.colors.border,
    },
    sectionGroup: {
      marginBottom: currentTheme.spacing.lg,
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.colors.surfacePrimary,
      borderRadius: currentTheme.radius.md,
      paddingVertical: currentTheme.spacing.sm,
      paddingHorizontal: currentTheme.spacing.sm,
      marginBottom: currentTheme.spacing.sm,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.border,
    },
    actionCardDisabled: {
      opacity: 0.6,
    },
    actionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: currentTheme.colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: currentTheme.spacing.sm,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: currentTheme.typography.sizes.body,
      fontWeight: currentTheme.typography.weights.semibold,
      color: currentTheme.colors.textPrimary,
    },
    actionSubtitle: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      marginTop: currentTheme.spacing.tiny,
    },
    sectionIntroCard: {
      marginBottom: currentTheme.spacing.lg,
    },
    preferenceSubtitle: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
    },
    appearanceCard: {
      marginBottom: currentTheme.spacing.lg,
      gap: currentTheme.spacing.sm,
    },
    themeSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: currentTheme.spacing.sm,
    },
    themeChip: {
      minWidth: 110,
    },
    themeChipLabel: {
      textAlign: 'center',
    },
    sectionBody: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
    },
    helpCard: {
      marginBottom: currentTheme.spacing.xl,
    },
    helpTitle: {
      fontSize: currentTheme.typography.sizes.body,
      fontWeight: currentTheme.typography.weights.semibold,
      color: currentTheme.colors.textPrimary,
      marginBottom: currentTheme.spacing.xs,
    },
    helpSubtitle: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      marginBottom: currentTheme.spacing.sm,
    },
    helpButton: {
      alignSelf: 'flex-start',
    },
    dangerCard: {
      marginBottom: currentTheme.spacing.xl,
      paddingVertical: currentTheme.spacing.lg,
      paddingHorizontal: currentTheme.spacing.lg,
      gap: currentTheme.spacing.sm,
    },
    dangerTitle: {
      fontSize: currentTheme.typography.sizes.body,
      fontWeight: currentTheme.typography.weights.semibold,
      color: currentTheme.colors.error,
    },
    dangerSubtitle: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
    },
    dangerButton: {
      alignSelf: 'flex-start',
    },
  });

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { theme } from '../utils/theme';

const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?name=Genesis+User&background=b3c7f7&color=fff&size=128';

export default function ProfileScreen({ navigation }) {
  const { user } = useUser();

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  const firstName = user.name?.split(' ')[0] || 'Genesis user';
  const profileActions = [
    {
      key: 'profileDetails',
      title: 'Profile details',
      subtitle: 'View and update personal information',
      icon: <Ionicons name="person" size={22} color={theme.colors.brandPrimary} />,
      onPress: () => navigation.navigate('ProfileDetails'),
    },
    {
      key: 'fastingPrograms',
      title: 'Fasting programs',
      subtitle: 'Browse structured plans and challenges',
      icon: <MaterialCommunityIcons name="timer-sand" size={22} color={theme.colors.info} />,
      onPress: () => navigation.navigate('FastingPrograms'),
    },
  ];

  const secondaryActions = [
    {
      key: 'notifications',
      title: 'Notifications & reminders',
      subtitle: 'Plan meal windows, meds, and fast alerts',
      icon: <Ionicons name="notifications" size={22} color={theme.colors.brandSecondary} />,
      onPress: null,
    },
    {
      key: 'integrations',
      title: 'Integrations',
      subtitle: 'Connect HealthKit, Google Fit, or ketone meters',
      icon: <MaterialCommunityIcons name="link-variant" size={22} color={theme.colors.brandSecondary} />,
      onPress: null,
    },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.heroWrapper}>
        <LinearGradient
          colors={[theme.colors.brandPrimary, theme.colors.brandPrimaryDark]}
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
            <Text style={styles.summaryValue}>4</Text>
            <Text style={styles.summaryLabel}>Fasts completed</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>0.5</Text>
            <Text style={styles.summaryLabel}>Avg ketones</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>3</Text>
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
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <Card variant="tinted" style={styles.sectionIntroCard}>
        <Text style={styles.sectionTitle}>Personalization & safety</Text>
        <Text style={styles.sectionBody}>Configure reminders, accessibility, and connected services to tailor Genesis4PD to your routine.</Text>
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
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <Card variant="outline" style={styles.helpCard}>
        <Text style={styles.helpTitle}>Need a hand?</Text>
        <Text style={styles.helpSubtitle}>Email support@genesis4pd.com and we’ll respond within one business day.</Text>
        <Button label="Email support" variant="primary" size="sm" onPress={() => {}} style={styles.helpButton} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundPrimary,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.body,
  },
  heroWrapper: {
    marginBottom: theme.spacing.lg,
  },
  heroCard: {
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: theme.colors.surfacePrimary,
    marginRight: theme.spacing.md,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroOverline: {
    color: theme.colors.textOnPrimary,
    opacity: 0.75,
    fontSize: theme.typography.sizes.caption,
    marginBottom: theme.spacing.tiny,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroTitle: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.sizes.headline,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.tiny,
  },
  heroSubtitle: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.sizes.caption,
    marginBottom: theme.spacing.tiny,
  },
  heroCaption: {
    color: theme.colors.textOnPrimary,
    opacity: 0.75,
    fontSize: theme.typography.sizes.caption,
  },
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroPrimaryButton: {
    marginRight: theme.spacing.xs,
    minWidth: 140,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
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
    fontSize: theme.typography.sizes.title,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  summaryLabel: {
    marginTop: theme.spacing.tiny,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.caption,
    textAlign: 'center',
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: 46,
    backgroundColor: theme.colors.border,
  },
  sectionGroup: {
    marginBottom: theme.spacing.lg,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfacePrimary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: theme.colors.border,
  },
  actionCardDisabled: {
    opacity: 0.6,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.tiny,
  },
  sectionIntroCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionBody: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  },
  helpCard: {
    marginBottom: theme.spacing.xl,
  },
  helpTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  helpSubtitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  helpButton: {
    alignSelf: 'flex-start',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../utils/theme';

export default function FastingStatusCard({ unifiedRec }) {
  const [expanded, setExpanded] = useState(false);
  if (!unifiedRec) {return null;}
  return (
    <LinearGradient
      colors={[theme.colors.blueLight, theme.colors.accent]}
      style={styles.statusCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cellEmoji} accessibilityLabel="Cell illustration">🦠</Text>
        <Text style={styles.title}>Fasting Challenge</Text>
        <Text style={styles.challengeText}>Next: <Text style={styles.inlineBold}>{unifiedRec.recommendedProgram?.duration}h Fast</Text></Text>
        <Text style={styles.statusText}>{unifiedRec.reason}</Text>
        <Pressable
          style={styles.learnMoreBtn}
          onPress={() => setExpanded(e => !e)}
          accessibilityLabel={expanded ? 'Hide details' : 'Learn more about fasting benefits'}
        >
          <Text style={styles.learnMoreText}>{expanded ? 'Hide details' : 'Learn more'}</Text>
        </Pressable>
        {expanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.detailText}><Text style={styles.inlineBold}>Benefits:</Text> {unifiedRec.benefits}</Text>
            <Text style={styles.detailText}><Text style={styles.inlineBold}>What to expect:</Text> {unifiedRec.whatToExpect}</Text>
            {unifiedRec.challengeMsg && <Text style={[styles.detailText, styles.detailAccent]}>{unifiedRec.challengeMsg}</Text>}
            {unifiedRec.caution && <Text style={[styles.detailText, styles.detailCaution]}>Caution: Consider a shorter fast first.</Text>}
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.large,
    marginBottom: theme.spacing.regular,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
    width: '100%',
  },
  cellEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xsmall,
    textAlign: 'center',
  },
  challengeText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xsmall,
    textAlign: 'center',
  },
  statusText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  learnMoreBtn: {
    alignSelf: 'center',
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: theme.colors.blueMedium,
  },
  learnMoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cardContent: {
    alignItems: 'center',
    width: '100%',
  },
  inlineBold: {
    fontWeight: 'bold',
  },
  expandedContent: {
    marginTop: 8,
    width: '100%',
  },
  detailText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.regular,
    marginBottom: 4,
    textAlign: 'center',
  },
  detailAccent: {
    color: theme.colors.accent,
  },
  detailCaution: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
});

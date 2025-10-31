import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { theme } from '../utils/theme';
import { SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';

export default function SymptomLogModal({
  visible,
  symptomType,
  severity,
  note,
  time,
  isTimePickerVisible,
  onSelectSymptom,
  onSelectSeverity,
  onChangeNote,
  onOpenTimePicker,
  onCloseTimePicker,
  onConfirmTime,
  onSave,
  onCancel,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.avoiding}
            enabled
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <Card variant="outline" style={styles.content}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  overScrollMode="never"
                >
                  <Text style={styles.title}>Log symptom</Text>
                  <Text style={styles.subtitle}>Track how you feel to spot patterns with fasting and meals.</Text>

                  <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Symptom</Text>
                  <View style={styles.selectorRow}>
                    {SYMPTOM_TYPES.map(type => {
                      const isActive = symptomType === type.key;
                      return (
                      <Chip
                        key={type.key}
                        label={type.label}
                        icon={<Text style={styles.selectorEmoji}>{type.emoji}</Text>}
                        size="lg"
                        active={isActive}
                        onPress={() => onSelectSymptom?.(type.key)}
                        accessibilityLabel={type.label}
                        style={styles.selectorChip}
                        textStyle={styles.selectorLabel}
                        contentStyle={styles.selectorContentStacked}
                      />
                    );
                  })}
                  </View>
                </View>

                  <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Severity</Text>
                  <View style={styles.selectorRow}>
                    {SEVERITIES.map(level => {
                      const isActive = severity === level.key;
                      return (
                      <Chip
                        key={level.key}
                        label={level.label}
                        size="lg"
                        active={isActive}
                        onPress={() => onSelectSeverity?.(level.key)}
                        accessibilityLabel={level.label}
                        style={styles.selectorChip}
                        textStyle={styles.selectorLabel}
                      />
                    );
                  })}
                  </View>
                </View>

                  <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Time</Text>
                  <Button
                    label={time.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}
                    variant="secondary"
                    onPress={onOpenTimePicker}
                    style={styles.fullWidthButton}
                  />
                <DateTimePickerModal
                  isVisible={isTimePickerVisible}
                  mode="datetime"
                  date={time}
                  onConfirm={date => onConfirmTime?.(date)}
                  onCancel={onCloseTimePicker}
                  is24Hour={true}
                />
              </View>

                  <View style={styles.section}>
                <Text style={styles.sectionLabel}>Note (optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  onChangeText={onChangeNote}
                  value={note}
                  placeholder="e.g. after exercise, before meds"
                  accessibilityLabel="Symptom note input"
                  multiline
                />
              </View>

                  <View style={styles.actions}>
                    <Button label="Cancel" variant="ghost" onPress={onCancel} style={styles.actionButton} />
                    <Button label="Save" onPress={onSave} style={styles.actionButton} />
                  </View>
                </ScrollView>
              </Card>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.overlay.scrim,
    paddingHorizontal: theme.spacing.lg,
  },
  avoiding: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxHeight: '90%',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
    alignItems: 'stretch',
  },
  title: {
    fontSize: theme.typography.sizes.headline,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginHorizontal: -theme.spacing.tiny / 2,
  },
  selectorChip: {
    flexBasis: 150,
    flexGrow: 1,
  },
  selectorLabel: {
    textAlign: 'center',
  },
  selectorEmoji: {
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
  },
  selectorContentStacked: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.tiny,
  },
  noteInput: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfacePrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fullWidthButton: {
    alignSelf: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
    alignSelf: 'stretch',
    gap: theme.spacing.xs,
  },
  actionButton: {
    marginLeft: theme.spacing.xs,
  },
});

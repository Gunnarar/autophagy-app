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
import { theme } from '../utils/theme';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';

export default function KetoneLogModal({
  visible,
  value,
  unit,
  time,
  note,
  onChangeValue,
  onSelectUnit,
  onSetTimeToNow,
  onChangeNote,
  onSave,
  onCancel,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.avoider}
            enabled
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <Card variant="outline" style={styles.content}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  overScrollMode="never"
                  contentContainerStyle={styles.scrollContent}
                >
                  <Text style={styles.title}>Log ketone</Text>
                  <Text style={styles.subtitle}>Capture the latest reading to understand ketosis trends.</Text>

                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Value</Text>
                    <View style={styles.valueRow}>
                      <TextInput
                        style={[styles.input, styles.inputFlexible]}
                        keyboardType="decimal-pad"
                        placeholder="e.g. 0.7"
                        value={value}
                        onChangeText={onChangeValue}
                        accessibilityLabel="Ketone value input"
                      />
                      <View style={styles.unitChips}>
                        {['mmol/L', 'mg/dL'].map(option => {
                          const isActive = unit === option;
                          return (
                            <Chip
                              key={option}
                              label={option}
                              size="md"
                              active={isActive}
                              onPress={() => onSelectUnit?.(option)}
                            />
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Time</Text>
                    <Button
                      label={time.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}
                      variant="secondary"
                      onPress={onSetTimeToNow}
                      style={styles.fullWidthButton}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Note (optional)</Text>
                    <TextInput
                      style={styles.noteInput}
                      placeholder="e.g. after exercise, before meds"
                      value={note}
                      onChangeText={onChangeNote}
                      accessibilityLabel="Ketone note input"
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
  avoider: {
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
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
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
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfacePrimary,
    width: '100%',
  },
  inputFlexible: {
    flex: 1,
    marginRight: theme.spacing.xs,
  },
  unitChips: {
    flexDirection: 'row',
  },
  noteInput: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfacePrimary,
    minHeight: 72,
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

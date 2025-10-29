import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';
import { theme } from '../utils/theme';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';

const DIET_TYPES = [
  { key: 'standard', label: 'Standard', icon: '🥗' },
  { key: 'animal', label: 'Animal', icon: '🍖' },
];

export default function LogEntryModal({
  mode, // 'meal' or 'symptom'
  visible,
  initialValues = {},
  onSave,
  onCancel,
}) {
  // Shared fields
  const [time, setTime] = useState(initialValues.time || new Date());
  const [note, setNote] = useState(initialValues.note || '');
  const [pickerMode, setPickerMode] = useState(false);
  // Meal fields
  const [dietType, setDietType] = useState(initialValues.dietType || 'standard');
  const [meatPounds, setMeatPounds] = useState(initialValues.pounds || '');
  // Symptom fields
  const [symptomType, setSymptomType] = useState(initialValues.type || 'tremor');
  const [severity, setSeverity] = useState(initialValues.severity || 'mild');

  function handleSave() {
    if (mode === 'meal') {
      onSave({
        dietType,
        pounds: meatPounds,
        time,
        note,
      });
    } else {
      onSave({
        type: symptomType,
        severity,
        time,
        note,
      });
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Card variant="outline" style={styles.modalContent}>
              <Text style={styles.modalTitle}>{mode === 'meal' ? 'Add meal' : 'Log symptom'}</Text>
              <Text style={styles.modalSubtitle}>
                {mode === 'meal'
                  ? 'Capture today’s intake to keep your nutrition history accurate.'
                  : 'Track symptoms to understand how fasting and diet impact your day.'}
              </Text>

              {mode === 'meal' ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Diet type</Text>
                  <View style={styles.selectorRow}>
                    {DIET_TYPES.map(dt => {
                      const isActive = dietType === dt.key;
                      return (
                        <Chip
                          key={dt.key}
                          label={dt.label}
                          size="lg"
                          active={isActive}
                          onPress={() => setDietType(dt.key)}
                          style={styles.selectorChip}
                          textStyle={styles.selectorChipLabel}
                          contentStyle={styles.selectorContentStacked}
                          icon={dt.icon ? <Text style={styles.selectorEmoji}>{dt.icon}</Text> : null}
                        />
                      );
                    })}
                  </View>
                  <Text style={styles.sectionLabel}>Pounds of meat</Text>
                  <TextInput
                    style={styles.input}
                    value={meatPounds}
                    onChangeText={setMeatPounds}
                    placeholder="e.g. 0.75"
                    keyboardType="numeric"
                  />
                </View>
              ) : (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Symptom</Text>
                  <View style={styles.selectorRow}>
                    {SYMPTOM_TYPES.map(t => {
                      const isActive = symptomType === t.key;
                      return (
                        <Chip
                          key={t.key}
                          label={t.label}
                          icon={<Text style={styles.selectorEmoji}>{t.emoji}</Text>}
                          size="lg"
                          active={isActive}
                          onPress={() => setSymptomType(t.key)}
                          accessibilityLabel={t.label}
                          style={styles.selectorChip}
                          textStyle={styles.selectorChipLabel}
                          contentStyle={styles.selectorContentStacked}
                        />
                      );
                    })}
                  </View>

                  <Text style={styles.sectionLabel}>Severity</Text>
                  <View style={styles.selectorRow}>
                    {SEVERITIES.map(s => {
                      const isActive = severity === s.key;
                      return (
                        <Chip
                          key={s.key}
                          label={s.label}
                          size="lg"
                          active={isActive}
                          onPress={() => setSeverity(s.key)}
                          style={styles.selectorChip}
                          textStyle={styles.selectorChipLabel}
                        />
                      );
                    })}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Time</Text>
                <Button
                  label={`Time: ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  variant="secondary"
                  onPress={() => setPickerMode(true)}
                  style={styles.sectionButton}
                />
                <DateTimePickerModal
                  isVisible={pickerMode}
                  mode="time"
                  date={time}
                  onConfirm={date => { setTime(date); setPickerMode(false); }}
                  onCancel={() => setPickerMode(false)}
                  is24Hour={true}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Note (optional)</Text>
                <TextInput
                  style={styles.noteInput}
                  numberOfLines={3}
                  onChangeText={setNote}
                  value={note}
                  placeholder={mode === 'meal' ? 'e.g. post-workout, high protein' : 'e.g. after meds, light tremor'}
                  accessibilityLabel="Log note input"
                  multiline
                />
              </View>

              <View style={styles.modalActions}>
                <Button
                  label="Cancel"
                  variant="ghost"
                  onPress={onCancel}
                  style={styles.modalAction}
                />
                <Button
                  label="Save"
                  onPress={handleSave}
                  style={styles.modalAction}
                />
              </View>
            </Card>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.overlay.scrim,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.headline,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  selectorChip: {
    flexBasis: 130,
    flexGrow: 1,
  },
  selectorChipLabel: {
    textAlign: 'center',
  },
  selectorContentStacked: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.tiny,
  },
  selectorEmoji: {
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfacePrimary,
  },
  sectionButton: {
    alignSelf: 'flex-start',
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
  },
  modalAction: {
    marginLeft: theme.spacing.xs,
  },
});

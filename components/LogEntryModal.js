import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';
import { useTheme, useThemedStyles } from '../utils/theme';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { useTranslation } from '../contexts/LocalizationContext';

const DIET_TYPES = [
  { key: 'standard', label: 'Standard', icon: '🥗' },
  { key: 'animal', label: 'Animal', icon: '🍖' },
];

const EMPTY_INITIAL_VALUES = Object.freeze({});

export default function LogEntryModal({
  mode, // 'meal' or 'symptom'
  visible,
  initialValues,
  onSave,
  onCancel,
}) {
  const safeInitialValues = initialValues ?? EMPTY_INITIAL_VALUES;
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  // Shared fields
  const [time, setTime] = useState(safeInitialValues.time || new Date());
  const [note, setNote] = useState(safeInitialValues.note || '');
  const [pickerMode, setPickerMode] = useState(false);
  // Meal fields
  const [dietType, setDietType] = useState(safeInitialValues.dietType || 'standard');
  const [meatPounds, setMeatPounds] = useState(safeInitialValues.pounds || '');
  // Symptom fields
  const [symptomType, setSymptomType] = useState(safeInitialValues.type || 'tremor');
  const [severity, setSeverity] = useState(safeInitialValues.severity || 'mild');

  useEffect(() => {
    if (!visible) {return;}
    const nextTime = safeInitialValues.time
      ? safeInitialValues.time instanceof Date
        ? safeInitialValues.time
        : new Date(safeInitialValues.time)
      : new Date();
    setTime(nextTime);
    setNote(safeInitialValues.note || '');
    setPickerMode(false);
    setDietType(safeInitialValues.dietType || 'standard');
    setMeatPounds(safeInitialValues.pounds || '');
    setSymptomType(safeInitialValues.type || 'tremor');
    setSeverity(safeInitialValues.severity || 'mild');
  }, [
    visible,
    mode,
    safeInitialValues.time,
    safeInitialValues.note,
    safeInitialValues.dietType,
    safeInitialValues.pounds,
    safeInitialValues.type,
    safeInitialValues.severity,
  ]);

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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoider}
            enabled
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <Card variant="outline" style={styles.modalContent}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  overScrollMode="never"
                  contentContainerStyle={styles.scrollContent}
                >
                  <Text style={styles.modalTitle}>{mode === 'meal' ? t('logEntryModal.addMealTitle', 'Add meal') : t('logEntryModal.logSymptomTitle', 'Log symptom')}</Text>
                  <Text style={styles.modalSubtitle}>
                    {mode === 'meal'
                      ? t('logEntryModal.mealSubtitle', 'Capture today’s intake to keep your nutrition history accurate.')
                      : t('logEntryModal.symptomSubtitle', 'Track symptoms to understand how fasting and diet impact your day.')}
                  </Text>

                  {mode === 'meal' ? (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>{t('logEntryModal.dietType', 'Diet type')}</Text>
                      <View style={styles.selectorRow}>
                        {DIET_TYPES.map(dt => {
                          const isActive = dietType === dt.key;
                          return (
                            <Chip
                              key={dt.key}
                              label={t(`logEntryModal.diet.${dt.key}`, dt.label)}
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
                      <Text style={styles.sectionLabel}>{t('logEntryModal.meatLabel', 'Pounds of meat')}</Text>
                      <TextInput
                        style={styles.input}
                        value={meatPounds}
                        onChangeText={setMeatPounds}
                        placeholder={t('logEntryModal.meatPlaceholder', 'e.g. 0.75')}
                        keyboardType="numeric"
                      />
                    </View>
                  ) : (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>{t('logEntryModal.symptomLabel', 'Symptom')}</Text>
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

                      <Text style={styles.sectionLabel}>{t('logEntryModal.severityLabel', 'Severity')}</Text>
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
                    <Text style={styles.sectionLabel}>{t('logEntryModal.timeLabel', 'Time')}</Text>
                    <Button
                      label={t('logEntryModal.timeValue', 'Time: {value}', { value: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })}
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
                    <Text style={styles.sectionLabel}>{t('logEntryModal.noteLabel', 'Note (optional)')}</Text>
                    <TextInput
                      style={styles.noteInput}
                      numberOfLines={3}
                      onChangeText={setNote}
                      value={note}
                      placeholder={mode === 'meal'
                        ? t('logEntryModal.mealNotePlaceholder', 'e.g. post-workout, high protein')
                        : t('logEntryModal.symptomNotePlaceholder', 'e.g. after meds, light tremor')}
                      accessibilityLabel={t('logEntryModal.noteAccessibility', 'Log note input')}
                      multiline
                    />
                  </View>

                  <View style={styles.modalActions}>
                    <Button
                      label={t('common.cancel', 'Cancel')}
                      variant="ghost"
                      onPress={onCancel}
                      style={styles.modalAction}
                    />
                    <Button
                      label={t('common.save', 'Save')}
                      onPress={handleSave}
                      style={styles.modalAction}
                    />
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

const createStyles = currentTheme => {
  const isDark = currentTheme.isDark;
  const mutedText = isDark ? currentTheme.colors.textOnSurfaceMuted : currentTheme.colors.textSecondary;
  const surfaceColor = isDark ? currentTheme.colors.surfaceElevated : currentTheme.colors.surfacePrimary;
  const inputBackground = isDark ? currentTheme.colors.surfaceMuted : currentTheme.colors.surfacePrimary;

  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: currentTheme.overlay.scrim,
      paddingHorizontal: currentTheme.spacing.lg,
    },
    keyboardAvoider: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '100%',
      maxHeight: '90%',
      borderRadius: currentTheme.radius.lg,
      paddingVertical: currentTheme.spacing.lg,
      paddingHorizontal: currentTheme.spacing.lg,
      backgroundColor: surfaceColor,
    },
    scrollContent: {
      paddingBottom: currentTheme.spacing.lg,
      alignItems: 'stretch',
      gap: currentTheme.spacing.md,
    },
    modalTitle: {
      fontSize: currentTheme.typography.sizes.headline,
      fontWeight: currentTheme.typography.weights.bold,
      color: currentTheme.colors.textPrimary,
      marginBottom: currentTheme.spacing.xs,
    },
    modalSubtitle: {
      fontSize: currentTheme.typography.sizes.caption,
      color: mutedText,
      marginBottom: currentTheme.spacing.sm,
    },
    section: {
      marginBottom: currentTheme.spacing.md,
    },
    sectionLabel: {
      fontSize: currentTheme.typography.sizes.caption,
      color: mutedText,
      marginBottom: currentTheme.spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    selectorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: currentTheme.spacing.xs,
      marginBottom: currentTheme.spacing.sm,
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
      gap: currentTheme.spacing.tiny,
    },
    selectorEmoji: {
      fontSize: 24,
      lineHeight: 28,
      textAlign: 'center',
    },
    input: {
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.border,
      borderRadius: currentTheme.radius.sm,
      paddingVertical: currentTheme.spacing.xs,
      paddingHorizontal: currentTheme.spacing.sm,
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textPrimary,
      backgroundColor: inputBackground,
    },
    sectionButton: {
      alignSelf: 'flex-start',
    },
    noteInput: {
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.border,
      borderRadius: currentTheme.radius.sm,
      padding: currentTheme.spacing.sm,
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textPrimary,
      backgroundColor: inputBackground,
      minHeight: 72,
      textAlignVertical: 'top',
    },
    label: {
      alignSelf: 'flex-start',
      marginBottom: currentTheme.spacing.xs,
      color: mutedText,
      fontSize: currentTheme.typography.sizes.caption,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: currentTheme.spacing.md,
      alignSelf: 'stretch',
      gap: currentTheme.spacing.xs,
    },
    modalAction: {
      marginLeft: currentTheme.spacing.xs,
    },
  });
};

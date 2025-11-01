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
import { useTheme, useThemedStyles } from '../utils/theme';
import { SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { useTranslation } from '../contexts/LocalizationContext';

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
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

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
                  <Text style={styles.title}>{t('symptomModal.title', 'Log symptom')}</Text>
                  <Text style={styles.subtitle}>{t('symptomModal.subtitle', 'Track how you feel to spot patterns with fasting and meals.')}</Text>

                  <View style={styles.section}>
                  <Text style={styles.sectionLabel}>{t('symptomModal.symptomLabel', 'Symptom')}</Text>
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
                  <Text style={styles.sectionLabel}>{t('symptomModal.severityLabel', 'Severity')}</Text>
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
                  <Text style={styles.sectionLabel}>{t('symptomModal.timeLabel', 'Time')}</Text>
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
                <Text style={styles.sectionLabel}>{t('symptomModal.noteLabel', 'Note (optional)')}</Text>
                <TextInput
                  style={styles.noteInput}
                  onChangeText={onChangeNote}
                  value={note}
                  placeholder={t('symptomModal.notePlaceholder', 'e.g. after exercise, before meds')}
                  accessibilityLabel={t('symptomModal.noteAccessibility', 'Symptom note input')}
                  multiline
                />
              </View>

                  <View style={styles.actions}>
                    <Button label={t('common.cancel', 'Cancel')} variant="ghost" onPress={onCancel} style={styles.actionButton} />
                    <Button label={t('common.save', 'Save')} onPress={onSave} style={styles.actionButton} />
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

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: currentTheme.overlay.scrim,
      paddingHorizontal: currentTheme.spacing.lg,
    },
    avoiding: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      width: '100%',
      maxHeight: '90%',
      paddingVertical: currentTheme.spacing.lg,
      paddingHorizontal: currentTheme.spacing.lg,
      backgroundColor: surfaceColor,
    },
    scrollContent: {
      paddingBottom: currentTheme.spacing.lg,
      gap: currentTheme.spacing.md,
      alignItems: 'stretch',
    },
    title: {
      fontSize: currentTheme.typography.sizes.headline,
      fontWeight: currentTheme.typography.weights.bold,
      marginBottom: currentTheme.spacing.xs,
      color: currentTheme.colors.textPrimary,
    },
    subtitle: {
      fontSize: currentTheme.typography.sizes.caption,
      color: mutedText,
      marginBottom: currentTheme.spacing.sm,
    },
    section: {
      marginBottom: currentTheme.spacing.md,
    },
    sectionLabel: {
      alignSelf: 'flex-start',
      marginBottom: currentTheme.spacing.xs,
      color: mutedText,
      fontSize: currentTheme.typography.sizes.caption,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    selectorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: currentTheme.spacing.xs,
      marginHorizontal: -currentTheme.spacing.tiny / 2,
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
      gap: currentTheme.spacing.tiny,
    },
    noteInput: {
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.border,
      borderRadius: currentTheme.radius.sm,
      padding: currentTheme.spacing.sm,
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textPrimary,
      backgroundColor: currentTheme.isDark ? currentTheme.colors.surfaceMuted : currentTheme.colors.surfacePrimary,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    fullWidthButton: {
      alignSelf: 'flex-start',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: currentTheme.spacing.md,
      alignSelf: 'stretch',
      gap: currentTheme.spacing.xs,
    },
    actionButton: {
      marginLeft: currentTheme.spacing.xs,
    },
  });
};

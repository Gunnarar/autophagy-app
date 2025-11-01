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
import { useTheme, useThemedStyles } from '../utils/theme';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { useTranslation } from '../contexts/LocalizationContext';

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
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

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
                  <Text style={styles.title}>{t('ketoneModal.title', 'Log ketone')}</Text>
                  <Text style={styles.subtitle}>{t('ketoneModal.subtitle', 'Capture the latest reading to understand ketosis trends.')}</Text>

                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t('ketoneModal.valueLabel', 'Value')}</Text>
                    <View style={styles.valueRow}>
                      <TextInput
                        style={[styles.input, styles.inputFlexible]}
                        keyboardType="decimal-pad"
                        placeholder={t('ketoneModal.valuePlaceholder', 'e.g. 0.7')}
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
                    <Text style={styles.sectionLabel}>{t('ketoneModal.timeLabel', 'Time')}</Text>
                    <Button
                      label={time.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}
                      variant="secondary"
                      onPress={onSetTimeToNow}
                      style={styles.fullWidthButton}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>{t('ketoneModal.noteLabel', 'Note (optional)')}</Text>
                    <TextInput
                      style={styles.noteInput}
                      placeholder={t('ketoneModal.notePlaceholder', 'e.g. after exercise, before meds')}
                      value={note}
                      onChangeText={onChangeNote}
                      accessibilityLabel={t('ketoneModal.noteAccessibility', 'Ketone note input')}
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
  const inputBackground = isDark ? currentTheme.colors.surfaceMuted : currentTheme.colors.surfacePrimary;

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: currentTheme.overlay.scrim,
      paddingHorizontal: currentTheme.spacing.lg,
    },
    avoider: {
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
      color: currentTheme.colors.textPrimary,
      marginBottom: currentTheme.spacing.xs,
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
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    input: {
      borderColor: currentTheme.colors.border,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderRadius: currentTheme.radius.sm,
      paddingVertical: currentTheme.spacing.xs,
      paddingHorizontal: currentTheme.spacing.sm,
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textPrimary,
      backgroundColor: inputBackground,
      width: '100%',
    },
    inputFlexible: {
      flex: 1,
      marginRight: currentTheme.spacing.xs,
    },
    unitChips: {
      flexDirection: 'row',
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

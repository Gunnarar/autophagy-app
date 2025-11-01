import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { FASTING_PROGRAMS } from '../utils/constants';
import { useTheme, useThemedStyles } from '../utils/theme';
import { Button } from '../components/ui/Button';
import { useUser } from '../contexts/UserContext';
import { useLogs } from '../contexts/LogsContext';
import { useTranslation } from '../contexts/LocalizationContext';

// For now, assume user.completedFasts is an array of completed program keys
function getStatus(program, completedFasts) {
  if (completedFasts?.includes(program.key)) {return 'completed';}
  if (!program.unlockAfter) {return 'unlocked';}
  if (completedFasts?.includes(program.unlockAfter)) {return 'unlocked';}
  return 'locked';
}

export default function FastingProgramsScreen() {
  const { user, saveUser } = useUser();
  const { setFastLog } = useLogs();
  const completedFasts = user?.completedFasts || [];
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  const scheduledFast = user?.scheduledFast;
  const selectedProgramLabel = selectedProgram
    ? t(`fastingPrograms.programs.${selectedProgram.key}`, selectedProgram.label)
    : '';

  const handleSelect = (program) => {
    setSelectedProgram(program);
    setModalVisible(true);
  };

  const handleStartNow = async () => {
    if (!selectedProgram) {return;}
    const startTime = new Date().toISOString();
    setFastLog(current => {
      if (current.some(fast => !fast.end)) {
        return current;
      }
      return [
        {
          id: `program-${selectedProgram.key}-${Date.now()}`,
          start: startTime,
          method: 'program',
          programKey: selectedProgram.key,
          targetHours: selectedProgram.duration,
          note: '',
        },
        ...current,
      ];
    });

    const baseUser = user || {};
    await saveUser({
      ...baseUser,
      scheduledFast: null,
      selectedFastingProgram: selectedProgram.key,
    });
    setModalVisible(false);
  };

  const handleSchedule = () => {
    setShowDatePicker(true);
  };

  const handleDatePicked = async (date) => {
    if (!selectedProgram) {
      setShowDatePicker(false);
      setModalVisible(false);
      return;
    }
    const baseUser = user || {};
    await saveUser({
      ...baseUser,
      scheduledFast: {
        programKey: selectedProgram.key,
        startTime: date.toISOString(),
      },
      selectedFastingProgram: selectedProgram.key,
    });
    setShowDatePicker(false);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('fastingPrograms.title', 'Fasting Programs')}</Text>
      {scheduledFast && (
        <View style={styles.scheduledBox}>
          <Text style={styles.scheduledLabel}>{t('fastingPrograms.nextScheduled', 'Next Scheduled Fast:')}</Text>
          <Text style={styles.scheduledText}>
            {t(`fastingPrograms.programs.${scheduledFast.programKey}`, FASTING_PROGRAMS.find(p => p.key === scheduledFast.programKey)?.label || scheduledFast.programKey)}
          </Text>
          <Text style={styles.scheduledText}>
            {t('fastingPrograms.scheduledStart', 'Start: {value}', { value: new Date(scheduledFast.startTime).toLocaleString() })}
          </Text>
        </View>
      )}
      {FASTING_PROGRAMS.map(program => {
        const status = getStatus(program, completedFasts);
        const isSelected = user?.selectedFastingProgram === program.key;
        return (
          <TouchableOpacity
            key={program.key}
            style={[styles.programCard, status === 'locked' && styles.locked, isSelected && styles.selected]}
            disabled={status === 'locked'}
            onPress={() => handleSelect(program)}
          >
            <Text style={styles.programLabel}>{t(`fastingPrograms.programs.${program.key}`, program.label)}</Text>
            <Text style={styles.programDuration}>{t('fastingPrograms.duration', '{hours} hours', { hours: program.duration })}</Text>
            <Text
              style={[
                styles.status,
                status === 'completed' && styles.statusCompleted,
                status === 'locked' && styles.statusLocked,
                isSelected && styles.statusSelected,
              ]}
            >
              {status === 'completed'
                ? t('fastingPrograms.status.completed', '✓ Completed')
                : status === 'locked'
                ? t('fastingPrograms.status.locked', '🔒 Locked')
                : isSelected
                ? t('fastingPrograms.status.selected', 'Selected')
                : t('fastingPrograms.status.unlocked', 'Unlocked')}
            </Text>
          </TouchableOpacity>
        );
      })}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('fastingPrograms.modal.title', 'Schedule Fast')}</Text>
            <Text style={styles.modalDesc}>{t('fastingPrograms.modal.description', 'Would you like to start your {program} now or schedule it for later?', { program: selectedProgramLabel })}</Text>
            <View style={styles.modalActionRow}>
              <Button label={t('fastingPrograms.modal.startNow', 'Start now')} onPress={handleStartNow} style={styles.modalButton} />
              <Button label={t('fastingPrograms.modal.scheduleLater', 'Schedule later')} variant="secondary" onPress={handleSchedule} style={styles.modalButton} />
            </View>
            <Button label={t('common.cancel', 'Cancel')} variant="ghost" onPress={() => setModalVisible(false)} style={styles.modalButton} textStyle={styles.modalButtonGhostText} />
          </View>
        </View>
      </Modal>
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="datetime"
        onConfirm={handleDatePicked}
        onCancel={() => setShowDatePicker(false)}
      />
    </ScrollView>
  );
}

const createStyles = currentTheme => {
  const isDark = currentTheme.isDark;
  const mutedText = isDark ? currentTheme.colors.textOnSurfaceMuted : currentTheme.colors.textSecondary;
  const surfaceElevated = isDark ? currentTheme.colors.surfaceElevated : currentTheme.colors.surfacePrimary;

  return StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: currentTheme.colors.backgroundPrimary,
    },
    container: {
      alignItems: 'center',
      padding: currentTheme.spacing.lg,
    },
    title: {
      fontSize: currentTheme.typography.sizes.headline,
      fontWeight: currentTheme.typography.weights.bold,
      marginBottom: currentTheme.spacing.lg,
      color: currentTheme.colors.textPrimary,
    },
    scheduledBox: {
      backgroundColor: currentTheme.colors.surfaceMuted,
      borderRadius: currentTheme.radius.md,
      padding: currentTheme.spacing.md,
      marginBottom: currentTheme.spacing.lg,
      width: '100%',
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.border,
    },
    scheduledLabel: {
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textPrimary,
      fontWeight: currentTheme.typography.weights.semibold,
    },
    scheduledText: {
      fontSize: currentTheme.typography.sizes.body,
      color: mutedText,
      marginTop: currentTheme.spacing.tiny,
    },
    programCard: {
      width: '100%',
      backgroundColor: currentTheme.colors.surfacePrimary,
      borderRadius: currentTheme.radius.md,
      padding: currentTheme.spacing.lg,
      marginBottom: currentTheme.spacing.md,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.border,
    },
    locked: {
      opacity: 0.6,
    },
    selected: {
      borderColor: currentTheme.colors.brandPrimary,
      backgroundColor: currentTheme.colors.surfaceMuted,
    },
    programLabel: {
      fontSize: currentTheme.typography.sizes.body,
      fontWeight: currentTheme.typography.weights.semibold,
      marginBottom: currentTheme.spacing.xs,
      color: currentTheme.colors.textPrimary,
    },
    programDuration: {
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textSecondary,
      marginBottom: currentTheme.spacing.xs,
    },
    status: {
      fontSize: currentTheme.typography.sizes.caption,
      color: mutedText,
      fontWeight: currentTheme.typography.weights.semibold,
    },
    statusCompleted: {
      color: currentTheme.colors.success,
    },
    statusLocked: {
      color: currentTheme.colors.textMuted,
    },
    statusSelected: {
      color: currentTheme.colors.brandPrimary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: currentTheme.overlay.scrim,
      justifyContent: 'center',
      alignItems: 'center',
      padding: currentTheme.spacing.lg,
    },
    modalContent: {
      backgroundColor: surfaceElevated,
      borderRadius: currentTheme.radius.lg,
      padding: currentTheme.spacing.lg,
      width: '100%',
      maxWidth: 320,
      alignItems: 'center',
      gap: currentTheme.spacing.sm,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    modalTitle: {
      fontSize: currentTheme.typography.sizes.body + 4,
      fontWeight: currentTheme.typography.weights.bold,
      color: currentTheme.colors.textPrimary,
    },
    modalDesc: {
      fontSize: currentTheme.typography.sizes.body,
      color: mutedText,
      textAlign: 'center',
    },
    modalActionRow: {
      flexDirection: 'row',
      marginTop: currentTheme.spacing.md,
      alignItems: 'center',
      gap: currentTheme.spacing.sm,
    },
    modalButton: {
      flex: 1,
    },
    modalButtonGhostText: {
      color: mutedText,
    },
  });
};

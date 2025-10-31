import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useLogs } from '../contexts/LogsContext';
import { SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useThemedStyles } from '../utils/theme';
import { Chip } from '../components/ui/Chip';
import { Card } from '../components/ui/Card';

export default function SymptomsScreen() {
  const { symptomLog, setSymptomLog } = useLogs();
  const [modalVisible, setModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [symptomType, setSymptomType] = useState('tremor');
  const [severity, setSeverity] = useState('mild');
  const [symptomTime, setSymptomTime] = useState(new Date());
  const [symptomNote, setSymptomNote] = useState('');
  const [pickerMode, setPickerMode] = useState(false); // for time picker
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  // Add or edit symptom entry
  const handleSave = () => {
    const entry = {
      type: symptomType,
      severity,
      time: symptomTime.toISOString(),
      note: symptomNote,
      id: (editIndex !== null && symptomLog[editIndex]) ? symptomLog[editIndex].id : Date.now(),
    };
    let updated;
    if (editIndex !== null && symptomLog[editIndex]) {
      updated = [...symptomLog];
      updated[editIndex] = entry;
    } else {
      updated = [entry, ...symptomLog];
    }
    setSymptomLog(updated);
    setModalVisible(false);
    setEditIndex(null);
    setSymptomType('tremor');
    setSeverity('mild');
    setSymptomTime(new Date());
    setSymptomNote('');
  };

  // Edit entry
  const handleEdit = idx => {
    const entry = symptomLog[idx];
    setEditIndex(idx);
    setSymptomType(entry.type);
    setSeverity(entry.severity);
    setSymptomTime(new Date(entry.time));
    setSymptomNote(entry.note);
    setModalVisible(true);
  };

  // Delete entry
  const handleDelete = idx => {
    const updated = [...symptomLog];
    updated.splice(idx, 1);
    setSymptomLog(updated);
  };

  // Today's entries
  const today = new Date().toISOString().slice(0, 10);
  const todaysEntries = symptomLog.filter(e => e.time.slice(0, 10) === today);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={currentTheme.gradients.hero}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Symptoms</Text>
        <View style={styles.card}>
          <Pressable style={[styles.modalButton, styles.modalButtonSpacing]} onPress={() => setModalVisible(true)}>
            <Text style={styles.modalButtonPrimaryText}>Add Symptom</Text>
          </Pressable>
          {todaysEntries.length === 0 ? (
            <Text style={styles.cardText}>No symptoms logged today.</Text>
          ) : (
            todaysEntries.map((entry, _idx) => {
              const typeObj = SYMPTOM_TYPES.find(t => t.key === entry.type);
              return (
                <Pressable
                  key={entry.id}
                  onPress={() => handleEdit(symptomLog.findIndex(e => e.id === entry.id))}
                  onLongPress={() => handleDelete(symptomLog.findIndex(e => e.id === entry.id))}
                  style={styles.entryPressable}
                  accessibilityLabel={`Edit or delete symptom entry: ${typeObj ? typeObj.label : entry.type} at ${new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                >
                  <View style={styles.entryContent}>
                    <Text style={styles.symptomLogEmoji}>
                      {typeObj ? typeObj.emoji : ''}
                    </Text>
                    <Text style={styles.symptomLogTime}>{entry.severity} — {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    {entry.note ? (
                      <Text style={styles.symptomLogNote}>{entry.note}</Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalAvoider}
                enabled
              >
                <TouchableWithoutFeedback onPress={() => {}}>
                  <Card variant="outline" style={styles.modalContent}>
                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      overScrollMode="never"
                      contentContainerStyle={styles.modalScrollContent}
                    >
                      <Text style={styles.modalTitle}>{editIndex !== null ? 'Edit Symptom' : 'Add Symptom'}</Text>
                      <Text style={styles.sectionTitle}>Symptom</Text>
                      <View style={styles.selectorRow}>
                        {SYMPTOM_TYPES.map(t => (
                          <Chip
                            key={t.key}
                            label={t.label}
                            icon={<Text style={styles.selectorEmoji}>{t.emoji}</Text>}
                            size="lg"
                            active={symptomType === t.key}
                            onPress={() => setSymptomType(t.key)}
                            accessibilityLabel={t.label}
                            style={styles.selectorChip}
                            contentStyle={styles.selectorContentStacked}
                            textStyle={styles.selectorLabel}
                          />
                        ))}
                      </View>
                      <Text style={styles.selectedLabel}>{SYMPTOM_TYPES.find(t => t.key === symptomType)?.label}</Text>
                      <Text style={styles.sectionTitle}>Severity</Text>
                      <View style={styles.selectorRow}>
                        {SEVERITIES.map(s => (
                          <Chip
                            key={s.key}
                            label={s.label}
                            size="lg"
                            active={severity === s.key}
                            onPress={() => setSeverity(s.key)}
                            accessibilityLabel={s.label}
                            style={styles.selectorChip}
                            textStyle={styles.selectorLabel}
                          />
                        ))}
                      </View>
                      <Pressable
                        style={[styles.modalButton, styles.modalButtonSpacing]}
                        onPress={() => setPickerMode(true)}
                        accessibilityLabel="Edit time"
                      >
                        <Text style={styles.modalButtonPrimaryText}>Time: {symptomTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </Pressable>
                      <DateTimePickerModal
                        isVisible={pickerMode}
                        mode="time"
                        date={symptomTime}
                        onConfirm={date => { setSymptomTime(date); setPickerMode(false); }}
                        onCancel={() => setPickerMode(false)}
                        is24Hour={true}
                      />
                      <Text style={styles.noteLabel}>Note (optional):</Text>
                      <View style={styles.fullWidthSection}>
                        <TextInput
                          style={styles.noteInput}
                          numberOfLines={1}
                          onChangeText={setSymptomNote}
                          value={symptomNote}
                          placeholder="e.g. after exercise, before meds"
                          accessibilityLabel="Symptom note input"
                          multiline
                        />
                      </View>
                      <Pressable style={styles.modalButton} onPress={handleSave} accessibilityLabel="Save symptom entry">
                        <Text style={styles.modalButtonPrimaryText}>Save</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.modalButton, styles.modalButtonDisabled, styles.modalButtonTopMargin]}
                        onPress={() => setModalVisible(false)}
                        accessibilityLabel="Cancel"
                      >
                        <Text style={styles.modalButtonDisabledText}>Cancel</Text>
                      </Pressable>
                    </ScrollView>
                  </Card>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </View>
  );
}

const createStyles = currentTheme => {
  const isDark = currentTheme.isDark;
  const mutedText = isDark ? currentTheme.colors.textOnSurfaceMuted : currentTheme.colors.textSecondary;
  const surfaceElevated = isDark ? currentTheme.colors.surfaceElevated : currentTheme.colors.surfacePrimary;

  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: currentTheme.spacing.lg,
      paddingBottom: currentTheme.spacing.xl,
    },
    title: {
      fontSize: currentTheme.typography.sizes.headline,
      fontWeight: currentTheme.typography.weights.bold,
      marginBottom: currentTheme.spacing.lg,
      color: currentTheme.colors.textPrimary,
    },
    card: {
      backgroundColor: currentTheme.colors.surfacePrimary,
      borderRadius: currentTheme.radius.md,
      padding: currentTheme.spacing.lg,
      marginBottom: currentTheme.spacing.lg,
      shadowColor: currentTheme.shadow.soft.color,
      shadowOpacity: currentTheme.shadow.soft.opacity,
      shadowRadius: currentTheme.shadow.soft.radius,
      shadowOffset: currentTheme.shadow.soft.offset,
      elevation: currentTheme.shadow.soft.elevation,
    },
    cardText: {
      fontSize: currentTheme.typography.sizes.body,
      color: mutedText,
      marginBottom: currentTheme.spacing.tiny,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: currentTheme.overlay.scrim,
      paddingHorizontal: currentTheme.spacing.lg,
    },
    modalAvoider: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '100%',
      maxHeight: '90%',
      paddingVertical: currentTheme.spacing.lg,
      paddingHorizontal: currentTheme.spacing.lg,
      backgroundColor: surfaceElevated,
    },
    modalScrollContent: {
      paddingBottom: currentTheme.spacing.lg,
      gap: currentTheme.spacing.md,
      alignItems: 'stretch',
    },
    modalTitle: {
      fontSize: currentTheme.typography.sizes.headline,
      fontWeight: currentTheme.typography.weights.bold,
      color: currentTheme.colors.textPrimary,
    },
    modalButton: {
      backgroundColor: currentTheme.colors.brandPrimary,
      borderRadius: currentTheme.radius.sm,
      paddingVertical: currentTheme.spacing.sm,
      paddingHorizontal: currentTheme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'stretch',
    },
    modalButtonSpacing: {
      marginBottom: currentTheme.spacing.md,
    },
    modalButtonPrimaryText: {
      color: currentTheme.colors.textOnPrimary,
      fontWeight: currentTheme.typography.weights.semibold,
    },
    selectedLabel: {
      fontSize: currentTheme.typography.sizes.body,
      fontWeight: currentTheme.typography.weights.semibold,
      marginBottom: currentTheme.spacing.sm,
      color: currentTheme.colors.textPrimary,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: currentTheme.typography.sizes.body,
      fontWeight: currentTheme.typography.weights.semibold,
      marginBottom: currentTheme.spacing.xs,
      color: currentTheme.colors.textPrimary,
    },
    selectorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: currentTheme.spacing.xs,
      marginBottom: currentTheme.spacing.md,
    },
    selectorChip: {
      flexBasis: 150,
      flexGrow: 1,
    },
    selectorLabel: {
      textAlign: 'center',
    },
    selectorEmoji: {
      fontSize: 26,
      lineHeight: 30,
      textAlign: 'center',
    },
    selectorContentStacked: {
      flexDirection: 'column',
      alignItems: 'center',
      gap: currentTheme.spacing.tiny,
    },
    entryPressable: {
      paddingVertical: currentTheme.spacing.tiny,
    },
    entryContent: {
      marginBottom: currentTheme.spacing.tiny,
      alignItems: 'center',
    },
    noteLabel: {
      alignSelf: 'flex-start',
      marginBottom: currentTheme.spacing.xs,
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textPrimary,
    },
    fullWidthSection: {
      width: '100%',
      marginBottom: currentTheme.spacing.md,
    },
    noteInput: {
      borderColor: currentTheme.colors.border,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderRadius: currentTheme.radius.sm,
      padding: currentTheme.spacing.sm,
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textPrimary,
      backgroundColor: currentTheme.isDark ? currentTheme.colors.surfaceMuted : currentTheme.colors.surfacePrimary,
      minHeight: 72,
      textAlignVertical: 'top',
    },
    symptomLogEmoji: {
      fontSize: 24,
      marginBottom: currentTheme.spacing.tiny,
    },
    symptomLogTime: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      marginBottom: currentTheme.spacing.tiny,
      maxWidth: 180,
      textAlign: 'center',
    },
    symptomLogNote: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.brandPrimary,
      marginBottom: currentTheme.spacing.tiny,
      maxWidth: 180,
      textAlign: 'center',
    },
    modalButtonDisabled: {
      backgroundColor: currentTheme.colors.surfaceMuted,
      alignSelf: 'stretch',
    },
    modalButtonTopMargin: {
      marginTop: currentTheme.spacing.xs,
    },
    modalButtonDisabledText: {
      color: currentTheme.colors.textSecondary,
      fontWeight: currentTheme.typography.weights.semibold,
    },
  });
};

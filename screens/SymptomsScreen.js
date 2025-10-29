import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback, TextInput, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useLogs } from '../contexts/LogsContext';
import { SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../utils/theme';
import { Chip } from '../components/ui/Chip';

export default function SymptomsScreen() {
  const { symptomLog, setSymptomLog } = useLogs();
  const [modalVisible, setModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [symptomType, setSymptomType] = useState('tremor');
  const [severity, setSeverity] = useState('mild');
  const [symptomTime, setSymptomTime] = useState(new Date());
  const [symptomNote, setSymptomNote] = useState('');
  const [pickerMode, setPickerMode] = useState(false); // for time picker

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
        colors={['#101c23', '#182c34']}
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
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
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
                    />
                  </View>
                  <Pressable style={styles.modalButton} onPress={handleSave} accessibilityLabel="Save symptom entry">
                    <Text style={styles.modalButtonPrimaryText}>Save</Text>
                  </Pressable>
                  <Pressable style={[styles.modalButton, styles.modalButtonDisabled, styles.modalButtonTopMargin]} onPress={() => setModalVisible(false)} accessibilityLabel="Cancel">
                    <Text style={styles.modalButtonDisabledText}>Cancel</Text>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.regular,
    paddingBottom: 40,
  },
  title: {
    fontSize: theme.fontSizes.xlarge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.medium,
    color: theme.colors.text,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.regular,
    marginBottom: theme.spacing.regular,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardText: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.tiny,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.overlay.scrim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: 24,
    width: 300,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.colors.text,
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.regular,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSpacing: {
    marginBottom: 12,
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.text,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
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
    gap: theme.spacing.tiny,
  },
  entryPressable: {
    paddingVertical: 6,
  },
  entryContent: {
    marginBottom: 2,
    alignItems: 'center',
  },
  noteLabel: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    color: theme.colors.textSecondary,
  },
  fullWidthSection: {
    width: '100%',
    marginBottom: 16,
  },
  noteInput: {
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: '#f8f8f8',
    minHeight: 40,
  },
  symptomLogEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  symptomLogTime: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    maxWidth: 180,
    textAlign: 'center',
  },
  symptomLogNote: {
    fontSize: 13,
    color: theme.colors.primary,
    marginBottom: 2,
    maxWidth: 180,
    textAlign: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  modalButtonTopMargin: {
    marginTop: 8,
  },
  modalButtonDisabledText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
});

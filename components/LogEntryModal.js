import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, TouchableWithoutFeedback } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';
import { theme } from '../utils/theme';

const DIET_TYPES = [
  { key: 'standard', label: 'Standard' },
  { key: 'animal', label: 'Animal' },
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
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{mode === 'meal' ? 'Add Meal' : 'Add Symptom'}</Text>
              {mode === 'meal' ? (
                <>
                  <Text style={styles.sectionTitle}>Diet Type</Text>
                  <View style={styles.dietTypeRow}>
                    {DIET_TYPES.map(dt => (
                      <Pressable
                        key={dt.key}
                        style={[styles.dietTypeButton, dietType === dt.key && styles.dietTypeButtonActive]}
                        onPress={() => setDietType(dt.key)}
                        accessibilityLabel={dt.label}
                      >
                        <Text style={dietType === dt.key ? styles.dietTypeTextActive : styles.dietTypeText}>{dt.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.sectionTitle}>Pounds of Meat</Text>
                  <TextInput
                    style={styles.input}
                    value={meatPounds}
                    onChangeText={setMeatPounds}
                    placeholder="Pounds"
                    keyboardType="numeric"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>Symptom</Text>
                  <View style={styles.emojiRowImproved}>
                    {SYMPTOM_TYPES.map(t => (
                      <Pressable
                        key={t.key}
                        style={[
                          styles.emojiCircle,
                          symptomType === t.key && styles.emojiCircleActive,
                        ]}
                        onPress={() => setSymptomType(t.key)}
                        accessibilityLabel={t.label}
                      >
                        <Text style={styles.emoji}>{t.emoji}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.selectedLabel}>{SYMPTOM_TYPES.find(t => t.key === symptomType)?.label}</Text>
                  <Text style={styles.sectionTitle}>Severity</Text>
                  <View style={styles.severityRowImproved}>
                    {SEVERITIES.map(s => (
                      <Pressable
                        key={s.key}
                        style={[styles.severityPill, severity === s.key && styles.severityPillActive]}
                        onPress={() => setSeverity(s.key)}
                        accessibilityLabel={s.label}
                      >
                        <Text style={[styles.severityPillText, severity === s.key && styles.severityPillTextActive]}>{s.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
              <Text style={styles.sectionTitle}>Time</Text>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSpacing]}
                onPress={() => setPickerMode(true)}
                accessibilityLabel="Edit time"
              >
                <Text style={styles.modalButtonPrimaryText}>Time: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </Pressable>
              <DateTimePickerModal
                isVisible={pickerMode}
                mode="time"
                date={time}
                onConfirm={date => { setTime(date); setPickerMode(false); }}
                onCancel={() => setPickerMode(false)}
                is24Hour={true}
              />
              <Text style={styles.sectionTitle}>Note (optional)</Text>
              <View style={styles.fullWidthSection}>
                <TextInput
                  style={styles.noteInput}
                  numberOfLines={1}
                  onChangeText={setNote}
                  value={note}
                  placeholder={mode === 'meal' ? 'e.g. after exercise, before meds' : 'e.g. after exercise, before meds'}
                  accessibilityLabel="Log note input"
                />
              </View>
              <View style={styles.modalActions}>
                <Pressable style={[styles.modalButton, styles.modalButtonDisabled, styles.modalButtonRightSpacing]} onPress={onCancel} accessibilityLabel="Cancel">
                  <Text style={styles.modalButtonDisabledText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.modalButtonLeftSpacing]} onPress={handleSave} accessibilityLabel="Save log entry">
                  <Text style={styles.modalButtonPrimaryText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: 24,
    width: 320,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.text,
    alignSelf: 'flex-start',
  },
  modalButtonSpacing: {
    marginBottom: 12,
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dietTypeRow: { flexDirection: 'row', marginBottom: 8 },
  dietTypeButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.regular,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  dietTypeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  dietTypeText: { color: theme.colors.textSecondary, fontWeight: 'bold' },
  dietTypeTextActive: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 12, backgroundColor: '#fff', width: 120 },
  emojiRowImproved: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  emojiCircle: {
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  emojiCircleActive: {
    borderColor: theme.colors.primary,
  },
  emoji: {
    fontSize: 20,
    textAlign: 'center',
  },
  selectedLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
    alignSelf: 'center',
  },
  severityRowImproved: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  severityPill: {
    backgroundColor: 'transparent',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  severityPillActive: {
    borderColor: theme.colors.primary,
  },
  severityPillText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  severityPillTextActive: {
    color: theme.colors.primary,
  },
  noteInput: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: '#2d4d4d',
    backgroundColor: '#f8f8f8',
    minHeight: 40,
    width: '100%',
  },
  fullWidthSection: {
    width: '100%',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButtonDisabled: {
    backgroundColor: theme.colors.disabled,
    flex: 1,
  },
  modalButtonRightSpacing: {
    marginRight: 8,
  },
  modalButtonLeftSpacing: {
    flex: 1,
    marginLeft: 8,
  },
  modalButtonDisabledText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.regular,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

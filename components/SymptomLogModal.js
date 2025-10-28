import React from 'react';
import { Modal, View, Text, TextInput, Pressable, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { theme } from '../utils/theme';
import { SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';

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
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.content}>
              <Text style={styles.title}>Add Symptom</Text>

              <Text style={styles.label}>Symptom:</Text>
              <View style={styles.symptomGrid}>
                {SYMPTOM_TYPES.map(type => (
                  <Pressable
                    key={type.key}
                    style={[styles.symptomButton, symptomType === type.key && styles.symptomButtonActive]}
                    onPress={() => onSelectSymptom?.(type.key)}
                    accessibilityLabel={type.label}
                  >
                    <Text style={styles.symptomEmoji}>{type.emoji}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.selectedLabel}>
                {SYMPTOM_TYPES.find(t => t.key === symptomType)?.label}
              </Text>

              <Text style={styles.label}>Severity:</Text>
              <View style={styles.severityRow}>
                {SEVERITIES.map(level => (
                  <Pressable
                    key={level.key}
                    style={[styles.severityButton, severity === level.key && styles.severityButtonActive]}
                    onPress={() => onSelectSeverity?.(level.key)}
                    accessibilityLabel={level.label}
                  >
                    <Text style={[styles.severityText, severity === level.key && styles.severityTextActive]}>
                      {level.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Note (optional):</Text>
              <TextInput
                style={[styles.input, styles.inputSpacing]}
                numberOfLines={1}
                onChangeText={onChangeNote}
                value={note}
                placeholder="e.g. after exercise, before meds"
                accessibilityLabel="Symptom note input"
              />

              <Text style={styles.label}>Time:</Text>
              <Pressable
                style={[styles.primaryButton, styles.primaryButtonSpacing]}
                onPress={onOpenTimePicker}
                accessibilityLabel="Edit date and time"
              >
                <Text style={styles.primaryLabel}>
                  {time.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </Pressable>
              <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="datetime"
                date={time}
                onConfirm={date => onConfirmTime?.(date)}
                onCancel={onCloseTimePicker}
                is24Hour={true}
              />

              <Pressable style={styles.primaryButton} onPress={onSave} accessibilityLabel="Save symptom entry">
                <Text style={styles.primaryLabel}>Save</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, styles.cancelButton]}
                onPress={onCancel}
                accessibilityLabel="Cancel"
              >
                <Text style={[styles.primaryLabel, styles.cancelLabel]}>Cancel</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.large,
    padding: 24,
    width: 340,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.colors.text,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    color: '#4d6d6d',
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    paddingHorizontal: 8,
  },
  symptomButton: {
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  symptomButtonActive: {
    backgroundColor: '#eaf6f6',
    borderWidth: 2,
    borderColor: '#6bb3b6',
  },
  symptomEmoji: {
    fontSize: 20,
    textAlign: 'center',
  },
  selectedLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: '#2d4d4d',
    marginBottom: 12,
  },
  severityRow: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  severityButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.regular,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  severityButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  severityText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  severityTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#2d4d4d',
    backgroundColor: '#f8f8f8',
    width: '100%',
  },
  inputSpacing: {
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.regular,
    paddingVertical: 10,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonSpacing: {
    marginBottom: 12,
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    marginTop: 8,
  },
  cancelLabel: {
    color: '#2d4d4d',
  },
});

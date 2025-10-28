import React from 'react';
import { Modal, View, Text, TextInput, Pressable, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

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
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.content}>
              <Text style={styles.title}>Log Ketone</Text>

              <Text style={styles.label}>Value:</Text>
              <View style={styles.valueRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 0.7"
                  value={value}
                  onChangeText={onChangeValue}
                  accessibilityLabel="Ketone value input"
                />
                <Pressable
                  style={[styles.unitButton, unit === 'mmol/L' && styles.unitButtonActive, { marginRight: 4 }]}
                  onPress={() => onSelectUnit?.('mmol/L')}
                  accessibilityLabel="mmol/L"
                >
                  <Text style={[styles.unitText, unit === 'mmol/L' && styles.unitTextActive]}>mmol/L</Text>
                </Pressable>
                <Pressable
                  style={[styles.unitButton, unit === 'mg/dL' && styles.unitButtonActive]}
                  onPress={() => onSelectUnit?.('mg/dL')}
                  accessibilityLabel="mg/dL"
                >
                  <Text style={[styles.unitText, unit === 'mg/dL' && styles.unitTextActive]}>mg/dL</Text>
                </Pressable>
              </View>

              <Text style={styles.label}>Time:</Text>
              <Pressable
                style={[styles.primaryButton, { marginBottom: 12 }]}
                onPress={onSetTimeToNow}
                accessibilityLabel="Set time to now"
              >
                <Text style={styles.primaryButtonLabel}>
                  {time.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </Pressable>

              <Text style={styles.label}>Note (optional):</Text>
              <TextInput
                style={[styles.input, { marginBottom: 12 }]}
                placeholder="e.g. after exercise, before meds"
                value={note}
                onChangeText={onChangeNote}
                accessibilityLabel="Ketone note input"
              />

              <Pressable style={styles.primaryButton} onPress={onSave} accessibilityLabel="Save ketone entry">
                <Text style={styles.primaryButtonLabel}>Save</Text>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, styles.cancelButton]}
                onPress={onCancel}
                accessibilityLabel="Cancel"
              >
                <Text style={[styles.primaryButtonLabel, styles.cancelLabel]}>Cancel</Text>
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
    width: 320,
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
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
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
  unitButton: {
    flex: 0,
    minWidth: 72,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.regular,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  unitText: {
    color: theme.colors.text,
  },
  unitTextActive: {
    color: '#fff',
    fontWeight: '600',
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
  primaryButtonLabel: {
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

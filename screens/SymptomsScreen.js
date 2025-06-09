import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback, TextInput } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useLogs } from '../contexts/LogsContext';
import { SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';

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
      <Text style={styles.title}>Symptoms</Text>
      <View style={styles.card}>
        <Pressable style={[styles.modalButton, { marginBottom: 12 }]} onPress={() => setModalVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Symptom</Text>
        </Pressable>
        {todaysEntries.length === 0 ? (
          <Text style={styles.cardText}>No symptoms logged today.</Text>
        ) : (
          todaysEntries.map((entry, idx) => {
            const typeObj = SYMPTOM_TYPES.find(t => t.key === entry.type);
            return (
              <Pressable
                key={entry.id}
                onPress={() => handleEdit(symptomLog.findIndex(e => e.id === entry.id))}
                onLongPress={() => handleDelete(symptomLog.findIndex(e => e.id === entry.id))}
                style={{ paddingVertical: 6 }}
                accessibilityLabel={`Edit or delete symptom entry: ${typeObj ? typeObj.label : entry.type} at ${new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              >
                <View style={{ marginBottom: 2, alignItems: 'center' }}>
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
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Symptom:</Text>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  marginBottom: 8,
                  width: '100%',
                  paddingHorizontal: 8
                }}>
                  {SYMPTOM_TYPES.map(t => (
                    <Pressable
                      key={t.key}
                      style={[
                        {
                          borderRadius: 18,
                          width: 36,
                          height: 36,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: symptomType === t.key ? '#eaf6f6' : 'transparent',
                          borderWidth: symptomType === t.key ? 2 : 0,
                          borderColor: symptomType === t.key ? '#6bb3b6' : 'transparent'
                        }
                      ]}
                      onPress={() => setSymptomType(t.key)}
                      accessibilityLabel={t.label}
                    >
                      <Text style={{ fontSize: 20, textAlign: 'center' }}>{t.emoji}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={{ textAlign: 'center', fontSize: 16, color: '#2d4d4d', marginBottom: 12 }}>
                  {SYMPTOM_TYPES.find(t => t.key === symptomType)?.label}
                </Text>
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Severity:</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  {SEVERITIES.map(s => (
                    <Pressable
                      key={s.key}
                      style={[styles.foodTypeButton, severity === s.key && styles.foodTypeButtonActive]}
                      onPress={() => setSeverity(s.key)}
                      accessibilityLabel={s.label}
                    >
                      <Text style={{ fontSize: 16 }}>{s.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable
                  style={[styles.modalButton, { marginBottom: 12 }]}
                  onPress={() => setPickerMode(true)}
                  accessibilityLabel="Edit time"
                >
                  <Text style={{ color: '#fff' }}>Time: {symptomTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </Pressable>
                <DateTimePickerModal
                  isVisible={pickerMode}
                  mode="time"
                  date={symptomTime}
                  onConfirm={date => { setSymptomTime(date); setPickerMode(false); }}
                  onCancel={() => setPickerMode(false)}
                  is24Hour={true}
                />
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Note (optional):</Text>
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <TextInput
                    style={{
                      borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40
                    }}
                    numberOfLines={1}
                    onChangeText={setSymptomNote}
                    value={symptomNote}
                    placeholder="e.g. after exercise, before meds"
                    accessibilityLabel="Symptom note input"
                  />
                </View>
                <Pressable style={styles.modalButton} onPress={handleSave} accessibilityLabel="Save symptom entry">
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setModalVisible(false)} accessibilityLabel="Cancel">
                  <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Cancel</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eaf6f6',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d4d4d',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    color: '#4d6d6d',
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2d4d4d',
  },
  modalButton: {
    backgroundColor: '#6bb3b6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  foodTypeButton: {
    flex: 1,
    backgroundColor: '#eaf6f6',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6bb3b6',
  },
  foodTypeButtonActive: {
    backgroundColor: '#6bb3b6',
  },
  symptomLogEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  symptomLogTime: {
    fontSize: 13,
    color: '#4d6d6d',
    marginBottom: 2,
    maxWidth: 180,
    textAlign: 'center',
  },
  symptomLogNote: {
    fontSize: 13,
    color: '#6bb3b6',
    marginBottom: 2,
    maxWidth: 180,
    textAlign: 'center',
  },
}); 
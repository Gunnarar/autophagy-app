import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback, TextInput } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useLogs } from '../contexts/LogsContext';

export default function FastingScreen() {
  const { fastLog, setFastLog } = useLogs();
  const [modalVisible, setModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [fastStart, setFastStart] = useState(new Date());
  const [fastEnd, setFastEnd] = useState(new Date());
  const [fastNote, setFastNote] = useState('');
  const [pickerMode, setPickerMode] = useState(null); // 'start' | 'end' | null

  // Add or edit fast entry
  const handleSave = () => {
    const entry = {
      start: fastStart.toISOString(),
      end: fastEnd.toISOString(),
      note: fastNote,
      id: editIndex !== null ? fastLog[editIndex].id : Date.now(),
    };
    let updated;
    if (editIndex !== null) {
      updated = [...fastLog];
      updated[editIndex] = entry;
    } else {
      updated = [entry, ...fastLog];
    }
    setFastLog(updated);
    setModalVisible(false);
    setEditIndex(null);
    setFastStart(new Date());
    setFastEnd(new Date());
    setFastNote('');
  };

  // Edit entry
  const handleEdit = idx => {
    const entry = fastLog[idx];
    setEditIndex(idx);
    setFastStart(new Date(entry.start));
    setFastEnd(new Date(entry.end));
    setFastNote(entry.note);
    setModalVisible(true);
  };

  // Delete entry
  const handleDelete = idx => {
    const updated = [...fastLog];
    updated.splice(idx, 1);
    setFastLog(updated);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Fasting Log</Text>
      <View style={styles.card}>
        <Pressable style={[styles.modalButton, { marginBottom: 12 }]} onPress={() => setModalVisible(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Fast</Text>
        </Pressable>
        {fastLog.length === 0 ? (
          <Text style={styles.cardText}>No fasts logged.</Text>
        ) : (
          fastLog.map((entry, idx) => (
            <Pressable
              key={entry.id}
              onPress={() => handleEdit(idx)}
              onLongPress={() => handleDelete(idx)}
              style={{ paddingVertical: 6 }}
              accessibilityLabel={`Edit or delete fast entry: ${new Date(entry.start).toLocaleString()} - ${new Date(entry.end).toLocaleString()}`}
            >
              <View style={{ marginBottom: 2 }}>
                <Text style={styles.cardText}>
                  Start: {new Date(entry.start).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.cardText}>
                  End: {new Date(entry.end).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </Text>
                {entry.note ? (
                  <Text style={styles.cardText}>Note: {entry.note}</Text>
                ) : null}
              </View>
            </Pressable>
          ))
        )}
      </View>
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{editIndex !== null ? 'Edit Fast' : 'Add Fast'}</Text>
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Start Time:</Text>
                <Pressable style={[styles.modalButton, { marginBottom: 8 }]} onPress={() => setPickerMode('start')}>
                  <Text style={{ color: '#fff' }}>{fastStart.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</Text>
                </Pressable>
                <DateTimePickerModal
                  isVisible={pickerMode === 'start'}
                  mode="datetime"
                  date={fastStart}
                  onConfirm={date => { setFastStart(date); setPickerMode(null); }}
                  onCancel={() => setPickerMode(null)}
                  is24Hour={true}
                />
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>End Time:</Text>
                <Pressable style={[styles.modalButton, { marginBottom: 8 }]} onPress={() => setPickerMode('end')}>
                  <Text style={{ color: '#fff' }}>{fastEnd.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</Text>
                </Pressable>
                <DateTimePickerModal
                  isVisible={pickerMode === 'end'}
                  mode="datetime"
                  date={fastEnd}
                  onConfirm={date => { setFastEnd(date); setPickerMode(null); }}
                  onCancel={() => setPickerMode(null)}
                  is24Hour={true}
                />
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Note (optional):</Text>
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <TextInput
                    style={{ borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40 }}
                    numberOfLines={1}
                    onChangeText={setFastNote}
                    value={fastNote}
                    placeholder="e.g. long fast, interrupted, etc."
                    accessibilityLabel="Fast note input"
                  />
                </View>
                <Pressable style={styles.modalButton} onPress={handleSave} accessibilityLabel="Save fast entry">
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
}); 
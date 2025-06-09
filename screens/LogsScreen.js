import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback, TextInput } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useLogs } from '../contexts/LogsContext';
import { SYMPTOM_TYPES } from '../utils/constants';

export default function LogsScreen() {
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const { foodLog, setFoodLog, symptomLog, setSymptomLog, fastLog, setFastLog } = useLogs();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'meal', 'snack', 'symptom', 'fast'
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [modalData, setModalData] = useState({});
  const [pickerMode, setPickerMode] = useState(null); // for fast/symptom time pickers

  // Helper to open modal for add
  const openAddModal = (type) => {
    if (type === 'food') {
      setModalType('meal');
      setModalMode('add');
      setModalData({ type: 'meal', time: new Date(), note: '' });
    } else if (type === 'symptom') {
      setModalType('symptom');
      setModalMode('add');
      setModalData({ type: 'tremor', severity: 'mild', time: new Date(), note: '' });
    } else if (type === 'fast') {
      setModalType('fast');
      setModalMode('add');
      setModalData({ start: new Date(), end: new Date(), note: '' });
    }
    setModalVisible(true);
  };
  // Helper to open modal for edit
  const openEditModal = (entry) => {
    setModalType(entry.logType === 'food' ? entry.type : entry.logType);
    setModalMode('edit');
    setModalData({ ...entry });
    setModalVisible(true);
  };
  // Save handler
  const handleSave = () => {
    if (modalType === 'meal' || modalType === 'snack') {
      const time = modalData.time instanceof Date ? modalData.time : (modalData.time ? new Date(modalData.time) : new Date());
      const entry = {
        ...modalData,
        time: time.toISOString(),
        id: modalMode === 'edit' ? modalData.id : Date.now(),
        logType: 'food',
      };
      let updated = [...foodLog];
      if (modalMode === 'edit') {
        const idx = foodLog.findIndex(e => e.id === entry.id);
        updated[idx] = entry;
      } else {
        updated = [entry, ...foodLog];
      }
      setFoodLog(updated);
    } else if (modalType === 'symptom') {
      const time = modalData.time instanceof Date ? modalData.time : (modalData.time ? new Date(modalData.time) : new Date());
      const entry = {
        ...modalData,
        time: time.toISOString(),
        id: modalMode === 'edit' ? modalData.id : Date.now(),
        logType: 'symptom',
      };
      let updated = [...symptomLog];
      if (modalMode === 'edit') {
        const idx = symptomLog.findIndex(e => e.id === entry.id);
        updated[idx] = entry;
      } else {
        updated = [entry, ...symptomLog];
      }
      setSymptomLog(updated);
    } else if (modalType === 'fast') {
      const start = modalData.start instanceof Date ? modalData.start : (modalData.start ? new Date(modalData.start) : new Date());
      const end = modalData.end instanceof Date ? modalData.end : (modalData.end ? new Date(modalData.end) : new Date());
      const entry = {
        ...modalData,
        start: start.toISOString(),
        end: end.toISOString(),
        id: modalMode === 'edit' ? modalData.id : Date.now(),
        logType: 'fast',
      };
      let updated = [...fastLog];
      if (modalMode === 'edit') {
        const idx = fastLog.findIndex(e => e.id === entry.id);
        updated[idx] = entry;
      } else {
        updated = [entry, ...fastLog];
      }
      setFastLog(updated);
    }
    setModalVisible(false);
    setModalData({});
  };
  // Delete handler
  const handleDelete = () => {
    if (modalType === 'meal' || modalType === 'snack') {
      setFoodLog(foodLog.filter(e => e.id !== modalData.id));
    } else if (modalType === 'symptom') {
      setSymptomLog(symptomLog.filter(e => e.id !== modalData.id));
    } else if (modalType === 'fast') {
      setFastLog(fastLog.filter(e => e.id !== modalData.id));
    }
    setModalVisible(false);
    setModalData({});
  };
  // Duplicate handler
  const handleDuplicate = () => {
    if (modalType === 'meal' || modalType === 'snack') {
      const entry = {
        ...modalData,
        time: new Date().toISOString(),
        id: Date.now(),
        logType: 'food',
      };
      setFoodLog([entry, ...foodLog]);
    } else if (modalType === 'symptom') {
      const entry = {
        ...modalData,
        time: new Date().toISOString(),
        id: Date.now(),
        logType: 'symptom',
      };
      setSymptomLog([entry, ...symptomLog]);
    } else if (modalType === 'fast') {
      const entry = {
        ...modalData,
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        id: Date.now(),
        logType: 'fast',
      };
      setFastLog([entry, ...fastLog]);
    }
    setModalVisible(false);
    setModalData({});
  };

  useEffect(() => {
    if (foodLog.length > 0 && foodLog.some(e => !e.time)) {
      setFoodLog(foodLog.map(e => ({
        ...e,
        time: e.time || (e.id ? new Date(e.id).toISOString() : new Date().toISOString()),
      })));
    }
  }, [foodLog, setFoodLog]);

  const allLogs = [
    ...foodLog.map(e => ({ ...e, logType: 'food' })),
    ...symptomLog.map(e => ({ ...e, logType: 'symptom' })),
    ...fastLog.map(e => ({ ...e, logType: 'fast' })),
  ];

  const today = new Date().toISOString().slice(0, 10);
  const logs = allLogs.filter(e => {
    if (filterType !== 'all' && e.logType !== filterType) return false;
    const dateStr = e.time || e.start;
    if (!dateStr) return false;
    if (filterDate === 'today') return dateStr.slice(0, 10) === today;
    return true;
  });
  logs.sort((a, b) => {
    const aDate = new Date(a.time || a.start);
    const bDate = new Date(b.time || b.start);
    return bDate - aDate;
  });

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Logs</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Pressable style={[styles.quickActionButton, { marginRight: 8 }]} onPress={() => openAddModal('food')}>
          <Text style={styles.quickActionText}>🍽️ Add Food</Text>
        </Pressable>
        <Pressable style={[styles.quickActionButton, { marginRight: 8 }]} onPress={() => openAddModal('symptom')}>
          <Text style={styles.quickActionText}>🩺 Add Symptom</Text>
        </Pressable>
        <Pressable style={styles.quickActionButton} onPress={() => openAddModal('fast')}>
          <Text style={styles.quickActionText}>⏱️ Add Fast</Text>
        </Pressable>
      </View>
      {logs.length === 0 ? (
        <Text style={styles.cardText}>No log entries.</Text>
      ) : (
        logs.map(entry => (
          <Pressable key={entry.id} style={styles.card} onPress={() => openEditModal(entry)} accessibilityLabel="Edit log entry">
            {entry.logType === 'food' ? (
              <Text style={styles.cardText}>
                {entry.type === 'meal' ? '🍽️ Meal' : '🥪 Snack'} at {new Date(entry.time).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}{entry.note ? ` — ${entry.note}` : ''}
              </Text>
            ) : entry.logType === 'symptom' ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.symptomLogEmoji}>
                  {(SYMPTOM_TYPES.find(t => t.key === entry.type) || { emoji: '' }).emoji}
                </Text>
                <Text style={styles.symptomLogTime}>{entry.severity} — {new Date(entry.time).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</Text>
                {entry.note ? (
                  <Text style={styles.symptomLogNote}>{entry.note}</Text>
                ) : null}
              </View>
            ) : entry.logType === 'fast' ? (
              <View>
                <Text style={styles.cardText}>
                  ⏱️ Fast: {new Date(entry.start).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })} - {new Date(entry.end).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </Text>
                {entry.note ? <Text style={styles.cardText}>Note: {entry.note}</Text> : null}
              </View>
            ) : (
              <Text style={styles.cardText}>
                📝 Log: {entry.id} {entry.note ? `— ${entry.note}` : ''}
              </Text>
            )}
          </Pressable>
        ))
      )}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {modalType === 'meal' || modalType === 'snack'
                    ? (modalMode === 'edit' ? 'Edit Food Entry' : 'Add Food Entry')
                    : modalType === 'symptom'
                      ? (modalMode === 'edit' ? 'Edit Symptom' : 'Add Symptom')
                      : modalType === 'fast'
                        ? (modalMode === 'edit' ? 'Edit Fast' : 'Add Fast')
                        : (modalMode === 'edit' ? 'Edit Entry' : 'Add Entry')
                  }
                </Text>
                {(modalType === 'meal' || modalType === 'snack') && (
                  <>
                    <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Type:</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                      <Pressable style={[styles.foodTypeButton, modalType === 'meal' && styles.foodTypeButtonActive]} onPress={() => setModalType('meal')} accessibilityLabel="Meal">
                        <Text style={{ fontSize: 20 }}>🍽️ Meal</Text>
                      </Pressable>
                      <Pressable style={[styles.foodTypeButton, modalType === 'snack' && styles.foodTypeButtonActive]} onPress={() => setModalType('snack')} accessibilityLabel="Snack">
                        <Text style={{ fontSize: 20 }}>🥪 Snack</Text>
                      </Pressable>
                    </View>
                    <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Time:</Text>
                    <Pressable
                      style={[styles.modalButton, { marginBottom: 12 }]}
                      onPress={() => setPickerMode('foodTime')}
                      accessibilityLabel="Edit date and time"
                    >
                      <Text style={{ color: '#fff' }}>
                        {(modalData.time instanceof Date ? modalData.time : new Date(modalData.time)).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </Pressable>
                    <DateTimePickerModal
                      isVisible={pickerMode === 'foodTime'}
                      mode="datetime"
                      date={modalData.time instanceof Date ? modalData.time : new Date(modalData.time)}
                      onConfirm={date => { setModalData(prev => ({ ...prev, time: date })); setPickerMode(null); }}
                      onCancel={() => setPickerMode(null)}
                      is24Hour={true}
                    />
                  </>
                )}
                {modalType === 'symptom' ? (
                  <>
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
                              backgroundColor: modalType === t.key ? '#eaf6f6' : 'transparent',
                              borderWidth: modalType === t.key ? 2 : 0,
                              borderColor: modalType === t.key ? '#6bb3b6' : 'transparent'
                            }
                          ]}
                          onPress={() => setModalType(t.key)}
                          accessibilityLabel={t.label}
                        >
                          <Text style={{ fontSize: 20, textAlign: 'center' }}>{t.emoji}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                ) : null}
                {modalType === 'fast' && (
                  <>
                    <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Start Time:</Text>
                    <Pressable style={[styles.modalButton, { marginBottom: 8 }]} onPress={() => setPickerMode('start')}>
                      <Text style={{ color: '#fff' }}>{(modalData.start instanceof Date ? modalData.start : new Date(modalData.start)).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    </Pressable>
                    <DateTimePickerModal
                      isVisible={pickerMode === 'start'}
                      mode="datetime"
                      date={modalData.start instanceof Date ? modalData.start : new Date(modalData.start)}
                      onConfirm={date => { setModalData(prev => ({ ...prev, start: date })); setPickerMode(null); }}
                      onCancel={() => setPickerMode(null)}
                      is24Hour={true}
                    />
                    <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>End Time:</Text>
                    <Pressable style={[styles.modalButton, { marginBottom: 8 }]} onPress={() => setPickerMode('end')}>
                      <Text style={{ color: '#fff' }}>{(modalData.end instanceof Date ? modalData.end : new Date(modalData.end)).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    </Pressable>
                    <DateTimePickerModal
                      isVisible={pickerMode === 'end'}
                      mode="datetime"
                      date={modalData.end instanceof Date ? modalData.end : new Date(modalData.end)}
                      onConfirm={date => { setModalData(prev => ({ ...prev, end: date })); setPickerMode(null); }}
                      onCancel={() => setPickerMode(null)}
                      is24Hour={true}
                    />
                  </>
                )}
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Note (optional):</Text>
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <TextInput
                    style={{ borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40 }}
                    numberOfLines={1}
                    onChangeText={text => setModalData(prev => ({ ...prev, note: text }))}
                    value={modalData.note}
                    placeholder="e.g. high carb, keto, protein shake"
                    accessibilityLabel="Food note input"
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                  {modalMode === 'edit' && (
                    <>
                      <Pressable style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={handleDelete} accessibilityLabel="Delete">
                        <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Delete</Text>
                      </Pressable>
                      <Pressable style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={handleDuplicate} accessibilityLabel="Duplicate">
                        <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Duplicate</Text>
                      </Pressable>
                    </>
                  )}
                  <Pressable style={styles.modalButton} onPress={handleSave} accessibilityLabel="Save">
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{modalMode === 'edit' ? 'Update' : 'Add'}</Text>
                  </Pressable>
                </View>
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
  quickActionButton: {
    flex: 1,
    backgroundColor: '#6bb3b6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 
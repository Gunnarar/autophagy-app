import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback, TextInput, Alert, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useLogs } from '../contexts/LogsContext';
import { formatTimeHM, SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LogsScreen() {
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const { foodLog, setFoodLog, symptomLog, setSymptomLog } = useLogs();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'meal', 'snack', 'symptom'
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [modalData, setModalData] = useState({});
  const [pickerMode, setPickerMode] = useState(null); // for fast/symptom time pickers
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLogType, setEditLogType] = useState(null); // 'food' or 'symptom'
  const [editLog, setEditLog] = useState(null);
  const [editTime, setEditTime] = useState(new Date());
  const [editNote, setEditNote] = useState('');
  const [editFoodType, setEditFoodType] = useState('meal');
  const [editSymptomType, setEditSymptomType] = useState('tremor');
  const [editSeverity, setEditSeverity] = useState('mild');
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);

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
  ];

  const today = new Date().toISOString().slice(0, 10);
  const logs = allLogs.filter(e => {
    if (filterType !== 'all' && e.logType !== filterType) return false;
    const dateStr = e.time;
    if (!dateStr) return false;
    if (filterDate === 'today') return dateStr.slice(0, 10) === today;
    return true;
  });
  logs.sort((a, b) => {
    const aDate = new Date(a.time);
    const bDate = new Date(b.time);
    return bDate - aDate;
  });

  const sortedFood = [...foodLog].sort((a, b) => new Date(a.time) - new Date(b.time));
  const fastingPeriods = [];
  if (sortedFood.length > 0) {
    for (let i = 0; i < sortedFood.length; i++) {
      const start = i === 0 ? null : new Date(sortedFood[i - 1].time);
      const end = new Date(sortedFood[i].time);
      const endFood = sortedFood[i];
      const symptoms = symptomLog.filter(s => {
        const t = new Date(s.time);
        return (!start || t > start) && t <= end;
      });
      fastingPeriods.push({ start, end, symptoms, endFood });
    }
    // Current fasting period: from last food log to now
    const lastFood = new Date(sortedFood[sortedFood.length - 1].time);
    const symptoms = symptomLog.filter(s => new Date(s.time) > lastFood);
    fastingPeriods.push({ start: lastFood, end: new Date(), symptoms, endFood: null });
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#101c23', '#182c34']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.title}>Logs</Text>
        {/* Pill-style filter */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
          {[
            { key: 'all', label: 'All', icon: <Ionicons name="list" size={18} color={filterType === 'all' ? '#fff' : '#6bb3b6'} /> },
            { key: 'food', label: 'Food', icon: <MaterialCommunityIcons name="food" size={18} color={filterType === 'food' ? '#fff' : '#6bb3b6'} /> },
            { key: 'symptom', label: 'Symptoms', icon: <MaterialCommunityIcons name="stethoscope" size={18} color={filterType === 'symptom' ? '#fff' : '#6bb3b6'} /> },
            { key: 'fasting', label: 'Fasting', icon: <MaterialCommunityIcons name="timer-sand" size={18} color={filterType === 'fasting' ? '#fff' : '#6bb3b6'} /> },
          ].map(pill => (
            <Pressable
              key={pill.key}
              onPress={() => setFilterType(pill.key)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: filterType === pill.key ? '#6bb3b6' : '#eaf6f6',
                borderColor: '#6bb3b6',
                borderWidth: 1,
                borderRadius: 20,
                paddingVertical: 6,
                paddingHorizontal: 16,
                marginHorizontal: 4,
              }}
              accessibilityLabel={`Show ${pill.label} logs`}
            >
              {pill.icon}
              <Text style={{ color: filterType === pill.key ? '#fff' : '#6bb3b6', fontWeight: 'bold', marginLeft: 6 }}>{pill.label}</Text>
            </Pressable>
          ))}
        </View>
        {fastingPeriods
          .filter((period, idx) => !(idx === 0 && period.start === null))
          .reverse()
          .map((period, idx, arr) => {
            let highlight = false;
            if (filterType === 'food' && period.endFood) highlight = true;
            if (filterType === 'symptom' && period.symptoms && period.symptoms.length > 0) highlight = true;
            if (filterType === 'fasting' && idx === 0) highlight = true; // latest/ongoing fast
            // For 'all', no highlight
            return (
              <View
                key={idx}
                style={[
                  styles.card,
                  { borderLeftWidth: 6, borderLeftColor: highlight ? '#e67e22' : '#6bb3b6', marginBottom: 24, backgroundColor: highlight ? '#fffbe9' : '#fff' }
                ]}
              >
                <Text style={styles.cardTitle}>
                  {period.endFood
                    ? `Fasting: ${period.start ? new Date(period.start).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'App Start'} - ${new Date(period.end).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })} ended with: ${period.endFood.type === 'meal' ? 'Meal' : 'Snack'}${period.endFood.note ? ' — ' + period.endFood.note : ''}`
                    : `Ongoing fast, started at ${period.start ? new Date(period.start).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'App Start'}`
                  }
                </Text>
                <Text style={styles.cardText}>Duration: {formatTimeHM(Math.floor((period.end - (period.start || period.end)) / 1000))}</Text>
                {period.symptoms.length > 0 ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ fontWeight: 'bold', color: '#2d4d4d', marginBottom: 4 }}>Symptoms:</Text>
                    {period.symptoms.map(s => (
                      <Pressable key={s.id} onPress={() => {
                        setEditLogType('symptom');
                        setEditLog(s);
                        setEditTime(new Date(s.time));
                        setEditNote(s.note || '');
                        setEditSymptomType(s.type);
                        setEditSeverity(s.severity);
                        setEditModalVisible(true);
                      }}>
                        <Text style={styles.cardText}>
                          {SYMPTOM_TYPES.find(t => t.key === s.type)?.emoji} {s.type} ({s.severity}) at {new Date(s.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{s.note ? ` — ${s.note}` : ''}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.cardText}>No symptoms logged during this period.</Text>
                )}
              </View>
            );
          })}
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
                                backgroundColor: modalData.type === t.key ? '#eaf6f6' : 'transparent',
                                borderWidth: modalData.type === t.key ? 2 : 0,
                                borderColor: modalData.type === t.key ? '#6bb3b6' : 'transparent'
                              }
                            ]}
                            onPress={() => setModalData(prev => ({ ...prev, type: t.key }))}
                            accessibilityLabel={t.label}
                          >
                            <Text style={{ fontSize: 20, textAlign: 'center' }}>{t.emoji}</Text>
                          </Pressable>
                        ))}
                      </View>
                      <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Time:</Text>
                      <Pressable
                        style={[styles.modalButton, { marginBottom: 12 }]}
                        onPress={() => setPickerMode('symptomTime')}
                        accessibilityLabel="Edit time"
                      >
                        <Text style={{ color: '#fff' }}>
                          {(modalData.time instanceof Date ? modalData.time : new Date(modalData.time)).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                      </Pressable>
                      <DateTimePickerModal
                        isVisible={pickerMode === 'symptomTime'}
                        mode="datetime"
                        date={modalData.time instanceof Date ? modalData.time : new Date(modalData.time)}
                        onConfirm={date => { setModalData(prev => ({ ...prev, time: date })); setPickerMode(null); }}
                        onCancel={() => setPickerMode(null)}
                        is24Hour={true}
                      />
                    </>
                  ) : null}
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
        <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit {editLogType === 'food' ? 'Food' : 'Symptom'} Log</Text>
                  {editLogType === 'food' ? (
                    <>
                      <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Type:</Text>
                      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                        <Pressable style={[styles.foodTypeButton, editFoodType === 'meal' && styles.foodTypeButtonActive]} onPress={() => setEditFoodType('meal')} accessibilityLabel="Meal">
                          <Text style={{ fontSize: 20 }}>🍽️ Meal</Text>
                        </Pressable>
                        <Pressable style={[styles.foodTypeButton, editFoodType === 'snack' && styles.foodTypeButtonActive]} onPress={() => setEditFoodType('snack')} accessibilityLabel="Snack">
                          <Text style={{ fontSize: 20 }}>🥪 Snack</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Symptom:</Text>
                      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        {SYMPTOM_TYPES.map(t => (
                          <Pressable
                            key={t.key}
                            style={[
                              styles.foodTypeButton,
                              editSymptomType === t.key && styles.foodTypeButtonActive,
                            ]}
                            onPress={() => setEditSymptomType(t.key)}
                            accessibilityLabel={t.label}
                          >
                            <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
                          </Pressable>
                        ))}
                      </View>
                      <Text style={{ textAlign: 'center', fontSize: 16, color: '#2d4d4d', marginBottom: 12 }}>
                        {SYMPTOM_TYPES.find(t => t.key === editSymptomType)?.label}
                      </Text>
                      <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Severity:</Text>
                      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                        {SEVERITIES.map(s => (
                          <Pressable
                            key={s.key}
                            style={[styles.foodTypeButton, editSeverity === s.key && styles.foodTypeButtonActive]}
                            onPress={() => setEditSeverity(s.key)}
                            accessibilityLabel={s.label}
                          >
                            <Text style={{ fontSize: 16 }}>{s.label}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </>
                  )}
                  <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Time:</Text>
                  <Pressable style={[styles.modalButton, { marginBottom: 12 }]} onPress={() => setShowEditTimePicker(true)}>
                    <Text style={{ color: '#fff' }}>{editTime.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</Text>
                  </Pressable>
                  <DateTimePickerModal
                    isVisible={showEditTimePicker}
                    mode="datetime"
                    date={editTime}
                    onConfirm={date => { setEditTime(date); setShowEditTimePicker(false); }}
                    onCancel={() => setShowEditTimePicker(false)}
                    is24Hour={true}
                  />
                  <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Note (optional):</Text>
                  <View style={{ width: '100%', marginBottom: 16 }}>
                    <TextInput
                      style={{ borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40 }}
                      numberOfLines={1}
                      onChangeText={setEditNote}
                      value={editNote}
                      placeholder="e.g. high carb, before meds, etc."
                      accessibilityLabel="Log note input"
                    />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                    <Pressable style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={() => {
                      // Delete log
                      if (editLogType === 'food') {
                        setFoodLog(foodLog.filter(e => e.id !== editLog.id));
                      } else {
                        setSymptomLog(symptomLog.filter(e => e.id !== editLog.id));
                      }
                      setEditModalVisible(false);
                    }} accessibilityLabel="Delete">
                      <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Delete</Text>
                    </Pressable>
                    <Pressable style={styles.modalButton} onPress={() => {
                      // Save changes
                      if (editLogType === 'food') {
                        setFoodLog(foodLog.map(e => e.id === editLog.id ? {
                          ...e,
                          type: editFoodType,
                          time: editTime.toISOString(),
                          note: editNote,
                        } : e));
                      } else {
                        setSymptomLog(symptomLog.map(e => e.id === editLog.id ? {
                          ...e,
                          type: editSymptomType,
                          severity: editSeverity,
                          time: editTime.toISOString(),
                          note: editNote,
                        } : e));
                      }
                      setEditModalVisible(false);
                    }} accessibilityLabel="Save">
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                    </Pressable>
                  </View>
                  <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setEditModalVisible(false)} accessibilityLabel="Cancel">
                    <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Cancel</Text>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d4d4d',
  },
}); 
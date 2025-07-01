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
  const [editFastModalVisible, setEditFastModalVisible] = useState(false);
  const [editFast, setEditFast] = useState(null);
  const [editFastStart, setEditFastStart] = useState(new Date());
  const [editFastEnd, setEditFastEnd] = useState(new Date());
  const [editFastNote, setEditFastNote] = useState('');
  const [showEditFastStartPicker, setShowEditFastStartPicker] = useState(false);
  const [showEditFastEndPicker, setShowEditFastEndPicker] = useState(false);

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
                shadowColor: filterType === pill.key ? '#6bb3b6' : undefined,
                shadowOpacity: filterType === pill.key ? 0.15 : 0,
                shadowRadius: filterType === pill.key ? 6 : 0,
                elevation: filterType === pill.key ? 2 : 0,
              }}
            >
              {pill.icon}
              <Text style={{ color: filterType === pill.key ? '#fff' : '#6bb3b6', fontWeight: 'bold', marginLeft: 6 }}>{pill.label}</Text>
            </Pressable>
          ))}
        </View>
        {/* Empty state for no logs */}
        {logs.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#6bb3b6', fontSize: 18, fontWeight: 'bold' }}>No logs yet</Text>
            <Text style={{ color: '#4d6d6d', fontSize: 16, marginTop: 8 }}>Tap + to add your first log!</Text>
          </View>
        )}
        {/* Log list */}
        {logs.map((entry, idx) => (
          <View
            key={entry.id}
            style={{
              ...styles.card,
              borderLeftWidth: 6,
              borderLeftColor:
                filterType === 'all'
                  ? '#6bb3b6'
                  : filterType === entry.logType
                  ? '#89ce00'
                  : '#eaf6f6',
              backgroundColor:
                filterType === 'all'
                  ? '#fff'
                  : filterType === entry.logType
                  ? '#eaf6f6'
                  : '#fff',
            }}
          >
            <Text style={styles.cardTitle}>
              {entry.logType === 'food' ? 'Meal' : SYMPTOM_TYPES[entry.type] || entry.type}
              {'  '}
              <Text style={{ color: '#4d6d6d', fontWeight: 'normal', fontSize: 14 }}>
                {new Date(entry.time).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
              </Text>
              {/* Fat red X for carb meals */}
              {entry.logType === 'food' && entry.isCarb ? (
                <MaterialCommunityIcons name="close-circle" size={22} color="#e74c3c" style={{ marginLeft: 8, marginBottom: -4 }} />
              ) : null}
            </Text>
            {/* Show pounds of meat if present */}
            {entry.pounds ? (
              <Text style={styles.cardText}>Pounds of Meat: {entry.pounds}</Text>
            ) : null}
            {/* Show general note if present */}
            {entry.note ? (
              <Text style={styles.cardText}>Note: {entry.note}</Text>
            ) : null}
            {entry.logType === 'symptom' && (
              <Text style={styles.cardText}>Severity: {SEVERITIES[entry.severity] || entry.severity}</Text>
            )}
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <Pressable onPress={() => { setEditLogType(entry.logType); setEditLog(entry); setEditModalVisible(true); }} style={[styles.modalButton, { marginRight: 8 }]} accessibilityLabel="Edit log">
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => { setEditLogType(entry.logType); setEditLog(entry); setEditModalVisible(true); }} style={[styles.modalButton, { backgroundColor: '#ccc' }]} accessibilityLabel="Delete log">
                <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
        {/* Empty state for no symptoms (if filter is symptom) */}
        {filterType === 'symptom' && logs.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#6bb3b6', fontSize: 18, fontWeight: 'bold' }}>No symptoms logged yet</Text>
            <Text style={{ color: '#4d6d6d', fontSize: 16, marginTop: 8 }}>Tap + to add your first symptom!</Text>
          </View>
        )}
      </ScrollView>
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
      <Modal visible={editFastModalVisible} transparent animationType="fade" onRequestClose={() => setEditFastModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setEditFastModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Fast</Text>
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Start Time:</Text>
                <Pressable style={[styles.modalButton, { marginBottom: 8 }]} onPress={() => setShowEditFastStartPicker(true)}>
                  <Text style={{ color: '#fff' }}>{editFastStart.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</Text>
                </Pressable>
                <DateTimePickerModal
                  isVisible={showEditFastStartPicker}
                  mode="datetime"
                  date={editFastStart}
                  onConfirm={date => { setEditFastStart(date); setShowEditFastStartPicker(false); }}
                  onCancel={() => setShowEditFastStartPicker(false)}
                  is24Hour={true}
                />
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>End Time:</Text>
                <Pressable style={[styles.modalButton, { marginBottom: 8 }]} onPress={() => setShowEditFastEndPicker(true)}>
                  <Text style={{ color: '#fff' }}>{editFastEnd.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</Text>
                </Pressable>
                <DateTimePickerModal
                  isVisible={showEditFastEndPicker}
                  mode="datetime"
                  date={editFastEnd}
                  onConfirm={date => { setEditFastEnd(date); setShowEditFastEndPicker(false); }}
                  onCancel={() => setShowEditFastEndPicker(false)}
                  is24Hour={true}
                />
                <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Note (optional):</Text>
                <View style={{ width: '100%', marginBottom: 16 }}>
                  <TextInput
                    style={{ borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40 }}
                    numberOfLines={1}
                    onChangeText={setEditFastNote}
                    value={editFastNote}
                    placeholder="e.g. completed, interrupted, etc."
                    accessibilityLabel="Fast note input"
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                  <Pressable style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={() => {
                    // Delete fast
                    if (editFast && editFast.endFood) {
                      // Remove fast by matching end time
                      setFoodLog(foodLog.filter(e => e.id !== editFast.endFood.id));
                    }
                    setEditFastModalVisible(false);
                  }} accessibilityLabel="Delete fast">
                    <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Delete</Text>
                  </Pressable>
                  <Pressable style={styles.modalButton} onPress={() => {
                    // Save changes
                    if (editFast && editFast.endFood) {
                      // Update food entry
                      setFoodLog(foodLog.map(e => e.id === editFast.endFood.id ? {
                        ...e,
                        time: editFastEnd.toISOString(),
                        note: editFastNote,
                      } : e));
                    }
                    // No explicit fastLog, so just update foodLog
                    setEditFastModalVisible(false);
                  }} accessibilityLabel="Save fast">
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                  </Pressable>
                </View>
                <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setEditFastModalVisible(false)} accessibilityLabel="Cancel">
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d4d4d',
  },
}); 
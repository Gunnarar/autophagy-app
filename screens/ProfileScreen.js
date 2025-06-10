import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback, ScrollView, Switch, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';

export default function ProfileScreen() {
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [fastingSchedule, setFastingSchedule] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [ketoneTracking, setKetoneTracking] = useState(false);
  const [reminders, setReminders] = useState([]); // [{id, type, time, message}]
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [reminderType, setReminderType] = useState('fasting');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const SCHEDULES = [
    { label: '12:12 (12h fast, 12h eating)', value: '12:12', color: '#6bb3b6' },
    { label: '14:10 (14h fast, 10h eating)', value: '14:10', color: '#4d6d6d' },
    { label: '16:8 (16h fast, 8h eating)', value: '16:8', color: '#2d4d4d' },
    { label: '18:6 (18h fast, 6h eating)', value: '18:6', color: '#1a2323' },
    { label: '20:4 (20h fast, 4h eating)', value: '20:4', color: '#000' },
  ];
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('fastingSchedule');
      if (stored) setFastingSchedule(stored);
      const dm = await AsyncStorage.getItem('darkMode');
      if (dm) setDarkMode(dm === 'true');
      const lt = await AsyncStorage.getItem('largeText');
      if (lt) setLargeText(lt === 'true');
      const kt = await AsyncStorage.getItem('ketoneTracking');
      if (kt) setKetoneTracking(kt === 'true');
      const storedReminders = await AsyncStorage.getItem('reminders');
      if (storedReminders) setReminders(JSON.parse(storedReminders));
    })();
  }, []);
  useEffect(() => {
    if (fastingSchedule) AsyncStorage.setItem('fastingSchedule', fastingSchedule);
    AsyncStorage.setItem('darkMode', String(darkMode));
    AsyncStorage.setItem('largeText', String(largeText));
    AsyncStorage.setItem('ketoneTracking', String(ketoneTracking));
  }, [fastingSchedule, darkMode, largeText, ketoneTracking]);
  useEffect(() => { AsyncStorage.setItem('reminders', JSON.stringify(reminders)); }, [reminders]);

  // Placeholder for scheduling notifications
  const scheduleReminder = async (type, time, message) => {
    // TODO: Implement notification scheduling with Expo Notifications
    // For now, just add to reminders list
    const id = Date.now().toString();
    setReminders([...reminders, { id, type, time, message }]);
    setReminderModalVisible(false);
  };
  const deleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
    // TODO: Cancel scheduled notification
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#101c23', '#182c34']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fasting Schedule</Text>
          <Text style={styles.cardText}>
            {fastingSchedule ? `Selected: ${SCHEDULES.find(s => s.value === fastingSchedule)?.label || fastingSchedule}` : 'No schedule selected'}
          </Text>
          <Pressable style={styles.modalButton} onPress={() => setScheduleModalVisible(true)} accessibilityLabel="Set fasting schedule">
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{fastingSchedule ? 'Change' : 'Set'} Schedule</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reminders & Notifications</Text>
          {reminders.length === 0 ? (
            <Text style={styles.cardText}>No reminders set.</Text>
          ) : (
            reminders.map(r => (
              <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.cardText}>{r.type} at {r.time} - {r.message}</Text>
                <Pressable onPress={() => deleteReminder(r.id)} style={{ marginLeft: 12 }} accessibilityLabel="Delete reminder">
                  <Text style={{ color: '#e74c3c', fontWeight: 'bold' }}>Delete</Text>
                </Pressable>
              </View>
            ))
          )}
          <Pressable style={styles.modalButton} onPress={() => setReminderModalVisible(true)} accessibilityLabel="Add reminder">
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Reminder</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personalization</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.cardText}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} accessibilityLabel="Toggle dark mode" style={{ marginLeft: 12 }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.cardText}>Large Text</Text>
            <Switch value={largeText} onValueChange={setLargeText} accessibilityLabel="Toggle large text" style={{ marginLeft: 12 }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.cardText}>Ketone Tracking</Text>
            <Switch value={ketoneTracking} onValueChange={setKetoneTracking} accessibilityLabel="Toggle ketone tracking" style={{ marginLeft: 12 }} />
          </View>
        </View>
        <Modal visible={reminderModalVisible} transparent animationType="fade" onRequestClose={() => setReminderModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setReminderModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add Reminder</Text>
                  <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Type:</Text>
                  <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    {['fasting', 'meal', 'medication'].map(type => (
                      <Pressable
                        key={type}
                        style={[styles.modalButton, { backgroundColor: reminderType === type ? '#6bb3b6' : '#eaf6f6', marginRight: 8 }]}
                        onPress={() => setReminderType(type)}
                        accessibilityLabel={`Set ${type} reminder`}
                      >
                        <Text style={{ color: reminderType === type ? '#fff' : '#2d4d4d', fontWeight: 'bold' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Time (HH:MM, 24h):</Text>
                  <TextInput
                    style={{ borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40, marginBottom: 8 }}
                    value={reminderTime}
                    onChangeText={setReminderTime}
                    placeholder="e.g. 20:00"
                    keyboardType="numeric"
                    accessibilityLabel="Reminder time input"
                  />
                  <Text style={{ alignSelf: 'flex-start', marginBottom: 4, color: '#4d6d6d' }}>Message (optional):</Text>
                  <TextInput
                    style={{ borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 8, padding: 8, fontSize: 16, color: '#2d4d4d', backgroundColor: '#f8f8f8', minHeight: 40, marginBottom: 8 }}
                    value={reminderMessage}
                    onChangeText={setReminderMessage}
                    placeholder="e.g. Start fasting now!"
                    accessibilityLabel="Reminder message input"
                  />
                  <Pressable style={styles.modalButton} onPress={() => {
                    if (!reminderTime.match(/^\d{2}:\d{2}$/)) {
                      Alert.alert('Invalid time', 'Please enter time as HH:MM (24h).');
                      return;
                    }
                    scheduleReminder(reminderType, reminderTime, reminderMessage);
                  }} accessibilityLabel="Save reminder">
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                  </Pressable>
                  <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setReminderModalVisible(false)} accessibilityLabel="Cancel">
                    <Text style={{ color: '#2d4d4d', fontWeight: 'bold' }}>Cancel</Text>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <Modal visible={scheduleModalVisible} transparent animationType="fade" onRequestClose={() => setScheduleModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setScheduleModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Pick a Fasting Schedule</Text>
                  {SCHEDULES.map(s => (
                    <Pressable
                      key={s.value}
                      style={[styles.modalButton, {
                        marginBottom: 12,
                        backgroundColor: fastingSchedule === s.value ? s.color : '#eaf6f6',
                      }]}
                      onPress={() => { setFastingSchedule(s.value); setScheduleModalVisible(false); }}
                      accessibilityLabel={`Select ${s.label}`}
                    >
                      <Text style={{ color: fastingSchedule === s.value ? '#fff' : '#2d4d4d', fontWeight: 'bold', fontSize: 18 }}>{s.label}</Text>
                    </Pressable>
                  ))}
                  <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginTop: 8 }]} onPress={() => setScheduleModalVisible(false)} accessibilityLabel="Cancel">
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2d4d4d',
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
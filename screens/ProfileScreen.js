import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [fastingSchedule, setFastingSchedule] = useState(null);
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
    })();
  }, []);
  useEffect(() => {
    if (fastingSchedule) AsyncStorage.setItem('fastingSchedule', fastingSchedule);
  }, [fastingSchedule]);
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
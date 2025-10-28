import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { FASTING_PROGRAMS } from '../utils/constants';
import { useUser } from '../contexts/UserContext';

// For now, assume user.completedFasts is an array of completed program keys
function getStatus(program, completedFasts) {
  if (completedFasts?.includes(program.key)) {return 'completed';}
  if (!program.unlockAfter) {return 'unlocked';}
  if (completedFasts?.includes(program.unlockAfter)) {return 'unlocked';}
  return 'locked';
}

export default function FastingProgramsScreen() {
  const { user, saveUser } = useUser();
  const completedFasts = user?.completedFasts || [];
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const scheduledFast = user?.scheduledFast;

  const handleSelect = (program) => {
    setSelectedProgram(program);
    setModalVisible(true);
  };

  const handleStartNow = async () => {
    await saveUser({
      ...user,
      scheduledFast: {
        programKey: selectedProgram.key,
        startTime: new Date().toISOString(),
      },
    });
    setModalVisible(false);
  };

  const handleSchedule = () => {
    setShowDatePicker(true);
  };

  const handleDatePicked = async (date) => {
    await saveUser({
      ...user,
      scheduledFast: {
        programKey: selectedProgram.key,
        startTime: date.toISOString(),
      },
    });
    setShowDatePicker(false);
    setModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Fasting Programs</Text>
      {scheduledFast && (
        <View style={styles.scheduledBox}>
          <Text style={styles.scheduledLabel}>Next Scheduled Fast:</Text>
          <Text style={styles.scheduledText}>
            {FASTING_PROGRAMS.find(p => p.key === scheduledFast.programKey)?.label || scheduledFast.programKey}
          </Text>
          <Text style={styles.scheduledText}>
            Start: {new Date(scheduledFast.startTime).toLocaleString()}
          </Text>
        </View>
      )}
      {FASTING_PROGRAMS.map(program => {
        const status = getStatus(program, completedFasts);
        const isSelected = user?.selectedFastingProgram === program.key;
        return (
          <TouchableOpacity
            key={program.key}
            style={[styles.programCard, status === 'locked' && styles.locked, isSelected && styles.selected]}
            disabled={status === 'locked'}
            onPress={() => handleSelect(program)}
          >
            <Text style={styles.programLabel}>{program.label}</Text>
            <Text style={styles.programDuration}>{program.duration} hours</Text>
            <Text style={styles.status}>
              {status === 'completed' ? '✓ Completed' : status === 'locked' ? '🔒 Locked' : isSelected ? 'Selected' : 'Unlocked'}
            </Text>
          </TouchableOpacity>
        );
      })}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Fast</Text>
            <Text style={styles.modalDesc}>Would you like to start your {selectedProgram?.label} now or schedule it for later?</Text>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <Button title="Start Now" onPress={handleStartNow} />
              <View style={{ width: 16 }} />
              <Button title="Schedule for Later" onPress={handleSchedule} />
            </View>
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#888" />
          </View>
        </View>
      </Modal>
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="datetime"
        onConfirm={handleDatePicked}
        onCancel={() => setShowDatePicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  scheduledBox: {
    backgroundColor: '#b3c7f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  scheduledLabel: { fontSize: 16, color: '#2d4d4d', fontWeight: 'bold' },
  scheduledText: { fontSize: 16, color: '#2d4d4d', marginTop: 2 },
  programCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6bb3b6',
  },
  locked: {
    backgroundColor: '#e0e0e0',
    borderColor: '#aaa',
  },
  selected: {
    borderColor: '#89ce00',
    backgroundColor: '#d9e4ff',
  },
  programLabel: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  programDuration: { fontSize: 16, color: '#4d6d6d', marginBottom: 8 },
  status: { fontSize: 14, color: '#6bb3b6', fontWeight: 'bold' },
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
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#2d4d4d' },
  modalDesc: { fontSize: 16, color: '#4d6d6d', marginBottom: 20, textAlign: 'center' },
});

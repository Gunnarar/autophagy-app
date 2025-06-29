import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// status: 'good' | 'warning' | 'bad'
// value: 0-1 (for gauge)
// icon: MaterialCommunityIcons name
// label: string
// info: string (detailed info for modal)
export default function StatusPill({ label, icon, value, status, info }) {
  const [modalVisible, setModalVisible] = useState(false);
  const color =
    status === 'good' ? '#89ce00' :
    status === 'warning' ? '#f7b731' :
    status === 'bad' ? '#e74c3c' : '#b3c7f7';
  return (
    <>
      <Pressable
        style={[styles.pill, { borderColor: color, backgroundColor: '#fff' }]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel={`Show more info about ${label}`}
      >
        <MaterialCommunityIcons name={icon} size={28} color={color} style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color }]}>{label}</Text>
          <View style={styles.gaugeBg}>
            <View style={[styles.gaugeFill, { width: `${Math.round(value * 100)}%`, backgroundColor: color }]} />
          </View>
        </View>
      </Pressable>
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color }]}>{label}</Text>
            <Text style={styles.modalInfo}>{info}</Text>
            <Pressable style={[styles.modalButton, { backgroundColor: color }]} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginHorizontal: 6,
    marginVertical: 8,
    minWidth: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gaugeBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#eaf6f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalInfo: {
    fontSize: 16,
    color: '#4d6d6d',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
}); 
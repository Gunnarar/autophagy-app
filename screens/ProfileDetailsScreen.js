import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useUser } from '../contexts/UserContext';

export default function ProfileDetailsScreen() {
  const { user, saveUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user || {});

  const requiredFields = ['name', 'age', 'height', 'weight', 'email', 'startDate'];

  if (!user) return <View style={styles.container}><Text>Loading...</Text></View>;

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = async () => {
    // Validate all required fields
    for (const key of requiredFields) {
      if (!form[key] || form[key].toString().trim() === '') {
        Alert.alert('Missing info', `Please enter your ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}.`);
        return;
      }
    }
    await saveUser(form);
    setEditing(false);
    Alert.alert('Success', 'Profile updated!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile Details</Text>
      {Object.entries({
        name: 'Name',
        address: 'Address',
        age: 'Age',
        height: 'Height (cm)',
        weight: 'Weight (kg)',
        email: 'Email',
        cell: 'Cell Phone',
        medications: 'Medications',
        symptoms: 'Symptoms',
        goal12: '12-Month Goal',
        goal24: '24-Month Goal',
        startDate: 'Start Date',
      }).map(([key, label]) => (
        <View key={key} style={styles.fieldRow}>
          <Text style={styles.label}>{label}:</Text>
          {editing && key !== 'startDate' ? (
            <TextInput
              style={styles.input}
              value={form[key] ? String(form[key]) : ''}
              onChangeText={v => handleChange(key, v)}
              editable={editing}
            />
          ) : key === 'startDate' ? (
            <Text style={styles.value}>{user.startDate ? new Date(user.startDate).toLocaleDateString() : ''}</Text>
          ) : (
            <Text style={styles.value}>{user[key] ? String(user[key]) : ''}</Text>
          )}
        </View>
      ))}
      {editing ? (
        <Button title="Save" onPress={handleSave} />
      ) : (
        <Button title="Edit" onPress={() => setEditing(true)} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  fieldRow: { width: '100%', marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  value: { fontSize: 16, color: '#333', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16 },
}); 
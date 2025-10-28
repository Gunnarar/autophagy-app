import React, { useState } from 'react';
import { Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useUser } from '../contexts/UserContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const steps = [
  { key: 'name', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'age', label: 'Age', keyboardType: 'numeric' },
  { key: 'height', label: 'Height (cm)', keyboardType: 'numeric' },
  { key: 'weight', label: 'Weight (kg)', keyboardType: 'numeric' },
  { key: 'email', label: 'Email', keyboardType: 'email-address' },
  { key: 'cell', label: 'Cell Phone', keyboardType: 'phone-pad' },
  { key: 'medications', label: 'Medications (optional)', multiline: true },
  { key: 'symptoms', label: 'Symptoms (comma separated, optional)', multiline: true },
  { key: 'goal12', label: '12-Month Goal', multiline: true },
  { key: 'goal24', label: '24-Month Goal', multiline: true },
  { key: 'startDate', label: 'Pick a Start Date', isDate: true },
];

const requiredFields = ['name', 'age', 'height', 'weight', 'email', 'startDate'];

export default function OnboardingScreen({ navigation }) {
  const { saveUser } = useUser();
  const [form, setForm] = useState({});
  const [step, setStep] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleNext = () => {
    const { key } = steps[step];
    if (requiredFields.includes(key) && (!form[key] || form[key].toString().trim() === '')) {
      Alert.alert('Missing info', `Please enter your ${steps[step].label}.`);
      return;
    }
    if (step < steps.length - 1) {setStep(step + 1);}
    else {handleSubmit();}
  };

  const handleSubmit = async () => {
    // Validate all required fields
    for (const key of requiredFields) {
      if (!form[key] || form[key].toString().trim() === '') {
        Alert.alert('Missing info', `Please enter your ${steps.find(s => s.key === key).label}.`);
        return;
      }
    }
    await saveUser({ ...form, onboarded: true });
    Alert.alert('Success', 'Onboarding complete!');
    navigation.replace('MainTabs');
  };

  const { key, label, keyboardType, multiline, isDate } = steps[step];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Onboarding</Text>
      <Text style={styles.label}>{label}</Text>
      {isDate ? (
        <>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {form.startDate ? new Date(form.startDate).toLocaleDateString() : 'Select Date'}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            onConfirm={date => {
              setShowDatePicker(false);
              handleChange('startDate', date.toISOString());
            }}
            onCancel={() => setShowDatePicker(false)}
          />
        </>
      ) : (
        <TextInput
          style={[styles.input, multiline && { height: 80 }]}
          value={form[key] || ''}
          onChangeText={v => handleChange(key, v)}
          keyboardType={keyboardType || 'default'}
          autoFocus
          multiline={!!multiline}
        />
      )}
      <Button title={step === steps.length - 1 ? 'Finish' : 'Next'} onPress={handleNext} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 18, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, width: '100%', marginBottom: 16 },
  dateButton: { borderWidth: 1, borderColor: '#6bb3b6', borderRadius: 8, padding: 16, width: '100%', alignItems: 'center', marginBottom: 16 },
  dateButtonText: { fontSize: 16, color: '#2d4d4d' },
});

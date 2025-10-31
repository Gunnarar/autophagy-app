import React, { useState } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { theme } from '../utils/theme';

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
  const [form, setForm] = useState({ startDate: new Date().toISOString() });
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
  const isLast = step === steps.length - 1;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="outline" style={styles.card}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardContent}
          >
            <Text style={styles.stepLabel}>Step {step + 1} of {steps.length}</Text>
            <Text style={styles.title}>Let’s get to know you</Text>
            <Text style={styles.subtitle}>
              {label}
            </Text>
            {isDate ? (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {form.startDate ? new Date(form.startDate).toLocaleDateString() : 'Select start date'}
                  </Text>
                </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                date={form.startDate ? new Date(form.startDate) : new Date()}
                onConfirm={date => {
                  setShowDatePicker(false);
                  handleChange('startDate', date.toISOString());
                }}
                onCancel={() => setShowDatePicker(false)}
              />
              </>
            ) : (
              <TextInput
                style={[styles.input, multiline && styles.inputMultiline]}
                value={form[key] || ''}
                onChangeText={v => handleChange(key, v)}
                keyboardType={keyboardType || 'default'}
                returnKeyType={isLast ? 'done' : 'next'}
                onSubmitEditing={() => {
                  if (!multiline) {
                    handleNext();
                  }
                }}
                blurOnSubmit={!multiline}
                multiline={!!multiline}
                autoCapitalize={key === 'email' ? 'none' : 'sentences'}
              />
            )}
          </ScrollView>
          <View style={styles.buttonRow}>
            {step > 0 && (
              <Button
                label="Back"
                variant="secondary"
                size="md"
                onPress={() => setStep(step - 1)}
                style={styles.actionButton}
              />
            )}
            <Button
              label={isLast ? 'Finish' : 'Next'}
              size="md"
              onPress={handleNext}
              style={styles.actionButton}
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    maxHeight: '90%',
  },
  cardContent: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  stepLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: theme.typography.sizes.headline,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfacePrimary,
    marginTop: theme.spacing.sm,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    marginTop: theme.spacing.sm,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surfacePrimary,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});

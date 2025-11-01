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
import { useTheme, useThemedStyles } from '../utils/theme';
import { useTranslation } from '../contexts/LocalizationContext';

const steps = [
  { key: 'name', labelKey: 'onboarding.profileStep.nameLabel', defaultLabel: 'Name' },
  { key: 'address', labelKey: 'onboarding.profileStep.addressLabel', defaultLabel: 'Address' },
  { key: 'age', labelKey: 'onboarding.profileStep.ageLabel', defaultLabel: 'Age', keyboardType: 'numeric' },
  { key: 'height', labelKey: 'onboarding.profileStep.heightLabel', defaultLabel: 'Height (cm)', keyboardType: 'numeric' },
  { key: 'weight', labelKey: 'onboarding.profileStep.weightLabel', defaultLabel: 'Weight (kg)', keyboardType: 'numeric' },
  { key: 'email', labelKey: 'onboarding.profileStep.emailLabel', defaultLabel: 'Email', keyboardType: 'email-address' },
  { key: 'cell', labelKey: 'onboarding.profileStep.cellLabel', defaultLabel: 'Cell Phone', keyboardType: 'phone-pad' },
  { key: 'medications', labelKey: 'onboarding.profileStep.medicationsLabel', defaultLabel: 'Medications (optional)', multiline: true },
  { key: 'symptoms', labelKey: 'onboarding.profileStep.symptomsLabel', defaultLabel: 'Symptoms (comma separated, optional)', multiline: true },
  { key: 'goal12', labelKey: 'onboarding.profileStep.goal12Label', defaultLabel: '12-Month Goal', multiline: true },
  { key: 'goal24', labelKey: 'onboarding.profileStep.goal24Label', defaultLabel: '24-Month Goal', multiline: true },
  { key: 'startDate', labelKey: 'onboarding.profileStep.startDateLabel', defaultLabel: 'Pick a Start Date', isDate: true },
];

const requiredFields = ['name', 'age', 'height', 'weight', 'email', 'startDate'];

export default function OnboardingScreen({ navigation }) {
  const { saveUser } = useUser();
  const [form, setForm] = useState({ startDate: new Date().toISOString() });
  const [step, setStep] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleNext = () => {
    const currentStep = steps[step];
    const { key } = currentStep;
    const labelText = t(currentStep.labelKey, currentStep.defaultLabel);
    if (requiredFields.includes(key) && (!form[key] || form[key].toString().trim() === '')) {
      Alert.alert(
        t('onboarding.missingInfoTitle', 'Missing info'),
        t('onboarding.missingInfoMessage', 'Please enter your {field}.', { field: labelText }),
      );
      return;
    }
    if (step < steps.length - 1) {setStep(step + 1);}
    else {handleSubmit();}
  };

  const handleSubmit = async () => {
    // Validate all required fields
    for (const key of requiredFields) {
      if (!form[key] || form[key].toString().trim() === '') {
        const missingStep = steps.find(s => s.key === key);
        const labelText = missingStep ? t(missingStep.labelKey, missingStep.defaultLabel) : key;
        Alert.alert(
          t('onboarding.missingInfoTitle', 'Missing info'),
          t('onboarding.missingInfoMessage', 'Please enter your {field}.', { field: labelText }),
        );
        return;
      }
    }
    await saveUser({ ...form, onboarded: true });
    Alert.alert(t('onboarding.successTitle', 'Success'), t('onboarding.successMessage', 'Onboarding complete!'));
    navigation.replace('MainTabs');
  };

  const { key, keyboardType, multiline, isDate } = steps[step];
  const currentLabel = t(steps[step].labelKey, steps[step].defaultLabel);
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
            <Text style={styles.stepLabel}>
              {t('onboarding.stepIndicator', 'Step {current} of {total}', { current: step + 1, total: steps.length })}
            </Text>
            <Text style={styles.title}>{t('onboarding.title', 'Let’s get to know you')}</Text>
            <Text style={styles.subtitle}>
              {currentLabel}
            </Text>
            {isDate ? (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {form.startDate
                      ? new Date(form.startDate).toLocaleDateString()
                      : t('onboarding.selectStartDate', 'Select start date')}
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
                label={t('common.back', 'Back')}
                variant="secondary"
                size="md"
                onPress={() => setStep(step - 1)}
                style={styles.actionButton}
              />
            )}
            <Button
              label={isLast ? t('common.finish', 'Finish') : t('common.next', 'Next')}
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

const createStyles = currentTheme =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: currentTheme.colors.backgroundPrimary,
    },
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: currentTheme.spacing.lg,
    },
    card: {
      paddingVertical: currentTheme.spacing.lg,
      paddingHorizontal: currentTheme.spacing.lg,
      gap: currentTheme.spacing.sm,
      maxHeight: '90%',
    },
    cardContent: {
      gap: currentTheme.spacing.sm,
      paddingBottom: currentTheme.spacing.lg,
    },
    stepLabel: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    title: {
      fontSize: currentTheme.typography.sizes.headline,
      fontWeight: currentTheme.typography.weights.bold,
      color: currentTheme.colors.textPrimary,
    },
    subtitle: {
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textSecondary,
    },
    input: {
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.border,
      borderRadius: currentTheme.radius.md,
      padding: currentTheme.spacing.sm,
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textPrimary,
      backgroundColor: currentTheme.colors.surfacePrimary,
      marginTop: currentTheme.spacing.sm,
    },
    inputMultiline: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    dateButton: {
      marginTop: currentTheme.spacing.sm,
      borderRadius: currentTheme.radius.md,
      paddingVertical: currentTheme.spacing.md,
      paddingHorizontal: currentTheme.spacing.sm,
      backgroundColor: currentTheme.colors.surfacePrimary,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.border,
      alignItems: 'center',
    },
    dateButtonText: {
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textPrimary,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: currentTheme.spacing.sm,
      marginTop: currentTheme.spacing.lg,
    },
    actionButton: {
      flex: 1,
    },
  });

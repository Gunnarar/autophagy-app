import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useUser } from '../contexts/UserContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme, useThemedStyles } from '../utils/theme';

const FIELD_CONFIGS = [
  { key: 'name', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'age', label: 'Age', keyboardType: 'numeric' },
  { key: 'height', label: 'Height (cm)', keyboardType: 'numeric' },
  { key: 'weight', label: 'Weight (kg)', keyboardType: 'numeric' },
  { key: 'email', label: 'Email', keyboardType: 'email-address', autoCapitalize: 'none' },
  { key: 'cell', label: 'Cell Phone', keyboardType: 'phone-pad' },
  { key: 'medications', label: 'Medications', multiline: true },
  { key: 'symptoms', label: 'Symptoms', multiline: true },
  { key: 'goal12', label: '12-Month Goal', multiline: true },
  { key: 'goal24', label: '24-Month Goal', multiline: true },
];

const REQUIRED_FIELDS = ['name', 'age', 'height', 'weight', 'email', 'startDate'];

export default function ProfileDetailsScreen() {
  const { user, saveUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user || {});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme: currentTheme } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    for (const key of REQUIRED_FIELDS) {
      if (!form[key] || String(form[key]).trim() === '') {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        Alert.alert('Missing info', `Please enter your ${label}.`);
        return;
      }
    }
    await saveUser(form);
    setEditing(false);
    Alert.alert('Success', 'Profile updated!');
  };

  const handleCancel = () => {
    setForm(user);
    setEditing(false);
  };

  const handleDateConfirm = date => {
    setShowDatePicker(false);
    handleChange('startDate', date.toISOString());
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="outline" style={styles.card}>
          <Text style={styles.title}>Profile details</Text>
          <Text style={styles.subtitle}>Update your personal information and long-term goals.</Text>

          {FIELD_CONFIGS.map(({ key, label, keyboardType, multiline, autoCapitalize }) => {
            const value = form[key] ? String(form[key]) : '';
            return (
              <View key={key} style={styles.fieldRow}>
                <Text style={styles.label}>{label}</Text>
                {editing ? (
                  <TextInput
                    style={[styles.input, multiline && styles.multilineInput]}
                    value={value}
                    onChangeText={text => handleChange(key, text)}
                    keyboardType={keyboardType || 'default'}
                    multiline={!!multiline}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    autoCapitalize={autoCapitalize || 'sentences'}
                    returnKeyType={multiline ? 'default' : 'next'}
                  />
                ) : (
                  <Text style={styles.value}>{value || '—'}</Text>
                )}
              </View>
            );
          })}

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Start Date</Text>
            {editing ? (
              <Button
                label={form.startDate ? new Date(form.startDate).toLocaleDateString() : 'Select date'}
                variant="secondary"
                size="sm"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              />
            ) : (
              <Text style={styles.value}>
                {user.startDate ? new Date(user.startDate).toLocaleDateString() : '—'}
              </Text>
            )}
          </View>

          {editing ? (
            <View style={styles.buttonRow}>
              <Button
                label="Cancel"
                variant="ghost"
                onPress={handleCancel}
                style={styles.actionButton}
              />
              <Button
                label="Save"
                onPress={handleSave}
                style={styles.actionButton}
              />
            </View>
          ) : (
            <Button
              label="Edit profile"
              onPress={() => setEditing(true)}
              style={styles.fullWidthButton}
            />
          )}
        </Card>
      </ScrollView>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        date={form.startDate ? new Date(form.startDate) : new Date()}
      />
    </KeyboardAvoidingView>
  );
}

const createStyles = currentTheme =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: currentTheme.colors.backgroundPrimary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: currentTheme.colors.backgroundPrimary,
    },
    loadingText: {
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textSecondary,
    },
    container: {
      padding: currentTheme.spacing.lg,
    },
    card: {
      paddingVertical: currentTheme.spacing.lg,
      paddingHorizontal: currentTheme.spacing.lg,
      gap: currentTheme.spacing.md,
    },
    title: {
      fontSize: currentTheme.typography.sizes.headline,
      fontWeight: currentTheme.typography.weights.bold,
      color: currentTheme.colors.textPrimary,
    },
    subtitle: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
    },
    fieldRow: {
      width: '100%',
      gap: currentTheme.spacing.xs,
    },
    label: {
      fontSize: currentTheme.typography.sizes.caption,
      color: currentTheme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    value: {
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textPrimary,
      paddingVertical: currentTheme.spacing.xs,
    },
    input: {
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: currentTheme.colors.border,
      borderRadius: currentTheme.radius.md,
      paddingHorizontal: currentTheme.spacing.sm,
      paddingVertical: currentTheme.spacing.sm,
      fontSize: currentTheme.typography.sizes.body,
      color: currentTheme.colors.textPrimary,
      backgroundColor: currentTheme.colors.surfacePrimary,
    },
    multilineInput: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    dateButton: {
      alignSelf: 'flex-start',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: currentTheme.spacing.sm,
      marginTop: currentTheme.spacing.lg,
    },
    actionButton: {
      flex: 1,
    },
    fullWidthButton: {
      marginTop: currentTheme.spacing.lg,
    },
  });

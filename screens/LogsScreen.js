import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useLogs } from '../contexts/LogsContext';
import { SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { theme } from '../utils/theme';

export default function LogsScreen() {
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('week'); // week, month, 3m, 6m, year
  const { foodLog, setFoodLog, symptomLog, setSymptomLog, fastLog, setFastLog, ketoneLog } = useLogs();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLogType, setEditLogType] = useState(null); // 'food' | 'symptom' | 'fast'
  const [editLog, setEditLog] = useState(null);
  const [editTime, setEditTime] = useState(new Date());
  const [editNote, setEditNote] = useState('');
  const [editFoodType, setEditFoodType] = useState('meal');
  const [editSymptomType, setEditSymptomType] = useState('tremor');
  const [editSeverity, setEditSeverity] = useState('mild');
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);
  const [editFastStart, setEditFastStart] = useState(new Date());
  const [editFastEnd, setEditFastEnd] = useState(null);
  const [showFastStartPicker, setShowFastStartPicker] = useState(false);
  const [showFastEndPicker, setShowFastEndPicker] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportTimeRange, setExportTimeRange] = useState('week');

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
    ...ketoneLog.map(e => ({ ...e, logType: 'ketone' })),
    ...fastLog.map(e => ({
      ...e,
      logType: 'fast',
      time: e.end || e.start,
    })),
  ];

  // Time range filtering
  const now = new Date();
  let filterRangeStart = new Date();
  if (timeRange === 'week') {filterRangeStart.setDate(now.getDate() - 6);}
  else if (timeRange === 'month') {filterRangeStart.setMonth(now.getMonth() - 1);}
  else if (timeRange === '3m') {filterRangeStart.setMonth(now.getMonth() - 3);}
  else if (timeRange === '6m') {filterRangeStart.setMonth(now.getMonth() - 6);}
  else if (timeRange === 'year') {filterRangeStart.setFullYear(now.getFullYear() - 1);}
  filterRangeStart.setHours(0, 0, 0, 0);
  const inRange = d => {
    const timestamp = new Date(d);
    return timestamp >= filterRangeStart && timestamp <= now;
  };
  const logs = allLogs.filter(e => {
    if (filterType !== 'all' && e.logType !== filterType) {return false;}
    const dateStr = e.time || e.end || e.start;
    if (!dateStr) {return false;}
    return inRange(dateStr);
  });
  logs.sort((a, b) => {
    const aDate = new Date(a.time);
    const bDate = new Date(b.time);
    return bDate - aDate;
  });

  // Summary calculations (filtered by time range)
  const meatPounds = foodLog.filter(e => e.type === 'animalMeat' && e.pounds && inRange(e.time)).reduce((sum, e) => sum + parseFloat(e.pounds), 0);
  const prolongedFasts = fastLog.filter(f => {
    const start = new Date(f.start);
    const end = new Date(f.end);
    const duration = (end - start) / 3600000;
    return duration >= 24 && inRange(f.end);
  }).length;
  const symptomCount = symptomLog.filter(e => inRange(e.time)).length;

  const formatDateTime = (date) => date.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });

  const handleEditPress = (entry) => {
    setEditLogType(entry.logType);
    setEditLog(entry);
    setEditNote(entry.note || '');
    setShowEditTimePicker(false);
    setShowFastStartPicker(false);
    setShowFastEndPicker(false);

    if (entry.logType === 'food') {
      setEditFoodType(entry.type || 'meal');
      setEditTime(entry.time ? new Date(entry.time) : new Date());
      setEditNote(entry.note || '');
    } else if (entry.logType === 'symptom') {
      setEditSymptomType(entry.type || 'tremor');
      setEditSeverity(entry.severity || 'mild');
      setEditTime(entry.time ? new Date(entry.time) : new Date());
    } else if (entry.logType === 'fast') {
      setEditFastStart(entry.start ? new Date(entry.start) : new Date());
      setEditFastEnd(entry.end ? new Date(entry.end) : null);
    } else {
      setEditTime(entry.time ? new Date(entry.time) : new Date());
    }

    setEditModalVisible(true);
  };

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

  // Helper: get date range for export
  function getExportRange(rangeKey) {
    const rangeEnd = new Date();
    let rangeStart = new Date();
    if (rangeKey === 'week') {rangeStart.setDate(rangeEnd.getDate() - 6);}
    else if (rangeKey === 'month') {rangeStart.setMonth(rangeEnd.getMonth() - 1);}
    else if (rangeKey === '3m') {rangeStart.setMonth(rangeEnd.getMonth() - 3);}
    else if (rangeKey === '6m') {rangeStart.setMonth(rangeEnd.getMonth() - 6);}
    else if (rangeKey === 'year') {rangeStart.setFullYear(rangeEnd.getFullYear() - 1);}
    rangeStart.setHours(0, 0, 0, 0);
    return { start: rangeStart, end: rangeEnd };
  }

  async function handleExportCSV() {
    try {
      const { start, end } = getExportRange(exportTimeRange);
      const isWithinRange = dateValue => {
        const timestamp = new Date(dateValue);
        return timestamp >= start && timestamp <= end;
      };
      // Filter logs
      const food = foodLog.filter(e => e.time && isWithinRange(e.time));
      const symptoms = symptomLog.filter(e => e.time && isWithinRange(e.time));
      const fasts = fastLog.filter(f => f.start && f.end && isWithinRange(f.end));
      // Summary
      const meatPoundsExport = food.filter(e => e.type === 'animalMeat' && e.pounds).reduce((sum, e) => sum + parseFloat(e.pounds), 0);
      const prolongedFastCount = fasts.filter(f => {
        const fastStart = new Date(f.start);
        const fastEnd = new Date(f.end);
        const duration = (fastEnd - fastStart) / 3600000;
        return duration >= 24;
      }).length;
      const symptomCountExport = symptoms.length;
      // CSV header
      let csv = `Genesis4PD Log Export\nTime Range: ${exportTimeRange}\nExported: ${new Date().toLocaleString()}\n\n`;
      csv += `Summary\n"Total Meat (lbs)","Prolonged Fasts (>=24h)","Symptoms"\n"${meatPoundsExport.toFixed(1)}","${prolongedFastCount}","${symptomCountExport}"\n\n`;
      // Logs header
      csv += 'Type,Time,Details\n';
      // Combine all logs
      const all = [
        ...food.map(e => ({
          type: 'Meal',
          time: e.time,
          details: [
            e.pounds ? `Pounds: ${e.pounds}` : null,
            e.isCarb ? 'Carb Meal: Yes' : null,
            e.note ? `Note: ${e.note}` : null,
          ].filter(Boolean).join('; '),
        })),
        ...symptoms.map(e => ({
          type: 'Symptom',
          time: e.time,
          details: [
            SYMPTOM_TYPES.find(t => t.key === e.type)?.label || e.type,
            e.severity ? `Severity: ${SEVERITIES.find(s => s.key === e.severity)?.label || e.severity}` : null,
            e.note ? `Note: ${e.note}` : null,
          ].filter(Boolean).join('; '),
        })),
        ...fasts.map(f => {
          const fastStart = new Date(f.start);
          const fastEnd = new Date(f.end);
          const duration = ((fastEnd - fastStart) / 3600000).toFixed(1);
          return {
            type: 'Fast',
            time: f.end,
            details: `Start: ${fastStart.toLocaleString()}, End: ${fastEnd.toLocaleString()}, Duration: ${duration}h${f.note ? `, Note: ${f.note}` : ''}`,
          };
        }),
      ];
      all.sort((a, b) => new Date(b.time) - new Date(a.time));
      for (const entry of all) {
        csv += `"${entry.type}","${new Date(entry.time).toLocaleString()}","${entry.details.replace(/"/g, '""')}"\n`;
      }
      // Save to file
      const fileUri = FileSystem.cacheDirectory + `genesis4pd-logs-${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Share Genesis4PD Logs' });
      setExportModalVisible(false);
    } catch (err) {
      Alert.alert('Export Error', err.message || 'Failed to export logs.');
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Logs &amp; insights</Text>
            <Text style={styles.subtitle}>Review meals, symptoms, and fasts</Text>
          </View>
          <Button
            label="Export"
            variant="secondary"
            size="sm"
            onPress={() => setExportModalVisible(true)}
          />
        </View>
        {/* Export Time Range Modal */}
        <Modal visible={exportModalVisible} transparent animationType="fade" onRequestClose={() => setExportModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setExportModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalAvoider}
                enabled={false}
              >
                <TouchableWithoutFeedback onPress={() => {}}>
                  <Card variant="outline" style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Export Logs</Text>
                    <Text style={styles.modalDescription}>Select time range for export:</Text>
                    <View style={[styles.chipRow, styles.modalChipRow]}>
                      {[
                        { key: 'week', label: 'Week' },
                        { key: 'month', label: 'Month' },
                        { key: '3m', label: '3 Months' },
                        { key: '6m', label: '6 Months' },
                        { key: 'year', label: 'Year' },
                      ].map(opt => (
                        <Chip
                          key={opt.key}
                          label={opt.label}
                          size="sm"
                          active={exportTimeRange === opt.key}
                          onPress={() => setExportTimeRange(opt.key)}
                        />
                      ))}
                    </View>
                    <Button label="Export CSV" onPress={handleExportCSV} style={styles.modalPrimaryAction} />
                    <Button
                      label="Cancel"
                      variant="secondary"
                      onPress={() => setExportModalVisible(false)}
                      style={styles.modalSecondaryAction}
                    />
                  </Card>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <Card variant="tinted" style={styles.rangeCard}>
          <Text style={styles.sectionLabel}>Time range</Text>
          <View style={styles.chipRow}>
            {[
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
              { key: '3m', label: '3 Months' },
              { key: '6m', label: '6 Months' },
              { key: 'year', label: 'Year' },
            ].map(opt => (
              <Chip
                key={opt.key}
                label={opt.label}
                active={timeRange === opt.key}
                onPress={() => setTimeRange(opt.key)}
              />
            ))}
          </View>
        </Card>

        <Card variant="outline" style={styles.summaryCard}>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryLabel}>Meat (lbs)</Text>
            <Text style={[styles.summaryValue, styles.summaryValueMeat]}>{meatPounds.toFixed(1)}</Text>
          </View>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryLabel}>Prolonged Fasts</Text>
            <Text style={[styles.summaryValue, styles.summaryValueFasts]}>{prolongedFasts}</Text>
          </View>
          <View style={styles.summaryMetric}>
            <Text style={styles.summaryLabel}>Symptoms</Text>
            <Text style={[styles.summaryValue, styles.summaryValueSymptoms]}>{symptomCount}</Text>
          </View>
        </Card>

        <Card variant="tinted" style={styles.filterCard}>
          <Text style={styles.sectionLabel}>Filter by</Text>
          <View style={styles.chipRow}>
            {[
              { key: 'all', label: 'All', icon: 'list' },
              { key: 'food', label: 'Food', icon: 'food' },
              { key: 'symptom', label: 'Symptoms', icon: 'stethoscope' },
              { key: 'fast', label: 'Fasts', icon: 'timer-sand' },
              { key: 'ketone', label: 'Ketones', icon: 'water' },
            ].map(pill => {
              const isActive = filterType === pill.key;
              const iconColor = isActive ? theme.colors.textOnPrimary : theme.colors.brandSecondary;
              const iconElement = pill.icon === 'list'
                ? <Ionicons name="list" size={18} color={iconColor} />
                : <MaterialCommunityIcons name={pill.icon} size={18} color={iconColor} />;
              return (
                <Chip
                  key={pill.key}
                  label={pill.label}
                  icon={iconElement}
                  active={isActive}
                  onPress={() => setFilterType(pill.key)}
                />
              );
            })}
          </View>
        </Card>
        {/* Empty state for no logs */}
        {logs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No logs yet</Text>
            <Text style={styles.emptyStateSubtitle}>Tap + to add your first log!</Text>
          </View>
        )}
        {/* Log list */}
        {logs.map((entry, _index) => {
          const isFilterAll = filterType === 'all';
          const matchesFilter = filterType === entry.logType;
          const accentColor = entry.logType === 'food'
            ? theme.colors.brandPrimary
            : entry.logType === 'symptom'
            ? theme.colors.error
            : entry.logType === 'fast'
            ? theme.colors.brandSecondary
            : theme.colors.info;
          const isHighlighted = matchesFilter || isFilterAll;
          const cardDynamicStyle = {
            borderLeftWidth: 4,
            borderLeftColor: isHighlighted ? accentColor : theme.colors.border,
            backgroundColor: isHighlighted ? theme.colors.surfaceMuted : theme.colors.surfacePrimary,
          };
          return (
            <Card variant="outline" key={entry.id} style={[styles.logCard, cardDynamicStyle]}>
              <Text style={styles.cardTitle}>
                {entry.logType === 'food'
                  ? 'Meal'
                  : entry.logType === 'symptom'
                  ? (SYMPTOM_TYPES.find(t => t.key === entry.type)?.label || entry.type)
                  : entry.logType === 'fast'
                  ? 'Fast'
                  : 'Ketone'}
                {'  '}
                <Text style={styles.cardTimestamp}>
                  {new Date(entry.time || entry.end || entry.start).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </Text>
                {/* Fat red X for carb meals */}
                {entry.logType === 'food' && entry.isCarb ? (
                  <MaterialCommunityIcons name="close-circle" size={22} color={theme.colors.error} style={styles.carbIcon} />
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
              {/* Show ketone value/unit if ketone log */}
              {entry.logType === 'ketone' && (
                <Text style={styles.cardText}>Ketone: {entry.value} {entry.unit}</Text>
              )}
              {entry.logType === 'fast' && (
                <>
                  <Text style={styles.cardText}>
                    Start: {new Date(entry.start).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </Text>
                  {entry.end ? (
                    <Text style={styles.cardText}>
                      End: {new Date(entry.end).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </Text>
                  ) : (
                    <Text style={styles.cardText}>In progress</Text>
                  )}
                  <Text style={styles.cardText}>
                    Duration: {entry.end ? `${((new Date(entry.end) - new Date(entry.start)) / 3600000).toFixed(1)}h` : '—'}
                  </Text>
                </>
              )}
              <View style={styles.logActions}>
                <Pressable
                  onPress={() => handleEditPress(entry)}
                  style={[styles.modalButton, styles.modalButtonSpacingRight]}
                  accessibilityLabel="Edit log"
                >
                  <Text style={styles.modalButtonPrimaryText}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleEditPress(entry)}
                  style={[styles.modalButton, styles.modalButtonNeutral]}
                  accessibilityLabel="Delete log"
                >
                  <Text style={styles.modalButtonNeutralText}>Delete</Text>
                </Pressable>
              </View>
            </Card>
          );
        })}
        {/* Empty state for no symptoms (if filter is symptom) */}
        {filterType === 'symptom' && logs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No symptoms logged yet</Text>
            <Text style={styles.emptyStateSubtitle}>Tap + to add your first symptom!</Text>
          </View>
        )}
      </ScrollView>
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalAvoider}
              enabled
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <Card variant="outline" style={styles.modalContent}>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    overScrollMode="never"
                    contentContainerStyle={styles.modalScrollContent}
                  >
                    <Text style={styles.modalTitle}>
                      {editLogType === 'food'
                        ? 'Edit food log'
                        : editLogType === 'symptom'
                        ? 'Edit symptom log'
                        : editLogType === 'fast'
                        ? 'Edit fast'
                        : 'Edit log'}
                    </Text>
                {editLogType === 'food' && (
                  <>
                    <Text style={styles.fieldLabel}>Type:</Text>
                    <View style={styles.selectorRow}>
                      <Chip
                        label="🍽️ Meal"
                        active={editFoodType === 'meal'}
                        onPress={() => setEditFoodType('meal')}
                        size="lg"
                        style={styles.selectorChip}
                        textStyle={styles.selectorChipLabel}
                      />
                    </View>
                  </>
                )}
                {editLogType === 'symptom' && (
                  <>
                    <Text style={styles.fieldLabel}>Symptom:</Text>
                    <View style={styles.selectorRow}>
                      {SYMPTOM_TYPES.map(t => (
                        <Chip
                          key={t.key}
                          label={t.emoji}
                          size="lg"
                          active={editSymptomType === t.key}
                          onPress={() => setEditSymptomType(t.key)}
                          accessibilityLabel={t.label}
                          style={styles.selectorChip}
                          textStyle={styles.symptomEmoji}
                        />
                      ))}
                    </View>
                    <Text style={styles.symptomLabel}>
                      {SYMPTOM_TYPES.find(t => t.key === editSymptomType)?.label}
                    </Text>
                    <Text style={styles.fieldLabel}>Severity:</Text>
                    <View style={styles.selectorRow}>
                      {SEVERITIES.map(s => (
                        <Chip
                          key={s.key}
                          label={s.label}
                          size="lg"
                          active={editSeverity === s.key}
                          onPress={() => setEditSeverity(s.key)}
                          accessibilityLabel={s.label}
                          style={styles.selectorChip}
                          textStyle={styles.selectorChipLabel}
                        />
                      ))}
                    </View>
                  </>
                )}
                {editLogType === 'fast' && (
                  <>
                    <Text style={styles.fieldLabel}>Start time</Text>
                    <View style={styles.fastButtonRow}>
                      <Button
                        label={`Start: ${formatDateTime(editFastStart)}`}
                        variant="secondary"
                        onPress={() => setShowFastStartPicker(true)}
                        style={styles.fastPrimaryButton}
                      />
                      <Button
                        label="Set to now"
                        variant="ghost"
                        onPress={() => setEditFastStart(new Date())}
                        style={styles.fastGhostButton}
                      />
                    </View>
                    <DateTimePickerModal
                      isVisible={showFastStartPicker}
                      mode="datetime"
                      date={editFastStart}
                      onConfirm={date => { setShowFastStartPicker(false); setEditFastStart(date); }}
                      onCancel={() => setShowFastStartPicker(false)}
                      is24Hour
                    />
                    <Text style={styles.fieldLabel}>End time</Text>
                    <View style={styles.fastButtonRow}>
                      <Button
                        label={editFastEnd ? `End: ${formatDateTime(editFastEnd)}` : 'Set end time'}
                        variant="secondary"
                        onPress={() => setShowFastEndPicker(true)}
                        style={styles.fastPrimaryButton}
                      />
                      <Button
                        label={editFastEnd ? 'Clear end' : 'Set to now'}
                        variant="ghost"
                        onPress={() => setEditFastEnd(editFastEnd ? null : new Date())}
                        style={styles.fastGhostButton}
                      />
                    </View>
                    <DateTimePickerModal
                      isVisible={showFastEndPicker}
                      mode="datetime"
                      date={editFastEnd || new Date()}
                      onConfirm={date => { setShowFastEndPicker(false); setEditFastEnd(date); }}
                      onCancel={() => setShowFastEndPicker(false)}
                      is24Hour
                    />
                  </>
                )}
                {editLogType !== 'fast' && (
                  <>
                    <Text style={styles.fieldLabel}>Time:</Text>
                    <Pressable style={[styles.modalButton, styles.modalButtonBottomSpacing]} onPress={() => setShowEditTimePicker(true)}>
                      <Text style={styles.modalButtonPrimaryText}>
                        {formatDateTime(editTime)}
                      </Text>
                    </Pressable>
                    <DateTimePickerModal
                      isVisible={showEditTimePicker}
                      mode="datetime"
                      date={editTime}
                      onConfirm={date => { setEditTime(date); setShowEditTimePicker(false); }}
                      onCancel={() => setShowEditTimePicker(false)}
                      is24Hour
                    />
                  </>
                )}
                    <Text style={styles.fieldLabel}>Note (optional):</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.noteInput}
                        multiline
                        onChangeText={setEditNote}
                        value={editNote}
                        placeholder={editLogType === 'fast' ? 'e.g. manual entry, planned extended fast' : 'e.g. high carb, before meds, etc.'}
                        accessibilityLabel="Log note input"
                      />
                    </View>
                    <View style={styles.modalFooter}>
                      <Pressable style={[styles.modalButton, styles.modalButtonNeutral]} onPress={() => {
                        // Delete log
                        if (editLogType === 'food') {
                          setFoodLog(foodLog.filter(e => e.id !== editLog.id));
                        } else if (editLogType === 'symptom') {
                          setSymptomLog(symptomLog.filter(e => e.id !== editLog.id));
                        } else if (editLogType === 'fast') {
                          setFastLog(fastLog.filter(e => e.id !== editLog.id));
                        }
                        setEditModalVisible(false);
                      }} accessibilityLabel="Delete">
                        <Text style={styles.modalButtonNeutralText}>Delete</Text>
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
                        } else if (editLogType === 'symptom') {
                          setSymptomLog(symptomLog.map(e => e.id === editLog.id ? {
                              ...e,
                              type: editSymptomType,
                              severity: editSeverity,
                              time: editTime.toISOString(),
                              note: editNote,
                            } : e));
                        } else if (editLogType === 'fast') {
                          if (editFastEnd && editFastEnd < editFastStart) {
                            Alert.alert('Invalid time', 'End time cannot be before the start time.');
                            return;
                          }
                          setFastLog(fastLog.map(e => e.id === editLog.id ? {
                              ...e,
                              start: editFastStart.toISOString(),
                              end: editFastEnd ? editFastEnd.toISOString() : undefined,
                              note: editNote,
                            } : e));
                        }
                        setEditModalVisible(false);
                      }} accessibilityLabel="Save">
                        <Text style={styles.modalButtonPrimaryText}>Save</Text>
                      </Pressable>
                    </View>
                    <Pressable style={[styles.modalButton, styles.modalButtonNeutral, styles.modalButtonTopMargin]} onPress={() => setEditModalVisible(false)} accessibilityLabel="Cancel">
                      <Text style={styles.modalButtonNeutralText}>Cancel</Text>
                    </Pressable>
                  </ScrollView>
                </Card>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.headline,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.tiny,
  },
  modalDescription: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  rangeCard: {
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryMetric: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.title,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  summaryValueMeat: {
    color: theme.colors.brandPrimary,
  },
  summaryValueFasts: {
    color: theme.colors.info,
  },
  summaryValueSymptoms: {
    color: theme.colors.error,
  },
  filterCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.tiny,
  },
  modalChipRow: {
    justifyContent: 'center',
  },
  logCard: {
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  cardTimestamp: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.caption,
  },
  cardText: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.tiny,
  },
  carbIcon: {
    marginLeft: theme.spacing.tiny,
    marginBottom: -4,
  },
  logActions: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  modalButtonSpacingRight: {
    marginRight: theme.spacing.xs,
  },
  modalButtonPrimaryText: {
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
  modalButtonNeutral: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  modalButtonNeutralText: {
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
  },
  modalPrimaryAction: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.sm,
  },
  modalSecondaryAction: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.xs,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    alignSelf: 'stretch',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.overlay.scrim,
    paddingHorizontal: theme.spacing.lg,
  },
  modalAvoider: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    padding: theme.spacing.lg,
  },
  modalScrollContent: {
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: theme.typography.sizes.headline,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  fieldLabel: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.tiny,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalButton: {
    backgroundColor: theme.colors.brandPrimary,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.tiny + 2,
    paddingHorizontal: theme.spacing.sm,
  },
  modalButtonBottomSpacing: {
    marginBottom: theme.spacing.sm,
  },
  modalButtonTopMargin: {
    marginTop: theme.spacing.xs,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  noteInput: {
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.xs,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfacePrimary,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  selectorRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  fastButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  fastPrimaryButton: {
    flex: 1,
  },
  fastGhostButton: {
    flexShrink: 0,
  },
  selectorChip: {
    flexGrow: 1,
    flexBasis: 90,
    alignSelf: 'stretch',
  },
  selectorChipLabel: {
    textAlign: 'center',
  },
  symptomEmoji: {
    fontSize: 24,
    textAlign: 'center',
  },
  symptomLabel: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  emptyStateTitle: {
    color: theme.colors.brandPrimary,
    fontSize: theme.typography.sizes.headline,
    fontWeight: theme.typography.weights.bold,
  },
  emptyStateSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.body,
    marginTop: theme.spacing.xs,
  },
});

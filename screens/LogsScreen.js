import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableWithoutFeedback, TextInput, Alert, ScrollView, Button } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useLogs } from '../contexts/LogsContext';
import { SYMPTOM_TYPES, SEVERITIES } from '../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function LogsScreen() {
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('week'); // week, month, 3m, 6m, year
  const { foodLog, setFoodLog, symptomLog, setSymptomLog, fastLog, ketoneLog } = useLogs();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLogType, setEditLogType] = useState(null); // 'food' or 'symptom'
  const [editLog, setEditLog] = useState(null);
  const [editTime, setEditTime] = useState(new Date());
  const [editNote, setEditNote] = useState('');
  const [editFoodType, setEditFoodType] = useState('meal');
  const [editSymptomType, setEditSymptomType] = useState('tremor');
  const [editSeverity, setEditSeverity] = useState('mild');
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);
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
    const dateStr = e.time;
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
      <LinearGradient
        colors={['#101c23', '#182c34']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Logs</Text>
          <Button title="Export" onPress={() => setExportModalVisible(true)} />
        </View>
        {/* Export Time Range Modal */}
        <Modal visible={exportModalVisible} transparent animationType="fade" onRequestClose={() => setExportModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setExportModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Export Logs</Text>
                  <Text style={styles.modalDescription}>Select time range for export:</Text>
                  <View style={styles.pillRow}>
                    {[
                      { key: 'week', label: 'Week' },
                      { key: 'month', label: 'Month' },
                      { key: '3m', label: '3 Months' },
                      { key: '6m', label: '6 Months' },
                      { key: 'year', label: 'Year' },
                    ].map(opt => (
                      <Pressable
                        key={opt.key}
                        onPress={() => setExportTimeRange(opt.key)}
                        style={[
                          styles.pill,
                          styles.exportPill,
                          exportTimeRange === opt.key && styles.pillActive,
                        ]}
                      >
                        <Text style={[
                          styles.pillLabel,
                          exportTimeRange === opt.key && styles.pillLabelActive,
                        ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Button title="Export as CSV" onPress={handleExportCSV} />
                  <Button title="Cancel" onPress={() => setExportModalVisible(false)} color="#888" />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        {/* Time Range Picker */}
        <View style={styles.pillRowCentered}>
          {[
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Month' },
            { key: '3m', label: '3 Months' },
            { key: '6m', label: '6 Months' },
            { key: 'year', label: 'Year' },
          ].map(opt => (
            <Pressable
              key={opt.key}
              onPress={() => setTimeRange(opt.key)}
              style={[
                styles.pill,
                styles.timeRangePill,
                timeRange === opt.key && styles.pillActive,
              ]}
            >
              <Text style={[
                styles.pillLabel,
                timeRange === opt.key && styles.pillLabelActive,
              ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {/* Summary Section */}
        <View style={styles.summaryCard}>
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
        </View>
        {/* Pill-style filter */}
        <View style={styles.pillRowCentered}>
          {[
            { key: 'all', label: 'All', renderIcon: color => <Ionicons name="list" size={18} color={color} /> },
            { key: 'food', label: 'Food', renderIcon: color => <MaterialCommunityIcons name="food" size={18} color={color} /> },
            { key: 'symptom', label: 'Symptoms', renderIcon: color => <MaterialCommunityIcons name="stethoscope" size={18} color={color} /> },
            { key: 'ketone', label: 'Ketones', renderIcon: color => <MaterialCommunityIcons name="water" size={18} color={color} /> },
          ].map(pill => (
            <Pressable
              key={pill.key}
              onPress={() => setFilterType(pill.key)}
              style={[
                styles.pill,
                styles.filterPill,
                filterType === pill.key && styles.pillActive,
                filterType === pill.key && styles.filterPillActive,
              ]}
            >
              {pill.renderIcon(filterType === pill.key ? '#fff' : '#6bb3b6')}
              <Text style={[
                styles.pillLabel,
                styles.filterPillLabel,
                filterType === pill.key && styles.pillLabelActive,
              ]}
              >
                {pill.label}
              </Text>
            </Pressable>
          ))}
        </View>
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
          const cardDynamicStyle = {
            borderLeftColor: isFilterAll
              ? '#6bb3b6'
              : matchesFilter
              ? '#89ce00'
              : '#eaf6f6',
            backgroundColor: isFilterAll
              ? '#fff'
              : matchesFilter
              ? '#eaf6f6'
              : '#fff',
          };
          return (
            <View
              key={entry.id}
              style={[styles.card, styles.logCard, cardDynamicStyle]}
            >
              <Text style={styles.cardTitle}>
                {entry.logType === 'food' ? 'Meal' : entry.logType === 'symptom' ? (SYMPTOM_TYPES[entry.type] || entry.type) : 'Ketone'}
                {'  '}
                <Text style={styles.cardTimestamp}>
                  {new Date(entry.time).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </Text>
                {/* Fat red X for carb meals */}
                {entry.logType === 'food' && entry.isCarb ? (
                  <MaterialCommunityIcons name="close-circle" size={22} color="#e74c3c" style={styles.carbIcon} />
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
              <View style={styles.logActions}>
                <Pressable
                  onPress={() => { setEditLogType(entry.logType); setEditLog(entry); setEditModalVisible(true); }}
                  style={[styles.modalButton, styles.modalButtonSpacingRight]}
                  accessibilityLabel="Edit log"
                >
                  <Text style={styles.modalButtonPrimaryText}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => { setEditLogType(entry.logType); setEditLog(entry); setEditModalVisible(true); }}
                  style={[styles.modalButton, styles.modalButtonNeutral]}
                  accessibilityLabel="Delete log"
                >
                  <Text style={styles.modalButtonNeutralText}>Delete</Text>
                </Pressable>
              </View>
            </View>
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
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit {editLogType === 'food' ? 'Food' : 'Symptom'} Log</Text>
                {editLogType === 'food' ? (
                  <>
                    <Text style={styles.fieldLabel}>Type:</Text>
                    <View style={styles.foodTypeRow}>
                      <Pressable style={[styles.foodTypeButton, editFoodType === 'meal' && styles.foodTypeButtonActive]} onPress={() => setEditFoodType('meal')} accessibilityLabel="Meal">
                        <Text style={styles.foodTypeEmoji}>🍽️ Meal</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.fieldLabel}>Symptom:</Text>
                    <View style={styles.symptomTypeRow}>
                      {SYMPTOM_TYPES.map(t => (
                        <Pressable
                          key={t.key}
                          style={[
                            styles.foodTypeButton,
                            editSymptomType === t.key && styles.foodTypeButtonActive,
                          ]}
                          onPress={() => setEditSymptomType(t.key)}
                          accessibilityLabel={t.label}
                        >
                          <Text style={styles.foodTypeEmoji}>{t.emoji}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <Text style={styles.symptomLabel}>
                      {SYMPTOM_TYPES.find(t => t.key === editSymptomType)?.label}
                    </Text>
                    <Text style={styles.fieldLabel}>Severity:</Text>
                    <View style={styles.severityRow}>
                      {SEVERITIES.map(s => (
                        <Pressable
                          key={s.key}
                          style={[styles.foodTypeButton, editSeverity === s.key && styles.foodTypeButtonActive]}
                          onPress={() => setEditSeverity(s.key)}
                          accessibilityLabel={s.label}
                        >
                          <Text style={styles.severityLabel}>{s.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
                <Text style={styles.fieldLabel}>Time:</Text>
                <Pressable style={[styles.modalButton, styles.modalButtonBottomSpacing]} onPress={() => setShowEditTimePicker(true)}>
                  <Text style={styles.modalButtonPrimaryText}>
                    {editTime.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </Text>
                </Pressable>
                <DateTimePickerModal
                  isVisible={showEditTimePicker}
                  mode="datetime"
                  date={editTime}
                    onConfirm={date => { setEditTime(date); setShowEditTimePicker(false); }}
                  onCancel={() => setShowEditTimePicker(false)}
                  is24Hour={true}
                />
                <Text style={styles.fieldLabel}>Note (optional):</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.noteInput}
                    numberOfLines={1}
                    onChangeText={setEditNote}
                    value={editNote}
                    placeholder="e.g. high carb, before meds, etc."
                    accessibilityLabel="Log note input"
                  />
                </View>
                <View style={styles.modalFooter}>
                  <Pressable style={[styles.modalButton, styles.modalButtonNeutral]} onPress={() => {
                    // Delete log
                    if (editLogType === 'food') {
                      setFoodLog(foodLog.filter(e => e.id !== editLog.id));
                    } else {
                      setSymptomLog(symptomLog.filter(e => e.id !== editLog.id));
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
                      } else {
                        setSymptomLog(symptomLog.map(e => e.id === editLog.id ? {
                          ...e,
                          type: editSymptomType,
                          severity: editSeverity,
                          time: editTime.toISOString(),
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
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eaf6f6',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2d4d4d',
  },
  modalDescription: {
    marginBottom: 12,
    color: '#4d6d6d',
    textAlign: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pillRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pill: {
    backgroundColor: '#eaf6f6',
    borderColor: '#6bb3b6',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  exportPill: {
    margin: 4,
  },
  timeRangePill: {
    marginHorizontal: 4,
  },
  pillActive: {
    backgroundColor: '#6bb3b6',
  },
  pillLabel: {
    color: '#6bb3b6',
    fontWeight: 'bold',
  },
  pillLabelActive: {
    color: '#fff',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#6bb3b6',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  filterPillActive: {
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  filterPillLabel: {
    marginLeft: 6,
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
  cardText: {
    fontSize: 16,
    color: '#4d6d6d',
    marginBottom: 4,
  },
  logCard: {
    borderLeftWidth: 6,
  },
  cardTimestamp: {
    color: '#4d6d6d',
    fontWeight: 'normal',
    fontSize: 14,
  },
  carbIcon: {
    marginLeft: 8,
    marginBottom: -4,
  },
  logActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  modalButtonSpacingRight: {
    marginRight: 8,
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtonNeutral: {
    backgroundColor: '#ccc',
  },
  modalButtonNeutralText: {
    color: '#2d4d4d',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButtonTopMargin: {
    marginTop: 8,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  noteInput: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: '#2d4d4d',
    backgroundColor: '#f8f8f8',
    minHeight: 40,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  summaryMetric: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#4d6d6d',
  },
  summaryValue: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  summaryValueMeat: {
    color: '#89ce00',
  },
  summaryValueFasts: {
    color: '#6bb3b6',
  },
  summaryValueSymptoms: {
    color: '#e74c3c',
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
  fieldLabel: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    color: '#4d6d6d',
  },
  modalButton: {
    backgroundColor: '#6bb3b6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  modalButtonBottomSpacing: {
    marginBottom: 12,
  },
  foodTypeButton: {
    flex: 1,
    backgroundColor: '#eaf6f6',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6bb3b6',
  },
  foodTypeButtonActive: {
    backgroundColor: '#6bb3b6',
  },
  foodTypeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  foodTypeEmoji: {
    fontSize: 20,
  },
  symptomTypeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  symptomLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: '#2d4d4d',
    marginBottom: 12,
  },
  severityRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  severityLabel: {
    fontSize: 16,
  },
  symptomLogEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  symptomLogTime: {
    fontSize: 13,
    color: '#4d6d6d',
    marginBottom: 2,
    maxWidth: 180,
    textAlign: 'center',
  },
  symptomLogNote: {
    fontSize: 13,
    color: '#6bb3b6',
    marginBottom: 2,
    maxWidth: 180,
    textAlign: 'center',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#6bb3b6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2d4d4d',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateTitle: {
    color: '#6bb3b6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyStateSubtitle: {
    color: '#4d6d6d',
    fontSize: 16,
    marginTop: 8,
  },
});

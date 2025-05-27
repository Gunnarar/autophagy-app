import * as React from 'react';
import { Button, View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const SYMPTOMS = [
  'Tremor',
  'Slowed movement',
  'Rigid muscles',
  'Poor posture and balance',
  'Loss of automatic movements',
  'Speech changes',
  'Writing changes',
  'Nonmotor symptoms',
];

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome to Genesis4PD!</Text>
      <Button
        title="Go to Fasting"
        onPress={() => navigation.navigate('Fasting')}
      />
    </View>
  );
}

function getAutophagyStatus(elapsed) {
  if (elapsed < 16 * 3600) return { text: 'Autophagy not active', color: '#d9534f' };
  if (elapsed < 24 * 3600) return { text: 'Autophagy likely active', color: '#f0ad4e' };
  return { text: 'Deep autophagy likely', color: '#5cb85c' };
}

function DateTimePickerWeb({ value, onChange }) {
  return (
    <input
      type="datetime-local"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ fontSize: 18, padding: 8, marginBottom: 16, width: 220 }}
    />
  );
}

function FastingScreen({ navigation }) {
  const [isFasting, setIsFasting] = React.useState(false);
  const [startTime, setStartTime] = React.useState(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [loggedSymptoms, setLoggedSymptoms] = React.useState([]);
  const [mealModalVisible, setMealModalVisible] = React.useState(false);
  const [loggedMeals, setLoggedMeals] = React.useState([]);
  const [mealType, setMealType] = React.useState(null);
  const [mealDateTime, setMealDateTime] = React.useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [startFastingModalVisible, setStartFastingModalVisible] = React.useState(false);
  const [fastingStartDateTime, setFastingStartDateTime] = React.useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const intervalRef = React.useRef(null);

  React.useEffect(() => {
    if (isFasting) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isFasting, startTime]);

  const handleStart = () => {
    setStartTime(new Date(fastingStartDateTime).getTime());
    setElapsed(Math.max(0, Math.floor((Date.now() - new Date(fastingStartDateTime).getTime()) / 1000)));
    setIsFasting(true);
    setStartFastingModalVisible(false);
    // Reset picker to now for next time
    const now = new Date();
    setFastingStartDateTime(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  };

  const handleStop = () => {
    setIsFasting(false);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const autophagy = getAutophagyStatus(elapsed);

  const handleLogSymptom = (symptom) => {
    setLoggedSymptoms((prev) => [...prev, { symptom, time: new Date() }]);
    setModalVisible(false);
  };

  const handleLogMeal = (type) => {
    const mealTime = new Date(mealDateTime);
    setLoggedMeals((prev) => [...prev, { type, time: mealTime }]);
    setMealModalVisible(false);
    setMealType(null);
    if (isFasting) {
      setIsFasting(false); // Stop fasting timer
    }
    setStartTime(mealTime.getTime());
    setElapsed(Math.max(0, Math.floor((Date.now() - mealTime.getTime()) / 1000)));
    // Reset picker to now for next time
    const now = new Date();
    setMealDateTime(new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Fasting Timer</Text>
      <Text style={{ fontSize: 32, marginBottom: 10 }}>{formatTime(elapsed)}</Text>
      <Text style={{ fontSize: 18, marginBottom: 20, color: autophagy.color }}>{autophagy.text}</Text>
      {!isFasting ? (
        <Button title="Start Fasting" onPress={() => setStartFastingModalVisible(true)} />
      ) : (
        <Button title="Stop Fasting" onPress={handleStop} color="#d9534f" />
      )}
      <View style={{ height: 20 }} />
      <Button title="Log Symptoms" onPress={() => setModalVisible(true)} />
      <View style={{ height: 20 }} />
      <Button title="Log Meal" onPress={() => setMealModalVisible(true)} color="#5bc0de" />
      <View style={{ height: 20 }} />
      <Button title="Go Back" onPress={() => navigation.goBack()} />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 22, marginBottom: 20 }}>Log Symptoms</Text>
            {SYMPTOMS.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={styles.symptomButton}
                onPress={() => handleLogSymptom(symptom)}
              >
                <Text style={{ fontSize: 20 }}>{symptom}</Text>
              </TouchableOpacity>
            ))}
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#888" />
          </View>
        </View>
      </Modal>
      <Modal
        visible={mealModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMealModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 22, marginBottom: 20 }}>Log Meal</Text>
            <DateTimePickerWeb value={mealDateTime} onChange={setMealDateTime} />
            <TouchableOpacity
              style={styles.mealButton}
              onPress={() => handleLogMeal('Simple Meal')}
            >
              <Text style={{ fontSize: 20 }}>I ate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mealButton}
              onPress={() => handleLogMeal('Carbs')}
            >
              <Text style={{ fontSize: 20 }}>Meal with Carbs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mealButton}
              onPress={() => handleLogMeal('No Carbs')}
            >
              <Text style={{ fontSize: 20 }}>Meal without Carbs</Text>
            </TouchableOpacity>
            <Button title="Cancel" onPress={() => setMealModalVisible(false)} color="#888" />
          </View>
        </View>
      </Modal>
      {/* Start Fasting Modal */}
      <Modal
        visible={startFastingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setStartFastingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 22, marginBottom: 20 }}>Start Fasting</Text>
            <DateTimePickerWeb value={fastingStartDateTime} onChange={setFastingStartDateTime} />
            <Button title="Start" onPress={handleStart} />
            <View style={{ height: 10 }} />
            <Button title="Cancel" onPress={() => setStartFastingModalVisible(false)} color="#888" />
          </View>
        </View>
      </Modal>
      {loggedSymptoms.length > 0 && (
        <View style={{ marginTop: 30, width: '90%', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>Recent Symptoms</Text>
          {loggedSymptoms.slice(-5).reverse().map((entry, idx) => (
            <View key={idx} style={{ backgroundColor: '#f7f7f7', borderRadius: 8, padding: 10, marginBottom: 6, width: '100%' }}>
              <Text style={{ fontSize: 18 }}>{entry.symptom}</Text>
              <Text style={{ fontSize: 14, color: '#888' }}>{entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          ))}
        </View>
      )}
      {loggedMeals.length > 0 && (
        <View style={{ marginTop: 30, width: '90%', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, marginBottom: 10 }}>Recent Meals</Text>
          {loggedMeals.slice(-5).reverse().map((entry, idx) => (
            <View key={idx} style={{ backgroundColor: '#eafaf1', borderRadius: 8, padding: 10, marginBottom: 6, width: '100%' }}>
              <Text style={{ fontSize: 18 }}>{entry.type}</Text>
              <Text style={{ fontSize: 14, color: '#888' }}>{entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 320,
    alignItems: 'center',
    elevation: 5,
  },
  symptomButton: {
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  mealButton: {
    backgroundColor: '#d9edf7',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Fasting" component={FastingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

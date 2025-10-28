import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?name=Genesis+User&background=b3c7f7&color=fff&size=128';

export default function ProfileScreen({ navigation }) {
  const { user } = useUser();
  if (!user) {return <View style={styles.container}><Text>Loading...</Text></View>;}
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: AVATAR_PLACEHOLDER }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name || 'Genesis User'}</Text>
        <Text style={styles.email}>{user.email || ''}</Text>
        </View>
      <TouchableOpacity
        style={styles.sectionButton}
        onPress={() => navigation.navigate('ProfileDetails')}
      >
        <Ionicons name="person" size={24} color="#8babf1" style={{ marginRight: 12 }} />
        <Text style={styles.buttonText}>Profile Details</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.sectionButton}
        onPress={() => navigation.navigate('FastingPrograms')}
      >
        <MaterialCommunityIcons name="timer-sand" size={24} color="#89ce00" style={{ marginRight: 12 }} />
        <Text style={styles.buttonText}>Fasting Programs</Text>
      </TouchableOpacity>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 32, backgroundColor: '#d9e4ff' },
  avatarContainer: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12, backgroundColor: '#b3c7f7' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#2d4d4d', marginBottom: 4 },
  email: { fontSize: 16, color: '#4d6d6d', marginBottom: 8 },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#b3c7f7',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: { fontSize: 18, fontWeight: '600', color: '#2d4d4d' },
});

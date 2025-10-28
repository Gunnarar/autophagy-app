import React from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function QuickActionFAB({
  open,
  onToggle,
  onAddMeal,
  onAddSymptom,
  mealAnim,
  symptomAnim,
}) {
  const symptomAnimatedStyle = React.useMemo(() => ({
    opacity: symptomAnim,
    transform: [
      { translateX: symptomAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -36] }) },
      { translateY: symptomAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -36] }) },
      { scale: symptomAnim },
    ],
  }), [symptomAnim]);

  const mealAnimatedStyle = React.useMemo(() => ({
    opacity: mealAnim,
    transform: [
      { translateY: mealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -48] }) },
      { scale: mealAnim },
    ],
  }), [mealAnim]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={[styles.miniWrapper, styles.symptomMiniWrapper, symptomAnimatedStyle]}
        pointerEvents={open ? 'auto' : 'none'}
      >
        <Pressable
          style={styles.fabMini}
          onPress={onAddSymptom}
          accessibilityLabel="Add symptom"
        >
          <Text style={styles.fabMiniIcon}>🧠</Text>
        </Pressable>
        <Text style={styles.fabMiniLabel}>Add Symptom</Text>
      </Animated.View>

      <Animated.View
        style={[styles.miniWrapper, styles.mealMiniWrapper, mealAnimatedStyle]}
        pointerEvents={open ? 'auto' : 'none'}
      >
        <Pressable
          style={styles.fabMini}
          onPress={onAddMeal}
          accessibilityLabel="Add meal"
        >
          <Text style={styles.fabMiniIcon}>🍽️</Text>
        </Pressable>
        <Text style={styles.fabMiniLabel}>Add Meal</Text>
      </Animated.View>

      <Pressable
        style={styles.fab}
        onPress={onToggle}
        accessibilityLabel={open ? 'Close menu' : 'Add log entry'}
      >
        <Animated.View style={open ? styles.fabIconOpen : styles.fabIcon}>
          <Ionicons name="add" size={36} color="#fff" />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
    bottom: 36,
    alignItems: 'center',
    zIndex: 100,
  },
  miniWrapper: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 101,
  },
  symptomMiniWrapper: {
    right: 36,
    bottom: 0,
  },
  mealMiniWrapper: {
    right: 0,
    bottom: 48,
  },
  fab: {
    backgroundColor: theme.colors.primary,
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabMini: {
    backgroundColor: theme.colors.primary,
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMiniIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  fabMiniLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  fabIcon: {
    transform: [{ rotate: '0deg' }],
  },
  fabIconOpen: {
    transform: [{ rotate: '45deg' }],
  },
});

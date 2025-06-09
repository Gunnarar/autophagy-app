export function formatTimeHMS(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export function formatTimeHM(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export const FAST_GOAL_SECONDS = 16 * 3600; // 16 hours
export const MILESTONES = [0, 2, 4, 6, 8, 12, 16, 24]; // hours

export const MILESTONE_INFO = {
  0: {
    title: '0 hours',
    description: 'Fasting started. Take medication as prescribed. Monitor for hunger or low energy.',
    icon: 'pill',
    emoji: '💊',
  },
  2: {
    title: '2 hours',
    description: 'Some may notice tremor or slowness if medication is wearing off. Stay hydrated.',
    icon: null,
    emoji: '🤲',
  },
  4: {
    title: '4 hours',
    description: 'Energy may dip. If you feel weak, consider a rest or gentle movement.',
    icon: 'walk',
    emoji: '🚶',
  },
  6: {
    title: '6 hours',
    description: 'Monitor for fatigue or mood changes. Log any symptoms.',
    icon: 'emoticon-sad',
    emoji: '😔',
  },
  8: {
    title: '8 hours',
    description: 'Blood sugar drops, fat burning begins. Some may feel more alert, others may feel tired.',
    icon: 'fire',
    emoji: '🔥',
  },
  12: {
    title: '12 hours',
    description: 'Ketosis may start. If you feel unwell, break your fast safely.',
    icon: 'water',
    emoji: '💧',
  },
  16: {
    title: '16 hours',
    description: 'Autophagy increases. Continue to monitor symptoms.',
    icon: null,
    emoji: '🦠',
  },
  24: {
    title: '24 hours',
    description: 'Deep autophagy. Only attempt prolonged fasting with medical supervision.',
    icon: null,
    emoji: '👨‍⚕️',
  },
};

export const SYMPTOM_TYPES = [
  { key: 'tremor', label: 'Tremor', emoji: '🤲' },
  { key: 'slowness', label: 'Slowness', emoji: '🐢' },
  { key: 'stiffness', label: 'Stiffness', emoji: '🦵' },
  { key: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { key: 'mood', label: 'Mood', emoji: '🙂' },
  { key: 'other', label: 'Other', emoji: '❓' },
];

export const SEVERITIES = [
  { key: 'mild', label: 'Mild' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'severe', label: 'Severe' },
]; 
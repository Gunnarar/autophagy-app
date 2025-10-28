import React from 'react';
import { View, StyleSheet } from 'react-native';
import StatusPill from './StatusPill';

export default function StatusOverview({ statuses = [] }) {
  if (!statuses.length) {return null;}

  return (
    <View style={styles.container}>
      {statuses.map(status => (
        <StatusPill key={status.key} status={status.status} icon={status.icon} label={status.label} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

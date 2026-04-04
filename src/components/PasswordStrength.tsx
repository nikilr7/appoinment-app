import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Level = { label: string; color: string; bars: number };

function getStrength(pwd: string): Level {
  if (!pwd || pwd.length < 6) return { label: 'Weak', color: '#e74c3c', bars: 1 };
  if (pwd.length < 10) return { label: 'Medium', color: '#f39c12', bars: 2 };
  return { label: 'Strong', color: '#27ae60', bars: 3 };
}

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { label, color, bars } = getStrength(password);
  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.bar, { backgroundColor: i <= bars ? color : '#e0e0e0' }]} />
        ))}
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  bars: { flexDirection: 'row', gap: 4 },
  bar: { height: 5, width: 40, borderRadius: 3 },
  label: { fontSize: 12, fontWeight: '600' },
});

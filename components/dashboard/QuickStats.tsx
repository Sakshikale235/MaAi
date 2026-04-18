import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/theme';

const stats = [
  { label: 'Total Patients', value: 48, color: Colors.primary },
  { label: 'High Risk', value: 7, color: Colors.risk.high },
  { label: 'Pending Referrals', value: 3, color: Colors.risk.medium },
];

export default function QuickStats() {
  return (
    <View style={styles.container}>
      {stats.map((stat) => (
        <View key={stat.label} style={[styles.card, { borderTopColor: stat.color }]}>
          <Text style={[styles.value, { color: stat.color }]}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 12,
    borderTopWidth: 3,
    ...Shadow.sm,
    alignItems: 'center',
    gap: 4,
  },
  value: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  label: { fontSize: FontSize.xs, color: Colors.text.muted, textAlign: 'center', lineHeight: 14 },
});

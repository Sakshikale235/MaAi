import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ChevronRight, Lock, Wifi, WifiOff } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import Badge from '@/components/ui/Badge';
import { Patient } from '@/types';

interface PatientCardProps {
  patient: Patient;
  onPress: () => void;
}

export default function PatientCard({ patient, onPress }: PatientCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const riskColors = {
    HIGH: Colors.risk.high,
    MEDIUM: Colors.risk.medium,
    LOW: Colors.risk.low,
  };

  const initials = patient.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
        activeOpacity={1}
      >
        <View style={[styles.avatar, { backgroundColor: riskColors[patient.riskLevel] + '20' }]}>
          <Text style={[styles.initials, { color: riskColors[patient.riskLevel] }]}>{initials}</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{patient.name}</Text>
            <Lock size={11} color={Colors.text.muted} />
          </View>
          <Text style={styles.meta}>
            {patient.age} yrs · {patient.village}
            {patient.weeksPregnant ? ` · ${patient.weeksPregnant}w` : ''}
          </Text>
          <Text style={styles.lastVisit}>Last visit: {patient.lastVisit}</Text>
          <View style={styles.tags}>
            <Badge label={patient.riskLevel} risk={patient.riskLevel} size="sm" />
            {patient.abhaId && (
              <Badge label="ABHA" variant="primary" size="sm" />
            )}
          </View>
        </View>

        <View style={styles.right}>
          {patient.synced ? (
            <Wifi size={14} color={Colors.status.synced} />
          ) : (
            <WifiOff size={14} color={Colors.status.offline} />
          )}
          <ChevronRight size={18} color={Colors.text.muted} style={{ marginTop: 8 }} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  meta: { fontSize: FontSize.sm, color: Colors.text.secondary },
  lastVisit: { fontSize: FontSize.xs, color: Colors.text.muted },
  tags: { flexDirection: 'row', gap: 6, marginTop: 4 },
  right: { alignItems: 'center', gap: 2 },
});

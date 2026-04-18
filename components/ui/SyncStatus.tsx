import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { RefreshCw, WifiOff, CircleCheck as CheckCircle, Loader } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight } from '@/constants/theme';
import { SyncState } from '@/types';

interface SyncStatusProps {
  state: SyncState;
  pendingCount?: number;
  onSync?: () => void;
}

export default function SyncStatus({ state, pendingCount = 0, onSync }: SyncStatusProps) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === 'syncing') {
      Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 1000, useNativeDriver: true })
      ).start();
    } else {
      spin.stopAnimation();
      spin.setValue(0);
    }
  }, [state]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const config = {
    offline: {
      color: Colors.status.offline,
      bg: '#ECEFF1',
      label: pendingCount > 0 ? `Offline — ${pendingCount} pending` : 'Offline',
      Icon: WifiOff,
    },
    syncing: {
      color: Colors.status.syncing,
      bg: Colors.risk.mediumLight,
      label: 'Syncing…',
      Icon: Loader,
    },
    synced: {
      color: Colors.status.synced,
      bg: Colors.risk.lowLight,
      label: 'Synced',
      Icon: CheckCircle,
    },
  }[state];

  return (
    <TouchableOpacity onPress={onSync} style={[styles.container, { backgroundColor: config.bg }]}>
      {state === 'syncing' ? (
        <Animated.View style={{ transform: [{ rotate }] }}>
          <RefreshCw size={12} color={config.color} />
        </Animated.View>
      ) : (
        <config.Icon size={12} color={config.color} />
      )}
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});

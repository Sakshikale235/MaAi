import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight } from '@/constants/theme';
import { RiskLevel } from '@/types';

interface RiskGaugeProps {
  risk: RiskLevel;
  confidence: number;
  size?: number;
}

export default function RiskGauge({ risk, confidence, size = 160 }: RiskGaugeProps) {
  const animVal = useRef(new Animated.Value(0)).current;
  const pulseVal = useRef(new Animated.Value(1)).current;

  const riskConfig = {
    HIGH: { color: Colors.risk.high, label: 'HIGH RISK', emoji: '⚠️', score: 85 },
    MEDIUM: { color: Colors.risk.medium, label: 'MEDIUM RISK', emoji: '⚡', score: 55 },
    LOW: { color: Colors.risk.low, label: 'LOW RISK', emoji: '✓', score: 20 },
  }[risk];

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: riskConfig.score / 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    if (risk === 'HIGH') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseVal, { toValue: 1.06, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseVal, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const outerRing = size;
  const innerRing = size * 0.75;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.outer,
          {
            width: outerRing,
            height: outerRing,
            borderRadius: outerRing / 2,
            borderColor: riskConfig.color + '30',
            transform: [{ scale: pulseVal }],
          },
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              width: innerRing,
              height: innerRing,
              borderRadius: innerRing / 2,
              backgroundColor: riskConfig.color + '15',
              borderColor: riskConfig.color + '50',
            },
          ]}
        >
          <View style={[styles.center, { backgroundColor: riskConfig.color + '20' }]}>
            <Text style={[styles.emoji]}>{riskConfig.emoji}</Text>
            <Text style={[styles.riskLabel, { color: riskConfig.color }]}>{riskConfig.label}</Text>
            <Text style={[styles.confidence, { color: riskConfig.color }]}>
              {Math.round(confidence * 100)}% confident
            </Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.bar}>
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              {
                backgroundColor: riskConfig.color,
                width: animVal.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              },
            ]}
          />
        </View>
        <View style={styles.barLabels}>
          <Text style={[styles.barLabel, { color: Colors.risk.low }]}>Low</Text>
          <Text style={[styles.barLabel, { color: Colors.risk.medium }]}>Medium</Text>
          <Text style={[styles.barLabel, { color: Colors.risk.high }]}>High</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 24 },
  outer: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    width: '70%',
    height: '70%',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  emoji: { fontSize: 28 },
  riskLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1 },
  confidence: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, opacity: 0.8 },
  bar: { width: '100%', gap: 6 },
  barTrack: {
    height: 8,
    backgroundColor: '#E8EEF2',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
});

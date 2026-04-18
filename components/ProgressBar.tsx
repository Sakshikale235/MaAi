import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface ProgressBarProps {
  riskLevel: 'STABLE' | 'NEEDS ATTENTION' | 'HIGH';
  score: number; // For internal positioning safely derived from the new WHO Engine scoring
}

export default function ProgressBar({ riskLevel, score }: ProgressBarProps) {
  const animatedFill = useRef(new Animated.Value(0)).current;

  let color = '#d1d5db';
  switch (riskLevel) {
    case 'STABLE':
      color = '#10b981'; // Green
      break;
    case 'NEEDS ATTENTION':
      color = '#f59e0b'; // Yellow
      break;
    case 'HIGH':
      color = '#ef4444'; // Red
      break;
  }

  // Bind animation fill percentage to scale relative to the container smoothly
  const fillPercentage = Math.max(10, Math.min(score * 100, 100)); // Cap between 10% and 100% visibly

  useEffect(() => {
    Animated.timing(animatedFill, {
      toValue: fillPercentage,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [fillPercentage]);

  const widthAnim = animatedFill.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Health Status Indicator</Text>
      <View style={styles.barBackground}>
        <Animated.View style={[styles.barFill, { width: widthAnim, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    alignSelf: 'flex-start'
  },
  barBackground: {
    height: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  }
});

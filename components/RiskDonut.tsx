import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface RiskDonutProps {
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  overrideScore?: number;
}

export default function RiskDonut({ risk, overrideScore }: RiskDonutProps) {
  const size = 150;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  let percentage = overrideScore !== undefined ? overrideScore : 0;
  let color = '#d1d5db';

  switch (risk) {
    case 'LOW':
      if (overrideScore === undefined) percentage = 30;
      color = '#16a34a'; // green
      break;
    case 'MEDIUM':
      if (overrideScore === undefined) percentage = 65;
      color = '#f59e0b'; // orange
      break;
    case 'HIGH':
    case 'EMERGENCY':
      if (overrideScore === undefined) percentage = 90;
      color = '#dc2626'; // red
      break;
  }

  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background Circle */}
          <Circle
            stroke="#e5e7eb"
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Foreground Circle arc */}
          <Circle
            stroke={color}
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.textContainer}>
          <Text style={[styles.percentageText, { color }]}>{percentage}%</Text>
        </View>
      </View>
      <Text style={styles.label}>Risk Score</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  svgContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotate: '-90deg' }], // Start from the top
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '800',
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

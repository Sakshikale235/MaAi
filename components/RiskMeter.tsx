import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RiskMeterProps {
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  overrideScore?: number;
}

export default function RiskMeter({ risk, overrideScore }: RiskMeterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const size = 160;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  let endPercentage = overrideScore !== undefined ? overrideScore : 0;
  let color = '#d1d5db';

  switch (risk) {
    case 'LOW':
      if (overrideScore === undefined) endPercentage = 30;
      color = '#10b981'; // vibrant green
      break;
    case 'MEDIUM':
      if (overrideScore === undefined) endPercentage = 65;
      color = '#f59e0b'; // warning orange
      break;
    case 'HIGH':
    case 'EMERGENCY':
      if (overrideScore === undefined) endPercentage = 90;
      color = '#ef4444'; // critical red
      break;
  }

  useEffect(() => {
    // Fill animation sweeping effect
    Animated.timing(animatedValue, {
      toValue: endPercentage,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Pulse effect if High
    if (risk === 'HIGH' || risk === 'EMERGENCY') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [endPercentage, risk]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0]
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.svgContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background Track */}
          <Circle
            stroke="rgba(0,0,0,0.05)"
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Animated Foreground */}
          <AnimatedCircle
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
          <Text style={[styles.percentageText, { color }]}>{endPercentage}%</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  svgContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '900',
  },
});

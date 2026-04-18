import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: 'primary' | 'default' | 'alert';
  badge?: string | number;
}

export default function DashboardCard({
  icon,
  title,
  subtitle,
  onPress,
  variant = 'default',
  badge,
}: DashboardCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50 }),
      Animated.timing(glow, { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start();
  };
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }),
      Animated.timing(glow, { toValue: 0, duration: 150, useNativeDriver: false }),
    ]).start();
  };

  const bgColors = {
    primary: Colors.primary,
    default: Colors.surface,
    alert: Colors.risk.highLight,
  };

  const borderColors = {
    primary: Colors.primary,
    default: Colors.border.light,
    alert: Colors.risk.high + '40',
  };

  const iconBgColors = {
    primary: 'rgba(255,255,255,0.2)',
    default: Colors.primaryLight,
    alert: Colors.risk.highLight,
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.card,
          { backgroundColor: bgColors[variant], borderColor: borderColors[variant] },
        ]}
      >
        {badge !== undefined && (
          <View style={[styles.badge, { backgroundColor: variant === 'alert' ? Colors.risk.high : Colors.risk.high }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        <View style={[styles.iconBox, { backgroundColor: iconBgColors[variant] }]}>
          {icon}
        </View>

        <Text
          style={[
            styles.title,
            { color: variant === 'primary' ? '#FFFFFF' : Colors.text.primary },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: variant === 'primary' ? 'rgba(255,255,255,0.8)' : Colors.text.muted },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadow.md,
    gap: 10,
    position: 'relative',
    minHeight: 110,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, lineHeight: 20 },
  subtitle: { fontSize: FontSize.xs, lineHeight: 16 },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#FFFFFF', fontSize: FontSize.xs, fontWeight: FontWeight.bold },
});

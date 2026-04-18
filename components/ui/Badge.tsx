import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight } from '@/constants/theme';
import { RiskLevel } from '@/types';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'risk';
  risk?: RiskLevel;
  size?: 'sm' | 'md';
}

export default function Badge({ label, variant = 'primary', risk, size = 'md' }: BadgeProps) {
  const getStyle = () => {
    if (risk) {
      switch (risk) {
        case 'HIGH': return { bg: Colors.risk.highLight, text: Colors.risk.high };
        case 'MEDIUM': return { bg: Colors.risk.mediumLight, text: Colors.risk.medium };
        case 'LOW': return { bg: Colors.risk.lowLight, text: Colors.risk.low };
      }
    }
    switch (variant) {
      case 'success': return { bg: Colors.risk.lowLight, text: Colors.risk.low };
      case 'warning': return { bg: Colors.risk.mediumLight, text: Colors.risk.medium };
      case 'error': return { bg: Colors.risk.highLight, text: Colors.risk.high };
      case 'neutral': return { bg: '#F0F4F8', text: Colors.text.secondary };
      default: return { bg: Colors.primaryLight, text: Colors.primary };
    }
  };

  const { bg, text } = getStyle();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === 'sm' && styles.sm]}>
      <Text style={[styles.label, { color: text }, size === 'sm' && styles.labelSm]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 7, paddingVertical: 2 },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  labelSm: { fontSize: FontSize.xs },
});

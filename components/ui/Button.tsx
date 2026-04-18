import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, TouchTargetSize } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], width: fullWidth ? '100%' : undefined }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.base,
          styles[variant],
          styles[`size_${size}`],
          disabled && styles.disabled,
          fullWidth && styles.fullWidth,
          style,
        ]}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#fff' : Colors.primary} size="small" />
        ) : (
          <View style={styles.inner}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TouchTargetSize,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { marginRight: 8 },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.primaryLight },
  outline: { borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: 'transparent' },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.risk.high },

  text: { fontWeight: FontWeight.semibold },
  text_primary: { color: '#FFFFFF' },
  text_secondary: { color: Colors.primary },
  text_outline: { color: Colors.primary },
  text_ghost: { color: Colors.primary },
  text_danger: { color: '#FFFFFF' },

  size_sm: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
  size_md: { paddingHorizontal: 20, paddingVertical: 12 },
  size_lg: { paddingHorizontal: 28, paddingVertical: 16 },

  textSize_sm: { fontSize: FontSize.sm },
  textSize_md: { fontSize: FontSize.md },
  textSize_lg: { fontSize: FontSize.lg },
});

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight } from '@/constants/theme';

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loadingWidth = useRef(new Animated.Value(0)).current;
  const dotOpacity = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, speed: 5, bounciness: 8 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(loadingWidth, { toValue: 1, duration: 1500, useNativeDriver: false }),
    ]).start(() => {
      setTimeout(() => router.replace('/onboarding/language'), 300);
    });

    Animated.loop(
      Animated.stagger(200,
        dotOpacity.map((d) =>
          Animated.sequence([
            Animated.timing(d, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(d, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ])
        )
      )
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={['#0A5F67', '#0E7C86', '#4BBAC8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        <Animated.View
          style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        >
          <View style={styles.logoMark}>
            <Text style={styles.logoIcon}>⚕</Text>
          </View>
          <Text style={styles.logoText}>MaaAI</Text>
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          AI-powered maternal & neonatal care
        </Animated.Text>

        <Animated.View style={[styles.pillRow, { opacity: taglineOpacity }]}>
          {['Offline-first', 'ABDM ready', 'AI-powered'].map((pill) => (
            <View key={pill} style={styles.pill}>
              <Text style={styles.pillText}>{pill}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.loadingTrack}>
          <Animated.View
            style={[
              styles.loadingFill,
              {
                width: loadingWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <View style={styles.dots}>
          {dotOpacity.map((d, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: d }]} />
          ))}
        </View>
        <Text style={styles.version}>v2.1.0 · Ministry of Health</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  logoContainer: { alignItems: 'center', gap: 12 },
  logoMark: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoIcon: { fontSize: 48 },
  logoText: {
    fontSize: 52,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: FontSize.lg,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontWeight: FontWeight.medium,
    paddingHorizontal: 32,
  },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pillText: { color: '#FFFFFF', fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  bottom: { paddingBottom: 48, paddingHorizontal: 48, gap: 12, alignItems: 'center' },
  loadingTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 2 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.8)' },
  version: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.xs },
});

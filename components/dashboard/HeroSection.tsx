import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow } from '@/constants/theme';

export default function HeroSection() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0E7C86', '#4BBAC8', '#D6EEF2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.textBlock}>
            <Text style={styles.tagline}>Supporting safe motherhood</Text>
            <Text style={styles.subtitle}>AI-assisted care for every mother & newborn</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>1.2K+</Text>
                <Text style={styles.statLabel}>Patients</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statNum}>98%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statNum}>24/7</Text>
                <Text style={styles.statLabel}>Offline</Text>
              </View>
            </View>
          </View>

          <View style={styles.illustrationBox}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=300' }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  gradient: { padding: 20 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  textBlock: { flex: 1, gap: 8 },
  tagline: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    lineHeight: 26,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  stat: { alignItems: 'center', gap: 2 },
  statNum: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  statLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
  divider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.3)' },
  illustrationBox: {
    width: 100,
    height: 110,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 124, 134, 0.2)',
  },
});

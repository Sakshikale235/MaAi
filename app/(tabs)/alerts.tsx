import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { TriangleAlert as AlertTriangle, Clock, ChevronRight, Phone, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';

const ALERTS = [
  {
    id: '1',
    name: 'Radha Kumari',
    age: 24,
    village: 'Nashik',
    reason: 'BP 160/110 · Severe headache · Blurred vision',
    time: '2 hours ago',
    urgency: 'CRITICAL',
    weeksPregnant: 32,
  },
  {
    id: '4',
    name: 'Kavita Rao',
    age: 31,
    village: 'Nagpur',
    reason: 'MUAC < 21cm · Low fetal heart rate (110 bpm)',
    time: '3 days ago',
    urgency: 'HIGH',
    weeksPregnant: 36,
  },
  {
    id: '7',
    name: 'Laxmi Bai',
    age: 17,
    village: 'Amravati',
    reason: 'Age < 18 · First pregnancy · Anaemia',
    time: '5 hours ago',
    urgency: 'HIGH',
    weeksPregnant: 12,
  },
  {
    id: '8',
    name: 'Rohini Shinde',
    age: 35,
    village: 'Kolhapur',
    reason: 'Gestational diabetes · History of pre-eclampsia',
    time: '1 day ago',
    urgency: 'HIGH',
    weeksPregnant: 28,
  },
];

const urgencyConfig = {
  CRITICAL: { color: Colors.risk.high, bg: Colors.risk.highLight, label: 'CRITICAL', pulse: true },
  HIGH: { color: '#E65100', bg: '#FFF3E0', label: 'HIGH', pulse: false },
  MEDIUM: { color: Colors.risk.medium, bg: Colors.risk.mediumLight, label: 'MEDIUM', pulse: false },
};

export default function AlertsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <AlertTriangle size={22} color={Colors.risk.high} />
          <View>
            <Text style={styles.title}>High Risk Alerts</Text>
            <Text style={styles.subtitle}>{ALERTS.length} patients need attention</Text>
          </View>
        </View>
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentBadgeText}>{ALERTS.length} Active</Text>
        </View>
      </View>

      <View style={styles.banner}>
        <AlertTriangle size={16} color={Colors.risk.high} />
        <Text style={styles.bannerText}>
          These patients require immediate clinical review or referral
        </Text>
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {ALERTS.map((alert, i) => (
          <AlertCard key={alert.id} alert={alert} delay={i * 80} />
        ))}
        <View style={{ height: 20 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function AlertCard({ alert, delay }: { alert: (typeof ALERTS)[0]; delay: number }) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const config = urgencyConfig[alert.urgency as keyof typeof urgencyConfig];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 15, delay }),
    ]).start();

    if (config.pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  return (
    <Animated.View
      style={[
        { opacity: opacityAnim, transform: [{ translateY: slideAnim }, { scale: pulseAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: config.color }]}
        onPress={() => router.push(`/patient/${alert.id}`)}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.patientInfo}>
            <View style={[styles.avatar, { backgroundColor: config.bg }]}>
              <Text style={[styles.avatarText, { color: config.color }]}>
                {alert.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View>
              <Text style={styles.patientName}>{alert.name}</Text>
              <Text style={styles.patientMeta}>{alert.age} yrs · {alert.village} · {alert.weeksPregnant}w</Text>
            </View>
          </View>
          <View style={[styles.urgencyBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.urgencyText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Risk factors:</Text>
          <Text style={styles.reasonText}>{alert.reason}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.timeRow}>
            <Clock size={12} color={Colors.text.muted} />
            <Text style={styles.timeText}>{alert.time}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Phone size={14} color={Colors.primary} />
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]}>
              <FileText size={14} color="#FFFFFF" />
              <Text style={[styles.actionText, styles.actionTextPrimary]}>Refer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  subtitle: { fontSize: FontSize.xs, color: Colors.text.muted },
  urgentBadge: {
    backgroundColor: Colors.risk.highLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  urgentBadgeText: { color: Colors.risk.high, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.risk.highLight,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.risk.high,
  },
  bannerText: { flex: 1, fontSize: FontSize.xs, color: Colors.risk.high, lineHeight: 16 },
  list: { paddingHorizontal: Spacing.lg, gap: 12 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    ...Shadow.md,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  patientInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  patientName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary },
  patientMeta: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  urgencyText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  reasonBox: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: 10,
    gap: 3,
  },
  reasonLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  reasonText: { fontSize: FontSize.sm, color: Colors.text.primary, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: FontSize.xs, color: Colors.text.muted },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  actionText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary },
  actionTextPrimary: { color: '#FFFFFF' },
});

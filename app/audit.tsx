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
import { ArrowLeft, Brain, User, Stethoscope, RefreshCw, Shield } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';

const AUDIT_ENTRIES = [
  {
    id: '1',
    timestamp: 'Today, 10:30 AM',
    action: 'AI assessed HIGH risk for pre-eclampsia',
    actor: 'MaaAI System v2.1',
    role: 'AI',
    type: 'AI_DECISION',
    notes: 'BP 160/110 · Headache · Visual changes · Oedema. Confidence: 92%',
    icon: 'AI',
  },
  {
    id: '2',
    timestamp: 'Today, 10:35 AM',
    action: 'ANM initiated emergency referral',
    actor: 'ANM Sunita Sharma',
    role: 'ANM',
    type: 'ANM_ACTION',
    notes: 'Patient referred to District Hospital Nashik. Referral slip #MH-2024-4521 generated.',
    icon: 'ANM',
  },
  {
    id: '3',
    timestamp: 'Today, 11:00 AM',
    action: 'Data synced to ABDM',
    actor: 'MaaAI System',
    role: 'SYSTEM',
    type: 'SYNC',
    notes: 'Patient record, assessment data, and referral slip synced to ABDM.',
    icon: 'SYNC',
  },
  {
    id: '4',
    timestamp: 'Yesterday, 2:00 PM',
    action: 'MO reviewed and accepted AI decision',
    actor: 'Dr. Priya Mehta',
    role: 'MO',
    type: 'MO_REVIEW',
    notes: 'Clinical assessment concurs with AI. Immediate referral appropriate.',
    icon: 'MO',
  },
  {
    id: '5',
    timestamp: 'Yesterday, 10:30 AM',
    action: 'Assessment recorded',
    actor: 'ANM Sunita Sharma',
    role: 'ANM',
    type: 'ANM_ACTION',
    notes: 'BP 140/95 · Mild oedema · No visual symptoms. Assessment saved offline.',
    icon: 'ANM',
  },
  {
    id: '6',
    timestamp: '2 days ago, 3:00 PM',
    action: 'AI assessed MEDIUM risk',
    actor: 'MaaAI System v2.1',
    role: 'AI',
    type: 'AI_DECISION',
    notes: 'BP 140/95 · Mild oedema. Confidence: 78%',
    icon: 'AI',
  },
];

const TYPE_CONFIG = {
  AI_DECISION: { color: Colors.primary, bg: Colors.primaryLight, IconComp: Brain },
  ANM_ACTION: { color: Colors.risk.low, bg: Colors.risk.lowLight, IconComp: Stethoscope },
  MO_REVIEW: { color: Colors.risk.medium, bg: Colors.risk.mediumLight, IconComp: User },
  SYNC: { color: Colors.text.muted, bg: '#ECEFF1', IconComp: RefreshCw },
};

export default function AuditScreen() {
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{t('audit_log')}</Text>
          <Text style={styles.headerSub}>Radha Kumari · {t('all_events')}</Text>
        </View>
        <View style={styles.secureTag}>
          <Shield size={12} color={Colors.primary} />
          <Text style={styles.secureText}>{t('immutable')}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {[
          { label: t('ai_decision'), color: Colors.primary },
          { label: t('anm_action'), color: Colors.risk.low },
          { label: t('mo_review'), color: Colors.risk.medium },
        ].map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.timeline}
        showsVerticalScrollIndicator={false}
      >
        {AUDIT_ENTRIES.map((entry, i) => (
          <TimelineEntry key={entry.id} entry={entry} isLast={i === AUDIT_ENTRIES.length - 1} delay={i * 80} />
        ))}
        <View style={{ height: 20 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function TimelineEntry({
  entry,
  isLast,
  delay,
}: {
  entry: (typeof AUDIT_ENTRIES)[0];
  isLast: boolean;
  delay: number;
}) {
  const config = TYPE_CONFIG[entry.type as keyof typeof TYPE_CONFIG];
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 15, delay }),
    ]).start();
  }, []);

  const IconComp = config.IconComp;

  return (
    <Animated.View
      style={[styles.entryRow, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.timelineLeft}>
        <View style={[styles.iconCircle, { backgroundColor: config.bg, borderColor: config.color }]}>
          <IconComp size={16} color={config.color} />
        </View>
        {!isLast && <View style={[styles.line, { backgroundColor: config.color + '30' }]} />}
      </View>

      <View style={[styles.entryCard, { borderLeftColor: config.color }]}>
        <Text style={styles.entryTime}>{entry.timestamp}</Text>
        <Text style={styles.entryAction}>{entry.action}</Text>
        <Text style={styles.entryActor}>{entry.actor} · {entry.role}</Text>
        {entry.notes && (
          <View style={[styles.notesBox, { backgroundColor: config.bg }]}>
            <Text style={[styles.notesText, { color: config.color }]}>{entry.notes}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  back: { padding: 8 },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  headerSub: { fontSize: FontSize.xs, color: Colors.text.muted },
  secureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  secureText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  legend: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs, color: Colors.text.muted },
  timeline: { paddingHorizontal: Spacing.lg, paddingTop: 4 },
  entryRow: { flexDirection: 'row', gap: 14, marginBottom: 4 },
  timelineLeft: { alignItems: 'center', width: 36 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { flex: 1, width: 2, marginVertical: 4 },
  entryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 3,
    ...Shadow.sm,
    gap: 4,
    marginBottom: 12,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: Colors.border.light,
    borderRightColor: Colors.border.light,
    borderBottomColor: Colors.border.light,
  },
  entryTime: { fontSize: FontSize.xs, color: Colors.text.muted },
  entryAction: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  entryActor: { fontSize: FontSize.xs, color: Colors.text.secondary },
  notesBox: { borderRadius: BorderRadius.sm, padding: 8, marginTop: 4 },
  notesText: { fontSize: FontSize.xs, lineHeight: 16 },
});

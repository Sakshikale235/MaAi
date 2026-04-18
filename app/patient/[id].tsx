import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Activity,
  ClipboardList,
  MessageCircle,
  Clock,
  Lock,
  Wifi,
  Brain,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import Badge from '@/components/ui/Badge';

const TAB_DATA = [
  { id: 'overview', label: 'Overview' },
  { id: 'assessments', label: 'Assessments' },
  { id: 'epds', label: 'EPDS' },
  { id: 'audit', label: 'Audit Log' },
];

const PATIENT = {
  id: '1',
  name: 'Radha Kumari',
  age: 24,
  riskLevel: 'HIGH' as const,
  lastVisit: 'Today, 10:30 AM',
  weeksPregnant: 32,
  village: 'Nashik, Maharashtra',
  phone: '+91 98765 43210',
  synced: true,
  abhaId: 'ABHA-1234-5678-9012',
  bloodGroup: 'B+',
  height: '158 cm',
  weight: '62 kg',
  lmp: '15 May 2024',
  edd: '20 Feb 2025',
};

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{PATIENT.name}</Text>
          <Badge label={PATIENT.riskLevel} risk={PATIENT.riskLevel} size="sm" />
        </View>
        <View style={styles.headerRight}>
          <Lock size={14} color={Colors.text.muted} />
          <Wifi size={14} color={Colors.risk.low} />
        </View>
      </View>

      <View style={styles.tabBar}>
        {TAB_DATA.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'assessments' && <AssessmentsTab />}
        {activeTab === 'epds' && <EPDSTab />}
        {activeTab === 'audit' && <AuditTab />}
        <View style={{ height: 20 }} />
      </Animated.ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.assessBtn}
          onPress={() => router.push('/patient/assessment')}
        >
          <Activity size={18} color="#fff" />
          <Text style={styles.assessBtnText}>New Assessment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatBtn} onPress={() => router.push('/ai/chatbot')}>
          <MessageCircle size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function OverviewTab() {
  return (
    <View style={styles.tabContent}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>RK</Text>
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>{PATIENT.name}</Text>
          <Text style={styles.profileMeta}>{PATIENT.age} yrs · {PATIENT.village}</Text>
          <Text style={styles.profileMeta}>{PATIENT.phone}</Text>
        </View>
      </View>

      <View style={styles.abhaCard}>
        <View style={styles.abhaRow}>
          <View style={styles.abhaLeft}>
            <Text style={styles.abhaLabel}>ABHA ID</Text>
            <Text style={styles.abhaId}>{PATIENT.abhaId}</Text>
          </View>
          <View style={styles.abhaBadge}>
            <Text style={styles.abhaBadgeText}>Linked</Text>
          </View>
        </View>
        <View style={styles.syncRow}>
          <Wifi size={12} color={Colors.risk.low} />
          <Text style={styles.syncText}>Synced with ABDM · {PATIENT.lastVisit}</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        {[
          { label: 'Blood Group', value: PATIENT.bloodGroup },
          { label: 'Height', value: PATIENT.height },
          { label: 'Weight', value: PATIENT.weight },
          { label: 'Weeks', value: `${PATIENT.weeksPregnant}w` },
          { label: 'LMP', value: PATIENT.lmp },
          { label: 'EDD', value: PATIENT.edd },
        ].map((item) => (
          <View key={item.label} style={styles.infoCell}>
            <Text style={styles.infoCellLabel}>{item.label}</Text>
            <Text style={styles.infoCellValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.riskSummaryCard}>
        <View style={styles.riskSummaryHeader}>
          <Brain size={18} color={Colors.risk.high} />
          <Text style={styles.riskSummaryTitle}>Latest AI Risk Assessment</Text>
        </View>
        <Text style={styles.riskSummaryLevel}>HIGH RISK</Text>
        <Text style={styles.riskSummaryReason}>
          BP: 160/110 · Severe headache · Visual disturbances · Oedema present
        </Text>
        <TouchableOpacity
          style={styles.viewResultBtn}
          onPress={() => router.push('/ai/result')}
        >
          <Text style={styles.viewResultText}>View Full AI Report →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AssessmentsTab() {
  const items = [
    { date: 'Today, 10:30 AM', bp: '160/110', risk: 'HIGH', notes: 'Severe pre-eclampsia signs' },
    { date: '1 week ago', bp: '140/95', risk: 'MEDIUM', notes: 'Moderate hypertension' },
    { date: '2 weeks ago', bp: '118/78', risk: 'LOW', notes: 'Normal visit' },
  ];

  return (
    <View style={styles.tabContent}>
      {items.map((item, i) => (
        <TouchableOpacity key={i} style={styles.assessmentCard} onPress={() => router.push('/ai/result')}>
          <View style={styles.assessmentHeader}>
            <Clock size={14} color={Colors.text.muted} />
            <Text style={styles.assessmentDate}>{item.date}</Text>
            <Badge label={item.risk} risk={item.risk as any} size="sm" />
          </View>
          <Text style={styles.assessmentBP}>BP: {item.bp} mmHg</Text>
          <Text style={styles.assessmentNotes}>{item.notes}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function EPDSTab() {
  return (
    <View style={styles.tabContent}>
      <View style={styles.epdsCard}>
        <Text style={styles.epdsTitle}>Edinburgh Postnatal Depression Scale</Text>
        <View style={styles.epdsScore}>
          <Text style={styles.epdsScoreNum}>14</Text>
          <Text style={styles.epdsScoreLabel}>/ 30</Text>
        </View>
        <Badge label="Moderate Risk" variant="warning" />
        <Text style={styles.epdsDate}>Screened: 2 weeks ago</Text>
        <TouchableOpacity style={styles.epdsBtn} onPress={() => router.push('/epds')}>
          <Text style={styles.epdsButtonText}>Start New Screening</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AuditTab() {
  return (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.auditViewBtn}
        onPress={() => router.push('/audit')}
      >
        <Clock size={16} color={Colors.primary} />
        <Text style={styles.auditViewText}>View Full Audit Timeline</Text>
      </TouchableOpacity>
      {[
        { time: 'Today 10:30', action: 'AI assessed HIGH risk', actor: 'MaaAI System', type: 'AI_DECISION' },
        { time: 'Today 10:35', action: 'ANM initiated referral', actor: 'ANM Sunita', type: 'ANM_ACTION' },
        { time: 'Yesterday 14:00', action: 'MO accepted AI decision', actor: 'Dr. Priya', type: 'MO_REVIEW' },
      ].map((entry, i) => (
        <View key={i} style={styles.auditItem}>
          <View style={[styles.auditDot, { backgroundColor: entry.type === 'AI_DECISION' ? Colors.primary : entry.type === 'MO_REVIEW' ? Colors.risk.medium : Colors.risk.low }]} />
          <View style={styles.auditContent}>
            <Text style={styles.auditAction}>{entry.action}</Text>
            <Text style={styles.auditMeta}>{entry.actor} · {entry.time}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 8,
  },
  back: { padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  headerRight: { flexDirection: 'row', gap: 6, padding: 8 },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.surface,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.xs, color: Colors.text.muted, fontWeight: FontWeight.medium },
  tabTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  scroll: { padding: Spacing.lg },
  tabContent: { gap: 12 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.risk.highLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.risk.high },
  profileDetails: { flex: 1, gap: 3 },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  profileMeta: { fontSize: FontSize.sm, color: Colors.text.secondary },
  abhaCard: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    gap: 8,
  },
  abhaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  abhaLeft: { gap: 2 },
  abhaLabel: { fontSize: FontSize.xs, color: Colors.text.muted, fontWeight: FontWeight.medium },
  abhaId: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary, letterSpacing: 1 },
  abhaBadge: {
    backgroundColor: Colors.risk.lowLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  abhaBadgeText: { color: Colors.risk.low, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  syncText: { fontSize: FontSize.xs, color: Colors.text.muted },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoCell: {
    width: '31%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 10,
    gap: 3,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  infoCellLabel: { fontSize: FontSize.xs, color: Colors.text.muted },
  infoCellValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary },
  riskSummaryCard: {
    backgroundColor: Colors.risk.highLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.risk.high,
  },
  riskSummaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  riskSummaryTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.risk.high },
  riskSummaryLevel: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.risk.high },
  riskSummaryReason: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 },
  viewResultBtn: { alignSelf: 'flex-start' },
  viewResultText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  assessmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 6,
  },
  assessmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  assessmentDate: { flex: 1, fontSize: FontSize.xs, color: Colors.text.muted },
  assessmentBP: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  assessmentNotes: { fontSize: FontSize.sm, color: Colors.text.secondary },
  epdsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  epdsTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.primary, textAlign: 'center' },
  epdsScore: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  epdsScoreNum: { fontSize: 56, fontWeight: FontWeight.bold, color: Colors.risk.medium },
  epdsScoreLabel: { fontSize: FontSize.xl, color: Colors.text.muted },
  epdsDate: { fontSize: FontSize.xs, color: Colors.text.muted },
  epdsBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  epdsButtonText: { color: '#fff', fontWeight: FontWeight.semibold },
  auditViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  auditViewText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  auditItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 14,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  auditDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  auditContent: { flex: 1, gap: 3 },
  auditAction: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text.primary },
  auditMeta: { fontSize: FontSize.xs, color: Colors.text.muted },
  bottomBar: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    ...Shadow.sm,
  },
  assessBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  assessBtnText: { color: '#FFFFFF', fontWeight: FontWeight.semibold, fontSize: FontSize.md },
  chatBtn: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
});

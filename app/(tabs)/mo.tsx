import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { ClipboardList, CircleCheck as CheckCircle, Circle as XCircle, MessageSquare, ChevronDown, ChevronUp, Brain } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import Badge from '@/components/ui/Badge';
import { useLanguage } from '@/context/LanguageContext';

const PENDING_CASES = [
  {
    id: '1',
    name: 'Radha Kumari',
    age: 24,
    riskLevel: 'HIGH' as const,
    aiDecision: 'Immediate referral to PHC',
    confidence: 0.92,
    bp: '160/110',
    symptoms: ['Severe headache', 'Blurred vision', 'Oedema'],
    anmNote: 'Patient is distressed, unable to walk',
    time: '2h ago',
  },
  {
    id: '4',
    name: 'Kavita Rao',
    age: 31,
    riskLevel: 'HIGH' as const,
    aiDecision: 'Nutritional supplementation + monitoring',
    confidence: 0.78,
    bp: '118/76',
    symptoms: ['Low MUAC', 'Pallor', 'Fatigue'],
    anmNote: 'Family unable to travel for referral',
    time: '1d ago',
  },
  {
    id: '6',
    name: 'Anita Jadhav',
    age: 19,
    riskLevel: 'MEDIUM' as const,
    aiDecision: 'Weekly monitoring + iron supplements',
    confidence: 0.71,
    bp: '100/68',
    symptoms: ['Mild anaemia', 'Low weight gain'],
    anmNote: 'Young mother, needs counseling support',
    time: '5h ago',
  },
];

export default function MODashboardScreen() {
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('mo_dashboard')}</Text>
          <Text style={styles.subtitle}>{t('medical_officer_name')}</Text>
        </View>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>{PENDING_CASES.length} {t('pending_lc')}</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <SummaryBox label={t('pending_reviews')} value="3" color={Colors.risk.medium} />
        <SummaryBox label={t('reviewed_today')} value="8" color={Colors.primary} />
        <SummaryBox label={t('epds_alerts')} value="2" color={Colors.risk.high} />
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{t('pending_case_reviews')}</Text>
        {PENDING_CASES.map((c, i) => (
          <CaseReviewCard key={c.id} caseData={c} delay={i * 100} />
        ))}
        <View style={{ height: 20 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function SummaryBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.summaryBox, { borderTopColor: color }]}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function CaseReviewCard({ caseData, delay }: { caseData: (typeof PENDING_CASES)[0]; delay: number }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'pending' | 'accepted' | 'overridden'>('pending');
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 15, delay }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const handleAccept = () => setStatus('accepted');
  const handleOverride = () => setStatus('overridden');

  if (status !== 'pending') {
    return (
      <Animated.View style={[styles.resolvedCard, { opacity: opacityAnim }]}>
        <CheckCircle size={20} color={status === 'accepted' ? Colors.risk.low : Colors.risk.medium} />
        <Text style={styles.resolvedText}>
          {caseData.name} — {status === 'accepted' ? t('accepted_ai_decision') : t('decision_overridden')}
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={styles.caseCard}>
        <View style={styles.caseHeader}>
          <View>
            <Text style={styles.caseName}>{caseData.name}</Text>
            <Text style={styles.caseMeta}>{caseData.age} yrs · {caseData.time}</Text>
          </View>
          <View style={styles.caseHeaderRight}>
            <Badge label={caseData.riskLevel} risk={caseData.riskLevel} />
            <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.expandBtn}>
              {expanded ? <ChevronUp size={18} color={Colors.text.muted} /> : <ChevronDown size={18} color={Colors.text.muted} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.aiSection}>
          <View style={styles.aiLabel}>
            <Brain size={14} color={Colors.primary} />
            <Text style={styles.aiLabelText}>{t('ai_recommendation')}</Text>
          </View>
          <Text style={styles.aiDecision}>{caseData.aiDecision}</Text>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>{t('confidence')}</Text>
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceFill, { width: `${caseData.confidence * 100}%` }]} />
            </View>
            <Text style={styles.confidenceValue}>{Math.round(caseData.confidence * 100)}%</Text>
          </View>
        </View>

        {expanded && (
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>{t('bp')}</Text>
              <Text style={styles.detailValue}>{caseData.bp} mmHg</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>{t('symptoms')}</Text>
              <Text style={styles.detailValue}>{caseData.symptoms.join(', ')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>{t('anm_note')}</Text>
              <Text style={styles.detailValue}>{caseData.anmNote}</Text>
            </View>
          </View>
        )}

        <View style={styles.noteSection}>
          <MessageSquare size={14} color={Colors.text.muted} />
          <TextInput
            style={styles.noteInput}
            placeholder={t('add_clinical_note')}
            value={note}
            onChangeText={setNote}
            multiline
            placeholderTextColor={Colors.text.muted}
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <CheckCircle size={16} color="#FFFFFF" />
            <Text style={styles.acceptText}>{t('accept')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.overrideBtn} onPress={handleOverride}>
            <XCircle size={16} color={Colors.risk.medium} />
            <Text style={styles.overrideText}>{t('override')}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  subtitle: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  pendingBadge: {
    backgroundColor: Colors.risk.mediumLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pendingText: { color: Colors.risk.medium, fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  summaryRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 10, marginBottom: 16 },
  summaryBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 12,
    borderTopWidth: 3,
    ...Shadow.sm,
    alignItems: 'center',
    gap: 3,
  },
  summaryValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.text.muted, textAlign: 'center' },
  list: { paddingHorizontal: Spacing.lg, gap: 12 },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  caseCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.md,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  caseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  caseName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  caseMeta: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  caseHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expandBtn: { padding: 4 },
  aiSection: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    padding: 12,
    gap: 8,
  },
  aiLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiLabelText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },
  aiDecision: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.medium },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confidenceLabel: { fontSize: FontSize.xs, color: Colors.text.muted },
  confidenceBar: {
    flex: 1,
    height: 5,
    backgroundColor: Colors.border.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  confidenceValue: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },
  details: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    paddingTop: 8,
  },
  detailRow: { flexDirection: 'row', gap: 8 },
  detailKey: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.secondary, width: 80 },
  detailValue: { flex: 1, fontSize: FontSize.sm, color: Colors.text.primary },
  noteSection: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'flex-start',
  },
  noteInput: { flex: 1, fontSize: FontSize.sm, color: Colors.text.primary, minHeight: 36 },
  actionRow: { flexDirection: 'row', gap: 12 },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
  },
  acceptText: { color: '#FFFFFF', fontWeight: FontWeight.semibold, fontSize: FontSize.md },
  overrideBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.risk.medium,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
  },
  overrideText: { color: Colors.risk.medium, fontWeight: FontWeight.semibold, fontSize: FontSize.md },
  resolvedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 14,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  resolvedText: { fontSize: FontSize.sm, color: Colors.text.secondary },
});

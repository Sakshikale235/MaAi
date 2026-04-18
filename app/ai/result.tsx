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
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, FileText, MessageCircle, ThumbsDown, Share2, CircleCheck as CheckCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import RiskGauge from '@/components/ui/RiskGauge';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

export default function AIResultScreen() {
  const { t } = useLanguage();
  const { risk, reason, rec, confidence, patient_name, age, gestation_weeks } = useLocalSearchParams();
  const [disagreeVisible, setDisagreeVisible] = useState(false);
  const [disagreeReason, setDisagreeReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const displayRisk = typeof risk === 'string' ? risk.toUpperCase() : 'HIGH';
  const displayReason = typeof reason === 'string' ? reason : null;
  const displayRec = typeof rec === 'string' ? rec : t('rec_text');
  
  let nameLabel = typeof patient_name === 'string' && patient_name ? patient_name : 'Unknown Patient';
  if (typeof age === 'string' && age) nameLabel += ` · ${age} yrs`;
  if (typeof gestation_weeks === 'string' && gestation_weeks) nameLabel += ` · ${gestation_weeks}w`;
  
  const numericConfidence = typeof confidence === 'string' && !isNaN(parseFloat(confidence)) ? parseFloat(confidence) : 92;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 10 }),
    ]).start();
  }, []);

  const handleDisagree = async () => {
    if (!disagreeReason) return;
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setTimeout(() => setDisagreeVisible(false), 1500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('ai_risk_assessment_title')}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>v2.1</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[styles.gaugeSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.patientLabel}>{nameLabel}</Text>
          <RiskGauge risk={displayRisk as any} confidence={numericConfidence / 100} size={200} />
        </Animated.View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.explanationCard}>
            <Text style={styles.explainTitle}>Why {displayRisk} risk?</Text>
            {displayReason ? (
              <View style={styles.explainItem}>
                <Text style={styles.explainIcon}>🔍</Text>
                <Text style={styles.explainText}>{displayReason}</Text>
              </View>
            ) : (
              [
                { icon: '🩺', text: t('expl_1') },
                { icon: '🤕', text: t('expl_2') },
                { icon: '🦶', text: t('expl_3') },
                { icon: '📅', text: t('expl_4') },
              ].map((item, i) => (
                <View key={i} style={styles.explainItem}>
                  <Text style={styles.explainIcon}>{item.icon}</Text>
                  <Text style={styles.explainText}>{item.text}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.recommendCard}>
            <Text style={styles.recommendTitle}>{t('ai_recommend')}</Text>
            <Text style={styles.recommendText}>
              {displayRec}
            </Text>
          </View>

          <View style={styles.confidenceCard}>
            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>{t('model_confidence')}</Text>
              <Text style={styles.confidenceValue}>{numericConfidence}%</Text>
            </View>
            <View style={styles.confidenceTrack}>
              <Animated.View style={[styles.confidenceFill, { width: `${numericConfidence}%` }]} />
            </View>
            <Text style={styles.confidenceNote}>
              {t('confidence_note')}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <Button
              title={t('generate_referral')}
              onPress={() => router.push('/referral')}
              variant="primary"
              fullWidth
              size="lg"
              icon={<FileText size={18} color="#fff" />}
            />
            <Button
              title={t('ask_ai')}
              onPress={() => router.push('/ai/chatbot')}
              variant="outline"
              fullWidth
              icon={<MessageCircle size={18} color={Colors.primary} />}
            />
            <Button
              title={t('disagree_ai')}
              onPress={() => setDisagreeVisible(true)}
              variant="ghost"
              fullWidth
              icon={<ThumbsDown size={16} color={Colors.text.secondary} />}
              textStyle={{ color: Colors.text.secondary }}
            />
          </View>

          <View style={styles.auditNote}>
            <CheckCircle size={14} color={Colors.text.muted} />
            <Text style={styles.auditNoteText}>
              {t('audit_logged')}
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={disagreeVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {submitted ? (
              <View style={styles.modalSuccess}>
                <CheckCircle size={48} color={Colors.risk.low} />
                <Text style={styles.modalSuccessTitle}>{t('feedback_recorded')}</Text>
                <Text style={styles.modalSuccessText}>
                  {t('feedback_recorded_sub')}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalTitle}>{t('disagree_decision')}</Text>
                <Text style={styles.modalSubtitle}>
                  {t('clinical_expertise')}
                </Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder={t('describe_assessment')}
                  value={disagreeReason}
                  onChangeText={setDisagreeReason}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={Colors.text.muted}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setDisagreeVisible(false)}
                  >
                    <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitBtn, !disagreeReason && { opacity: 0.5 }]}
                    onPress={handleDisagree}
                    disabled={!disagreeReason}
                  >
                    <Text style={styles.submitBtnText}>{t('submit_feedback')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  back: { padding: 8 },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  badge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold },
  scroll: { padding: Spacing.lg, gap: 20 },
  gaugeSection: { alignItems: 'center', gap: 12 },
  patientLabel: { fontSize: FontSize.md, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  content: { gap: 16 },
  explanationCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadow.md,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  explainTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  explainItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  explainIcon: { fontSize: 18, marginTop: -1 },
  explainText: { flex: 1, fontSize: FontSize.sm, color: Colors.text.primary, lineHeight: 20 },
  recommendCard: {
    backgroundColor: Colors.risk.highLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.risk.high,
  },
  recommendTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.risk.high },
  recommendText: { fontSize: FontSize.sm, color: Colors.text.primary, lineHeight: 22 },
  confidenceCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
    gap: 8,
  },
  confidenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confidenceLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text.secondary },
  confidenceValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  confidenceTrack: { height: 8, backgroundColor: Colors.border.light, borderRadius: 4, overflow: 'hidden' },
  confidenceFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  confidenceNote: { fontSize: FontSize.xs, color: Colors.text.muted, lineHeight: 16 },
  actionButtons: { gap: 10 },
  auditNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  auditNoteText: { fontSize: FontSize.xs, color: Colors.text.muted },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: 16,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  modalSubtitle: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 },
  reasonInput: {
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: 14,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: 14,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: FontSize.md, color: Colors.text.secondary, fontWeight: FontWeight.semibold },
  submitBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: 14,
    alignItems: 'center',
  },
  submitBtnText: { fontSize: FontSize.md, color: '#FFFFFF', fontWeight: FontWeight.bold },
  modalSuccess: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  modalSuccessTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  modalSuccessText: { fontSize: FontSize.sm, color: Colors.text.secondary, textAlign: 'center', lineHeight: 20 },
});

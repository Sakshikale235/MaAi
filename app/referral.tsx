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
import { router } from 'expo-router';
import { ArrowLeft, Download, Share2, CircleCheck as CheckCircle, MapPin, User, Calendar } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';

export default function ReferralScreen() {
  const { t } = useLanguage();
  const [generated, setGenerated] = useState(false);
  const [shared, setShared] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    setTimeout(() => {
      setGenerated(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 10 }),
      ]).start();
    }, 500);
  }, []);

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('referral_slip')}</Text>
        {generated && (
          <View style={styles.genBadge}>
            <CheckCircle size={12} color={Colors.risk.low} />
            <Text style={styles.genBadgeText}>{t('generated')}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!generated ? (
          <View style={styles.generating}>
            <Text style={styles.generatingIcon}>⏳</Text>
            <Text style={styles.generatingText}>{t('generating_slip')}</Text>
          </View>
        ) : (
          <Animated.View
            style={[styles.slip, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <View style={styles.slipHeader}>
              <View style={styles.slipLogo}>
                <Text style={styles.slipLogoText}>{t('maa_ai')}</Text>
              </View>
              <View>
                <Text style={styles.slipTitle}>{t('emergency_slip')}</Text>
                <Text style={styles.slipDate}>{t('date')}: {new Date().toLocaleDateString('en-IN')}</Text>
                <Text style={styles.slipRef}>{t('ref')}: MH-2024-{Math.floor(Math.random() * 9000 + 1000)}</Text>
              </View>
            </View>

            <View style={styles.slipDivider} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('patient_details_label')}</Text>
              <SlipRow icon={<User size={14} color={Colors.text.muted} />} label={t('name')} value="Radha Kumari" />
              <SlipRow icon={<Calendar size={14} color={Colors.text.muted} />} label={t('age_gestation')} value="24 yrs / 32 weeks" />
              <SlipRow icon={<MapPin size={14} color={Colors.text.muted} />} label={t('village')} value="Nashik, Maharashtra" />
              <SlipRow label="ABHA ID" value="ABHA-1234-5678-9012" />
              <SlipRow label={t('blood_group')} value="B+" />
            </View>

            <View style={styles.slipDivider} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('clinical_findings')}</Text>
              <SlipRow label={t('step_bp')} value="160/110 mmHg" highlight />
              <SlipRow label={t('step_symp')} value="Severe headache, Blurred vision, Oedema" />
              <SlipRow label={t('ai_risk_level')} value="HIGH RISK" highlight />
              <SlipRow label={t('ai_confidence')} value="92%" />
            </View>

            <View style={styles.slipDivider} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('referral_details')}</Text>
              <SlipRow label={t('referred_from')} value="PHC Nashik · ANM Sunita Sharma" />
              <SlipRow label={t('referred_to')} value="District Hospital, Nashik" />
              <SlipRow label={t('urgency')} value="EMERGENCY" highlight />
              <SlipRow label={t('reason')} value="Suspected severe pre-eclampsia. Immediate obstetric care required." />
            </View>

            <View style={styles.urgencyBanner}>
              <Text style={styles.urgencyBannerText}>
                {t('emergency_priority')}
              </Text>
            </View>

            <View style={styles.slipDivider} />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('referring_clinician')}</Text>
              <SlipRow label={t('name')} value="ANM Sunita Sharma" />
              <SlipRow label={t('facility')} value="PHC Nashik, Block Igatpuri" />
              <SlipRow label={t('contact')} value="+91 98765 43210" />
              <View style={styles.signatureLine}>
                <Text style={styles.signatureText}>{t('signature')}: _________________</Text>
                <Text style={styles.signatureText}>{t('stamp')}: _________________</Text>
              </View>
            </View>

            <View style={styles.footerNote}>
              <Text style={styles.footerNoteText}>
                {t('footer_note')}
              </Text>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {generated && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.downloadBtn}>
            <Download size={18} color={Colors.primary} />
            <Text style={styles.downloadText}>{t('download_pdf')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareBtn, shared && styles.shareBtnSuccess]}
            onPress={handleShare}
          >
            {shared ? (
              <>
                <CheckCircle size={18} color="#FFFFFF" />
                <Text style={styles.shareText}>{t('shared')}</Text>
              </>
            ) : (
              <>
                <Share2 size={18} color="#FFFFFF" />
                <Text style={styles.shareText}>{t('share')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function SlipRow({ icon, label, value, highlight }: {
  icon?: React.ReactNode; label: string; value: string; highlight?: boolean;
}) {
  return (
    <View style={styles.slipRow}>
      {icon && <View style={styles.slipIcon}>{icon}</View>}
      <Text style={styles.slipLabel}>{label}:</Text>
      <Text style={[styles.slipValue, highlight && styles.slipValueHighlight]}>{value}</Text>
    </View>
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
  genBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.risk.lowLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  genBadgeText: { fontSize: FontSize.xs, color: Colors.risk.low, fontWeight: FontWeight.bold },
  scroll: { padding: Spacing.lg },
  generating: { alignItems: 'center', paddingTop: 80, gap: 16 },
  generatingIcon: { fontSize: 48 },
  generatingText: { fontSize: FontSize.lg, color: Colors.text.secondary },
  slip: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    ...Shadow.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  slipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: Spacing.md,
    backgroundColor: Colors.primary,
  },
  slipLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slipLogoText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  slipTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  slipDate: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  slipRef: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  slipDivider: { height: 1, backgroundColor: Colors.border.light },
  section: { padding: Spacing.md, gap: 8 },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  slipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  slipIcon: { marginTop: 1 },
  slipLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text.secondary,
    width: 100,
    flexShrink: 0,
  },
  slipValue: { flex: 1, fontSize: FontSize.sm, color: Colors.text.primary, lineHeight: 18 },
  slipValueHighlight: { color: Colors.risk.high, fontWeight: FontWeight.bold },
  urgencyBanner: {
    backgroundColor: Colors.risk.high,
    padding: 12,
    alignItems: 'center',
  },
  urgencyBannerText: { color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  signatureLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  signatureText: { fontSize: FontSize.xs, color: Colors.text.muted },
  footerNote: {
    backgroundColor: Colors.accent,
    padding: 10,
    alignItems: 'center',
  },
  footerNoteText: { fontSize: FontSize.xs, color: Colors.primary, textAlign: 'center' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    ...Shadow.lg,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  downloadText: { color: Colors.primary, fontWeight: FontWeight.semibold, fontSize: FontSize.md },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    ...Shadow.sm,
  },
  shareBtnSuccess: { backgroundColor: Colors.risk.low },
  shareText: { color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.md },
});

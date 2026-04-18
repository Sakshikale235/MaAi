import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Check, CircleAlert as AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import ProgressBar from '@/components/ui/ProgressBar';

const STEPS = [
  { id: 1, title: 'Blood Pressure', subtitle: 'Measure and record BP' },
  { id: 2, title: 'Symptoms', subtitle: 'Select all that apply' },
  { id: 3, title: 'MUAC Measurement', subtitle: 'Measure arm circumference' },
  { id: 4, title: 'Fetal Heart Sounds', subtitle: 'Record fetal heart rate' },
  { id: 5, title: 'Review & Submit', subtitle: 'Confirm all readings' },
];

const SYMPTOMS = [
  'Severe headache', 'Blurred vision', 'Swelling of face/hands',
  'Abdominal pain', 'Fever', 'Vaginal bleeding',
  'Decreased fetal movement', 'Nausea/Vomiting', 'Pallor',
  'Shortness of breath', 'Convulsions', 'Loss of consciousness',
];

export default function AssessmentScreen() {
  const [step, setStep] = useState(1);
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [muac, setMuac] = useState<number | null>(null);
  const [fhr, setFhr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateStep = (next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(40);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 15 }),
      ]).start();
    });
  };

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleNext = () => {
    if (step < 5) animateStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) animateStep(step - 1);
    else router.back();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    router.replace('/ai/result');
  };

  const getMuacColor = (v: number) => {
    if (v < 21) return Colors.risk.high;
    if (v < 23) return Colors.risk.medium;
    return Colors.risk.low;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0E7C86', '#4BBAC8']} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.back}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{STEPS[step - 1].title}</Text>
          <Text style={styles.headerSub}>{STEPS[step - 1].subtitle}</Text>
        </View>
      </LinearGradient>

      <View style={styles.progressSection}>
        <ProgressBar current={step} total={5} label={`Step ${step} of 5`} />
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <BPStep bpSys={bpSys} bpDia={bpDia} onSysChange={setBpSys} onDiaChange={setBpDia} />
        )}
        {step === 2 && (
          <SymptomsStep symptoms={symptoms} onToggle={toggleSymptom} />
        )}
        {step === 3 && (
          <MUACStep value={muac} onSelect={setMuac} getMuacColor={getMuacColor} />
        )}
        {step === 4 && (
          <FHRStep fhr={fhr} onFhrChange={setFhr} />
        )}
        {step === 5 && (
          <ReviewStep
            bpSys={bpSys}
            bpDia={bpDia}
            symptoms={symptoms}
            muac={muac}
            fhr={fhr}
            getMuacColor={getMuacColor}
          />
        )}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={18} color={Colors.primary} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        {step < 5 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>Continue</Text>
            <ArrowRight size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <Text style={styles.nextBtnText}>Analyzing…</Text>
            ) : (
              <>
                <Text style={styles.nextBtnText}>Submit & Get AI Risk</Text>
                <Check size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function BPStep({ bpSys, bpDia, onSysChange, onDiaChange }: {
  bpSys: string; bpDia: string;
  onSysChange: (v: string) => void; onDiaChange: (v: string) => void;
}) {
  const sys = parseInt(bpSys) || 0;
  const dia = parseInt(bpDia) || 0;
  const isHigh = sys >= 140 || dia >= 90;
  const isCritical = sys >= 160 || dia >= 110;

  return (
    <View style={styles.stepContent}>
      <View style={styles.bpCard}>
        <Text style={styles.bpLabel}>Systolic (mmHg)</Text>
        <TextInput
          style={[styles.bpInput, isCritical && { borderColor: Colors.risk.high }]}
          value={bpSys}
          onChangeText={onSysChange}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="120"
          placeholderTextColor={Colors.text.muted}
        />
        <Text style={styles.bpDivider}>/</Text>
        <Text style={styles.bpLabel}>Diastolic (mmHg)</Text>
        <TextInput
          style={[styles.bpInput, isCritical && { borderColor: Colors.risk.high }]}
          value={bpDia}
          onChangeText={onDiaChange}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="80"
          placeholderTextColor={Colors.text.muted}
        />
      </View>

      {isCritical && (
        <View style={styles.alertBox}>
          <AlertCircle size={18} color={Colors.risk.high} />
          <Text style={styles.alertText}>Critical BP! Immediate referral may be required.</Text>
        </View>
      )}
      {isHigh && !isCritical && (
        <View style={[styles.alertBox, { backgroundColor: Colors.risk.mediumLight }]}>
          <AlertCircle size={18} color={Colors.risk.medium} />
          <Text style={[styles.alertText, { color: Colors.risk.medium }]}>
            Elevated BP. Closely monitor patient.
          </Text>
        </View>
      )}

      <View style={styles.referenceBox}>
        <Text style={styles.refTitle}>Reference Values</Text>
        {[
          { label: 'Normal', range: '< 120/80', color: Colors.risk.low },
          { label: 'High', range: '140-159 / 90-109', color: Colors.risk.medium },
          { label: 'Critical', range: '≥ 160/110', color: Colors.risk.high },
        ].map((r) => (
          <View key={r.label} style={styles.refRow}>
            <View style={[styles.refDot, { backgroundColor: r.color }]} />
            <Text style={styles.refLabel}>{r.label}:</Text>
            <Text style={styles.refRange}>{r.range}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SymptomsStep({ symptoms, onToggle }: { symptoms: string[]; onToggle: (s: string) => void }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.symptomNote}>Tap to select symptoms. Select all that apply.</Text>
      <View style={styles.symptomsGrid}>
        {SYMPTOMS.map((sym) => (
          <TouchableOpacity
            key={sym}
            style={[styles.symptomTile, symptoms.includes(sym) && styles.symptomTileActive]}
            onPress={() => onToggle(sym)}
          >
            <Text style={[styles.symptomText, symptoms.includes(sym) && styles.symptomTextActive]}>
              {sym}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {symptoms.length > 0 && (
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>{symptoms.length} symptom(s) selected</Text>
        </View>
      )}
    </View>
  );
}

function MUACStep({ value, onSelect, getMuacColor }: {
  value: number | null; onSelect: (v: number) => void; getMuacColor: (v: number) => string;
}) {
  const values = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
  return (
    <View style={styles.stepContent}>
      <Text style={styles.muacDesc}>
        MUAC (Mid Upper Arm Circumference) measures nutritional status
      </Text>
      <View style={styles.muacScale}>
        {values.map((v) => (
          <TouchableOpacity
            key={v}
            style={[
              styles.muacBtn,
              { backgroundColor: value === v ? getMuacColor(v) : getMuacColor(v) + '20' },
              value === v && styles.muacBtnSelected,
            ]}
            onPress={() => onSelect(v)}
          >
            <Text style={[styles.muacBtnText, { color: getMuacColor(v) }, value === v && { color: '#fff' }]}>
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {value !== null && (
        <View style={[styles.muacResult, { backgroundColor: getMuacColor(value) + '15', borderColor: getMuacColor(value) }]}>
          <Text style={[styles.muacResultLabel, { color: getMuacColor(value) }]}>
            {value < 21 ? 'Severe Malnutrition' : value < 23 ? 'Moderate Malnutrition' : 'Normal'}
          </Text>
          <Text style={[styles.muacResultValue, { color: getMuacColor(value) }]}>{value} cm</Text>
        </View>
      )}
    </View>
  );
}

function FHRStep({ fhr, onFhrChange }: { fhr: string; onFhrChange: (v: string) => void }) {
  const hr = parseInt(fhr) || 0;
  const isAbnormal = hr > 0 && (hr < 110 || hr > 160);
  return (
    <View style={styles.stepContent}>
      <View style={styles.fhrCard}>
        <Text style={styles.fhrLabel}>Fetal Heart Rate (BPM)</Text>
        <TextInput
          style={[styles.fhrInput, isAbnormal && { borderColor: Colors.risk.high }]}
          value={fhr}
          onChangeText={onFhrChange}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="140"
          placeholderTextColor={Colors.text.muted}
        />
        {isAbnormal && (
          <View style={styles.alertBox}>
            <AlertCircle size={16} color={Colors.risk.high} />
            <Text style={styles.alertText}>Abnormal FHR. Consult MO immediately.</Text>
          </View>
        )}
        <View style={styles.referenceBox}>
          <Text style={styles.refTitle}>Normal Range: 110–160 BPM</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.noFhrBtn}>
        <Text style={styles.noFhrText}>Unable to record fetal heart sounds</Text>
      </TouchableOpacity>
    </View>
  );
}

function ReviewStep({ bpSys, bpDia, symptoms, muac, fhr, getMuacColor }: any) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.reviewCard}>
        <Text style={styles.reviewTitle}>Assessment Summary</Text>
        <ReviewRow label="Blood Pressure" value={bpSys && bpDia ? `${bpSys}/${bpDia} mmHg` : 'Not recorded'} highlight={parseInt(bpSys) >= 140} />
        <ReviewRow label="Symptoms" value={symptoms.length > 0 ? `${symptoms.length} selected` : 'None'} highlight={symptoms.length > 3} />
        <ReviewRow label="MUAC" value={muac ? `${muac} cm` : 'Not recorded'} color={muac ? getMuacColor(muac) : undefined} />
        <ReviewRow label="Fetal Heart Rate" value={fhr ? `${fhr} BPM` : 'Not recorded'} highlight={parseInt(fhr) < 110 || parseInt(fhr) > 160} />
      </View>
      <View style={styles.offlineSavedNote}>
        <Text style={styles.offlineSavedText}>Saved locally (offline-ready) ✓</Text>
      </View>
    </View>
  );
}

function ReviewRow({ label, value, highlight, color }: { label: string; value: string; highlight?: boolean; color?: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={[styles.reviewValue, highlight && { color: Colors.risk.high }, color && { color }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { padding: 4 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  progressSection: { padding: Spacing.lg, paddingBottom: 8 },
  scroll: { padding: Spacing.lg, paddingTop: 8 },
  stepContent: { gap: 16 },
  bpCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
    alignItems: 'center',
    gap: 8,
  },
  bpLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  bpInput: {
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    fontSize: 48,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    width: 160,
    height: 80,
  },
  bpDivider: { fontSize: FontSize.xxxl, color: Colors.text.muted, fontWeight: FontWeight.bold },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.risk.highLight,
    borderRadius: BorderRadius.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.risk.high,
  },
  alertText: { flex: 1, fontSize: FontSize.sm, color: Colors.risk.high, fontWeight: FontWeight.medium },
  referenceBox: { backgroundColor: Colors.accent, borderRadius: BorderRadius.md, padding: 12, width: '100%', gap: 6 },
  refTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text.secondary, marginBottom: 4 },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refDot: { width: 8, height: 8, borderRadius: 4 },
  refLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text.secondary },
  refRange: { fontSize: FontSize.sm, color: Colors.text.primary },
  symptomNote: { fontSize: FontSize.sm, color: Colors.text.secondary },
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  symptomTile: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.surface,
  },
  symptomTileActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  symptomText: { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  symptomTextActive: { color: '#FFFFFF' },
  selectedCount: { backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.md, padding: 10, alignItems: 'center' },
  selectedCountText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  muacDesc: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 },
  muacScale: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  muacBtn: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  muacBtnSelected: { borderWidth: 2 },
  muacBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  muacResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: 14,
  },
  muacResultLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  muacResultValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  fhrCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
    alignItems: 'center',
    gap: 12,
  },
  fhrLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  fhrInput: {
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    fontSize: 56,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    width: 160,
    height: 80,
  },
  noFhrBtn: {
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: 14,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  noFhrText: { fontSize: FontSize.sm, color: Colors.text.muted },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
    gap: 12,
  },
  reviewTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: 4 },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  reviewLabel: { fontSize: FontSize.sm, color: Colors.text.secondary, flex: 1 },
  reviewValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  offlineSavedNote: {
    backgroundColor: Colors.risk.lowLight,
    borderRadius: BorderRadius.md,
    padding: 12,
    alignItems: 'center',
  },
  offlineSavedText: { fontSize: FontSize.sm, color: Colors.risk.low, fontWeight: FontWeight.semibold },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  backBtnText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  nextBtnText: { fontSize: FontSize.md, color: '#FFFFFF', fontWeight: FontWeight.bold },
});

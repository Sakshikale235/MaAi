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
import { ArrowLeft, Play, Mic, MicOff, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import ProgressBar from '@/components/ui/ProgressBar';
import { useLanguage } from '@/context/LanguageContext';

const QUESTIONS = [
  {
    id: 1,
    text: 'epds_q1',
    options: [
      { label: 'epds_q1_o0', score: 0 },
      { label: 'epds_q1_o1', score: 1 },
      { label: 'epds_q1_o2', score: 2 },
      { label: 'epds_q1_o3', score: 3 },
    ],
  },
  {
    id: 2,
    text: 'epds_q2',
    options: [
      { label: 'epds_q2_o0', score: 0 },
      { label: 'epds_q2_o1', score: 1 },
      { label: 'epds_q2_o2', score: 2 },
      { label: 'epds_q2_o3', score: 3 },
    ],
  },
  {
    id: 3,
    text: 'epds_q3',
    options: [
      { label: 'epds_q3_o0', score: 0 },
      { label: 'epds_q3_o1', score: 1 },
      { label: 'epds_q3_o2', score: 2 },
      { label: 'epds_q3_o3', score: 3 },
    ],
  },
  {
    id: 4,
    text: 'epds_q4',
    options: [
      { label: 'epds_q4_o0', score: 0 },
      { label: 'epds_q4_o1', score: 1 },
      { label: 'epds_q4_o2', score: 2 },
      { label: 'epds_q4_o3', score: 3 },
    ],
  },
  {
    id: 5,
    text: 'epds_q5',
    options: [
      { label: 'epds_q5_o0', score: 0 },
      { label: 'epds_q5_o1', score: 1 },
      { label: 'epds_q5_o2', score: 2 },
      { label: 'epds_q5_o3', score: 3 },
    ],
  },
];

export default function EPDSScreen() {
  const { t } = useLanguage();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(1)).current;

  const totalScore = answers.reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      waveAnim.stopAnimation();
      waveAnim.setValue(1);
    }
  }, [isRecording]);

  const handlePlay = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const handleSelect = (score: number, idx: number) => {
    setSelectedIdx(idx);
    const newAnswers = [...answers];
    newAnswers[currentQ] = score;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (selectedIdx === null) return;
    if (currentQ < QUESTIONS.length - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setCurrentQ((q) => q + 1);
        setSelectedIdx(null);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    const risk = totalScore >= 13 ? 'HIGH' : totalScore >= 10 ? 'MEDIUM' : 'LOW';
    const riskColor = risk === 'HIGH' ? Colors.risk.high : risk === 'MEDIUM' ? Colors.risk.medium : Colors.risk.low;
    const riskBg = risk === 'HIGH' ? Colors.risk.highLight : risk === 'MEDIUM' ? Colors.risk.mediumLight : Colors.risk.lowLight;

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={22} color={Colors.text.primary} /></TouchableOpacity>
          <Text style={styles.headerTitle}>{t('epds_result_title')}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <View style={[styles.resultCard, { borderTopColor: riskColor }]}>
            <Text style={styles.resultTitle}>{t('edinburgh_scale')}</Text>
            <View style={[styles.scoreCircle, { backgroundColor: riskBg, borderColor: riskColor }]}>
              <Text style={[styles.scoreNum, { color: riskColor }]}>{totalScore}</Text>
              <Text style={[styles.scoreDenom, { color: riskColor }]}>/ {QUESTIONS.length * 3}</Text>
            </View>
            <View style={[styles.riskResultBadge, { backgroundColor: riskBg }]}>
              <Text style={[styles.riskResultText, { color: riskColor }]}>{t(risk.toLowerCase() as any)} {t('risk_of_ppd')}</Text>
            </View>
            <Text style={styles.recommendation}>
              {risk === 'HIGH'
                ? t('recommend_high')
                : risk === 'MEDIUM'
                  ? t('recommend_medium')
                  : t('recommend_low')}
            </Text>
          </View>

          <TouchableOpacity style={styles.retakeBtn} onPress={() => { setCompleted(false); setCurrentQ(0); setAnswers([]); setSelectedIdx(null); }}>
            <Text style={styles.retakeBtnText}>{t('retake_screening')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const question = QUESTIONS[currentQ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('epds_screening_title')}</Text>
      </View>

      <View style={styles.progressSection}>
        <ProgressBar current={currentQ + 1} total={QUESTIONS.length} label={t('edinburgh_scale')} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
          <View style={styles.qNumRow}>
            <View style={styles.qNum}>
              <Text style={styles.qNumText}>{currentQ + 1}</Text>
            </View>
            <Text style={styles.qCount}>{t('of')} {QUESTIONS.length}</Text>
          </View>

          <Text style={styles.questionText}>{t(question.text as any)}</Text>

          <View style={styles.audioRow}>
            <TouchableOpacity
              style={[styles.playBtn, isPlaying && styles.playBtnActive]}
              onPress={handlePlay}
            >
              <Play size={18} color={isPlaying ? '#fff' : Colors.primary} fill={isPlaying ? '#fff' : 'none'} />
              <Text style={[styles.playBtnText, isPlaying && { color: '#fff' }]}>
                {isPlaying ? t('playing') : t('play_question')}
              </Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: waveAnim }] }}>
              <TouchableOpacity
                style={[styles.micBtn, isRecording && styles.micBtnActive]}
                onPress={() => setIsRecording(!isRecording)}
              >
                {isRecording ? (
                  <MicOff size={20} color="#fff" />
                ) : (
                  <Mic size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.options, { opacity: fadeAnim }]}>
          {question.options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.option, selectedIdx === idx && styles.optionSelected]}
              onPress={() => handleSelect(opt.score, idx)}
            >
              <View style={[styles.optionRadio, selectedIdx === idx && styles.optionRadioSelected]}>
                {selectedIdx === idx && <View style={styles.optionRadioFill} />}
              </View>
              <Text style={[styles.optionText, selectedIdx === idx && styles.optionTextSelected]}>
                {t(opt.label as any)}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <TouchableOpacity
          style={[styles.nextBtn, selectedIdx === null && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={selectedIdx === null}
        >
          <Text style={styles.nextBtnText}>
            {currentQ === QUESTIONS.length - 1 ? t('complete_screening') : t('next_question')}
          </Text>
          <Check size={18} color="#fff" />
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
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
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  progressSection: { paddingHorizontal: Spacing.lg, paddingBottom: 8 },
  scroll: { padding: Spacing.lg, gap: 16 },
  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  qNumRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qNumText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md },
  qCount: { fontSize: FontSize.sm, color: Colors.text.muted },
  questionText: { fontSize: FontSize.lg, color: Colors.text.primary, lineHeight: 26, fontWeight: FontWeight.medium },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  playBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 10,
  },
  playBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  playBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  micBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  micBtnActive: { backgroundColor: Colors.risk.high, borderColor: Colors.risk.high },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border.light,
    ...Shadow.sm,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.accent },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: { borderColor: Colors.primary },
  optionRadioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  optionText: { flex: 1, fontSize: FontSize.md, color: Colors.text.primary, lineHeight: 20 },
  optionTextSelected: { color: Colors.primary, fontWeight: FontWeight.medium },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    ...Shadow.md,
  },
  nextBtnDisabled: { backgroundColor: Colors.border.medium, elevation: 0 },
  nextBtnText: { color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.md },
  resultScroll: { padding: Spacing.lg, gap: 16 },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.lg,
    borderTopWidth: 4,
    alignItems: 'center',
    gap: 16,
  },
  resultTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.secondary, textAlign: 'center' },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  scoreNum: { fontSize: 48, fontWeight: FontWeight.bold },
  scoreDenom: { fontSize: FontSize.lg, fontWeight: FontWeight.medium, alignSelf: 'flex-end', paddingBottom: 8 },
  riskResultBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  riskResultText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, letterSpacing: 1 },
  recommendation: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  retakeBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  retakeBtnText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, ArrowRight, Shield, Lock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

type Step = 'phone' | 'otp';

export default function LoginScreen() {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const otpRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 12 }),
    ]).start();
  }, [step]);

  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const t = setInterval(() => setTimer((p) => p - 1), 1000);
      return () => clearInterval(t);
    }
  }, [step, timer]);

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    setStep('otp');
    setTimer(30);
  };

  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, '').slice(0, 1);

    const next = [...otp];
    next[idx] = digit;
    setOtp(next);

    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!digit && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#0E7C86', '#4BBAC8']} style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logo}>{t('maa_ai')}</Text>
        </View>
        <Text style={styles.headerTitle}>
          {step === 'phone' ? t('welcome_back') : t('verify_otp')}
        </Text>
        <Text style={styles.headerSub}>
          {step === 'phone'
            ? t('sign_in_prompt')
            : `${t('otp_sent_to')} +91 ${phone}`}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View
          style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {step === 'phone' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('mobile_number')}</Text>
                <View style={styles.inputRow}>
                  <View style={styles.prefix}>
                    <Text style={styles.prefixText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={t('enter_10_digit')}
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(val) => {
                      const cleaned = val.replace(/[^0-9]/g, '').slice(0, 10);
                      setPhone(cleaned);
                    }}
                    placeholderTextColor={Colors.text.muted}
                  />
                  <Phone size={18} color={Colors.text.muted} style={styles.inputIcon} />
                </View>
              </View>

              <View style={styles.secureNote}>
                <Shield size={14} color={Colors.primary} />
                <Text style={styles.secureText}>
                  {t('encrypted_secure')}
                </Text>
              </View>

              <Button
                title={t('send_otp')}
                onPress={handleSendOtp}
                loading={loading}
                disabled={phone.length < 10}
                fullWidth
                size="lg"
                icon={<ArrowRight size={18} color="#fff" />}
              />

              <TouchableOpacity onPress={() => router.push('/auth/signup')} style={styles.link}>
                <Text style={styles.linkText}>{t('new_user')} <Text style={styles.linkBold}>{t('register_here')}</Text></Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.otpTitle}>{t('enter_6_digit_otp')}</Text>
              <View style={styles.otpRow}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    style={[styles.otpBox, digit && styles.otpBoxFilled]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(v) => handleOtpChange(v, i)}
                    textAlign="center"
                    selectionColor={Colors.primary}
                  />
                ))}
              </View>

              <View style={styles.resendRow}>
                {timer > 0 ? (
                  <Text style={styles.timerText}>{t('resend_in')} {timer}s</Text>
                ) : (
                  <TouchableOpacity onPress={() => { setTimer(30); }}>
                    <Text style={styles.resendText}>{t('resend_otp')}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Button
                title={t('verify_and_login')}
                onPress={handleVerify}
                loading={loading}
                disabled={otp.some((d) => !d)}
                fullWidth
                size="lg"
              />

              <TouchableOpacity
                onPress={() => { fadeAnim.setValue(0); slideAnim.setValue(30); setStep('phone'); }}
                style={styles.link}
              >
                <Text style={styles.linkText}>{t('change_number')}</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        <View style={styles.footer}>
          <Lock size={12} color={Colors.text.muted} />
          <Text style={styles.footerText}>{t('data_encrypted')}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 64,
    paddingBottom: 36,
    paddingHorizontal: 24,
    gap: 8,
  },
  logoRow: { marginBottom: 4 },
  logo: { fontSize: FontSize.lg, color: 'rgba(255,255,255,0.9)', fontWeight: FontWeight.bold },
  headerTitle: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  headerSub: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)' },
  body: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: 16 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.lg,
    gap: 20,
  },
  inputGroup: { gap: 8 },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    height: 52,
  },
  prefix: {
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: Colors.border.light,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
  },
  prefixText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  input: { flex: 1, paddingHorizontal: 14, fontSize: FontSize.lg, color: Colors.text.primary },
  inputIcon: { marginRight: 14 },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    padding: 10,
    borderRadius: BorderRadius.sm,
  },
  secureText: { fontSize: FontSize.xs, color: Colors.primary },
  link: { alignItems: 'center', paddingVertical: 4 },
  linkText: { fontSize: FontSize.sm, color: Colors.text.secondary },
  linkBold: { color: Colors.primary, fontWeight: FontWeight.semibold },
  otpTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text.primary, textAlign: 'center' },
  otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    backgroundColor: Colors.accent,
  },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  resendRow: { alignItems: 'center' },
  timerText: { fontSize: FontSize.sm, color: Colors.text.muted },
  resendText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 8 },
  footerText: { fontSize: FontSize.xs, color: Colors.text.muted },
});

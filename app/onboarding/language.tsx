import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', desc: 'Continue in English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', desc: 'हिन्दी में जारी रखें' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', desc: 'मराठीत सुरू ठेवा' },
];

export default function LanguageScreen() {
  const { language, setLanguage, t } = useLanguage();
  const [selected, setSelected] = useState<string>(language || 'en');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 10 }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0E7C86', '#4BBAC8']}
        style={styles.header}
      >
        <Text style={styles.headerLogo}>{t('maa_ai')}</Text>
        <Text style={styles.headerTitle}>{t('choose_language')}</Text>
        <Text style={styles.headerSub}>{t('choose_language_sub')}</Text>
      </LinearGradient>

      <Animated.View
        style={[styles.body, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {LANGUAGES.map((lang, i) => (
            <LanguageCard
              key={lang.code}
              lang={lang}
              selected={selected === lang.code}
              onSelect={() => setSelected(lang.code)}
              delay={i * 100}
            />
          ))}

          <View style={styles.info}>
            <Text style={styles.infoText}>
              {t('language_info')}
            </Text>
          </View>

          <Button
            title={t('continue')}
            onPress={async () => {
              await setLanguage(selected as any);
              router.replace('/auth/login');
            }}
            fullWidth
            size="lg"
            style={styles.btn}
          />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function LanguageCard({
  lang,
  selected,
  onSelect,
  delay,
}: {
  lang: (typeof LANGUAGES)[0];
  selected: boolean;
  onSelect: () => void;
  delay: number;
}) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(selected ? 1 : 0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 15,
        delay,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: selected ? 1 : 0.97,
      useNativeDriver: true,
      speed: 30,
    }).start();
  }, [selected]);

  return (
    <Animated.View
      style={[{ opacity: opacityAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        onPress={onSelect}
        style={[styles.langCard, selected && styles.langCardSelected]}
        activeOpacity={0.8}
      >
        <Text style={styles.flag}>{lang.flag}</Text>
        <View style={styles.langInfo}>
          <Text style={[styles.langNative, selected && styles.langNativeSelected]}>
            {lang.native}
          </Text>
          <Text style={styles.langDesc}>{lang.desc}</Text>
        </View>
        {selected && (
          <CheckCircle size={22} color={Colors.primary} fill={Colors.primaryLight} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 64,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: { fontSize: FontSize.xl, color: 'rgba(255,255,255,0.9)', fontWeight: FontWeight.bold },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  headerSub: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)' },
  body: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: 12 },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border.light,
    ...Shadow.sm,
    gap: 14,
  },
  langCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accent,
  },
  flag: { fontSize: 36 },
  langInfo: { flex: 1, gap: 2 },
  langNative: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  langNativeSelected: { color: Colors.primary },
  langDesc: { fontSize: FontSize.sm, color: Colors.text.muted },
  info: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: 12,
    marginTop: 4,
  },
  infoText: { fontSize: FontSize.sm, color: Colors.primary, textAlign: 'center' },
  btn: { marginTop: 8 },
});

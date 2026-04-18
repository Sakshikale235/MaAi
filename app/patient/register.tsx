import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Link, User, Phone, MapPin, Calendar, Hash, Save } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';

export default function PatientRegisterScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [weeks, setWeeks] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 12 }),
    ]).start();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSaved(true);
    setTimeout(() => router.push('/patient/assessment'), 800);
  };

  if (saved) {
    return (
      <View style={styles.savedScreen}>
        <Animated.View style={styles.savedContent}>
          <Text style={styles.savedIcon}>✅</Text>
          <Text style={styles.savedTitle}>Patient Registered!</Text>
          <Text style={styles.savedSub}>Saved locally · Starting assessment…</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0E7C86', '#4BBAC8']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Patient</Text>
        <Text style={styles.headerSub}>Register & begin assessment</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.ScrollView
          style={{ opacity: opacityAnim }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Patient Information</Text>

            <Field label="Full Name *" placeholder="e.g. Radha Kumari" value={name} onChange={setName} icon={<User size={18} color={Colors.text.muted} />} />
            <Field label="Age *" placeholder="e.g. 24" value={age} onChange={setAge} keyboardType="number-pad" icon={<Calendar size={18} color={Colors.text.muted} />} />
            <Field label="Mobile Number" placeholder="10-digit number" value={phone} onChange={setPhone} keyboardType="number-pad" icon={<Phone size={18} color={Colors.text.muted} />} />
            <Field label="Village / Locality *" placeholder="e.g. Nashik" value={village} onChange={setVillage} icon={<MapPin size={18} color={Colors.text.muted} />} />
            <Field label="Weeks Pregnant" placeholder="e.g. 28" value={weeks} onChange={setWeeks} keyboardType="number-pad" icon={<Calendar size={18} color={Colors.text.muted} />} />
          </View>

          <View style={styles.card}>
            <View style={styles.abhaHeader}>
              <Link size={18} color={Colors.primary} />
              <View>
                <Text style={styles.abhaTitle}>ABHA ID (Optional)</Text>
                <Text style={styles.abhaSub}>Link patient to national digital health record</Text>
              </View>
            </View>
            <View style={styles.abhaInput}>
              <Hash size={18} color={Colors.text.muted} />
              <TextInput
                style={styles.abhaTextInput}
                placeholder="14-digit ABHA number"
                value={abhaId}
                onChangeText={setAbhaId}
                keyboardType="number-pad"
                maxLength={14}
                placeholderTextColor={Colors.text.muted}
              />
            </View>
            <View style={styles.abhaNote}>
              <Text style={styles.abhaNoteTxt}>
                ABHA enables seamless sharing of health records across ABDM-enabled facilities
              </Text>
            </View>
          </View>

          <View style={styles.offlineNote}>
            <Text style={styles.offlineIcon}>📱</Text>
            <Text style={styles.offlineTxt}>
              Data saved locally · Will sync when online
            </Text>
          </View>

          <Button
            title="Save & Start Assessment"
            onPress={handleSave}
            loading={loading}
            disabled={!name || !age || !village}
            fullWidth
            size="lg"
            icon={<Save size={18} color="#fff" />}
          />

          <View style={{ height: 20 }} />
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  keyboardType,
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: 'default' | 'number-pad';
  icon: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.fieldRow}>
        <View style={styles.fieldIcon}>{icon}</View>
        <TextInput
          style={styles.fieldInput}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType ?? 'default'}
          placeholderTextColor={Colors.text.muted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24, gap: 6 },
  back: { marginBottom: 8 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
  scroll: { padding: Spacing.lg, gap: 16 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadow.md,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  fieldGroup: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    height: 52,
    overflow: 'hidden',
  },
  fieldIcon: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border.light,
    height: '100%',
    backgroundColor: Colors.accent,
  },
  fieldInput: { flex: 1, paddingHorizontal: 14, fontSize: FontSize.md, color: Colors.text.primary },
  abhaHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  abhaTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  abhaSub: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  abhaInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent,
    padding: 14,
  },
  abhaTextInput: { flex: 1, fontSize: FontSize.md, color: Colors.text.primary, letterSpacing: 2 },
  abhaNote: { backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.sm, padding: 10 },
  abhaNoteTxt: { fontSize: FontSize.xs, color: Colors.primary, lineHeight: 16 },
  offlineNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  offlineIcon: { fontSize: 18 },
  offlineTxt: { fontSize: FontSize.sm, color: Colors.primary },
  savedScreen: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedContent: { alignItems: 'center', gap: 12 },
  savedIcon: { fontSize: 64 },
  savedTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  savedSub: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)' },
});

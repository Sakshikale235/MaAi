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
import { User, Phone, Building, CircleCheck as CheckCircle, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { UserRole } from '@/types';

const ROLES: { id: UserRole; label: string; desc: string; icon: string }[] = [
  { id: 'ANM', label: 'ANM', desc: 'Auxiliary Nurse Midwife — Field worker', icon: '👩‍⚕️' },
  { id: 'MO', label: 'Medical Officer', desc: 'Clinical supervisor & reviewer', icon: '👨‍⚕️' },
];

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [facility, setFacility] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 12 }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!name || !phone || !role || !facility) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    router.replace('/auth/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#0E7C86', '#4BBAC8']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSub}>Register as a health worker</Text>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View
          style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.sectionTitle}>Select your role</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => setRole(r.id)}
                style={[styles.roleCard, role === r.id && styles.roleCardSelected]}
              >
                <Text style={styles.roleIcon}>{r.icon}</Text>
                <Text style={[styles.roleLabel, role === r.id && styles.roleLabelSelected]}>{r.label}</Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
                {role === r.id && <CheckCircle size={18} color={Colors.primary} style={styles.check} />}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <InputField
            label="Full Name"
            placeholder="e.g. Sunita Sharma"
            value={name}
            onChangeText={setName}
            icon={<User size={18} color={Colors.text.muted} />}
          />
          <InputField
            label="Mobile Number"
            placeholder="10-digit mobile number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="number-pad"
            maxLength={10}
            icon={<Phone size={18} color={Colors.text.muted} />}
          />
          <InputField
            label="Health Facility"
            placeholder="e.g. PHC Nashik"
            value={facility}
            onChangeText={setFacility}
            icon={<Building size={18} color={Colors.text.muted} />}
          />

          <Button
            title="Register"
            onPress={handleRegister}
            loading={loading}
            disabled={!name || !phone || !role || !facility}
            fullWidth
            size="lg"
          />

          <TouchableOpacity onPress={() => router.back()} style={styles.link}>
            <Text style={styles.linkText}>Already registered? <Text style={styles.linkBold}>Login</Text></Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  maxLength,
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'number-pad';
  maxLength?: number;
  icon: React.ReactNode;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputIconBox}>{icon}</View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? 'default'}
          maxLength={maxLength}
          placeholderTextColor={Colors.text.muted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 24,
    gap: 6,
  },
  back: { marginBottom: 8 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  headerSub: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)' },
  body: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: 16 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.lg,
    gap: 16,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text.primary,
  },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.lg,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accent,
  },
  roleIcon: { fontSize: 32 },
  roleLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary },
  roleLabelSelected: { color: Colors.primary },
  roleDesc: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: 14,
  },
  check: { position: 'absolute', top: 8, right: 8 },
  divider: { height: 1, backgroundColor: Colors.border.light },
  inputGroup: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    height: 52,
    overflow: 'hidden',
  },
  inputIconBox: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border.light,
    height: '100%',
    backgroundColor: Colors.accent,
  },
  input: { flex: 1, paddingHorizontal: 14, fontSize: FontSize.md, color: Colors.text.primary },
  link: { alignItems: 'center' },
  linkText: { fontSize: FontSize.sm, color: Colors.text.secondary },
  linkBold: { color: Colors.primary, fontWeight: FontWeight.semibold },
});

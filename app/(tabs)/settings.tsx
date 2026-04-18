import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  SafeAreaView,
} from 'react-native';
import {
  RefreshCw,
  Globe,
  Type,
  Moon,
  Shield,
  Lock,
  Info,
  ChevronRight,
  Database,
  Wifi,
  LogOut,
  Bell,
  User,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import SyncStatus from '@/components/ui/SyncStatus';
import { useSync } from '@/hooks/useSync';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { syncState, pendingCount, triggerSync } = useSync();
  const [autoSync, setAutoSync] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [language, setLanguage] = useState('English');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SS</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Sunita Sharma</Text>
            <Text style={styles.profileRole}>ANM · PHC Nashik</Text>
            <Text style={styles.profileId}>ID: ANM-MH-2024-001</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <User size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <SettingsSection title="Data & Sync" icon={<Database size={16} color={Colors.primary} />}>
          <SettingsRow
            label="Auto-sync"
            subtitle="Sync automatically when online"
            right={<Switch value={autoSync} onValueChange={setAutoSync} trackColor={{ true: Colors.primary }} thumbColor="#FFFFFF" />}
          />
          <View style={styles.syncStatusRow}>
            <SyncStatus state={syncState} pendingCount={pendingCount} onSync={triggerSync} />
            <TouchableOpacity style={styles.manualSyncBtn} onPress={triggerSync}>
              <RefreshCw size={14} color={Colors.primary} />
              <Text style={styles.manualSyncText}>Sync Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <Info size={14} color={Colors.primary} />
            <Text style={styles.infoText}>
              All records stored locally and synced securely when online. Data is encrypted with AES-256 and transmitted over TLS 1.3.
            </Text>
          </View>
        </SettingsSection>

        <SettingsSection title="Security" icon={<Shield size={16} color={Colors.primary} />}>
          <SettingsRow
            label="Data Encryption"
            subtitle="AES-256 encryption active"
            right={<View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Active</Text></View>}
          />
          <SettingsRow
            label="Secure Transmission"
            subtitle="TLS 1.3 protocol"
            right={<Lock size={18} color={Colors.risk.low} />}
          />
          <SettingsRow
            label="ABDM Compliance"
            subtitle="FHIR-compatible data structure"
            right={<ChevronRight size={18} color={Colors.text.muted} />}
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection title="Language" icon={<Globe size={16} color={Colors.primary} />}>
          {['English', 'हिन्दी', 'मराठी'].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.langOption, language === lang && styles.langOptionActive]}
              onPress={() => setLanguage(lang)}
            >
              <Text style={[styles.langText, language === lang && styles.langTextActive]}>{lang}</Text>
              {language === lang && <View style={styles.langDot} />}
            </TouchableOpacity>
          ))}
        </SettingsSection>

        <SettingsSection title="Appearance" icon={<Type size={16} color={Colors.primary} />}>
          <SettingsRow
            label="Dark Mode"
            subtitle="Switch to dark theme"
            right={<Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: Colors.primary }} thumbColor="#FFFFFF" />}
          />
          <View style={styles.fontSizeRow}>
            <Text style={styles.fontSizeLabel}>Font Size</Text>
            <View style={styles.fontSizeBtns}>
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.fontSizeBtn, fontSize === size && styles.fontSizeBtnActive]}
                  onPress={() => setFontSize(size)}
                >
                  <Text style={[styles.fontSizeBtnText, fontSize === size && styles.fontSizeBtnTextActive]}>
                    {size === 'sm' ? 'A' : size === 'md' ? 'Aa' : 'AA'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </SettingsSection>

        <SettingsSection title="Notifications" icon={<Bell size={16} color={Colors.primary} />}>
          <SettingsRow
            label="High Risk Alerts"
            subtitle="Get notified for critical cases"
            right={<Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: Colors.primary }} thumbColor="#FFFFFF" />}
          />
        </SettingsSection>

        <SettingsSection title="About" icon={<Info size={16} color={Colors.primary} />}>
          <SettingsRow label="Version" right={<Text style={styles.versionText}>v2.1.0</Text>} />
          <SettingsRow label="Build" right={<Text style={styles.versionText}>2024.12</Text>} />
          <SettingsRow
            label="Ministry of Health & FW"
            subtitle="Government of India initiative"
            right={<ChevronRight size={18} color={Colors.text.muted} />}
          />
        </SettingsSection>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/auth/login')}>
          <LogOut size={18} color={Colors.risk.high} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function SettingsSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function SettingsRow({
  label,
  subtitle,
  right,
  onPress,
}: {
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} style={styles.settingsRow}>
      <View style={styles.settingsRowLeft}>
        <Text style={styles.settingsLabel}>{label}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      {right}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  scroll: { padding: Spacing.lg, gap: 16 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadow.md,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  profileRole: { fontSize: FontSize.sm, color: Colors.text.secondary },
  profileId: { fontSize: FontSize.xs, color: Colors.text.muted },
  editBtn: { padding: 10 },
  section: { gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text.primary },
  sectionBody: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    minHeight: 56,
  },
  settingsRowLeft: { flex: 1, gap: 2, marginRight: 12 },
  settingsLabel: { fontSize: FontSize.md, color: Colors.text.primary, fontWeight: FontWeight.medium },
  settingsSubtitle: { fontSize: FontSize.xs, color: Colors.text.muted },
  syncStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  manualSyncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  manualSyncText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.accent,
    padding: 12,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: FontSize.xs, color: Colors.primary, lineHeight: 16 },
  activeBadge: {
    backgroundColor: Colors.risk.lowLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: { color: Colors.risk.low, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  langOptionActive: { backgroundColor: Colors.accent },
  langText: { fontSize: FontSize.md, color: Colors.text.primary },
  langTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  langDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  fontSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  fontSizeLabel: { fontSize: FontSize.md, color: Colors.text.primary, fontWeight: FontWeight.medium },
  fontSizeBtns: { flexDirection: 'row', gap: 8 },
  fontSizeBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.background,
  },
  fontSizeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  fontSizeBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text.secondary },
  fontSizeBtnTextActive: { color: Colors.primary },
  versionText: { fontSize: FontSize.sm, color: Colors.text.muted },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.risk.highLight,
    borderRadius: BorderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.risk.high + '40',
  },
  logoutText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.risk.high },
});

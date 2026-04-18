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
import { useLanguage } from '@/context/LanguageContext';

export default function SettingsScreen() {
  const { t, language: savedLang, setLanguage: setGlobalLang } = useLanguage();
  const { syncState, pendingCount, triggerSync } = useSync();
  const [autoSync, setAutoSync] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [localLang, setLocalLang] = useState(savedLang === 'hi' ? 'हिन्दी' : 'English');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings')}</Text>
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

        <SettingsSection title={t('data_sync')} icon={<Database size={16} color={Colors.primary} />}>
          <SettingsRow
            label={t('auto_sync')}
            subtitle={t('sync_auto')}
            right={<Switch value={autoSync} onValueChange={setAutoSync} trackColor={{ true: Colors.primary }} thumbColor="#FFFFFF" />}
          />
          <View style={styles.syncStatusRow}>
            <SyncStatus state={syncState} pendingCount={pendingCount} onSync={triggerSync} />
            <TouchableOpacity style={styles.manualSyncBtn} onPress={triggerSync}>
              <RefreshCw size={14} color={Colors.primary} />
              <Text style={styles.manualSyncText}>{t('sync_now')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <Info size={14} color={Colors.primary} />
            <Text style={styles.infoText}>
              {t('records_info')}
            </Text>
          </View>
        </SettingsSection>

        <SettingsSection title={t('security')} icon={<Shield size={16} color={Colors.primary} />}>
          <SettingsRow
            label={t('data_encryption')}
            subtitle={t('aes_active')}
            right={<View style={styles.activeBadge}><Text style={styles.activeBadgeText}>{t('active_status')}</Text></View>}
          />
          <SettingsRow
            label={t('secure_transmission')}
            subtitle={t('tls_protocol')}
            right={<Lock size={18} color={Colors.risk.low} />}
          />
          <SettingsRow
            label={t('abdm_compliance')}
            subtitle={t('fhir_structure')}
            right={<ChevronRight size={18} color={Colors.text.muted} />}
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection title={t('language')} icon={<Globe size={16} color={Colors.primary} />}>
          {['English', 'हिन्दी', 'मराठी'].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.langOption, localLang === lang && styles.langOptionActive]}
              onPress={() => {
                setLocalLang(lang);
                if (lang === 'हिन्दी') setGlobalLang('hi');
                else setGlobalLang('en');
              }}
            >
              <Text style={[styles.langText, localLang === lang && styles.langTextActive]}>{lang}</Text>
              {localLang === lang && <View style={styles.langDot} />}
            </TouchableOpacity>
          ))}
        </SettingsSection>

        <SettingsSection title={t('appearance')} icon={<Type size={16} color={Colors.primary} />}>
          <SettingsRow
            label={t('dark_mode')}
            subtitle={t('switch_dark')}
            right={<Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: Colors.primary }} thumbColor="#FFFFFF" />}
          />
          <View style={styles.fontSizeRow}>
            <Text style={styles.fontSizeLabel}>{t('font_size')}</Text>
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

        <SettingsSection title={t('notifications')} icon={<Bell size={16} color={Colors.primary} />}>
          <SettingsRow
            label={t('high_risk_alerts')}
            subtitle={t('get_notified')}
            right={<Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: Colors.primary }} thumbColor="#FFFFFF" />}
          />
        </SettingsSection>

        <SettingsSection title={t('about')} icon={<Info size={16} color={Colors.primary} />}>
          <SettingsRow label={t('version')} right={<Text style={styles.versionText}>v2.1.0</Text>} />
          <SettingsRow label={t('build')} right={<Text style={styles.versionText}>2024.12</Text>} />
          <SettingsRow
            label={t('ministry')}
            subtitle={t('gov_india')}
            right={<ChevronRight size={18} color={Colors.text.muted} />}
          />
        </SettingsSection>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/auth/login')}>
          <LogOut size={18} color={Colors.risk.high} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
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

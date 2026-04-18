import React, { useRef, useEffect, useState } from 'react';
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
import { UserPlus, Users, TriangleAlert as AlertTriangle, MessageCircle, Globe, Bell } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import SyncStatus from '@/components/ui/SyncStatus';
import HeroSection from '@/components/dashboard/HeroSection';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { useSync } from '@/hooks/useSync';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardScreen() {
  const { t } = useLanguage();
  const { syncState, pendingCount, triggerSync } = useSync();
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'good_morning';
    if (h < 17) return 'good_afternoon';
    return 'good_evening';
  });

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(cardsAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{t(greeting as any)},</Text>
          <Text style={styles.userName}>ANM Sunita</Text>
        </View>
        <View style={styles.headerRight}>
          <SyncStatus state={syncState} pendingCount={pendingCount} onSync={triggerSync} />
          <TouchableOpacity style={styles.iconBtn}>
            <Globe size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={20} color={Colors.text.secondary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: cardsAnim }}>
          <HeroSection />
        </Animated.View>

        <View style={styles.statsRow}>
          <StatPill label={t('total')} value="48" color={Colors.primary} />
          <StatPill label={t('high_risk')} value="7" color={Colors.risk.high} />
          <StatPill label={t('pending')} value="3" color={Colors.risk.medium} />
          <StatPill label={t('synced')} value="45" color={Colors.risk.low} />
        </View>

        <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
        <View style={styles.grid}>
          <DashboardCard
            icon={<UserPlus size={22} color="#FFFFFF" />}
            title={t('add_new_patient')}
            subtitle={t('register_assess')}
            onPress={() => router.push('/patient/register')}
            variant="primary"
          />
          <DashboardCard
            icon={<Users size={22} color={Colors.primary} />}
            title={t('patient_list')}
            subtitle={t('view_all_patients')}
            onPress={() => router.push('/(tabs)/patients')}
          />
          <DashboardCard
            icon={<AlertTriangle size={22} color={Colors.risk.high} />}
            title={t('high_risk_alerts')}
            subtitle={`7 ${t('need_attention')}`}
            onPress={() => router.push('/(tabs)/alerts')}
            variant="alert"
            badge={7}
          />
          <DashboardCard
            icon={<MessageCircle size={22} color={Colors.primary} />}
            title={t('ai_chatbot')}
            subtitle={t('ask_clinical')}
            onPress={() => router.push('/ai/chatbot')}
          />
        </View>

        <Text style={styles.sectionTitle}>{t('recent_activity')}</Text>
        <View style={styles.activityList}>
          <ActivityItem name="Radha Kumari" actionKey="assessment_completed" actionParams=" · HIGH risk" time="2h ago" color={Colors.risk.high} />
          <ActivityItem name="Meena Devi" actionKey="referral_generated" actionParams="" time="4h ago" color={Colors.risk.medium} />
          <ActivityItem name="Parvati Singh" actionKey="epds_screening" actionParams="" time="6h ago" color={Colors.risk.low} />
          <ActivityItem name="Kavita Rao" actionKey="data_synced" actionParams="" time="8h ago" color={Colors.primary} />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/ai/chatbot')}
        activeOpacity={0.85}
      >
        <MessageCircle size={26} color="#FFFFFF" fill="rgba(255,255,255,0.2)" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statPill, { borderTopColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityItem({ name, actionKey, actionParams, time, color }: { name: string, actionKey: string, actionParams: string, time: string, color: string }) {
  const { t } = useLanguage();
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityDot, { backgroundColor: color }]} />
      <View style={styles.activityInfo}>
        <Text style={styles.activityName}>{name}</Text>
        <Text style={styles.activityAction}>{t(actionKey as any)}{actionParams}</Text>
      </View>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  headerLeft: { gap: 2 },
  greeting: { fontSize: FontSize.sm, color: Colors.text.muted },
  userName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { position: 'relative', padding: 8 },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.risk.high,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  scroll: { flex: 1 },
  content: { gap: 20, paddingBottom: 100 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  statPill: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    borderTopWidth: 3,
    alignItems: 'center',
    gap: 2,
    ...Shadow.sm,
  },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { fontSize: FontSize.xs, color: Colors.text.muted },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.lg,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: 12 },
  activityList: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  activityDot: { width: 10, height: 10, borderRadius: 5 },
  activityInfo: { flex: 1, gap: 2 },
  activityName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  activityAction: { fontSize: FontSize.xs, color: Colors.text.muted },
  activityTime: { fontSize: FontSize.xs, color: Colors.text.muted },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
});

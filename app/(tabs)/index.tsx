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

export default function DashboardScreen() {
  const { syncState, pendingCount, triggerSync } = useSync();
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
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
          <Text style={styles.greeting}>{greeting},</Text>
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
          <StatPill label="Total" value="48" color={Colors.primary} />
          <StatPill label="High Risk" value="7" color={Colors.risk.high} />
          <StatPill label="Pending" value="3" color={Colors.risk.medium} />
          <StatPill label="Synced" value="45" color={Colors.risk.low} />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          <DashboardCard
            icon={<UserPlus size={22} color="#FFFFFF" />}
            title="Add New Patient"
            subtitle="Register & assess"
            onPress={() => router.push('/patient/register')}
            variant="primary"
          />
          <DashboardCard
            icon={<Users size={22} color={Colors.primary} />}
            title="Patient List"
            subtitle="View all 48 patients"
            onPress={() => router.push('/(tabs)/patients')}
          />
          <DashboardCard
            icon={<AlertTriangle size={22} color={Colors.risk.high} />}
            title="High Risk Alerts"
            subtitle="7 need attention"
            onPress={() => router.push('/(tabs)/alerts')}
            variant="alert"
            badge={7}
          />
          <DashboardCard
            icon={<MessageCircle size={22} color={Colors.primary} />}
            title="AI Chatbot"
            subtitle="Ask clinical questions"
            onPress={() => router.push('/ai/chatbot')}
          />
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {RECENT_ACTIVITY.map((item, i) => (
            <ActivityItem key={i} item={item} />
          ))}
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

function ActivityItem({ item }: { item: (typeof RECENT_ACTIVITY)[0] }) {
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityDot, { backgroundColor: item.color }]} />
      <View style={styles.activityInfo}>
        <Text style={styles.activityName}>{item.name}</Text>
        <Text style={styles.activityAction}>{item.action}</Text>
      </View>
      <Text style={styles.activityTime}>{item.time}</Text>
    </View>
  );
}

const RECENT_ACTIVITY = [
  { name: 'Radha Kumari', action: 'Assessment completed · HIGH risk', time: '2h ago', color: Colors.risk.high },
  { name: 'Meena Devi', action: 'Referral generated', time: '4h ago', color: Colors.risk.medium },
  { name: 'Parvati Singh', action: 'EPDS screening done', time: '6h ago', color: Colors.risk.low },
  { name: 'Kavita Rao', action: 'Data synced to ABDM', time: '8h ago', color: Colors.primary },
];

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

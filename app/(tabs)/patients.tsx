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
} from 'react-native';
import { router } from 'expo-router';
import { Search, UserPlus, ListFilter as Filter, SlidersHorizontal } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import PatientCard from '@/components/patient/PatientCard';
import { Patient, RiskLevel } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

const PATIENTS: Patient[] = [
  { id: '1', name: 'Radha Kumari', age: 24, riskLevel: 'HIGH', lastVisit: 'Today', weeksPregnant: 32, village: 'Nashik', phone: '9876543210', synced: true, abhaId: 'ABHA001' },
  { id: '2', name: 'Meena Devi', age: 28, riskLevel: 'MEDIUM', lastVisit: 'Yesterday', weeksPregnant: 28, village: 'Pune', phone: '9876543211', synced: false },
  { id: '3', name: 'Parvati Singh', age: 22, riskLevel: 'LOW', lastVisit: '2 days ago', weeksPregnant: 20, village: 'Aurangabad', phone: '9876543212', synced: true, abhaId: 'ABHA003' },
  { id: '4', name: 'Kavita Rao', age: 31, riskLevel: 'HIGH', lastVisit: '3 days ago', weeksPregnant: 36, village: 'Nagpur', phone: '9876543213', synced: true },
  { id: '5', name: 'Sunita Patil', age: 26, riskLevel: 'LOW', lastVisit: '4 days ago', weeksPregnant: 16, village: 'Nashik', phone: '9876543214', synced: false },
  { id: '6', name: 'Anita Jadhav', age: 19, riskLevel: 'MEDIUM', lastVisit: '5 days ago', weeksPregnant: 24, village: 'Solapur', phone: '9876543215', synced: true, abhaId: 'ABHA006' },
];

const FILTERS: { label: string; value: RiskLevel | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'High Risk', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low Risk', value: 'LOW' },
];

export default function PatientsScreen() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<RiskLevel | 'ALL'>('ALL');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const filtered = PATIENTS.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.village.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'ALL' || p.riskLevel === activeFilter;
    return matchSearch && matchFilter;
  });

  const counts = {
    HIGH: PATIENTS.filter((p) => p.riskLevel === 'HIGH').length,
    MEDIUM: PATIENTS.filter((p) => p.riskLevel === 'MEDIUM').length,
    LOW: PATIENTS.filter((p) => p.riskLevel === 'LOW').length,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('patients')}</Text>
          <Text style={styles.subtitle}>{PATIENTS.length} {t('registered_count')}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/patient/register')}
        >
          <UserPlus size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>{t('add')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.riskSummary}>
        <RiskCount label={t('high')} count={counts.HIGH} color={Colors.risk.high} bg={Colors.risk.highLight} />
        <RiskCount label={t('medium')} count={counts.MEDIUM} color={Colors.risk.medium} bg={Colors.risk.mediumLight} />
        <RiskCount label={t('low')} count={counts.LOW} color={Colors.risk.low} bg={Colors.risk.lowLight} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={18} color={Colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_patients')}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={Colors.text.muted}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <SlidersHorizontal size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.filterRow} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            onPress={() => setActiveFilter('ALL')}
            style={[styles.chip, activeFilter === 'ALL' && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeFilter === 'ALL' && styles.chipTextActive]}>
              {t('all')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveFilter('HIGH')}
            style={[styles.chip, activeFilter === 'HIGH' && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeFilter === 'HIGH' && styles.chipTextActive]}>
              {t('high_risk')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveFilter('MEDIUM')}
            style={[styles.chip, activeFilter === 'MEDIUM' && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeFilter === 'MEDIUM' && styles.chipTextActive]}>
              {t('medium')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveFilter('LOW')}
            style={[styles.chip, activeFilter === 'LOW' && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeFilter === 'LOW' && styles.chipTextActive]}>
              {t('low_risk')}
            </Text>
          </TouchableOpacity>
      </ScrollView>

      <Animated.ScrollView
        style={[styles.list, { opacity: fadeAnim }]}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>{t('no_patients_found')}</Text>
          </View>
        ) : (
          filtered.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onPress={() => router.push(`/patient/${patient.id}`)}
            />
          ))
        )}
        <View style={{ height: 20 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function RiskCount({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <View style={[styles.riskBox, { backgroundColor: bg }]}>
      <Text style={[styles.riskCount, { color }]}>{count}</Text>
      <Text style={[styles.riskLabel, { color }]}>{label}</Text>
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
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  subtitle: { fontSize: FontSize.sm, color: Colors.text.muted, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    ...Shadow.sm,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  riskSummary: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 10, marginBottom: 12 },
  riskBox: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  riskCount: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  riskLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: 10,
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    gap: 10,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadow.sm,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text.primary },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadow.sm,
  },
  filterRow: { maxHeight: 48, marginBottom: 4 },
  filterScroll: { paddingHorizontal: Spacing.lg, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border.light,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text.secondary },
  chipTextActive: { color: '#FFFFFF' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg, gap: 10, paddingTop: 8 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: FontSize.lg, color: Colors.text.muted },
});

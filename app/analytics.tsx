import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CaseStore, MedicalCase } from '../services/CaseStore';
import { ArrowLeft, BrainCircuit, Activity, BarChart4, MoveRight, Stethoscope } from 'lucide-react-native';

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [cases, setCases] = useState<MedicalCase[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await CaseStore.getAllCases();
      setCases(data);
    };
    load();
  }, []);

  const totalCases = cases.length;
  const overwrittenCases = cases.filter(c => c.status === 'Pending MO Review' || c.moResponseNote).length;
  const disagreementRate = totalCases > 0 ? Math.round((overwrittenCases / totalCases) * 100) : 0;

  // Outcome Logic Analysis
  const outcomeCases = cases.filter(c => c.status === 'Outcome Recorded');
  const totalOutcomes = outcomeCases.length;
  
  const necessary = outcomeCases.filter(c => c.referralOutcome === 'Necessary Referral').length;
  const unnecessary = outcomeCases.filter(c => c.referralOutcome === 'Unnecessary Referral').length;
  const delayed = outcomeCases.filter(c => c.referralOutcome === 'Delayed Referral').length;

  const getPercent = (val: number) => totalOutcomes > 0 ? Math.round((val / totalOutcomes) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><ArrowLeft color="#1e293b" size={24} /></TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>AI Learning Mode</Text>
          <Text style={styles.headerSubtitle}>Intelligence Analytics</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.learningBanner}>
          <BrainCircuit color="#2563eb" size={24} />
          <Text style={styles.learningBannerText}>System Learning from Real Outcomes</Text>
        </View>

        <Text style={styles.sectionLbl}>Referral Insights (Feedback Loop)</Text>
        <View style={styles.card}>
          <View style={styles.graphBlock}>
            <Text style={styles.graphValue}>{getPercent(necessary)}%</Text>
            <Text style={styles.graphSub}>Referral Accuracy Target</Text>
          </View>
          
          <View style={styles.barWrap}>
            {totalOutcomes > 0 ? (
              <View style={styles.barVisualizer}>
                <View style={{flex: necessary, backgroundColor: '#10b981', height: 16}} />
                <View style={{flex: delayed, backgroundColor: '#f59e0b', height: 16}} />
                <View style={{flex: unnecessary, backgroundColor: '#ef4444', height: 16}} />
              </View>
            ) : (
              <View style={[styles.barVisualizer, {backgroundColor: '#e2e8f0'}]} />
            )}
            
            <View style={styles.legendWrap}>
              <View style={styles.legendRow}><View style={[styles.dot, {backgroundColor: '#10b981'}]}/><Text style={styles.legendText}>Necessary ({necessary})</Text></View>
              <View style={styles.legendRow}><View style={[styles.dot, {backgroundColor: '#f59e0b'}]}/><Text style={styles.legendText}>Delayed ({delayed})</Text></View>
              <View style={styles.legendRow}><View style={[styles.dot, {backgroundColor: '#ef4444'}]}/><Text style={styles.legendText}>Unnecessary ({unnecessary})</Text></View>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
               <Text style={[styles.metricPerc, {color: '#ef4444'}]}>{getPercent(unnecessary)}%</Text>
               <Text style={styles.metricLbl}>False Positives</Text>
            </View>
            <View style={styles.metricItem}>
               <Text style={[styles.metricPerc, {color: '#f59e0b'}]}>{getPercent(delayed)}%</Text>
               <Text style={styles.metricLbl}>False Negatives</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLbl}>Continuous Improvement Over Time</Text>
        <View style={styles.card}>
           {outcomeCases.slice(0, 3).map((c, i) => (
             <View key={i} style={styles.outcomeRow}>
                <Stethoscope size={20} color="#94a3b8" />
                <View style={styles.outcomeMeta}>
                  <Text style={styles.outcomeTitle}>{c.finalDiagnosis}</Text>
                  <View style={styles.outcomeSubRow}>
                    <Text style={styles.outcomeAi}>AI Model: {c.aiResult.riskLevel} </Text>
                    <MoveRight size={14} color="#cbd5e1" />
                    <Text style={[styles.outcomeResult, c.referralOutcome === 'Necessary Referral' ? {color: '#16a34a'} : {color: '#dc2626'}]}> {c.referralOutcome}</Text>
                  </View>
                </View>
             </View>
           ))}
           {totalOutcomes === 0 && <Text style={{color: '#94a3b8', fontStyle:'italic'}}>No outcomes logged yet to shape ML paths.</Text>}
        </View>

        <View style={styles.macroGrid}>
          <View style={styles.macroCard}>
            <Text style={styles.macroTitle}>ANM Override Rate</Text>
            <Text style={styles.macroValue}>{disagreementRate}%</Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroTitle}>Total Database</Text>
            <Text style={styles.macroValue}>{totalCases}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12, marginRight: 16 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  headerSubtitle: { fontSize: 13, color: '#2563eb', fontWeight: '700', textTransform: 'uppercase' },
  content: { padding: 20, paddingBottom: 60 },
  
  learningBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#eff6ff', padding: 18, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#bfdbfe' },
  learningBannerText: { flex: 1, color: '#1d4ed8', fontWeight: '800', fontSize: 15 },
  
  sectionLbl: { fontSize: 13, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 3 },
  
  graphBlock: { alignItems: 'center', marginBottom: 20 },
  graphValue: { fontSize: 48, fontWeight: '900', color: '#10b981', letterSpacing: -1 },
  graphSub: { fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },

  barWrap: { marginBottom: 24 },
  barVisualizer: { height: 16, borderRadius: 8, overflow: 'hidden', flexDirection: 'row', width: '100%' },
  legendWrap: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: '#475569', fontWeight: '700' },

  metricsGrid: { flexDirection: 'row', gap: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  metricItem: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#f8fafc', borderRadius: 12 },
  metricPerc: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  metricLbl: { fontSize: 12, fontWeight: '700', color: '#64748b' },

  outcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  outcomeMeta: { flex: 1 },
  outcomeTitle: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 4 },
  outcomeSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  outcomeAi: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  outcomeResult: { fontSize: 13, fontWeight: '800' },

  macroGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  macroCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  macroTitle: { fontSize: 12, color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: 8 },
  macroValue: { fontSize: 32, color: '#0f172a', fontWeight: '900' }
});

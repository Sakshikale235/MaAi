import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CaseStore, MedicalCase } from '../services/CaseStore';
import { Activity, ShieldAlert, ArrowLeft, CheckCircle2, XCircle, Stethoscope, AlertTriangle } from 'lucide-react-native';

export default function MODashboard() {
  const router = useRouter();
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedCase, setSelectedCase] = useState<MedicalCase | null>(null);
  const [moNote, setMoNote] = useState('');
  
  // Outcome Recording State
  const [isOutcomeMode, setIsOutcomeMode] = useState(false);
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [referralOutcome, setReferralOutcome] = useState<'Necessary Referral' | 'Unnecessary Referral' | 'Delayed Referral' | null>(null);
  const [treatmentGiven, setTreatmentGiven] = useState('');

  const loadData = async () => {
    setRefreshing(true);
    const data = await CaseStore.getAllCases();
    const sorted = data.sort((a,b) => b.timestamp - a.timestamp);
    setCases(sorted);
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (action: 'Override Accepted' | 'Override Rejected') => {
    if (!selectedCase) return;
    const updated = { ...selectedCase, status: 'Closed' as any, moResponseNote: moNote, moAction: action };
    await CaseStore.updateCase(updated);
    setSelectedCase(null);
    setMoNote('');
    loadData();
  };

  const handleRecordOutcome = async () => {
    if (!selectedCase || !referralOutcome || !finalDiagnosis) return;
    const updated = { 
      ...selectedCase, 
      status: 'Outcome Recorded' as any, 
      finalDiagnosis, 
      referralOutcome, 
      treatmentGiven 
    };
    await CaseStore.updateCase(updated);
    setSelectedCase(null);
    setIsOutcomeMode(false);
    setFinalDiagnosis(''); setReferralOutcome(null); setTreatmentGiven('');
    loadData();
  };

  const openOutcomeModal = (c: MedicalCase) => {
    setSelectedCase(c);
    setIsOutcomeMode(true);
  };

  const flaggedCount = cases.filter(c => c.status === 'Pending MO Review').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><ArrowLeft color="#1e293b" size={24} /></TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Supervisor Dashboard</Text>
          <Text style={styles.headerSubtitle}>{flaggedCount} cases pending review</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}>
        {cases.map(c => (
          <TouchableOpacity key={c.id} style={[styles.card, c.status === 'Pending MO Review' && styles.cardFlagged]} onPress={() => { setSelectedCase(c); setIsOutcomeMode(false); }}>
            <View style={styles.cardHeader}>
              <Text style={styles.caseTimestamp}>{new Date(c.timestamp).toLocaleString()}</Text>
              <View style={[styles.badge, c.status === 'Pending MO Review' ? styles.badgeRed : c.status === 'Outcome Recorded' ? styles.badgeBlue : styles.badgeGreen]}>
                <Text style={[styles.badgeText, c.status === 'Pending MO Review' ? styles.badgeTextRed : c.status === 'Outcome Recorded' ? styles.badgeTextBlue : styles.badgeTextGreen]}>
                  {c.status}
                </Text>
              </View>
            </View>

            <Text style={styles.patientMeta}>BP: {c.patientData.bpSystolic}/{c.patientData.bpDiastolic}  •  Hb: {c.patientData.hb}  •  {c.patientData.trimester}</Text>
            
            <View style={styles.aiRow}>
              <Text style={styles.cardAiLabel}>Diagnostic Trace:</Text>
              <Text style={styles.cardAiResult}>{c.aiResult.riskLevel} Risk ({c.aiConfidence}%)</Text>
            </View>

            {c.status === 'Closed' && (
              <TouchableOpacity style={styles.outcomeBtnPrimary} onPress={(e) => { e.stopPropagation(); openOutcomeModal(c); }}>
                <Stethoscope size={16} color="#fff" />
                <Text style={styles.outcomeBtnText}>Record Case Outcome</Text>
              </TouchableOpacity>
            )}
            
            {c.status === 'Outcome Recorded' && (
              <View style={styles.recordedBox}>
                <Text style={styles.recordedLabel}>Clinical Outcome Closed: <Text style={{color:'#1e293b', fontWeight:'800'}}>{c.referralOutcome}</Text></Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Detail Modal or Outcome Form */}
      <Modal visible={!!selectedCase} animationType="slide" presentationStyle="pageSheet">
        {isOutcomeMode ? (
          <SafeAreaView style={{flex:1, backgroundColor:'#f8fafc'}}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => { setSelectedCase(null); setIsOutcomeMode(false); }}><Text style={styles.closeText}>Cancel</Text></TouchableOpacity>
              <Text style={styles.modalTitle}>Record Outcome</Text>
              <View style={{width: 40}} />
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.outcomeDesc}>Provide the final hospital diagnosis to calibrate the AI Feedback Loop safely.</Text>
              
              <Text style={styles.inputLabel}>Final Diagnosis <Text style={{color:'red'}}>*</Text></Text>
              <TextInput style={styles.textInput} placeholder="e.g. Severe Pre-Eclampsia..." value={finalDiagnosis} onChangeText={setFinalDiagnosis} />
              
              <Text style={styles.inputLabel}>Referral Classification <Text style={{color:'red'}}>*</Text></Text>
              <View style={styles.radioGroup}>
                {['Necessary Referral', 'Delayed Referral', 'Unnecessary Referral'].map((item: any) => (
                  <TouchableOpacity key={item} style={[styles.radioItem, referralOutcome === item && styles.radioItemActive]} onPress={() => setReferralOutcome(item)}>
                    <Text style={[styles.radioText, referralOutcome === item && styles.radioTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Treatment Given (Optional)</Text>
              <TextInput style={[styles.textInput, {height: 80, textAlignVertical:'top'}]} multiline placeholder="e.g. Admitted, MgSO4 Administered..." value={treatmentGiven} onChangeText={setTreatmentGiven} />

              <TouchableOpacity style={[styles.submitOutcomeBtn, (!finalDiagnosis || !referralOutcome) && {opacity: 0.5}]} onPress={handleRecordOutcome}>
                <Text style={styles.submitOutcomeText}>Lock Referral Outcome</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        ) : (
          <SafeAreaView style={{flex:1, backgroundColor:'#f1f5f9'}}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedCase(null)}><Text style={styles.closeText}>Close</Text></TouchableOpacity>
              <Text style={styles.modalTitle}>Case Overview</Text>
              <View style={{width: 40}} />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.sectionTitle}>Patient Profile</Text>
              <View style={styles.dataBlock}>
                <Text style={styles.dataRow}>Heart: {selectedCase?.patientData.bpSystolic}/{selectedCase?.patientData.bpDiastolic}</Text>
                <Text style={styles.dataRow}>Hemoglobin: {selectedCase?.patientData.hb} | SpO2: {selectedCase?.patientData.spo2}%</Text>
              </View>

              <Text style={styles.sectionTitle}>AI System Analysis</Text>
              <View style={styles.dataBlock}>
                <Text style={styles.dataRowHeader}>Evaluated Gravity: <Text style={{fontWeight:'900'}}>{selectedCase?.aiResult.riskLevel}</Text></Text>
                <Text style={styles.dataRowHeader}>Model Confidence: <Text style={{fontWeight:'900', color: '#2563eb'}}>{selectedCase?.aiConfidence}%</Text></Text>
              </View>

              {selectedCase?.status === 'Pending MO Review' && (
                <View style={styles.actionPanel}>
                  <Text style={styles.sectionTitle}>Supervisor Action Form</Text>
                  <TextInput style={styles.moInput} placeholder="Enter supervisory notes or guidance here..." multiline value={moNote} onChangeText={setMoNote} />
                  <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => handleAction('Override Accepted')}>
                      <CheckCircle2 color="#fff" size={20} /><Text style={styles.btnText}>Validate Override</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleAction('Override Rejected')}>
                      <XCircle color="#fff" size={20} /><Text style={styles.btnText}>Reject Override</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12, marginRight: 16 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  headerSubtitle: { fontSize: 13, color: '#ef4444', fontWeight: '700' },
  content: { padding: 20, paddingBottom: 60 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  cardFlagged: { borderColor: '#fca5a5', backgroundColor: '#fff5f5' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  caseTimestamp: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeRed: { backgroundColor: '#fef2f2' }, badgeGreen: { backgroundColor: '#f0fdf4' }, badgeBlue: { backgroundColor: '#eff6ff' },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  badgeTextRed: { color: '#ef4444' }, badgeTextGreen: { color: '#10b981' }, badgeTextBlue: { color: '#2563eb' },
  patientMeta: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  cardAiLabel: { fontSize: 13, color: '#64748b', fontWeight: '700' }, cardAiResult: { fontSize: 13, color: '#0f172a', fontWeight: '900' },
  
  outcomeBtnPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2563eb', paddingVertical: 10, borderRadius: 12, marginTop: 12 },
  outcomeBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  recordedBox: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 10, marginTop: 12, alignItems: 'center' },
  recordedLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#cbd5e1' },
  closeText: { fontSize: 16, color: '#475569', fontWeight: '700' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  modalContent: { padding: 20, paddingBottom: 60 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 16 },
  dataBlock: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  dataRow: { fontSize: 15, color: '#334155', marginBottom: 6, fontWeight: '500', lineHeight: 22 },
  dataRowHeader: { fontSize: 15, color: '#0f172a', marginBottom: 4 },
  actionPanel: { marginTop: 24, backgroundColor: '#fff', padding: 20, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  moInput: { height: 100, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, textAlignVertical: 'top', marginBottom: 20 },
  btnRow: { flexDirection: 'row', gap: 12 },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Outcome Form styling
  outcomeDesc: { fontSize: 15, color: '#475569', marginBottom: 24, lineHeight: 22 },
  inputLabel: { fontSize: 13, fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: 8, marginTop: 16, letterSpacing: 0.5 },
  textInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a' },
  radioGroup: { flexDirection: 'column', gap: 10 },
  radioItem: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff' },
  radioItemActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  radioText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  radioTextActive: { color: '#2563eb', fontWeight: '800' },
  submitOutcomeBtn: { backgroundColor: '#0f172a', padding: 20, borderRadius: 14, alignItems: 'center', marginTop: 40 },
  submitOutcomeText: { color: '#fff', fontSize: 17, fontWeight: '800' }
});

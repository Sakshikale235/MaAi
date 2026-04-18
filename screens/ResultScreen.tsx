import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import NetInfo from '@react-native-community/netinfo';
import { Volume2, AlertTriangle, Activity, CheckCircle2, XOctagon, BrainCircuit } from 'lucide-react-native';

import ProgressBar from '../components/ProgressBar';
import FactorList from '../components/FactorList';
import { PatientData, RiskResult } from '../utils/RiskEngine';
import { explainRiskWithAI } from '../services/GeminiService';
import { CaseStore, MedicalCase } from '../services/CaseStore';

interface ResultScreenProps {
  data: PatientData;
  result: RiskResult;
  onReset: () => void;
}

export default function ResultScreen({ data, result, onReset }: ResultScreenProps) {
  const [explanation, setExplanation] = useState<string>(result.rationale);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [isDisagreementModalVisible, setIsDisagreementModalVisible] = useState(false);
  const [disagreementNote, setDisagreementNote] = useState('');
  
  // Calculate mock confidence score dynamically based on weight bounds
  const aiConfidence = Math.max(75, Math.min(100, Math.floor(100 - (result.riskScore * 10) + (result.triggeredFactors.length * 2))));
  
  let confColor = '#10b981';
  if (aiConfidence < 80) confColor = '#f59e0b';
  if (aiConfidence < 50) confColor = '#ef4444';

  useEffect(() => {
    const checkNetwork = async () => {
      const state = await NetInfo.fetch();
      setIsOnline(state.isConnected && state.isInternetReachable);
    };
    checkNetwork();
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchAI = async () => {
      if (isOnline === false) return;

      setLoadingAI(true);
      const aiText = await explainRiskWithAI(result.triggeredFactors, result.riskLevel, data);
      
      if (mounted && aiText) setExplanation(aiText);
      if (mounted) setLoadingAI(false);
    };
    
    if (result.isValid && result.triggeredFactors.length > 0 && isOnline !== null) {
      fetchAI();
    }
  }, [result, isOnline]);

  if (!result.isValid) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle color="#ef4444" size={48} />
        <Text style={styles.errorText}>{result.errorMessage}</Text>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onReset}>
          <Text style={styles.secondaryBtnText}>Return to Input</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSpeak = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    const combinedScript = `${result.reassuringLine} ${explanation.split('(Hindi:')[0]}`;
    const sanitizedSpeech = combinedScript.replace(/[0-9%/]/g, ''); 
    Speech.speak(sanitizedSpeech, {
      language: 'en-IN', pitch: 1.0, rate: 0.85,
      onDone: () => setIsSpeaking(false), onError: () => setIsSpeaking(false), onStopped: () => setIsSpeaking(false),
    });
  };

  const handleAcceptRoutine = async () => {
    const newCase: MedicalCase = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      patientData: data,
      aiResult: result,
      aiConfidence,
      status: 'Accepted by ANM'
    };
    await CaseStore.saveCase(newCase);
    Alert.alert('Response Logged', 'The Clinical AI assessment was formally accepted.', [{ text: 'OK', onPress: onReset }]);
  };

  const handleSubmitDisagreement = async () => {
    if (!disagreementNote.trim()) {
      Alert.alert('Required', 'Please provide clinical reasoning for overriding the AI.');
      return;
    }
    const newCase: MedicalCase = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      patientData: data,
      aiResult: result,
      aiConfidence,
      status: 'Pending MO Review',
      anmDisagreementNote: disagreementNote
    };
    await CaseStore.saveCase(newCase);
    setIsDisagreementModalVisible(false);
    Alert.alert('Flagged for MO', 'This case has securely been submitted to the Medical Officer for review.', [{ text: 'OK', onPress: onReset }]);
  };

  const UI_COLORS = {
    STABLE: { grad1: '#dcfce7', grad2: '#bbf7d0', text: '#16a34a' },
    'NEEDS ATTENTION': { grad1: '#fef3c7', grad2: '#fde68a', text: '#d97706' },
    HIGH: { grad1: '#fee2e2', grad2: '#fecaca', text: '#dc2626' }
  };
  const colors = UI_COLORS[result.riskLevel as keyof typeof UI_COLORS] || { grad1: '#fff', grad2: '#f1f5f9', text: '#333' };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {isOnline !== null && (
          <View style={[styles.networkPill, isOnline ? styles.onlineState : styles.offlineState]}>
            <Text style={[styles.networkText, isOnline ? styles.onlineText : styles.offlineText]}>
              {isOnline ? '🟢 AI Powered (Online Mode)' : '🟡 Offline Clinical Mode'}
            </Text>
          </View>
        )}

        <LinearGradient colors={[colors.grad1, colors.grad2]} style={styles.mainCard}>
          <Text style={[styles.riskLabel, { color: colors.text }]}>{result.riskLevel}</Text>
          <ProgressBar riskLevel={result.riskLevel} score={result.riskScore} />

          <View style={styles.confidenceRow}>
            <BrainCircuit size={18} color="#475569" />
            <Text style={styles.confidenceText}>AI Confidence Subsystem: </Text>
            <Text style={[styles.confidenceScore, { color: confColor }]}>{aiConfidence}% </Text>
          </View>

          <FactorList factors={result.triggeredFactors} />

          {result.multipleInsightFlag && (
            <View style={styles.insightFlag}>
              <AlertTriangle size={18} color="#b91c1c" />
              <Text style={styles.insightText}>Multiple high-risk conditions detected. Extra care is required.</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.explanationCard}>
          <View style={styles.explanationHeaderRow}>
            <Text style={styles.explanationTitle}>Clinical Interpretation</Text>
            <TouchableOpacity onPress={handleSpeak} style={[styles.speakBtn, isSpeaking && styles.speakBtnActive]}>
              <Volume2 color={isSpeaking ? "#fff" : "#2563eb"} size={18} />
              <Text style={[styles.speakText, isSpeaking && { color: '#fff' }]}>{isSpeaking ? "Stop" : "Speak"}</Text>
            </TouchableOpacity>
          </View>

          {loadingAI ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.loadingText}>Synthesizing cognitive reasoning...</Text>
            </View>
          ) : (
            <Text style={styles.explanationBody}>{explanation}</Text>
          )}
          
          <View style={styles.reassuranceBanner}>
            <Text style={styles.reassuranceText}>{result.reassuringLine}</Text>
          </View>
        </View>

        <Text style={styles.hitlTitle}>System Recommendation Action</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptRoutine}>
            <CheckCircle2 color="#fff" size={24} />
            <Text style={styles.acceptBtnText}>Accept Baseline</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.overrideBtn} onPress={() => setIsDisagreementModalVisible(true)}>
            <XOctagon color="#ef4444" size={20} />
            <Text style={styles.overrideBtnText}>Disagree (Override AI)</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.disclaimerText}>
          This tool is for screening purposes only. ANMs possess full clinical mandate to override AI decisions. 
        </Text>
      </ScrollView>

      {/* Disagreement HITL Modal */}
      <Modal visible={isDisagreementModalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Override AI Routine</Text>
            <Text style={styles.modalDesc}>Please provide your clinical reason for overruling this system assessment. This will be flagged to the Medical Officer.</Text>
            
            <TextInput
              style={styles.modalInput}
              multiline
              placeholder="e.g. Patient appeared heavily exhausted despite normal vitals recorded..."
              placeholderTextColor="#94a3b8"
              value={disagreementNote}
              onChangeText={setDisagreementNote}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setIsDisagreementModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmit} onPress={handleSubmitDisagreement}>
                <Text style={styles.modalSubmitText}>Escalate to MO</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  errorContainer: { flex: 1, padding: 40, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: '#1e293b', textAlign: 'center', marginVertical: 20, fontWeight: '700', lineHeight: 28 },

  networkPill: {
    alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  onlineState: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  offlineState: { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fef08a' },
  networkText: { fontSize: 13, fontWeight: '800' },
  onlineText: { color: '#166534' },
  offlineText: { color: '#854d0e' },
  
  mainCard: {
    borderRadius: 24, padding: 24, paddingBottom: 24, marginBottom: 20, alignItems: 'stretch',
    shadowColor: '#000', shadowOffset: { width:0, height:8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8
  },
  riskLabel: { fontSize: 34, fontWeight: '900', letterSpacing: 1, marginTop: -4, textAlign: 'center', textTransform: 'uppercase' },
  
  confidenceRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 12, backgroundColor: 'rgba(255,255,255,0.6)', paddingVertical: 8, borderRadius: 12 },
  confidenceText: { fontSize: 14, fontWeight: '700', color: '#475569', marginLeft: 6 },
  confidenceScore: { fontSize: 15, fontWeight: '900' },

  insightFlag: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fee2e2', padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#fca5a5', marginTop: 16
  },
  insightText: { flex: 1, color: '#991b1b', fontWeight: '700', fontSize: 13, lineHeight: 18 },

  explanationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: '#1e293b', shadowOffset: { width:0, height:6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6
  },
  explanationHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  explanationTitle: { fontSize: 14, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  speakBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eff6ff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
  speakBtnActive: { backgroundColor: '#2563eb' },
  speakText: { color: '#2563eb', fontWeight: '800', fontSize: 14 },
  
  explanationBody: { fontSize: 16, color: '#0f172a', lineHeight: 26, fontWeight: '500' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  loadingText: { color: '#64748b', fontSize: 15, fontStyle: 'italic', flex: 1 },
  
  reassuranceBanner: { marginTop: 16, borderTopWidth: 1.5, borderTopColor: '#f1f5f9', paddingTop: 16 },
  reassuranceText: { fontWeight: '800', color: '#0f172a', fontStyle: 'italic', fontSize: 15 },

  hitlTitle: { fontSize: 14, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 12, alignSelf: 'center', letterSpacing: 0.5 },
  actionGrid: { gap: 14, marginBottom: 20 },
  acceptBtn: { flexDirection: 'row', gap: 10, justifyContent: 'center', backgroundColor: '#10b981', padding: 18, borderRadius: 14, alignItems: 'center', shadowColor: '#10b981', shadowOffset: {width:0, height:8}, shadowOpacity:0.4, shadowRadius:12, elevation:8 },
  acceptBtnText: { color: '#ffffff', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
  
  overrideBtn: { flexDirection: 'row', gap: 8, justifyContent: 'center', backgroundColor: '#fef2f2', borderWidth: 2, borderColor: '#fecaca', padding: 16, borderRadius: 14, alignItems: 'center' },
  overrideBtnText: { color: '#dc2626', fontSize: 17, fontWeight: '800' },

  secondaryBtn: { backgroundColor: '#f1f5f9', padding: 18, borderRadius: 14, alignItems: 'center' },
  secondaryBtnText: { color: '#475569', fontSize: 17, fontWeight: '800' },

  disclaimerText: { textAlign: 'center', fontSize: 12, color: '#94a3b8', fontWeight: '600', paddingHorizontal: 10, lineHeight: 18 },

  modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 24, elevation: 12 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a', marginBottom: 10 },
  modalDesc: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 20 },
  modalInput: { height: 120, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, fontSize: 16, color: '#0f172a', textAlignVertical: 'top', marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  modalCancelText: { color: '#64748b', fontWeight: '800', fontSize: 16 },
  modalSubmit: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#ef4444', alignItems: 'center', shadowColor: '#ef4444', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  modalSubmitText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});

import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { LineChart, ShieldAlert, Mic } from 'lucide-react-native';

import InputScreen from '../screens/InputScreen';
import ResultScreen from '../screens/ResultScreen';
import { PatientData, RiskResult, calculateDeterministicRisk } from '../utils/RiskEngine';

export default function RiskAnalyzer() {
  const router = useRouter(); // EXPO ROUTER NAVIGATION

  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [result, setResult] = useState<RiskResult | null>(null);

  const handleAssess = (data: PatientData) => {
    setPatientData(data);
    const assessment = calculateDeterministicRisk(data);
    setResult(assessment);
  };

  const resetFlow = () => {
    setPatientData(null);
    setResult(null);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1d4ed8" />
      
      {/* Seamless Header Layer */}
      <LinearGradient colors={['#1d4ed8', '#2563eb', '#3b82f6']} style={styles.headerGradient}>
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Maternal Analyzer</Text>
              <Text style={styles.headerSubtitle}>Frontend Evaluator Tool</Text>
            </View>
            <View style={styles.navBlock}>
              <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/mo-dashboard')}>
                <ShieldAlert color="#bfdbfe" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/analytics')}>
                <LineChart color="#bfdbfe" size={24} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.navBtn, {marginLeft: 8}]} onPress={() => router.push('/audio-test')}>
                <Mic color="#bfdbfe" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Dynamic Viewport */}
      {result && patientData ? (
        <ResultScreen data={patientData} result={result} onReset={resetFlow} />
      ) : (
        <InputScreen onAssess={handleAssess} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f1f5f9' },
  headerGradient: { paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, shadowColor: '#1d4ed8', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10, zIndex: 10 },
  headerSafeArea: { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0 },
  headerContent: { paddingHorizontal: 24, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5, marginBottom: 2 },
  headerSubtitle: { fontSize: 13, fontWeight: '700', color: '#bfdbfe', letterSpacing: 1, textTransform: 'uppercase' },
  
  navBlock: { flexDirection: 'row', gap: 12 },
  navBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 }
});

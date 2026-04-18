import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { PatientData } from '../utils/RiskEngine';

interface InputScreenProps {
  onAssess: (data: PatientData) => void;
}

export default function InputScreen({ onAssess }: InputScreenProps) {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [hb, setHb] = useState('');
  const [spo2, setSpo2] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [trimester, setTrimester] = useState('1st');
  
  const [prevSystolic, setPrevSystolic] = useState(''); // Lightweight trend flag demo
  
  const emergencySymptoms = [
    'vaginal bleeding', 'convulsions/seizures', 'loss of consciousness', 
    'severe abdominal pain', 'no fetal movement', 'severe breathlessness'
  ];
  
  const standardSymptoms = [
    'severe headache', 'blurred vision', 'swelling of face/hands', 'dizziness', 
    'weakness', 'fever', 'chills', 'burning urination', 'poor appetite',
    'persistent vomiting', 'chest pain', 'reduced urine output'
  ];
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleAssess = () => {
    onAssess({
      bpSystolic: systolic ? parseFloat(systolic) : undefined,
      bpDiastolic: diastolic ? parseFloat(diastolic) : undefined,
      hb: hb ? parseFloat(hb) : undefined,
      spo2: spo2 ? parseFloat(spo2) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      trimester,
      symptoms: selectedSymptoms,
      previousData: {
        bpSystolic: prevSystolic ? parseFloat(prevSystolic) : undefined
      }
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Primary Clinical Vitals</Text>
        
        <View style={styles.row}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>BP Systolic</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={systolic} onChangeText={setSystolic} placeholder="120" placeholderTextColor="#9ca3af" />
          </View>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>BP Diastolic</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={diastolic} onChangeText={setDiastolic} placeholder="80" placeholderTextColor="#9ca3af" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Hemoglobin (g/dL)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={hb} onChangeText={setHb} placeholder="11" placeholderTextColor="#9ca3af" />
          </View>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>SpO2 (%)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={spo2} onChangeText={setSpo2} placeholder="98" placeholderTextColor="#9ca3af" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Temperature (°C)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={temperature} onChangeText={setTemperature} placeholder="37.5" placeholderTextColor="#9ca3af" />
          </View>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} placeholder="60" placeholderTextColor="#9ca3af" />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Prev. Systolic (Optional Trend)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={prevSystolic} onChangeText={setPrevSystolic} placeholder="e.g. 110" placeholderTextColor="#9ca3af" />
          </View>
        </View>

        <Text style={[styles.label, { marginTop: 10 }]}>Current Trimester</Text>
        <View style={styles.trimesterRow}>
          {['1st', '2nd', '3rd'].map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.triBtn, trimester === t && styles.triBtnActive]}
              onPress={() => setTrimester(t)}
            >
              <Text style={[styles.triText, trimester === t && styles.triTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: '#dc2626' }]}>Emergency Danger Signs</Text>
        <View style={styles.symptomsWrap}>
          {emergencySymptoms.map(sym => (
            <TouchableOpacity 
              key={sym} 
              style={[styles.symBtn, styles.dangerBtn, selectedSymptoms.includes(sym) && styles.dangerBtnActive]}
              onPress={() => toggleSymptom(sym)}
            >
              <Text style={[styles.symText, selectedSymptoms.includes(sym) && styles.dangerTextActive]}>
                {sym}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Other Symptoms</Text>
        <View style={styles.symptomsWrap}>
          {standardSymptoms.map(sym => (
            <TouchableOpacity 
              key={sym} 
              style={[styles.symBtn, selectedSymptoms.includes(sym) && styles.symBtnActive]}
              onPress={() => toggleSymptom(sym)}
            >
              <Text style={[styles.symText, selectedSymptoms.includes(sym) && styles.symTextActive]}>
                {sym}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.mainBtn} onPress={handleAssess}>
        <Text style={styles.mainBtnText}>Compute Risk Engine</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#1e293b', shadowOffset: { width:0, height:6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6
  },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#1e293b', marginBottom: 16, letterSpacing: 0.5, textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  inputWrap: { flex: 1 },
  label: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '600'
  },
  trimesterRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  triBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0', alignItems: 'center', backgroundColor: '#f8fafc' },
  triBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6', shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 4, elevation: 3 },
  triText: { fontWeight: '800', color: '#475569' },
  triTextActive: { color: '#ffffff' },
  symptomsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  symBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1.5, borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
  symBtnActive: { backgroundColor: '#fef08a', borderColor: '#eab308', shadowColor: '#eab308', shadowOpacity: 0.2, shadowRadius: 4 },
  symText: { fontSize: 14, color: '#475569', fontWeight: '700', textTransform: 'capitalize' },
  symTextActive: { color: '#854d0e', fontWeight: '900' },
  dangerBtn: { borderColor: '#fca5a5' },
  dangerBtnActive: { backgroundColor: '#ef4444', borderColor: '#b91c1c', shadowColor: '#ef4444' },
  dangerTextActive: { color: '#ffffff', fontWeight: '900' },
  
  mainBtn: { backgroundColor: '#1d4ed8', padding: 18, borderRadius: 14, alignItems: 'center', shadowColor: '#1d4ed8', shadowOffset: {width:0, height:8}, shadowOpacity:0.4, shadowRadius:12, elevation:8 },
  mainBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 }
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Square, Play, Brain, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import * as FileSystem from "expo-file-system";
import { useRecorder } from "../hooks/useRecorder";
import { getTextFromAudio } from "../services/GeminiSpeechService";

export default function AudioTestScreen() {
  const router = useRouter();
  const { startRecording, stopRecording, isRecording } = useRecorder();
  
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // STEP 4: Audio -> Base64
  const convertToBase64 = async (uri: string) => {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
  };

  // STEP 5: Process Pipeline
  const processAudio = async (uri: string) => {
    setIsProcessing(true);
    setErrorText(null);
    setTranscribedText(null);
    try {
      const base64 = await convertToBase64(uri);
      const text = await getTextFromAudio(base64);
      setTranscribedText(text);
    } catch (error: any) {
      console.error("Processing Error:", error);
      setErrorText(error.message || "Failed to process audio.");
    } finally {
      setIsProcessing(false);
    }
  };

  // UI Flow Controls
  const handleStart = async () => {
    setTranscribedText(null);
    setErrorText(null);
    await startRecording();
  };

  const handleStop = async () => {
    const uri = await stopRecording();
    if (uri) setRecordedUri(uri);
  };

  const handleProcess = async () => {
    if (recordedUri) {
      await processAudio(recordedUri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gemini Speech-to-Text</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Record Block */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Recording Controls</Text>
          
          <View style={styles.recordRow}>
            {!isRecording ? (
              <TouchableOpacity style={[styles.recordBtn, styles.btnStart]} onPress={handleStart}>
                <Mic color="#fff" size={24} />
                <Text style={styles.btnText}>Start Recording</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.recordBtn, styles.btnStop]} onPress={handleStop}>
                <Square color="#fff" size={24} fill="#fff" />
                <Text style={styles.btnText}>Stop Recording</Text>
              </TouchableOpacity>
            )}
          </View>

          {isRecording && <Text style={styles.recordingIndicator}>🔴 Recording in progress...</Text>}
          {!isRecording && recordedUri && <Text style={styles.uriText}>Audio Saved Successfully</Text>}
        </View>

        {/* Process Block */}
        {recordedUri && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>AI Processing</Text>
            
            <TouchableOpacity 
              style={[styles.processBtn, isProcessing && { opacity: 0.7 }]} 
              onPress={handleProcess}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <ActivityIndicator color="#fff" style={{marginRight: 8}}/>
                  <Text style={styles.btnText}>Analyzing Audio...</Text>
                </>
              ) : (
                <>
                  <Brain color="#fff" size={24} />
                  <Text style={styles.btnText}>Send to Gemini STT</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Result Block */}
        {errorText && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Error: {errorText}</Text>
          </View>
        )}

        {transcribedText && (
          <View style={styles.resultCard}>
            <Text style={styles.cardLabel}>Transcription Result</Text>
            <Text style={styles.resultText}>{transcribedText}</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 12, marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  content: { padding: 20 },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  cardLabel: { fontSize: 14, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  
  recordRow: { flexDirection: 'row', justifyContent: 'center' },
  recordBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, paddingHorizontal: 24, borderRadius: 16, width: '100%' },
  btnStart: { backgroundColor: '#3b82f6' },
  btnStop: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  
  recordingIndicator: { textAlign: 'center', marginTop: 16, color: '#ef4444', fontWeight: '800', fontStyle: 'italic' },
  uriText: { textAlign: 'center', marginTop: 16, color: '#10b981', fontWeight: '800' },

  processBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#8b5cf6', paddingVertical: 18, borderRadius: 16 },
  
  resultCard: { backgroundColor: '#f0fdf4', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#bbf7d0' },
  resultText: { fontSize: 18, color: '#166534', lineHeight: 28, fontWeight: '500' },

  errorBox: { backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', marginBottom: 20 },
  errorText: { color: '#b91c1c', fontWeight: '700' }
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Camera, FileText, CreditCard as Edit3, CircleCheck as CheckCircle, Wifi, WifiOff } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';

type Step = 'scan' | 'preview' | 'edit';

const EXTRACTED_DATA = {
  name: 'Radha Kumari',
  age: '24',
  lmp: '15/05/2024',
  edd: '20/02/2025',
  bp: '120/80',
  weight: '58',
  hb: '9.2',
};

export default function ScanScreen() {
  const [step, setStep] = useState<Step>('scan');
  const [isOnline] = useState(Platform.OS === 'web');
  const [editData, setEditData] = useState(EXTRACTED_DATA);
  const [scanning, setScanning] = useState(false);
  const [saved, setSaved] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.timing(scanAnim, { toValue: 1, duration: 2000, useNativeDriver: false })
      ).start();
    } else {
      scanAnim.stopAnimation();
      scanAnim.setValue(0);
    }
  }, [scanning]);

  const handleScan = async () => {
    if (!isOnline) return;
    setScanning(true);
    await new Promise((r) => setTimeout(r, 2500));
    setScanning(false);
    setStep('preview');
  };

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => router.back(), 1200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Scan</Text>
        <View style={[styles.onlineTag, { backgroundColor: isOnline ? Colors.risk.lowLight : '#ECEFF1' }]}>
          {isOnline ? (
            <Wifi size={12} color={Colors.risk.low} />
          ) : (
            <WifiOff size={12} color={Colors.text.muted} />
          )}
          <Text style={[styles.onlineTagText, { color: isOnline ? Colors.risk.low : Colors.text.muted }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 'scan' && (
          <View style={styles.scanSection}>
            <View style={styles.cameraFrame}>
              <View style={styles.overlay}>
                {scanning && (
                  <Animated.View
                    style={[
                      styles.scanLine,
                      {
                        top: scanAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                )}
                <View style={styles.corner} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <Camera size={48} color="rgba(255,255,255,0.5)" />
                <Text style={styles.cameraPlaceholder}>
                  {scanning ? 'Scanning…' : 'Position document inside frame'}
                </Text>
              </View>
            </View>

            {!isOnline && (
              <View style={styles.offlineWarning}>
                <WifiOff size={18} color={Colors.text.muted} />
                <View style={styles.offlineText}>
                  <Text style={styles.offlineTitle}>OCR unavailable offline</Text>
                  <Text style={styles.offlineDesc}>Connect to internet to scan documents</Text>
                </View>
              </View>
            )}

            <View style={styles.docTypes}>
              <Text style={styles.docTypesLabel}>Supported documents:</Text>
              <View style={styles.docTypesList}>
                {['MCP Card', 'Antenatal Record', 'Lab Report', 'Referral Slip'].map((d) => (
                  <View key={d} style={styles.docTypePill}>
                    <FileText size={12} color={Colors.primary} />
                    <Text style={styles.docTypePillText}>{d}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.scanBtn, !isOnline && styles.scanBtnDisabled]}
              onPress={handleScan}
              disabled={!isOnline || scanning}
            >
              <Camera size={22} color={isOnline ? '#FFFFFF' : Colors.text.muted} />
              <Text style={[styles.scanBtnText, !isOnline && { color: Colors.text.muted }]}>
                {scanning ? 'Scanning document…' : isOnline ? 'Scan Document' : 'Available when online'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manualBtn}
              onPress={() => setStep('edit')}
            >
              <Edit3 size={16} color={Colors.primary} />
              <Text style={styles.manualBtnText}>Enter data manually instead</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'preview' && (
          <View style={styles.previewSection}>
            <View style={styles.extractedBanner}>
              <CheckCircle size={18} color={Colors.risk.low} />
              <Text style={styles.extractedText}>Data extracted successfully</Text>
            </View>

            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Extracted Information</Text>
              <Text style={styles.previewSub}>Review and correct if needed</Text>
              {Object.entries(EXTRACTED_DATA).map(([key, val]) => (
                <View key={key} style={styles.previewRow}>
                  <Text style={styles.previewKey}>{formatKey(key)}:</Text>
                  <Text style={styles.previewVal}>{val}</Text>
                </View>
              ))}
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.editBtn} onPress={() => setStep('edit')}>
                <Edit3 size={16} color={Colors.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={() => setStep('edit')}>
                <CheckCircle size={16} color="#fff" />
                <Text style={styles.confirmBtnText}>Confirm & Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'edit' && (
          <View style={styles.editSection}>
            <Text style={styles.editTitle}>Edit Extracted Data</Text>
            {Object.entries(editData).map(([key, val]) => (
              <View key={key} style={styles.editField}>
                <Text style={styles.editLabel}>{formatKey(key)}</Text>
                <TextInput
                  style={styles.editInput}
                  value={val}
                  onChangeText={(v) => setEditData((d) => ({ ...d, [key]: v }))}
                  placeholderTextColor={Colors.text.muted}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
              onPress={handleSave}
            >
              {saved ? (
                <>
                  <CheckCircle size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Saved!</Text>
                </>
              ) : (
                <Text style={styles.saveBtnText}>Save to Patient Record</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatKey(key: string): string {
  const map: Record<string, string> = {
    name: 'Patient Name',
    age: 'Age',
    lmp: 'Last Menstrual Period',
    edd: 'Expected Delivery Date',
    bp: 'Blood Pressure',
    weight: 'Weight (kg)',
    hb: 'Haemoglobin (g/dL)',
  };
  return map[key] ?? key;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  back: { padding: 8 },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  onlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  onlineTagText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  scroll: { padding: Spacing.lg, gap: 16 },
  scanSection: { gap: 16 },
  cameraFrame: {
    height: 280,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#1A2B3C',
    overflow: 'hidden',
    ...Shadow.lg,
  },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.8,
  },
  corner: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.primary,
  },
  cornerTR: { left: undefined, right: 20, borderLeftWidth: 0, borderRightWidth: 3 },
  cornerBL: { top: undefined, bottom: 20, borderTopWidth: 0, borderBottomWidth: 3 },
  cornerBR: { top: undefined, bottom: 20, left: undefined, right: 20, borderTopWidth: 0, borderBottomWidth: 3, borderLeftWidth: 0, borderRightWidth: 3 },
  cameraPlaceholder: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, textAlign: 'center' },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  offlineText: { flex: 1, gap: 2 },
  offlineTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  offlineDesc: { fontSize: FontSize.xs, color: Colors.text.muted },
  docTypes: { gap: 8 },
  docTypesLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text.secondary },
  docTypesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  docTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  docTypePillText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    ...Shadow.md,
  },
  scanBtnDisabled: { backgroundColor: '#ECEFF1', elevation: 0 },
  scanBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  manualBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  previewSection: { gap: 16 },
  extractedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.risk.lowLight,
    borderRadius: BorderRadius.md,
    padding: 12,
  },
  extractedText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.risk.low },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadow.md,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  previewTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary },
  previewSub: { fontSize: FontSize.xs, color: Colors.text.muted, marginBottom: 4 },
  previewRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  previewKey: { width: 140, fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  previewVal: { flex: 1, fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.semibold },
  btnRow: { flexDirection: 'row', gap: 12 },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  editBtnText: { color: Colors.primary, fontWeight: FontWeight.semibold, fontSize: FontSize.md },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    ...Shadow.sm,
  },
  confirmBtnText: { color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.md },
  editSection: { gap: 14 },
  editTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text.primary },
  editField: { gap: 6 },
  editLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  editInput: {
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    backgroundColor: Colors.surface,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    marginTop: 8,
    ...Shadow.md,
  },
  saveBtnSuccess: { backgroundColor: Colors.risk.low },
  saveBtnText: { color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.md },
});

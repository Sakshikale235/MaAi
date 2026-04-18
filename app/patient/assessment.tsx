import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Check, CircleAlert as AlertCircle, Upload } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Shadow, Spacing } from '@/constants/theme';
import ProgressBar from '@/components/ui/ProgressBar';
import { useLanguage } from '@/context/LanguageContext';

const STEPS = [
  { id: 1, title: 'step_bp', subtitle: 'step_bp_sub' },
  { id: 2, title: 'step_symp', subtitle: 'step_symp_sub' },
  { id: 3, title: 'step_muac', subtitle: 'step_muac_sub' },
  { id: 4, title: 'step_fhr', subtitle: 'step_fhr_sub' },
  { id: 5, title: 'step_review', subtitle: 'step_review_sub' },
];

const SYMPTOMS = [
  'symp_headache', 'symp_vision', 'symp_swelling',
  'symp_pain', 'symp_fever', 'symp_bleeding',
  'symp_movement', 'symp_nausea', 'symp_pallor',
  'symp_breath', 'symp_convulsions', 'symp_loss',
];

export default function AssessmentScreen() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [muac, setMuac] = useState<number | null>(null);
  const [fhr, setFhr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gravida, setGravida] = useState('');
  const [parity, setParity] = useState('');
  const [hb, setHb] = useState('');
  const [weight, setWeight] = useState('');
  const [prevWeight, setPrevWeight] = useState('');
  const [tetanus, setTetanus] = useState('Not taken');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateStep = (next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(40);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 15 }),
      ]).start();
    });
  };

  useEffect(() => {
    if (imageUri && !uploading) {
      uploadImage(imageUri);
    }
  }, [isOfflineMode]);

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleNext = () => {
    if (step < 5) animateStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) animateStep(step - 1);
    else router.back();
  };

  const handleSubmit = async () => {
    if (aiResult) {
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 800));
      setSubmitting(false);
      router.replace({
        pathname: '/ai/result',
        params: { 
          risk: aiResult.risk || 'HIGH', 
          reason: Array.isArray(aiResult.reason) ? aiResult.reason.join(' ') : (aiResult.reason || (Array.isArray(aiResult.reasons) ? aiResult.reasons.join(' ') : aiResult.reasons) || ''), 
          rec: aiResult.recommendation || aiResult.recommendations || 'Please evaluate patient status carefully.',
          confidence: aiResult.confidence || 92,
          patient_name: aiResult.patient_name || '',
          age: aiResult.age || '',
          gestation_weeks: aiResult.gestation_weeks || ''
        }
      });
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const manualText = `Patient Assessment Data:
Blood Pressure: ${bpSys}/${bpDia} mmHg
Symptoms: ${symptoms.length > 0 ? symptoms.join(', ') : 'None'}
MUAC: ${muac ? muac + ' cm' : 'Not recorded'}
Fetal Heart Rate: ${fhr ? fhr + ' bpm' : 'Not recorded'}`;

      const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/analyze-text' : 'http://localhost:3000/api/analyze-text';
      
      const response = await axios.post(API_URL, {
        text: manualText,
        offline: isOfflineMode
      });

      const result = response.data;
      
      router.replace({
        pathname: '/ai/result',
        params: { 
          risk: result.risk || 'HIGH', 
          reason: Array.isArray(result.reason) ? result.reason.join(' ') : (result.reason || (Array.isArray(result.reasons) ? result.reasons.join(' ') : result.reasons) || ''), 
          rec: result.recommendation || result.recommendations || 'Please evaluate patient status carefully.',
          confidence: result.confidence || 92,
          patient_name: result.patient_name || '',
          age: result.age || '',
          gestation_weeks: result.gestation_weeks || ''
        }
      });
    } catch (err: any) {
      console.log('Manual analysis failed', err.response?.data || err.message);
      setErrorMsg(`Failed: ${err.response?.data?.error || err.message}`);
      // Fallback to static mock removed to prevent confusing silent failures
    } finally {
      setSubmitting(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('image', blob, 'upload.jpg');
      } else {
        formData.append('image', {
          uri,
          name: 'upload.jpg',
          type: 'image/jpeg'
        } as any);
      }
      formData.append('offline', isOfflineMode ? 'true' : 'false');

      const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/analyze' : 'http://localhost:3000/api/analyze';
      
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAiResult(response.data);
    } catch (err: any) {
      console.log('Upload error details:', err.response?.data || err.message);
      const serverMsg = err.response?.data?.details || err.response?.data?.error || err.message;
      setErrorMsg(`Failed: ${serverMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const getMuacColor = (v: number) => {
    if (v < 21) return Colors.risk.high;
    if (v < 23) return Colors.risk.medium;
    return Colors.risk.low;
  };

  const calculateRisk = () => {
    let level = "LOW";
    let alerts = [];

    const ageVal = parseInt(age) || 0;
    const gravidaVal = parseInt(gravida) || 0;
    const parityVal = parseInt(parity) || 0;
    const sys = parseInt(bpSys) || 0;
    const dia = parseInt(bpDia) || 0;
    const fhrVal = parseInt(fhr) || 0;
    const hbVal = parseFloat(hb) || 0;
    const wtGain = (parseFloat(weight) || 0) - (parseFloat(prevWeight) || 0);



    // -----------------------
    // 🚨 CRITICAL RULES (override everything)
    // -----------------------

    // BP emergency
    if (sys >= 160 || dia >= 110) {
      level = "HIGH";
      alerts.push("Critical BP (Severe Hypertension)");
    }

    // No FHS
    if (fhr === "") {
      level = "HIGH";
      alerts.push("Foetal Heart Sound not detected");
    }

    // Abnormal FHS
    if (fhrVal > 0 && (fhrVal < 110 || fhrVal > 160)) {
      level = "HIGH";
      alerts.push("Abnormal Foetal Heart Rate");
    }

    // No fetal movement in late pregnancy
    if (symptoms.includes("Decreased fetal movement")) {
      level = "HIGH";
      alerts.push("Reduced Foetal Movement");
    }

    // Severe anemia
    if (hbVal > 0 && hbVal < 7) {
      level = "HIGH";
      alerts.push("Severe Anaemia");
    }

    // Danger signs present
    if (
      symptoms.includes("Convulsions") ||
      symptoms.includes("Loss of consciousness") ||
      symptoms.includes("Vaginal bleeding")
    ) {
      level = "HIGH";
      alerts.push("Danger signs present");
    }

    // -----------------------
    // ⚠️ MODERATE RULES
    // -----------------------

    // High BP (not critical)
    if ((sys >= 140 || dia >= 90) && level !== "HIGH") {
      level = "MODERATE";
      alerts.push("High Blood Pressure");
    }

    // Moderate anemia
    if (hbVal >= 7 && hbVal < 11 && level !== "HIGH") {
      level = "MODERATE";
      alerts.push("Mild/Moderate Anaemia");
    }

    // MUAC risk
    if (muac !== null && muac < 23 && level !== "HIGH") {
      level = "MODERATE";
      alerts.push("Low MUAC (Malnutrition risk)");
    }

    // Poor weight gain
    if (wtGain < 1 && level !== "HIGH") {
      level = "MODERATE";
      alerts.push("Low weight gain");
    }

    // Age risk
    if ((ageVal < 18 || ageVal > 35) && level !== "HIGH") {
      level = "MODERATE";
      alerts.push("Age-related risk");
    }

    // High parity risk
    if (parityVal >= 4 && level !== "HIGH") {
      level = "MODERATE";
      alerts.push("High parity risk");
    }

    // -----------------------
    // 💉 PREVENTIVE (never increases severity)
    // -----------------------

    if (tetanus === "Not taken") {
      alerts.push("Tetanus vaccine pending");
    }

    return { level, alerts };
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#0E7C86', '#4BBAC8']} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.back}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t(STEPS[step - 1].title as any)}</Text>
          <Text style={styles.headerSub}>{t(STEPS[step - 1].subtitle as any)}</Text>
        </View>
      </LinearGradient>

      <View style={styles.progressSection}>
        <ProgressBar current={step} total={5} label={`${t('step_of')} ${step} ${t('of')} 5`} />
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <BPStep
            bpSys={bpSys} bpDia={bpDia} onSysChange={setBpSys} onDiaChange={setBpDia}
            name={name} onNameChange={setName}
            age={age} onAgeChange={setAge}
            gravida={gravida} onGravidaChange={setGravida}
            parity={parity} onParityChange={setParity}
            hb={hb} onHbChange={setHb}
            weight={weight} onWeightChange={setWeight}
            prevWeight={prevWeight} onPrevWeightChange={setPrevWeight}
          />
        )}
        {step === 2 && (
          <SymptomsStep symptoms={symptoms} onToggle={toggleSymptom} />
        )}
        {step === 3 && (
          <MUACStep value={muac} onSelect={setMuac} getMuacColor={getMuacColor} />
        )}
        {step === 4 && (
          <FHRStep fhr={fhr} onFhrChange={setFhr} />
        )}
        {step === 5 && (
          <ReviewStep
            bpSys={bpSys}
            bpDia={bpDia}
            symptoms={symptoms}
            muac={muac}
            fhr={fhr}
            getMuacColor={getMuacColor}
            imageUri={imageUri}
            uploading={uploading}
            aiResult={aiResult}
            errorMsg={errorMsg}
            onPickImage={pickImage}
            isOfflineMode={isOfflineMode}
            setIsOfflineMode={setIsOfflineMode}
          />
        )}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={18} color={Colors.primary} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        {step < 5 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{t('continue')}</Text>
            <ArrowRight size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <Text style={styles.nextBtnText}>{t('analyzing')}</Text>
            ) : (
              <>
                <Text style={styles.nextBtnText}>{t('submit_get_ai')}</Text>
                <Check size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function BPStep({
  bpSys, bpDia, onSysChange, onDiaChange,
  name, onNameChange,
  age, onAgeChange,
  gravida, onGravidaChange,
  parity, onParityChange,
  hb, onHbChange,
  weight, onWeightChange,
  prevWeight, onPrevWeightChange
}: {
  bpSys: string; bpDia: string; onSysChange: (v: string) => void; onDiaChange: (v: string) => void;
  name: string; onNameChange: (v: string) => void;
  age: string; onAgeChange: (v: string) => void;
  gravida: string; onGravidaChange: (v: string) => void;
  parity: string; onParityChange: (v: string) => void;
  hb: string; onHbChange: (v: string) => void;
  weight: string; onWeightChange: (v: string) => void;
  prevWeight: string; onPrevWeightChange: (v: string) => void;
}) {
  const { t } = useLanguage();
  const sys = parseInt(bpSys) || 0;
  const dia = parseInt(bpDia) || 0;
  const isHigh = sys >= 140 || dia >= 90;
  const isCritical = sys >= 160 || dia >= 110;

  return (
    <View style={styles.stepContent}>
      <View style={styles.bpCard}>
        <Text style={styles.bpLabel}>Patient Name</Text>
        <TextInput style={styles.standardInput} value={name} onChangeText={onNameChange} placeholder="Enter name" placeholderTextColor={Colors.text.muted} />

        <View style={styles.rowInputs}>
          <View style={styles.halfInput}>
            <Text style={styles.bpLabel}>Age</Text>
            <TextInput style={styles.standardInput} value={age} onChangeText={(val) => onAgeChange(val.replace(/\D/g, '').slice(0, 3))}
              keyboardType="number-pad"
              placeholder="Age" placeholderTextColor={Colors.text.muted} />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.bpLabel}>Hemoglobin</Text>
            <TextInput style={styles.standardInput} value={hb} onChangeText={(val) => onHbChange(val.replace(/[^0-9.]/g, '').slice(0, 4))}
              keyboardType="decimal-pad"
              placeholder="g/dL" placeholderTextColor={Colors.text.muted} />
          </View>
        </View>

        <View style={styles.rowInputs}>
          <View style={styles.halfInput}>
            <Text style={styles.bpLabel}>Gravida</Text>
            <TextInput style={styles.standardInput} value={gravida} onChangeText={(val) => onGravidaChange(val.replace(/\D/g, '').slice(0, 2))}
              keyboardType="number-pad" placeholder="e.g. 2" placeholderTextColor={Colors.text.muted} />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.bpLabel}>Parity</Text>
            <TextInput style={styles.standardInput} value={parity} onChangeText={(val) => onParityChange(val.replace(/\D/g, '').slice(0, 2))}
              keyboardType="number-pad" placeholder="e.g. 1" placeholderTextColor={Colors.text.muted} />
          </View>
        </View>

        <View style={styles.rowInputs}>
          <View style={styles.halfInput}>
            <Text style={styles.bpLabel}>Current Weight</Text>
            <TextInput style={styles.standardInput} value={weight} onChangeText={(val) => onWeightChange(val.replace(/[^0-9.]/g, '').slice(0, 5))}
              keyboardType="decimal-pad" placeholder="kg" placeholderTextColor={Colors.text.muted} />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.bpLabel}>Prev. Weight</Text>
            <TextInput style={styles.standardInput} value={prevWeight} onChangeText={(val) => onPrevWeightChange(val.replace(/[^0-9.]/g, '').slice(0, 5))}
              keyboardType="decimal-pad"
              placeholder="kg" placeholderTextColor={Colors.text.muted} />
          </View>
        </View>
      </View>

      <View style={styles.bpCard}>
        <Text style={styles.bpLabel}>{t('systolic_mmhg')}</Text>
        <TextInput
          style={[styles.bpInput, isCritical && { borderColor: Colors.risk.high }]}
          value={bpSys}
          onChangeText={(val) => onSysChange(val.replace(/\D/g, '').slice(0, 3))}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="120"
          placeholderTextColor={Colors.text.muted}
        />
        <Text style={styles.bpDivider}>/</Text>
        <Text style={styles.bpLabel}>{t('diastolic_mmhg')}</Text>
        <TextInput
          style={[styles.bpInput, isCritical && { borderColor: Colors.risk.high }]}
          value={bpDia}
          onChangeText={(val) => onDiaChange(val.replace(/\D/g, '').slice(0, 3))}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="80"
          placeholderTextColor={Colors.text.muted}
        />
      </View>

      {isCritical && (
        <View style={styles.alertBox}>
          <AlertCircle size={18} color={Colors.risk.high} />
          <Text style={styles.alertText}>{t('critical_bp')}</Text>
        </View>
      )}
      {isHigh && !isCritical && (
        <View style={[styles.alertBox, { backgroundColor: Colors.risk.mediumLight }]}>
          <AlertCircle size={18} color={Colors.risk.medium} />
          <Text style={[styles.alertText, { color: Colors.risk.medium }]}>
            {t('elevated_bp')}
          </Text>
        </View>
      )}

      <View style={styles.referenceBox}>
        <Text style={styles.refTitle}>{t('reference_values')}</Text>
        {[
          { label: 'normal', range: '< 120/80', color: Colors.risk.low },
          { label: 'high', range: '140-159 / 90-109', color: Colors.risk.medium },
          { label: 'critical', range: '≥ 160/110', color: Colors.risk.high },
        ].map((r) => (
          <View key={r.label} style={styles.refRow}>
            <View style={[styles.refDot, { backgroundColor: r.color }]} />
            <Text style={styles.refLabel}>{t(r.label as any)}:</Text>
            <Text style={styles.refRange}>{r.range}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SymptomsStep({ symptoms, onToggle }: { symptoms: string[]; onToggle: (s: string) => void }) {
  const { t } = useLanguage();
  return (
    <View style={styles.stepContent}>
      <Text style={styles.symptomNote}>{t('tap_symptoms')}</Text>
      <View style={styles.symptomsGrid}>
        {SYMPTOMS.map((sym) => (
          <TouchableOpacity
            key={sym}
            style={[styles.symptomTile, symptoms.includes(sym) && styles.symptomTileActive]}
            onPress={() => onToggle(sym)}
          >
            <Text style={[styles.symptomText, symptoms.includes(sym) && styles.symptomTextActive]}>
              {t(sym as any)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {symptoms.length > 0 && (
        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>{symptoms.length} {t('symptoms_selected')}</Text>
        </View>
      )}
    </View>
  );
}

function MUACStep({ value, onSelect, getMuacColor }: {
  value: number | null; onSelect: (v: number) => void; getMuacColor: (v: number) => string;
}) {
  const { t } = useLanguage();
  const values = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
  return (
    <View style={styles.stepContent}>
      <Text style={styles.muacDesc}>
        {t('muac_desc')}
      </Text>
      <View style={styles.muacScale}>
        {values.map((v) => (
          <TouchableOpacity
            key={v}
            style={[
              styles.muacBtn,
              { backgroundColor: value === v ? getMuacColor(v) : getMuacColor(v) + '20' },
              value === v && styles.muacBtnSelected,
            ]}
            onPress={() => onSelect(v)}
          >
            <Text style={[styles.muacBtnText, { color: getMuacColor(v) }, value === v && { color: '#fff' }]}>
              {v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {value !== null && (
        <View style={[styles.muacResult, { backgroundColor: getMuacColor(value) + '15', borderColor: getMuacColor(value) }]}>
          <Text style={[styles.muacResultLabel, { color: getMuacColor(value) }]}>
            {value < 21 ? t('severe_malnutrition') : value < 23 ? t('moderate_malnutrition') : t('normal')}
          </Text>
          <Text style={[styles.muacResultValue, { color: getMuacColor(value) }]}>{value} cm</Text>
        </View>
      )}
    </View>
  );
}

function FHRStep({ fhr, onFhrChange }: { fhr: string; onFhrChange: (v: string) => void }) {
  const { t } = useLanguage();
  const hr = parseInt(fhr) || 0;
  const isAbnormal = hr > 0 && (hr < 110 || hr > 160);
  return (
    <View style={styles.stepContent}>
      <View style={styles.fhrCard}>
        <Text style={styles.fhrLabel}>{t('fhr_bpm')}</Text>
        <TextInput
          style={[styles.fhrInput, isAbnormal && { borderColor: Colors.risk.high }]}
          value={fhr}
          onChangeText={(val) => onFhrChange(val.replace(/\D/g, '').slice(0, 3))}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="140"
          placeholderTextColor={Colors.text.muted}
        />
        {isAbnormal && (
          <View style={styles.alertBox}>
            <AlertCircle size={16} color={Colors.risk.high} />
            <Text style={styles.alertText}>{t('abnormal_fhr')}</Text>
          </View>
        )}
        <View style={styles.referenceBox}>
          <Text style={styles.refTitle}>{t('normal_range_fhr')}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.noFhrBtn}>
        <Text style={styles.noFhrText}>{t('unable_fhr')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ReviewStep({ bpSys, bpDia, symptoms, muac, fhr, getMuacColor, imageUri, uploading, aiResult, errorMsg, onPickImage, isOfflineMode, setIsOfflineMode }: any) {
  const { t } = useLanguage();
  return (
    <View style={styles.stepContent}>
      <View style={styles.reviewCard}>
        <Text style={styles.reviewTitle}>{t('assessment_summary')}</Text>
        <ReviewRow label={t('step_bp')} value={bpSys && bpDia ? `${bpSys}/${bpDia} mmHg` : t('not_recorded')} highlight={(parseInt(bpSys) || 0) >= 140} />
        <ReviewRow label={t('step_symp')} value={symptoms.length > 0 ? `${symptoms.length} selected` : t('none')} highlight={symptoms.length > 3} />
        <ReviewRow label={t('step_muac')} value={muac ? `${muac} cm` : t('not_recorded')} color={muac ? getMuacColor(muac) : undefined} />
        <ReviewRow label={t('step_fhr')} value={fhr ? `${fhr} BPM` : t('not_recorded')} highlight={fhr && (parseInt(fhr) < 110 || parseInt(fhr) > 160)} />
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewTitle}>Upload Document for AI OCR</Text>
        <Text style={styles.muacDesc}>Select a medical report or prescription to automatically extract patient findings via MaAi.</Text>
        
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginTop: 8 }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.uploadBtn} onPress={onPickImage} disabled={uploading}>
              <Upload size={18} color="#fff" />
              <Text style={styles.uploadBtnText}>{uploading ? 'Extracting...' : 'Upload Image'}</Text>
            </TouchableOpacity>
          </View>
          {imageUri && (
            <Image 
              source={{ uri: imageUri }} 
              style={{ width: 60, height: 80, borderRadius: 8, borderWidth: 1, borderColor: Colors.border.medium }} 
              resizeMode="cover"
            />
          )}
        </View>

        <TouchableOpacity 
          style={[styles.offlineToggle, isOfflineMode && styles.offlineToggleActive]} 
          onPress={() => setIsOfflineMode(!isOfflineMode)}
        >
          <Text style={[styles.offlineToggleText, isOfflineMode && { color: '#fff' }]}>
            {isOfflineMode ? '✓ Offline Mode Enabled (Mistral)' : 'Enable Offline Mode (Mistral)'}
          </Text>
        </TouchableOpacity>

        {errorMsg !== '' && <Text style={styles.errorText}>{errorMsg}</Text>}

        {aiResult && (
          <View style={{ gap: 8, marginTop: 8 }}>
            {aiResult.source === 'offline' && (
              <View style={[styles.alertBox, { backgroundColor: Colors.accent, borderLeftColor: Colors.text.secondary, padding: 8 }]}>
                <AlertCircle size={16} color={Colors.text.secondary} />
                <Text style={{ fontSize: 12, color: Colors.text.secondary, fontWeight: 'bold' }}>Offline Mode (Local AI)</Text>
              </View>
            )}
            <View style={[styles.alertBox, { backgroundColor: Colors.risk.lowLight, borderLeftColor: Colors.risk.low, flexDirection: 'column', alignItems: 'flex-start' }]}>
              <Text style={[styles.resultTitle, { color: aiResult.risk === 'HIGH' ? Colors.risk.high : Colors.risk.low, fontWeight: 'bold' }]}>
                Risk: {aiResult.risk}
              </Text>
              <Text style={styles.resultText}><Text style={{fontWeight: 'bold'}}>Reason:</Text> {aiResult.reason}</Text>
              <Text style={styles.resultText}><Text style={{fontWeight: 'bold'}}>Action:</Text> {aiResult.recommendation}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.offlineSavedNote}>
        <Text style={styles.offlineSavedText}>{t('saved_locally')}</Text>
      </View>
    </View>
  );
}

function ReviewRow({ label, value, highlight, color }: { label: string; value: string; highlight?: boolean; color?: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={[styles.reviewValue, highlight && { color: Colors.risk.high }, color && { color }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { padding: 4 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  progressSection: { padding: Spacing.lg, paddingBottom: 8 },
  scroll: { padding: Spacing.lg, paddingTop: 8 },
  stepContent: { gap: 16 },
  bpCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
    alignItems: 'center',
    gap: 8,
  },
  bpLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  bpInput: {
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    fontSize: 48,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    width: 160,
    height: 80,
  },
  standardInput: {
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    width: '100%',
    marginBottom: 6,
    backgroundColor: Colors.background,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  halfInput: {
    flex: 1,
  },
  bpDivider: { fontSize: FontSize.xxxl, color: Colors.text.muted, fontWeight: FontWeight.bold },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.risk.highLight,
    borderRadius: BorderRadius.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.risk.high,
  },
  alertText: { flex: 1, fontSize: FontSize.sm, color: Colors.risk.high, fontWeight: FontWeight.medium },
  referenceBox: { backgroundColor: Colors.accent, borderRadius: BorderRadius.md, padding: 12, width: '100%', gap: 6 },
  refTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text.secondary, marginBottom: 4 },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refDot: { width: 8, height: 8, borderRadius: 4 },
  refLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text.secondary },
  refRange: { fontSize: FontSize.sm, color: Colors.text.primary },
  symptomNote: { fontSize: FontSize.sm, color: Colors.text.secondary },
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  symptomTile: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.surface,
  },
  symptomTileActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  symptomText: { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: FontWeight.medium },
  symptomTextActive: { color: '#FFFFFF' },
  selectedCount: { backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.md, padding: 10, alignItems: 'center' },
  selectedCountText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  muacDesc: { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 },
  muacScale: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  muacBtn: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  muacBtnSelected: { borderWidth: 2 },
  muacBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  muacResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    padding: 14,
  },
  muacResultLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  muacResultValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  fhrCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
    alignItems: 'center',
    gap: 12,
  },
  fhrLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text.secondary },
  fhrInput: {
    borderWidth: 2,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    fontSize: 56,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    width: 160,
    height: 80,
  },
  noFhrBtn: {
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: 14,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  noFhrText: { fontSize: FontSize.sm, color: Colors.text.muted },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.md,
    gap: 12,
  },
  reviewTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text.primary, marginBottom: 4 },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  reviewLabel: { fontSize: FontSize.sm, color: Colors.text.secondary, flex: 1 },
  reviewValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text.primary },
  offlineSavedNote: {
    backgroundColor: Colors.risk.lowLight,
    borderRadius: BorderRadius.md,
    padding: 12,
    alignItems: 'center',
  },
  offlineSavedText: { fontSize: FontSize.sm, color: Colors.risk.low, fontWeight: FontWeight.semibold },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  backBtnText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  nextBtnText: { fontSize: FontSize.md, color: '#FFFFFF', fontWeight: FontWeight.bold },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  uploadBtnText: { fontSize: FontSize.sm, color: '#fff', fontWeight: FontWeight.bold },
  errorText: { color: Colors.risk.high, fontSize: FontSize.sm, marginTop: 4 },
  resultTitle: { fontSize: FontSize.md, marginBottom: 4 },
  resultText: { fontSize: FontSize.sm, color: Colors.text.primary, marginBottom: 2 },
  offlineToggle: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: 10,
    alignItems: 'center'
  },
  offlineToggleActive: {
    backgroundColor: Colors.risk.medium,
    borderColor: Colors.risk.medium,
  },
  offlineToggleText: { fontSize: FontSize.sm, color: Colors.text.primary, fontWeight: FontWeight.bold }
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PatientData, RiskResult } from '../utils/RiskEngine';

export interface MedicalCase {
  id: string;
  timestamp: number;
  
  patientData: PatientData;
  aiResult: RiskResult;
  aiConfidence: number;
  
  status: 'Pending MO Review' | 'Closed' | 'Accepted by ANM' | 'Outcome Recorded';
  
  anmDisagreementNote?: string;
  moResponseNote?: string;
  moAction?: 'Override Accepted' | 'Override Rejected';

  // Referral Insights Additions
  finalDiagnosis?: string;
  referralOutcome?: 'Necessary Referral' | 'Unnecessary Referral' | 'Delayed Referral';
  treatmentGiven?: string;
}

const STORE_KEY = '@maai_cases';

// Helper to pre-load a compelling demo state showing AI learning loop visually
const MOCK_CASES: MedicalCase[] = [
  {
    id: 'mock-1', timestamp: Date.now() - 86400000 * 2,
    status: 'Outcome Recorded', patientData: { bpSystolic: 165, bpDiastolic: 110, hb: 10, spo2: 97, trimester: '3rd' },
    aiResult: { riskLevel: 'HIGH', riskScore: 0.9, rationale: '', referralUrgency: '', reassuringLine: '', multipleInsightFlag: false, triggeredFactors: [], isValid: true },
    aiConfidence: 94, anmDisagreementNote: '', moResponseNote: 'Validated, immediate dispatch.', moAction: 'Override Accepted',
    finalDiagnosis: 'Severe Pre-Eclampsia', referralOutcome: 'Necessary Referral', treatmentGiven: 'MgSO4 Administered'
  },
  {
    id: 'mock-2', timestamp: Date.now() - 86400000 * 4,
    status: 'Outcome Recorded', patientData: { bpSystolic: 130, bpDiastolic: 85, hb: 11, spo2: 98, trimester: '2nd', symptoms: ['headache'] },
    aiResult: { riskLevel: 'HIGH', riskScore: 0.7, rationale: '', referralUrgency: '', reassuringLine: '', multipleInsightFlag: false, triggeredFactors: [], isValid: true },
    aiConfidence: 82, anmDisagreementNote: 'Patient stressed but stable.', moResponseNote: 'Agreed, AI flagged too high for minor headache.', moAction: 'Override Accepted',
    finalDiagnosis: 'Tension Headache', referralOutcome: 'Unnecessary Referral', treatmentGiven: 'Paracetamol, Rest'
  },
  {
    id: 'mock-3', timestamp: Date.now() - 86400000 * 5,
    status: 'Outcome Recorded', patientData: { bpSystolic: 110, bpDiastolic: 70, hb: 6.5, spo2: 96, trimester: '1st' },
    aiResult: { riskLevel: 'STABLE', riskScore: 0.2, rationale: '', referralUrgency: '', reassuringLine: '', multipleInsightFlag: false, triggeredFactors: [], isValid: true },
    aiConfidence: 55, anmDisagreementNote: 'Extremely pale, Hb very low. Disagree with AI stable finding.', moResponseNote: 'Good catch ANM. Anemia protocol initiated.', moAction: 'Override Accepted',
    finalDiagnosis: 'Severe Iron Deficiency Anemia', referralOutcome: 'Delayed Referral', treatmentGiven: 'Iron Infusion / Pack RBCs'
  }
];

export const CaseStore = {
  async getAllCases(): Promise<MedicalCase[]> {
    try {
      const data = await AsyncStorage.getItem(STORE_KEY);
      if (!data) return MOCK_CASES; // Returns mock data globally if db is fresh for investors!
      let parsed = JSON.parse(data) as MedicalCase[];
      if (parsed.length === 0) parsed = MOCK_CASES;
      return parsed;
    } catch (e) {
      console.error('Failed to parse Case Store', e);
      return MOCK_CASES;
    }
  },

  async saveCase(newCase: MedicalCase): Promise<void> {
    try {
      const existing = await this.getAllCases();
      existing.unshift(newCase);
      await AsyncStorage.setItem(STORE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to save Case', e);
    }
  },

  async updateCase(updatedCase: MedicalCase): Promise<void> {
    try {
      let existing = await this.getAllCases();
      existing = existing.map(c => c.id === updatedCase.id ? updatedCase : c);
      await AsyncStorage.setItem(STORE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to update Case', e);
    }
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORE_KEY);
  }
};

export type Language = 'en' | 'hi' | 'mr';

export type UserRole = 'ANM' | 'MO';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type SyncState = 'offline' | 'syncing' | 'synced';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  facility: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  abhaId?: string;
  riskLevel: RiskLevel;
  lastVisit: string;
  weeksPregnant?: number;
  village: string;
  phone: string;
  synced: boolean;
}

export interface Assessment {
  id: string;
  patientId: string;
  date: string;
  bp: { systolic: number; diastolic: number };
  symptoms: string[];
  muac: number;
  fetalHeartRate?: number;
  riskLevel: RiskLevel;
  aiConfidence: number;
  notes: string;
}

export interface AuditEntry {
  id: string;
  patientId: string;
  timestamp: string;
  action: string;
  actor: string;
  role: UserRole;
  notes?: string;
  type: 'AI_DECISION' | 'ANM_ACTION' | 'MO_REVIEW' | 'SYNC';
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  referredBy: string;
  referredTo: string;
  urgency: RiskLevel;
  reason: string;
  date: string;
  status: 'pending' | 'accepted' | 'completed';
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface EPDSQuestion {
  id: number;
  text: string;
  options: { label: string; score: number }[];
}

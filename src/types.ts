export type BloodSugarUnit = 'mg/dL' | 'mmol/L';
export type WeightUnit = 'kg' | 'lbs';

export type BloodSugarContext = 'Fasting' | 'Post-Meal' | 'Before Meal' | 'Bedtime' | 'Random';

export interface HealthRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  bloodSugar?: number; // stored in mg/dL, converted for display if needed
  bloodSugarContext?: BloodSugarContext;
  systolic?: number; // mmHg
  diastolic?: number; // mmHg
  pulse?: number; // bpm
  weight?: number; // stored in kg
  notes?: string;
  createdAt: string; // ISO timestamp
}

export type BloodPressureCategory = 'Normal' | 'Elevated' | 'Stage 1 High' | 'Stage 2 High' | 'Hypertensive Crisis' | 'Unknown';

export type BloodSugarCategory = 'Low' | 'Normal' | 'Elevated' | 'High' | 'Unknown';

export interface FilterOptions {
  searchQuery: string;
  startDate: string;
  endDate: string;
  sortBy: 'date' | 'bloodSugar' | 'systolic' | 'weight';
  sortOrder: 'asc' | 'desc';
}

export interface PatientInfo {
  name: string;
  age?: string;
  doctorName?: string;
  notes?: string;
}

export interface UserSettings {
  bloodSugarUnit: BloodSugarUnit;
  weightUnit: WeightUnit;
  patientInfo: PatientInfo;
}

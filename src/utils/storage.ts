import { HealthRecord, UserSettings } from '../types';

const STORAGE_KEY_RECORDS = 'health_vitals_records_v1';
const STORAGE_KEY_SETTINGS = 'health_vitals_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  bloodSugarUnit: 'mg/dL',
  weightUnit: 'kg',
  patientInfo: {
    name: 'John Doe',
    age: '48',
    doctorName: 'Dr. Sarah Jenkins',
    notes: 'Primary Care Health Monitoring Log'
  }
};

export const INITIAL_SAMPLE_RECORDS: HealthRecord[] = [
  {
    id: 'rec_1',
    date: '2026-08-12',
    time: '07:30',
    bloodSugar: 95,
    bloodSugarContext: 'Fasting',
    systolic: 118,
    diastolic: 78,
    pulse: 68,
    weight: 74.5,
    notes: 'Morning measurement. Felt energetic after a good sleep.',
    createdAt: '2026-08-12T07:30:00.000Z'
  },
  {
    id: 'rec_2',
    date: '2026-08-11',
    time: '20:15',
    bloodSugar: 128,
    bloodSugarContext: 'Post-Meal',
    systolic: 124,
    diastolic: 82,
    pulse: 74,
    weight: 74.8,
    notes: 'Taken 2 hours after dinner (chicken salad).',
    createdAt: '2026-08-11T20:15:00.000Z'
  },
  {
    id: 'rec_3',
    date: '2026-08-11',
    time: '08:00',
    bloodSugar: 102,
    bloodSugarContext: 'Fasting',
    systolic: 122,
    diastolic: 80,
    pulse: 70,
    weight: 74.6,
    notes: 'Routine morning entry.',
    createdAt: '2026-08-11T08:00:00.000Z'
  },
  {
    id: 'rec_4',
    date: '2026-08-10',
    time: '19:45',
    bloodSugar: 142,
    bloodSugarContext: 'Post-Meal',
    systolic: 132,
    diastolic: 85,
    pulse: 78,
    weight: 75.1,
    notes: 'Slightly high after pasta dinner.',
    createdAt: '2026-08-10T19:45:00.000Z'
  },
  {
    id: 'rec_5',
    date: '2026-08-10',
    time: '07:15',
    bloodSugar: 98,
    bloodSugarContext: 'Fasting',
    systolic: 119,
    diastolic: 76,
    pulse: 66,
    weight: 75.0,
    notes: 'Walked for 30 minutes yesterday.',
    createdAt: '2026-08-10T07:15:00.000Z'
  },
  {
    id: 'rec_6',
    date: '2026-08-09',
    time: '08:00',
    bloodSugar: 110,
    bloodSugarContext: 'Fasting',
    systolic: 126,
    diastolic: 81,
    pulse: 72,
    weight: 75.2,
    notes: 'Morning coffee prior to reading.',
    createdAt: '2026-08-09T08:00:00.000Z'
  },
  {
    id: 'rec_7',
    date: '2026-08-08',
    time: '07:45',
    bloodSugar: 92,
    bloodSugarContext: 'Fasting',
    systolic: 116,
    diastolic: 75,
    pulse: 65,
    weight: 75.5,
    notes: 'Normal readings.',
    createdAt: '2026-08-08T07:45:00.000Z'
  }
];

export function getStoredRecords(): HealthRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(INITIAL_SAMPLE_RECORDS));
      return INITIAL_SAMPLE_RECORDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse records from storage:', err);
    return INITIAL_SAMPLE_RECORDS;
  }
}

export function saveRecords(records: HealthRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records:', err);
  }
}

export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

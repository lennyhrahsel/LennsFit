import { BloodPressureCategory, BloodSugarCategory, BloodSugarContext, BloodSugarUnit, WeightUnit } from '../types';

// Blood Pressure Evaluation according to AHA (American Heart Association)
export function getBloodPressureCategory(systolic?: number, diastolic?: number): BloodPressureCategory {
  if (!systolic || !diastolic) return 'Unknown';

  if (systolic > 180 || diastolic > 120) {
    return 'Hypertensive Crisis';
  } else if (systolic >= 140 || diastolic >= 90) {
    return 'Stage 2 High';
  } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return 'Stage 1 High';
  } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return 'Elevated';
  } else if (systolic < 120 && diastolic < 80) {
    return 'Normal';
  }
  return 'Unknown';
}

export function getBloodPressureColor(category: BloodPressureCategory): { bg: string; text: string; border: string } {
  switch (category) {
    case 'Normal':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
    case 'Elevated':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
    case 'Stage 1 High':
      return { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' };
    case 'Stage 2 High':
      return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' };
    case 'Hypertensive Crisis':
      return { bg: 'bg-purple-900 text-white animate-pulse', text: 'text-white', border: 'border-purple-900' };
    default:
      return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };
  }
}

// Blood Sugar Evaluation according to ADA guidelines (values in mg/dL)
export function getBloodSugarCategory(mgDl?: number, context: BloodSugarContext = 'Fasting'): BloodSugarCategory {
  if (!mgDl) return 'Unknown';

  if (mgDl < 70) return 'Low';

  if (context === 'Fasting' || context === 'Before Meal') {
    if (mgDl <= 99) return 'Normal';
    if (mgDl <= 125) return 'Elevated';
    return 'High';
  } else {
    // Post-meal or random
    if (mgDl < 140) return 'Normal';
    if (mgDl <= 199) return 'Elevated';
    return 'High';
  }
}

export function getBloodSugarColor(category: BloodSugarCategory): { bg: string; text: string; border: string } {
  switch (category) {
    case 'Normal':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
    case 'Low':
      return { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' };
    case 'Elevated':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
    case 'High':
      return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' };
    default:
      return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };
  }
}

// Unit Conversion Helpers
export function convertBloodSugar(value: number, from: BloodSugarUnit, to: BloodSugarUnit): number {
  if (from === to) return value;
  if (from === 'mg/dL' && to === 'mmol/L') {
    return Number((value / 18.0182).toFixed(1));
  }
  if (from === 'mmol/L' && to === 'mg/dL') {
    return Math.round(value * 18.0182);
  }
  return value;
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  if (from === 'kg' && to === 'lbs') {
    return Number((value * 2.20462).toFixed(1));
  }
  if (from === 'lbs' && to === 'kg') {
    return Number((value / 2.20462).toFixed(1));
  }
  return value;
}

export function formatBloodSugar(mgDlValue?: number, targetUnit: BloodSugarUnit = 'mg/dL'): string {
  if (mgDlValue === undefined || mgDlValue === null || isNaN(mgDlValue)) return '-';
  if (targetUnit === 'mmol/L') {
    const mmol = (mgDlValue / 18.0182).toFixed(1);
    return `${mmol} mmol/L`;
  }
  return `${mgDlValue} mg/dL`;
}

export function formatWeight(kgValue?: number, targetUnit: WeightUnit = 'kg'): string {
  if (kgValue === undefined || kgValue === null || isNaN(kgValue)) return '-';
  if (targetUnit === 'lbs') {
    const lbs = (kgValue * 2.20462).toFixed(1);
    return `${lbs} lbs`;
  }
  return `${kgValue} kg`;
}

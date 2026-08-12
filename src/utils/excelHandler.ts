import * as XLSX from 'xlsx';
import { HealthRecord, BloodSugarContext, UserSettings } from '../types';
import { convertBloodSugar, convertWeight } from './healthCalculators';

export interface ParsedImportResult {
  records: HealthRecord[];
  totalRows: number;
  validRows: number;
  warnings: string[];
}

// Convert Excel serial date to YYYY-MM-DD
function excelDateToISO(serial: number): string {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateObj = new Date(utcValue * 1000);
  return dateObj.toISOString().split('T')[0];
}

// Standardize date strings
function parseFlexibleDate(val: any): { dateStr: string; timeStr: string } {
  let dateStr = new Date().toISOString().split('T')[0];
  let timeStr = '08:00';

  if (!val) return { dateStr, timeStr };

  if (typeof val === 'number') {
    // Excel date number
    dateStr = excelDateToISO(val);
    return { dateStr, timeStr };
  }

  const str = String(val).trim();
  if (!str) return { dateStr, timeStr };

  // Try standard JS date parsing
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    dateStr = d.toISOString().split('T')[0];
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    if (hrs !== '00' || mins !== '00') {
      timeStr = `${hrs}:${mins}`;
    }
  } else {
    // Attempt DD/MM/YYYY or MM/DD/YYYY split
    const parts = str.split(/[\/\-\.\s]/);
    if (parts.length >= 3) {
      const p1 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[1], 10);
      const p3 = parseInt(parts[2], 10);

      if (p3 > 1000) {
        // MM/DD/YYYY or DD/MM/YYYY
        const year = p3;
        let month = p1;
        let day = p2;
        if (month > 12 && day <= 12) {
          // DD/MM/YYYY
          month = p2;
          day = p1;
        }
        const formattedMonth = String(month).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        dateStr = `${year}-${formattedMonth}-${formattedDay}`;
      } else if (p1 > 1000) {
        // YYYY-MM-DD
        const year = p1;
        const month = String(p2).padStart(2, '0');
        const day = String(p3).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      }
    }
  }

  return { dateStr, timeStr };
}

export function parseExcelOrCsvFile(file: File, userSettings: UserSettings): Promise<ParsedImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON array of objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const records: HealthRecord[] = [];
        const warnings: string[] = [];
        let validRows = 0;

        rawJson.forEach((row, index) => {
          // Normalize column headers to lowercase without spaces/special characters
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.toLowerCase().replace(/[^a-z0-0]/g, '');
            normalizedRow[cleanKey] = row[key];
          });

          // Find date
          const rawDate = row['Date'] || row['date'] || normalizedRow['date'] || normalizedRow['readingdate'] || normalizedRow['dt'] || '';
          const { dateStr, timeStr: parsedTime } = parseFlexibleDate(rawDate);

          const timeVal = row['Time'] || row['time'] || normalizedRow['time'] || parsedTime || '08:00';

          // Blood Sugar
          let bloodSugarRaw = row['Blood Sugar'] || row['BloodSugar'] || row['Glucose'] || normalizedRow['bloodsugar'] || normalizedRow['glucose'] || normalizedRow['sugar'] || normalizedRow['bs'] || '';
          let bloodSugar: number | undefined = undefined;
          if (bloodSugarRaw !== '' && !isNaN(Number(bloodSugarRaw))) {
            const num = Number(bloodSugarRaw);
            // Convert to mg/dL if imported in mmol/L
            if (userSettings.bloodSugarUnit === 'mmol/L' || num < 35) {
              bloodSugar = convertBloodSugar(num, 'mmol/L', 'mg/dL');
            } else {
              bloodSugar = Math.round(num);
            }
          }

          // Context
          const contextRaw = String(row['Context'] || row['Timing'] || normalizedRow['context'] || normalizedRow['timing'] || normalizedRow['type'] || 'Fasting').trim();
          let bloodSugarContext: BloodSugarContext = 'Fasting';
          if (/post|after/i.test(contextRaw)) bloodSugarContext = 'Post-Meal';
          else if (/before|pre/i.test(contextRaw)) bloodSugarContext = 'Before Meal';
          else if (/bed/i.test(contextRaw)) bloodSugarContext = 'Bedtime';
          else if (/random/i.test(contextRaw)) bloodSugarContext = 'Random';

          // Blood Pressure
          let systolic: number | undefined = undefined;
          let diastolic: number | undefined = undefined;

          // Check if single combined string like "120/80"
          const bpCombined = row['Blood Pressure'] || row['BloodPressure'] || row['BP'] || normalizedRow['bloodpressure'] || normalizedRow['bp'] || '';
          if (bpCombined) {
            const match = String(bpCombined).match(/(\d{2,3})\s*[\/\-\:]\s*(\d{2,3})/);
            if (match) {
              systolic = parseInt(match[1], 10);
              diastolic = parseInt(match[2], 10);
            }
          }

          if (!systolic) {
            const sysRaw = row['Systolic'] || row['Sys'] || normalizedRow['systolic'] || normalizedRow['sys'] || '';
            if (sysRaw !== '' && !isNaN(Number(sysRaw))) systolic = Number(sysRaw);
          }

          if (!diastolic) {
            const diaRaw = row['Diastolic'] || row['Dia'] || normalizedRow['diastolic'] || normalizedRow['dia'] || '';
            if (diaRaw !== '' && !isNaN(Number(diaRaw))) diastolic = Number(diaRaw);
          }

          // Pulse
          let pulse: number | undefined = undefined;
          const pulseRaw = row['Pulse'] || row['Heart Rate'] || row['HR'] || normalizedRow['pulse'] || normalizedRow['heartrate'] || normalizedRow['hr'] || '';
          if (pulseRaw !== '' && !isNaN(Number(pulseRaw))) pulse = Number(pulseRaw);

          // Weight
          let weightRaw = row['Weight'] || row['Weight (kg)'] || row['Weight (lbs)'] || normalizedRow['weight'] || normalizedRow['wt'] || '';
          let weight: number | undefined = undefined;
          if (weightRaw !== '' && !isNaN(Number(weightRaw))) {
            const num = Number(weightRaw);
            // If user's default unit is lbs or header indicates lbs, convert to kg for internal storage
            if (userSettings.weightUnit === 'lbs' || /lbs/i.test(String(row))) {
              weight = convertWeight(num, 'lbs', 'kg');
            } else {
              weight = num;
            }
          }

          // Notes
          const notes = String(row['Notes'] || row['Note'] || row['Comments'] || normalizedRow['notes'] || normalizedRow['comments'] || '').trim();

          // Ensure at least one vital sign exists
          if (bloodSugar !== undefined || (systolic !== undefined && diastolic !== undefined) || weight !== undefined) {
            validRows++;
            records.push({
              id: `imp_${Date.now()}_${index}`,
              date: dateStr,
              time: String(timeVal),
              bloodSugar,
              bloodSugarContext,
              systolic,
              diastolic,
              pulse,
              weight,
              notes,
              createdAt: new Date().toISOString()
            });
          } else {
            warnings.push(`Row ${index + 2}: Skipped because no valid Blood Sugar, Blood Pressure, or Weight values were found.`);
          }
        });

        resolve({
          records,
          totalRows: rawJson.length,
          validRows,
          warnings
        });
      } catch (err: any) {
        reject(new Error(err?.message || 'Failed to parse spreadsheet file. Please check format.'));
      }
    };

    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsArrayBuffer(file);
  });
}

export function exportToExcel(records: HealthRecord[], userSettings: UserSettings, fileName = 'Health_Vitals_Log.xlsx') {
  // Map records to clean worksheet rows
  const exportRows = records.map((rec) => {
    // Blood sugar display
    let bsVal: string | number = '';
    if (rec.bloodSugar !== undefined) {
      if (userSettings.bloodSugarUnit === 'mmol/L') {
        bsVal = Number((rec.bloodSugar / 18.0182).toFixed(1));
      } else {
        bsVal = rec.bloodSugar;
      }
    }

    // Weight display
    let wtVal: string | number = '';
    if (rec.weight !== undefined) {
      if (userSettings.weightUnit === 'lbs') {
        wtVal = Number((rec.weight * 2.20462).toFixed(1));
      } else {
        wtVal = rec.weight;
      }
    }

    // BP string
    const bpStr = (rec.systolic && rec.diastolic) ? `${rec.systolic}/${rec.diastolic}` : '';

    return {
      Date: rec.date,
      Time: rec.time || '08:00',
      [`Blood Sugar (${userSettings.bloodSugarUnit})`]: bsVal,
      'Context': rec.bloodSugarContext || 'Fasting',
      'Blood Pressure (mmHg)': bpStr,
      'Systolic': rec.systolic || '',
      'Diastolic': rec.diastolic || '',
      'Pulse (bpm)': rec.pulse || '',
      [`Weight (${userSettings.weightUnit})`]: wtVal,
      Notes: rec.notes || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);

  // Set column widths for clean readability
  worksheet['!cols'] = [
    { wch: 12 }, // Date
    { wch: 8 },  // Time
    { wch: 18 }, // Blood Sugar
    { wch: 14 }, // Context
    { wch: 22 }, // Blood Pressure
    { wch: 10 }, // Systolic
    { wch: 10 }, // Diastolic
    { wch: 12 }, // Pulse
    { wch: 14 }, // Weight
    { wch: 35 }  // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vitals Log');

  // Write file
  XLSX.writeFile(workbook, fileName);
}

export function downloadSampleExcelTemplate(userSettings: UserSettings) {
  const sampleData = [
    {
      Date: '2026-08-12',
      Time: '08:00',
      [`Blood Sugar (${userSettings.bloodSugarUnit})`]: userSettings.bloodSugarUnit === 'mmol/L' ? 5.3 : 95,
      Context: 'Fasting',
      'Blood Pressure': '118/78',
      Pulse: 68,
      [`Weight (${userSettings.weightUnit})`]: userSettings.weightUnit === 'lbs' ? 164.2 : 74.5,
      Notes: 'Morning entry sample'
    },
    {
      Date: '2026-08-12',
      Time: '13:30',
      [`Blood Sugar (${userSettings.bloodSugarUnit})`]: userSettings.bloodSugarUnit === 'mmol/L' ? 7.1 : 128,
      Context: 'Post-Meal',
      'Blood Pressure': '122/80',
      Pulse: 72,
      [`Weight (${userSettings.weightUnit})`]: userSettings.weightUnit === 'lbs' ? 164.8 : 74.8,
      Notes: 'After lunch sample'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 12 }, { wch: 8 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 30 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Template');
  XLSX.writeFile(workbook, 'Health_Vitals_Template.xlsx');
}

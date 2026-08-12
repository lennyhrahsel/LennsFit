import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Activity, Heart, Scale, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { HealthRecord, BloodSugarContext, UserSettings } from '../types';
import {
  getBloodPressureCategory,
  getBloodPressureColor,
  getBloodSugarCategory,
  getBloodSugarColor,
  convertBloodSugar,
  convertWeight
} from '../utils/healthCalculators';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: HealthRecord) => void;
  initialRecord?: HealthRecord | null;
  userSettings: UserSettings;
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecord,
  userSettings
}) => {
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [bloodSugarInput, setBloodSugarInput] = useState<string>('');
  const [bloodSugarContext, setBloodSugarContext] = useState<BloodSugarContext>('Fasting');
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');
  const [weightInput, setWeightInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialRecord) {
        setDate(initialRecord.date || new Date().toISOString().split('T')[0]);
        setTime(initialRecord.time || '08:00');

        // Convert blood sugar for input display if unit is mmol/L
        if (initialRecord.bloodSugar !== undefined) {
          if (userSettings.bloodSugarUnit === 'mmol/L') {
            const val = (initialRecord.bloodSugar / 18.0182).toFixed(1);
            setBloodSugarInput(val);
          } else {
            setBloodSugarInput(String(initialRecord.bloodSugar));
          }
        } else {
          setBloodSugarInput('');
        }

        setBloodSugarContext(initialRecord.bloodSugarContext || 'Fasting');
        setSystolic(initialRecord.systolic ? String(initialRecord.systolic) : '');
        setDiastolic(initialRecord.diastolic ? String(initialRecord.diastolic) : '');
        setPulse(initialRecord.pulse ? String(initialRecord.pulse) : '');

        // Convert weight for input display if unit is lbs
        if (initialRecord.weight !== undefined) {
          if (userSettings.weightUnit === 'lbs') {
            const val = (initialRecord.weight * 2.20462).toFixed(1);
            setWeightInput(val);
          } else {
            setWeightInput(String(initialRecord.weight));
          }
        } else {
          setWeightInput('');
        }

        setNotes(initialRecord.notes || '');
      } else {
        // Reset to default new record values
        const now = new Date();
        setDate(now.toISOString().split('T')[0]);
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        setTime(`${hrs}:${mins}`);
        setBloodSugarInput('');
        setBloodSugarContext('Fasting');
        setSystolic('');
        setDiastolic('');
        setPulse('');
        setWeightInput('');
        setNotes('');
      }
      setErrorMessage('');
    }
  }, [isOpen, initialRecord, userSettings]);

  if (!isOpen) return null;

  // Real-time calculation helpers for preview badges
  const parsedBsVal = bloodSugarInput ? parseFloat(bloodSugarInput) : undefined;
  let bsInMgDl: number | undefined = undefined;
  if (parsedBsVal !== undefined && !isNaN(parsedBsVal)) {
    bsInMgDl = userSettings.bloodSugarUnit === 'mmol/L'
      ? convertBloodSugar(parsedBsVal, 'mmol/L', 'mg/dL')
      : parsedBsVal;
  }

  const parsedSys = systolic ? parseInt(systolic, 10) : undefined;
  const parsedDia = diastolic ? parseInt(diastolic, 10) : undefined;

  const bpCategory = getBloodPressureCategory(parsedSys, parsedDia);
  const bpColors = getBloodPressureColor(bpCategory);

  const bsCategory = getBloodSugarCategory(bsInMgDl, bloodSugarContext);
  const bsColors = getBloodSugarColor(bsCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!date) {
      setErrorMessage('Please select a valid date.');
      return;
    }

    const hasBs = bloodSugarInput !== '' && !isNaN(parseFloat(bloodSugarInput));
    const hasBp = systolic !== '' && diastolic !== '' && !isNaN(parseInt(systolic)) && !isNaN(parseInt(diastolic));
    const hasWt = weightInput !== '' && !isNaN(parseFloat(weightInput));

    if (!hasBs && !hasBp && !hasWt) {
      setErrorMessage('Please enter at least one health record value: Blood Sugar, Blood Pressure, or Weight.');
      return;
    }

    // Convert values to internal storage format (mg/dL and kg)
    let finalBloodSugar: number | undefined = undefined;
    if (hasBs) {
      const val = parseFloat(bloodSugarInput);
      finalBloodSugar = userSettings.bloodSugarUnit === 'mmol/L'
        ? convertBloodSugar(val, 'mmol/L', 'mg/dL')
        : val;
    }

    let finalWeight: number | undefined = undefined;
    if (hasWt) {
      const val = parseFloat(weightInput);
      finalWeight = userSettings.weightUnit === 'lbs'
        ? convertWeight(val, 'lbs', 'kg')
        : val;
    }

    const recordToSave: HealthRecord = {
      id: initialRecord?.id || `rec_${Date.now()}`,
      date,
      time: time || '08:00',
      bloodSugar: finalBloodSugar,
      bloodSugarContext,
      systolic: parsedSys,
      diastolic: parsedDia,
      pulse: pulse ? parseInt(pulse, 10) : undefined,
      weight: finalWeight,
      notes: notes.trim(),
      createdAt: initialRecord?.createdAt || new Date().toISOString()
    };

    onSave(recordToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden rounded-none"
        id="modal-record-form"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0078d7] text-white border-b border-[#005a9e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-white/20 text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialRecord ? 'Edit Vitals Record' : 'Log New Vitals Entry'}
              </h2>
              <p className="text-xs text-sky-100">
                Record Blood Sugar, Blood Pressure & Weight
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-none hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-[#333333] dark:text-slate-100">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 rounded-none text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#333333] dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0078d7]" />
                Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-xs text-[#333333] dark:text-white focus:ring-1 focus:ring-[#0078d7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#333333] dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0078d7]" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-xs text-[#333333] dark:text-white focus:ring-1 focus:ring-[#0078d7] focus:outline-none"
              />
            </div>
          </div>

          {/* Blood Sugar Section */}
          <div className="p-4 bg-[#f8f9fa] dark:bg-slate-800/40 border border-[#cccccc] dark:border-slate-700/60 rounded-none space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#333333] dark:text-slate-200 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#0078d7]" />
                Blood Sugar ({userSettings.bloodSugarUnit})
              </label>
              {bsCategory !== 'Unknown' && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-none border ${bsColors.bg} ${bsColors.text} ${bsColors.border}`}>
                  {bsCategory} Range
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  step={userSettings.bloodSugarUnit === 'mmol/L' ? '0.1' : '1'}
                  placeholder={`e.g. ${userSettings.bloodSugarUnit === 'mmol/L' ? '5.5' : '95'}`}
                  value={bloodSugarInput}
                  onChange={(e) => setBloodSugarInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-xs font-medium text-[#333333] dark:text-white focus:ring-1 focus:ring-[#0078d7] focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={bloodSugarContext}
                  onChange={(e) => setBloodSugarContext(e.target.value as BloodSugarContext)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-xs font-medium text-[#333333] dark:text-white focus:ring-1 focus:ring-[#0078d7] focus:outline-none"
                >
                  <option value="Fasting">Fasting (Morning)</option>
                  <option value="Before Meal">Before Meal</option>
                  <option value="Post-Meal">Post-Meal (2 hrs after)</option>
                  <option value="Bedtime">Bedtime</option>
                  <option value="Random">Random</option>
                </select>
              </div>
            </div>
          </div>

          {/* Blood Pressure Section */}
          <div className="p-4 bg-[#f8f9fa] dark:bg-slate-800/40 border border-[#cccccc] dark:border-slate-700/60 rounded-none space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#333333] dark:text-slate-200 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-600" />
                Blood Pressure (mmHg) & Pulse
              </label>
              {bpCategory !== 'Unknown' && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-none border ${bpColors.bg} ${bpColors.text} ${bpColors.border}`}>
                  {bpCategory}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="block text-[11px] text-slate-500 font-medium mb-1">Systolic (Top)</span>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-xs font-medium text-[#333333] dark:text-white focus:ring-1 focus:ring-[#0078d7] focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-[11px] text-slate-500 font-medium mb-1">Diastolic (Bottom)</span>
                <input
                  type="number"
                  placeholder="e.g. 80"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-xs font-medium text-[#333333] dark:text-white focus:ring-1 focus:ring-[#0078d7] focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-[11px] text-slate-500 font-medium mb-1">Pulse (bpm)</span>
                <input
                  type="number"
                  placeholder="e.g. 72"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-xs font-medium text-[#333333] dark:text-white focus:ring-1 focus:ring-[#0078d7] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Weight Section */}
          <div className="p-4 bg-[#f8f9fa] dark:bg-slate-800/40 border border-[#cccccc] dark:border-slate-700/60 rounded-none space-y-2">
            <label className="text-xs font-bold text-[#333333] dark:text-slate-200 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-sky-600" />
              Weight ({userSettings.weightUnit})
            </label>
            <input
              type="number"
              step="0.1"
              placeholder={`e.g. ${userSettings.weightUnit === 'lbs' ? '165.0' : '75.0'}`}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-xs font-medium text-[#333333] dark:text-white focus:ring-1 focus:ring-[#0078d7] focus:outline-none"
            />
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-bold text-[#333333] dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Additional Notes / Remarks
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Fasted for 10 hours, took morning medication..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-xs text-[#333333] dark:text-white focus:ring-1 focus:ring-[#0078d7] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#cccccc] dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#333333] dark:text-slate-300 border border-[#cccccc] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#0078d7] hover:bg-[#005a9e] text-white rounded-none shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialRecord ? 'Save Changes' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

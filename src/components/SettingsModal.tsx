import React, { useState } from 'react';
import { X, Settings, User, Stethoscope, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { UserSettings, BloodSugarUnit, WeightUnit } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onResetToSampleData: () => void;
  onClearAllRecords: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userSettings,
  onSaveSettings,
  onResetToSampleData,
  onClearAllRecords
}) => {
  const [bloodSugarUnit, setBloodSugarUnit] = useState<BloodSugarUnit>(userSettings.bloodSugarUnit);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(userSettings.weightUnit);
  const [patientName, setPatientName] = useState<string>(userSettings.patientInfo.name || '');
  const [patientAge, setPatientAge] = useState<string>(userSettings.patientInfo.age || '');
  const [doctorName, setDoctorName] = useState<string>(userSettings.patientInfo.doctorName || '');
  const [patientNotes, setPatientNotes] = useState<string>(userSettings.patientInfo.notes || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      bloodSugarUnit,
      weightUnit,
      patientInfo: {
        name: patientName.trim() || 'John Doe',
        age: patientAge.trim(),
        doctorName: doctorName.trim(),
        notes: patientNotes.trim()
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-[#333333] dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden rounded-none">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0078d7] text-white border-b border-[#005a9e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-white/20 text-white flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Software Preferences & Patient Profile
              </h2>
              <p className="text-xs text-sky-100">
                Measurement units and report settings
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

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Measurement Units */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[11px] text-[#0078d7] dark:text-sky-400">
              Measurement Units
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-400 mb-1 font-bold">
                  Blood Sugar Unit
                </label>
                <select
                  value={bloodSugarUnit}
                  onChange={(e) => setBloodSugarUnit(e.target.value as BloodSugarUnit)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-[#333333] dark:text-white font-medium"
                >
                  <option value="mg/dL">mg/dL (Standard US)</option>
                  <option value="mmol/L">mmol/L (Standard UK / Int)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-400 mb-1 font-bold">
                  Weight Unit
                </label>
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-[#333333] dark:text-white font-medium"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Patient Profile */}
          <div className="space-y-3 pt-3 border-t border-[#cccccc] dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[11px] text-[#0078d7] dark:text-sky-400">
              Patient Profile (For Reports)
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-400 mb-1 font-bold flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Patient Full Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-[#333333] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-400 mb-1 font-bold">
                  Age
                </label>
                <input
                  type="text"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 48"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-[#333333] dark:text-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-700 dark:text-slate-400 mb-1 font-bold flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" /> Physician / Doctor Name
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-[#333333] dark:text-white"
              />
            </div>
          </div>

          {/* Database Reset Controls */}
          <div className="space-y-2 pt-3 border-t border-[#cccccc] dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[11px] text-slate-500">
              Data Management
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset records to initial sample data?')) {
                    onResetToSampleData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-[#f8f9fa] border border-[#cccccc] hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#333333] dark:text-slate-200 rounded-none text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Load Sample Records</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete ALL records? This cannot be undone.')) {
                    onClearAllRecords();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-rose-50 border border-rose-300 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 rounded-none text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Clear All Records</span>
              </button>
            </div>
          </div>

          {/* Footer Save */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#cccccc] dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#333333] dark:text-slate-300 border border-[#cccccc] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#0078d7] hover:bg-[#005a9e] text-white rounded-none shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

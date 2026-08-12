import React, { useState, useEffect } from 'react';
import { HealthRecord, UserSettings } from './types';
import {
  getStoredRecords,
  saveRecords,
  getStoredSettings,
  saveSettings,
  INITIAL_SAMPLE_RECORDS
} from './utils/storage';
import { Header } from './components/Header';
import { RecordTable } from './components/RecordTable';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { RecordFormModal } from './components/RecordFormModal';
import { ImportModal } from './components/ImportModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { WindowsInfoModal } from './components/WindowsInfoModal';
import { Activity, Plus, FileSpreadsheet, Download, Heart, Scale } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(getStoredSettings());
  const [activeTab, setActiveTab] = useState<'table' | 'analytics'>('table');

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isWindowsInfoOpen, setIsWindowsInfoOpen] = useState(false);

  // Load records on mount
  useEffect(() => {
    const loaded = getStoredRecords();
    setRecords(loaded);
  }, []);

  // Keyboard shortcut listener (Ctrl+N for new record, Ctrl+E for export)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingRecord(null);
        setIsRecordModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save record handler
  const handleSaveRecord = (recordToSave: HealthRecord) => {
    setRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === recordToSave.id);
      let updated: HealthRecord[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = recordToSave;
      } else {
        updated = [recordToSave, ...prev];
      }
      saveRecords(updated);
      return updated;
    });
  };

  // Single record delete
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveRecords(updated);
      return updated;
    });
  };

  // Batch record delete
  const handleBatchDelete = (ids: string[]) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => !ids.includes(r.id));
      saveRecords(updated);
      return updated;
    });
  };

  // Import records handler
  const handleImportConfirmed = (newRecords: HealthRecord[]) => {
    setRecords((prev) => {
      const merged = [...newRecords, ...prev];
      saveRecords(merged);
      return merged;
    });
  };

  // Save settings handler
  const handleSaveSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    saveSettings(newSettings);
  };

  // Reset data handler
  const handleResetToSampleData = () => {
    setRecords(INITIAL_SAMPLE_RECORDS);
    saveRecords(INITIAL_SAMPLE_RECORDS);
  };

  const handleClearAllRecords = () => {
    setRecords([]);
    saveRecords([]);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-slate-950 text-[#333333] dark:text-slate-100 font-sans flex flex-col selection:bg-[#0078d7] selection:text-white">
      {/* Header Navigation Bar */}
      <Header
        onOpenNewRecord={() => {
          setEditingRecord(null);
          setIsRecordModalOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenWindowsInfo={() => setIsWindowsInfoOpen(true)}
        onResetData={handleResetToSampleData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userSettings={userSettings}
        totalRecordsCount={records.length}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quick Vitals Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 rounded-none p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Records</p>
              <p className="text-xl font-black text-[#333333] dark:text-white mt-0.5">{records.length}</p>
            </div>
            <div className="w-10 h-10 rounded-none bg-[#0078d7]/10 text-[#0078d7] dark:text-sky-400 flex items-center justify-center border border-[#0078d7]/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 rounded-none p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Blood Sugar Logged</p>
              <p className="text-xl font-black text-[#333333] dark:text-white mt-0.5">
                {records.filter(r => r.bloodSugar !== undefined).length} <span className="text-xs font-normal text-slate-500">entries</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-none bg-teal-500/10 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 rounded-none p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Blood Pressure Logged</p>
              <p className="text-xl font-black text-[#333333] dark:text-white mt-0.5">
                {records.filter(r => r.systolic && r.diastolic).length} <span className="text-xs font-normal text-slate-500">entries</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-none bg-rose-500/10 text-rose-700 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Heart className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 rounded-none p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Weight Logged</p>
              <p className="text-xl font-black text-[#333333] dark:text-white mt-0.5">
                {records.filter(r => r.weight !== undefined).length} <span className="text-xs font-normal text-slate-500">entries</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-none bg-sky-500/10 text-sky-700 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Scale className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab View: Table vs Analytics */}
        {activeTab === 'table' ? (
          <RecordTable
            records={records}
            userSettings={userSettings}
            onEditRecord={(rec) => {
              setEditingRecord(rec);
              setIsRecordModalOpen(true);
            }}
            onDeleteRecord={handleDeleteRecord}
            onBatchDelete={handleBatchDelete}
            onExportSelected={(selRecs) => {
              setIsExportModalOpen(true);
            }}
          />
        ) : (
          <AnalyticsCharts records={records} userSettings={userSettings} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© Health Vitals Tracker — Windows 10 x64 Software</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Shortcut: <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono border border-slate-300 dark:border-slate-700">Ctrl+N</kbd> New Entry</span>
            <span>Shortcut: <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono border border-slate-300 dark:border-slate-700">Ctrl+E</kbd> Export</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RecordFormModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        initialRecord={editingRecord}
        userSettings={userSettings}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportConfirmed={handleImportConfirmed}
        userSettings={userSettings}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        records={records}
        userSettings={userSettings}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        userSettings={userSettings}
        onSaveSettings={handleSaveSettings}
        onResetToSampleData={handleResetToSampleData}
        onClearAllRecords={handleClearAllRecords}
      />

      <WindowsInfoModal
        isOpen={isWindowsInfoOpen}
        onClose={() => setIsWindowsInfoOpen(false)}
      />
    </div>
  );
}

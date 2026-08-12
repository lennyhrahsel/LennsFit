import React from 'react';
import { Plus, FileSpreadsheet, FileText, Settings, Download, Monitor, Activity, RefreshCw } from 'lucide-react';
import { UserSettings } from '../types';

interface HeaderProps {
  onOpenNewRecord: () => void;
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenWindowsInfo: () => void;
  onResetData: () => void;
  activeTab: 'table' | 'analytics';
  setActiveTab: (tab: 'table' | 'analytics') => void;
  userSettings: UserSettings;
  totalRecordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewRecord,
  onOpenImportModal,
  onOpenExportModal,
  onOpenSettingsModal,
  onOpenWindowsInfo,
  onResetData,
  activeTab,
  setActiveTab,
  userSettings,
  totalRecordsCount
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-30">
      {/* Top Windows 10 style app banner */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs text-slate-400 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0078d7] animate-pulse"></span>
          <span className="font-bold text-slate-100">LennsFit</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 hidden sm:inline">Win 10/11 x64 Desktop Edition</span>
          <button
            onClick={onOpenWindowsInfo}
            className="text-sky-400 hover:underline hover:text-sky-300 ml-1 flex items-center gap-1 cursor-pointer"
          >
            <Monitor className="w-3 h-3" />
            <span>Desktop Guide</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono">
            Patient: <span className="text-slate-200 font-medium">{userSettings.patientInfo.name || 'Default'}</span>
          </span>
          <button
            onClick={onOpenSettingsModal}
            className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Navigation */}
        <div className="flex items-center justify-between sm:justify-start gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                LennsFit Vitals
                <span className="text-xs font-bold px-2 py-0.5 bg-[#0078d7] text-white rounded-none border border-sky-400">
                  {totalRecordsCount} Records
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Blood Sugar, Blood Pressure & Weight Tracker
              </p>
            </div>
          </div>

          {/* View Toggle Tabs */}
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700/60">
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Records Table
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Analytics & Trends
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* New Record Button */}
          <button
            onClick={onOpenNewRecord}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md shadow-emerald-900/20 transition-colors cursor-pointer"
            id="btn-add-record"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            id="btn-import-excel"
            title="Import records from Excel (.xlsx) or CSV file"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Import Excel</span>
            <span className="sm:hidden">Import</span>
          </button>

          {/* Export Options */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            id="btn-export-reports"
            title="Export data to Excel or PDF Report"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};

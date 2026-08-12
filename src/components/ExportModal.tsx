import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  CheckCircle2,
  User,
  Stethoscope,
  Check
} from 'lucide-react';
import { HealthRecord, UserSettings } from '../types';
import { exportToExcel } from '../utils/excelHandler';
import { generateHealthPDFReport } from '../utils/pdfGenerator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: HealthRecord[];
  userSettings: UserSettings;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  records,
  userSettings
}) => {
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [patientName, setPatientName] = useState<string>(userSettings.patientInfo.name || '');
  const [doctorName, setDoctorName] = useState<string>(userSettings.patientInfo.doctorName || '');
  const [reportTitle, setReportTitle] = useState<string>('Health Vitals Record Log');
  const [includeSummary, setIncludeSummary] = useState<boolean>(true);
  const [customReportNotes, setCustomReportNotes] = useState<string>('');

  if (!isOpen) return null;

  // Filter records by date range if specified
  const targetRecords = records.filter((r) => {
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    return true;
  });

  const handleExecuteExport = () => {
    if (targetRecords.length === 0) {
      alert('No records match the selected date range to export.');
      return;
    }

    if (exportFormat === 'excel') {
      const fileName = `Health_Log_${patientName ? patientName.replace(/\s+/g, '_') : 'Patient'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      exportToExcel(targetRecords, userSettings, fileName);
    } else {
      generateHealthPDFReport({
        records: targetRecords,
        userSettings: {
          ...userSettings,
          patientInfo: {
            ...userSettings.patientInfo,
            name: patientName,
            doctorName: doctorName
          }
        },
        title: reportTitle,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        includeSummary: includeSummary,
        notes: customReportNotes.trim() || undefined
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-[#333333] dark:text-slate-100">
      <div
        className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden rounded-none"
        id="modal-export-data"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0078d7] text-white border-b border-[#005a9e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-white/20 text-white flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Export Health Vitals Data
              </h2>
              <p className="text-xs text-sky-100">
                Generate formatted Excel spreadsheet or PDF report
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Format Selection Cards */}
          <div>
            <label className="block text-xs font-bold text-[#333333] dark:text-slate-300 mb-2">
              Select Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Excel Choice */}
              <div
                onClick={() => setExportFormat('excel')}
                className={`p-4 border-2 rounded-none cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${
                  exportFormat === 'excel'
                    ? 'border-[#0078d7] bg-[#e3f2fd] dark:bg-slate-800 text-[#0078d7] dark:text-sky-300 font-bold'
                    : 'border-[#cccccc] dark:border-slate-800 bg-[#f8f9fa] dark:bg-slate-800/30 text-[#333333] dark:text-slate-400 hover:border-[#0078d7]'
                }`}
              >
                <FileSpreadsheet className={`w-7 h-7 ${exportFormat === 'excel' ? 'text-[#0078d7]' : 'text-slate-400'}`} />
                <div>
                  <p className="text-xs font-bold">Excel Sheet (.xlsx)</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Structured spreadsheet data</p>
                </div>
              </div>

              {/* PDF Choice */}
              <div
                onClick={() => setExportFormat('pdf')}
                className={`p-4 border-2 rounded-none cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${
                  exportFormat === 'pdf'
                    ? 'border-[#0078d7] bg-[#e3f2fd] dark:bg-slate-800 text-[#0078d7] dark:text-sky-300 font-bold'
                    : 'border-[#cccccc] dark:border-slate-800 bg-[#f8f9fa] dark:bg-slate-800/30 text-[#333333] dark:text-slate-400 hover:border-[#0078d7]'
                }`}
              >
                <FileText className={`w-7 h-7 ${exportFormat === 'pdf' ? 'text-[#0078d7]' : 'text-slate-400'}`} />
                <div>
                  <p className="text-xs font-bold">PDF Report (.pdf)</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Printable physician document</p>
                </div>
              </div>
            </div>
          </div>

          {/* Date Filter Range */}
          <div className="p-3.5 bg-[#f8f9fa] dark:bg-slate-800/50 border border-[#cccccc] dark:border-slate-700/80 rounded-none space-y-2">
            <label className="text-xs font-bold text-[#333333] dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Date Range Filter (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-[10px] text-slate-500 mb-1 font-bold">Start Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-[#333333] dark:text-white"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 mb-1 font-bold">End Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-[#333333] dark:text-white"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Leave empty to export all {records.length} records. Currently matching: <span className="font-bold text-[#333333] dark:text-slate-300">{targetRecords.length} records</span>.
            </p>
          </div>

          {/* PDF-Specific Customization Options */}
          {exportFormat === 'pdf' && (
            <div className="space-y-3 pt-2 border-t border-[#cccccc] dark:border-slate-800">
              <h3 className="text-xs font-bold text-[#333333] dark:text-slate-200">PDF Report Header Options</h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 flex items-center gap-1 font-medium">
                    <User className="w-3 h-3" /> Patient Name
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Patient Name"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-[#333333] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 flex items-center gap-1 font-medium">
                    <Stethoscope className="w-3 h-3" /> Doctor Name
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Doctor Name"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-[#333333] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1 font-medium">
                  Custom Physician / Patient Notes
                </label>
                <textarea
                  rows={2}
                  value={customReportNotes}
                  onChange={(e) => setCustomReportNotes(e.target.value)}
                  placeholder="e.g. Please bring this log for your quarterly checkup..."
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-xs text-[#333333] dark:text-white"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[#333333] dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="rounded-none border-[#cccccc] text-[#0078d7] focus:ring-[#0078d7] w-4 h-4"
                />
                <span>Include Vitals Average Statistics KPI Summary Box</span>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#f8f9fa] dark:bg-slate-950 border-t border-[#cccccc] dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#333333] dark:text-slate-300 border border-[#cccccc] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleExecuteExport}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#0078d7] hover:bg-[#005a9e] text-white rounded-none shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download {exportFormat === 'excel' ? 'Excel File' : 'PDF Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

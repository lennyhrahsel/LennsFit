import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText,
  ArrowRight
} from 'lucide-react';
import { HealthRecord, UserSettings } from '../types';
import { parseExcelOrCsvFile, downloadSampleExcelTemplate, ParsedImportResult } from '../utils/excelHandler';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportConfirmed: (newRecords: HealthRecord[]) => void;
  userSettings: UserSettings;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportConfirmed,
  userSettings
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ParsedImportResult | null>(null);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setError('');
    setIsProcessing(true);
    setImportResult(null);

    try {
      const res = await parseExcelOrCsvFile(file, userSettings);
      setImportResult(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to read file. Please verify it is a valid Excel (.xlsx, .xls) or CSV file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (importResult && importResult.records.length > 0) {
      onImportConfirmed(importResult.records);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-[#333333] dark:text-slate-100">
      <div
        className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden rounded-none"
        id="modal-import-excel"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0078d7] text-white border-b border-[#005a9e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-white/20 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Import Health Records from Excel
              </h2>
              <p className="text-xs text-sky-100">
                Supports .xlsx, .xls, and .csv format
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Download Template Banner */}
          <div className="p-3.5 bg-[#e3f2fd] dark:bg-slate-800 border border-[#0078d7] rounded-none flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#0d47a1] dark:text-sky-300">
              <FileText className="w-4 h-4 shrink-0 text-[#0078d7]" />
              <span className="font-medium">Need a formatted Excel spreadsheet template to start?</span>
            </div>
            <button
              onClick={() => downloadSampleExcelTemplate(userSettings)}
              className="px-3 py-1.5 bg-[#0078d7] hover:bg-[#005a9e] text-white rounded-none font-bold flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Drag & Drop File Zone */}
          {!importResult && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#cccccc] dark:border-slate-700 hover:border-[#0078d7] rounded-none p-8 text-center bg-[#f8f9fa] dark:bg-slate-800/20 transition-all cursor-pointer relative"
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-10 h-10 mx-auto text-[#0078d7] mb-2" />
              <p className="text-sm font-bold text-[#333333] dark:text-slate-200">
                Click or drag Excel / CSV file here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Reads columns: Date, Time, Blood Sugar, Blood Pressure, Systolic, Diastolic, Weight, Notes
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="py-8 text-center text-slate-500 space-y-2">
              <div className="w-6 h-6 border-2 border-[#0078d7] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold">Parsing spreadsheet headers and data...</p>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 rounded-none text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview Parsed Results */}
          {importResult && (
            <div className="space-y-4">
              <div className="p-4 bg-[#f8f9fa] dark:bg-slate-800/60 border border-[#cccccc] dark:border-slate-700 rounded-none flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#333333] dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0078d7]" />
                    Ready to Import {importResult.validRows} Records
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Parsed from file: <span className="font-bold text-[#333333] dark:text-slate-300">{selectedFile?.name}</span> ({importResult.totalRows} rows total)
                  </p>
                </div>
                <button
                  onClick={() => setImportResult(null)}
                  className="text-xs text-[#0078d7] hover:underline cursor-pointer font-bold"
                >
                  Choose Different File
                </button>
              </div>

              {/* Sample preview table */}
              <div className="border border-[#cccccc] dark:border-slate-800 rounded-none overflow-hidden max-h-48 overflow-y-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#e8e8e8] dark:bg-slate-800 text-[11px] font-bold text-[#333333] uppercase border-b border-[#cccccc]">
                    <tr>
                      <th className="p-2 border-r border-[#cccccc]">Date</th>
                      <th className="p-2 border-r border-[#cccccc]">Blood Sugar</th>
                      <th className="p-2 border-r border-[#cccccc]">BP</th>
                      <th className="p-2 border-r border-[#cccccc]">Weight</th>
                      <th className="p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cccccc] dark:divide-slate-800">
                    {importResult.records.slice(0, 5).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2 font-mono border-r border-[#cccccc]">{r.date}</td>
                        <td className="p-2 border-r border-[#cccccc]">{r.bloodSugar ? `${r.bloodSugar} mg/dL` : '-'}</td>
                        <td className="p-2 border-r border-[#cccccc]">{(r.systolic && r.diastolic) ? `${r.systolic}/${r.diastolic}` : '-'}</td>
                        <td className="p-2 border-r border-[#cccccc]">{r.weight ? `${r.weight} kg` : '-'}</td>
                        <td className="p-2 truncate max-w-[120px] text-slate-500">{r.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {importResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 rounded-none text-[11px] space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Some rows were skipped during parsing:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 opacity-90 max-h-20 overflow-y-auto">
                    {importResult.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-[#f8f9fa] dark:bg-slate-950 border-t border-[#cccccc] dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#333333] dark:text-slate-300 border border-[#cccccc] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {importResult && importResult.validRows > 0 && (
            <button
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#0078d7] hover:bg-[#005a9e] text-white rounded-none shadow-sm transition-all cursor-pointer"
            >
              <span>Import {importResult.validRows} Records</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

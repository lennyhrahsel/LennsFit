import React from 'react';
import { X, Monitor, Download, ShieldCheck, CheckCircle2, HardDrive } from 'lucide-react';

interface WindowsInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsInfoModal: React.FC<WindowsInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-[#333333] dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden rounded-none">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0078d7] text-white border-b border-[#005a9e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-white/20 text-white flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Windows 10 / 11 Desktop Compatibility Guide
              </h2>
              <p className="text-xs text-sky-100">
                Running as a desktop health software tool
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 dark:text-slate-300 flex-1">
          <div className="p-3.5 bg-[#e3f2fd] dark:bg-slate-800 border border-[#0078d7] rounded-none flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0078d7] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#0d47a1] dark:text-sky-300 text-sm">
                LennsFit Desktop - Windows 10 & 11 (64-bit)
              </p>
              <p className="text-[11px] text-[#0d47a1] dark:text-sky-200 mt-1">
                LennsFit is packaged for native Windows 10/11 x64 desktop execution with offline LocalStorage support, Excel import/export, and PDF generation.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-[#333333] dark:text-white text-xs flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#0078d7]" /> Zero-Installation Standalone Portable Options:
            </h3>

            <ol className="list-decimal list-inside space-y-2 text-[#333333] dark:text-slate-300 pl-1">
              <li>
                <strong className="text-[#333333] dark:text-slate-200">Standalone Portable Executable:</strong> Download <span className="font-mono bg-[#e8e8e8] border border-[#cccccc] dark:bg-slate-800 px-1 py-0.5">LennsFit-Portable-1.0.0.exe</span> from GitHub Releases and double-click to run immediately without any setup wizard.
              </li>
              <li>
                <strong className="text-[#333333] dark:text-slate-200">Instant Batch Launcher:</strong> Extract the folder and double-click <span className="font-mono bg-[#e8e8e8] border border-[#cccccc] dark:bg-slate-800 px-1 py-0.5">Run-LennsFit.bat</span> to launch LennsFit in Windows native app mode powered by Microsoft Edge.
              </li>
              <li>
                <strong className="text-[#333333] dark:text-slate-200">GitHub Actions Build:</strong> The included <span className="font-mono bg-[#e8e8e8] border border-[#cccccc] dark:bg-slate-800 px-1 py-0.5">.github/workflows/build-exe.yml</span> automatically builds <span className="font-mono bg-[#e8e8e8] border border-[#cccccc] dark:bg-slate-800 px-1 py-0.5">LennsFit-Portable-1.0.0.exe</span> on every push.
              </li>
            </ol>
          </div>

          <div className="space-y-2 pt-3 border-t border-[#cccccc] dark:border-slate-800">
            <h3 className="font-bold text-[#333333] dark:text-white text-xs flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-[#0078d7]" /> Data Backup & Offline Storage:
            </h3>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-600 dark:text-slate-400">
              <li>All records are saved securely inside local storage on your Windows system.</li>
              <li>You can export all records anytime to standard <strong className="text-[#333333] dark:text-slate-300">Excel (.xlsx) files</strong> for local hard drive backup.</li>
              <li>Import any existing Excel or CSV spreadsheet logs using the <strong className="text-[#333333] dark:text-slate-300">Import Excel</strong> button.</li>
              <li>Generate printable physician reports in <strong className="text-[#333333] dark:text-slate-300">PDF format</strong>.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f8f9fa] dark:bg-slate-950 border-t border-[#cccccc] dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0078d7] hover:bg-[#005a9e] text-white rounded-none text-xs font-bold shadow-sm cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

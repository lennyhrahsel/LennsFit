import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  ArrowUpDown,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  Activity,
  Heart,
  Scale,
  FileSpreadsheet,
  AlertCircle,
  FilterX
} from 'lucide-react';
import { HealthRecord, UserSettings, FilterOptions } from '../types';
import {
  formatBloodSugar,
  formatWeight,
  getBloodPressureCategory,
  getBloodPressureColor,
  getBloodSugarCategory,
  getBloodSugarColor
} from '../utils/healthCalculators';

interface RecordTableProps {
  records: HealthRecord[];
  userSettings: UserSettings;
  onEditRecord: (record: HealthRecord) => void;
  onDeleteRecord: (id: string) => void;
  onBatchDelete: (ids: string[]) => void;
  onExportSelected: (selectedRecords: HealthRecord[]) => void;
}

export const RecordTable: React.FC<RecordTableProps> = ({
  records,
  userSettings,
  onEditRecord,
  onDeleteRecord,
  onBatchDelete,
  onExportSelected
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'bloodSugar' | 'systolic' | 'weight'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter & Sort logic
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const notesMatch = rec.notes?.toLowerCase().includes(q);
          const dateMatch = rec.date.includes(q);
          const bsMatch = rec.bloodSugar ? String(rec.bloodSugar).includes(q) : false;
          const bpMatch = (rec.systolic && rec.diastolic) ? `${rec.systolic}/${rec.diastolic}`.includes(q) : false;
          if (!notesMatch && !dateMatch && !bsMatch && !bpMatch) return false;
        }

        // Date Range
        if (startDate && rec.date < startDate) return false;
        if (endDate && rec.date > endDate) return false;

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'date') {
          const timeA = `${a.date}T${a.time || '00:00'}`;
          const timeB = `${b.date}T${b.time || '00:00'}`;
          comp = timeA.localeCompare(timeB);
        } else if (sortBy === 'bloodSugar') {
          comp = (a.bloodSugar || 0) - (b.bloodSugar || 0);
        } else if (sortBy === 'systolic') {
          comp = (a.systolic || 0) - (b.systolic || 0);
        } else if (sortBy === 'weight') {
          comp = (a.weight || 0) - (b.weight || 0);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [records, searchQuery, startDate, endDate, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  // Selection logic
  const isAllSelected = paginatedRecords.length > 0 && paginatedRecords.every((r) => selectedIds.includes(r.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedRecords.some((r) => r.id === id)));
    } else {
      const newIds = [...selectedIds];
      paginatedRecords.forEach((r) => {
        if (!newIds.includes(r.id)) newIds.push(r.id);
      });
      setSelectedIds(newIds);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 shadow-sm rounded-none overflow-hidden flex flex-col">
      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-[#e8e8e8]/80 dark:bg-slate-950/60 border-b border-[#cccccc] dark:border-slate-800 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by date, notes, blood sugar or BP..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none text-[#333333] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0078d7]"
          />
        </div>

        {/* Right: Date Range & Sort controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Start Date */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 text-[10px]">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[#333333] dark:text-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 text-[10px]">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[#333333] dark:text-white focus:outline-none cursor-pointer"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-[#cccccc] dark:border-slate-700 rounded-none px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [any, any];
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="bg-transparent text-[#333333] dark:text-white focus:outline-none font-medium cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="bloodSugar-desc">Highest Blood Sugar</option>
              <option value="systolic-desc">Highest Blood Pressure</option>
              <option value="weight-desc">Highest Weight</option>
            </select>
          </div>

          {(searchQuery || startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-none transition-colors cursor-pointer border border-rose-200"
              title="Clear all filters"
            >
              <FilterX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Batch Actions Bar if items selected */}
      {selectedIds.length > 0 && (
        <div className="bg-[#e3f2fd] dark:bg-slate-800 border-b border-[#0078d7] px-4 py-2 flex items-center justify-between text-xs text-[#005a9e] dark:text-sky-300 font-medium">
          <span className="font-bold">
            {selectedIds.length} {selectedIds.length === 1 ? 'record' : 'records'} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const selRecs = records.filter((r) => selectedIds.includes(r.id));
                onExportSelected(selRecs);
              }}
              className="px-3 py-1 bg-[#0078d7] hover:bg-[#005a9e] text-white rounded-none font-medium flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Selected</span>
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedIds.length} selected records?`)) {
                  onBatchDelete(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-none font-medium flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#dcdcdc] dark:bg-slate-800 border-b border-[#cccccc] dark:border-slate-700 text-[11px] font-bold text-[#333333] dark:text-slate-300 uppercase tracking-wider">
              <th className="py-3 px-4 w-10 border-r border-[#cccccc] dark:border-slate-700">
                <button
                  onClick={toggleSelectAll}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#0078d7] dark:text-sky-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-4 border-r border-[#cccccc] dark:border-slate-700">Date & Time</th>
              <th className="py-3 px-4 border-r border-[#cccccc] dark:border-slate-700">
                <div className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-[#0078d7]" />
                  <span>Blood Sugar ({userSettings.bloodSugarUnit})</span>
                </div>
              </th>
              <th className="py-3 px-4 border-r border-[#cccccc] dark:border-slate-700">
                <div className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  <span>Blood Pressure & Pulse</span>
                </div>
              </th>
              <th className="py-3 px-4 border-r border-[#cccccc] dark:border-slate-700">
                <div className="flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-sky-600" />
                  <span>Weight ({userSettings.weightUnit})</span>
                </div>
              </th>
              <th className="py-3 px-4 border-r border-[#cccccc] dark:border-slate-700">Notes & Remarks</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#cccccc] dark:divide-slate-800 text-xs">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">
                      No vitals records found
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      {searchQuery || startDate || endDate
                        ? 'Try clearing your search or date filters.'
                        : 'Click "Add Record" or "Import Excel" to start logging data.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((rec) => {
                const isSelected = selectedIds.includes(rec.id);

                // Blood Sugar Status
                const bsFormatted = formatBloodSugar(rec.bloodSugar, userSettings.bloodSugarUnit);
                const bsCat = rec.bloodSugar ? getBloodSugarCategory(rec.bloodSugar, rec.bloodSugarContext) : 'Unknown';
                const bsColors = getBloodSugarColor(bsCat);

                // Blood Pressure Status
                const bpCat = (rec.systolic && rec.diastolic) ? getBloodPressureCategory(rec.systolic, rec.diastolic) : 'Unknown';
                const bpColors = getBloodPressureColor(bpCat);

                // Weight
                const wtFormatted = formatWeight(rec.weight, userSettings.weightUnit);

                return (
                  <tr
                    key={rec.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleSelectRow(rec.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {rec.date}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {rec.time || '08:00'}
                      </div>
                    </td>

                    {/* Blood Sugar */}
                    <td className="py-3.5 px-4">
                      {rec.bloodSugar !== undefined ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {bsFormatted}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {rec.bloodSugarContext || 'Fasting'}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${bsColors.bg} ${bsColors.text} ${bsColors.border}`}
                            >
                              {bsCat}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Blood Pressure & Pulse */}
                    <td className="py-3.5 px-4">
                      {(rec.systolic && rec.diastolic) ? (
                        <div className="flex flex-col gap-1 items-start">
                          <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                            <span>{rec.systolic}/{rec.diastolic} <span className="text-xs font-normal text-slate-400">mmHg</span></span>
                            {rec.pulse && (
                              <span className="text-xs font-normal text-rose-500 font-mono">
                                ({rec.pulse} bpm)
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${bpColors.bg} ${bpColors.text} ${bpColors.border}`}
                          >
                            {bpCat}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Weight */}
                    <td className="py-3.5 px-4">
                      {rec.weight !== undefined ? (
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {wtFormatted}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                      {rec.notes || <span className="text-slate-400 italic">No notes</span>}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditRecord(rec)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this health record?')) {
                              onDeleteRecord(rec.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-[#e8e8e8]/80 dark:bg-slate-950/60 border-t border-[#cccccc] dark:border-slate-800 flex items-center justify-between text-xs text-[#333333] dark:text-slate-400">
        <div>
          Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-2.5 py-1 rounded-none border border-[#cccccc] dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-medium cursor-pointer"
          >
            Previous
          </button>
          <span className="px-2 font-bold text-[#333333] dark:text-slate-300">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-2.5 py-1 rounded-none border border-[#cccccc] dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-medium cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

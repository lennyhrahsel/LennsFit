import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Activity, Heart, Scale, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { HealthRecord, UserSettings } from '../types';
import {
  formatBloodSugar,
  formatWeight,
  getBloodPressureCategory,
  getBloodPressureColor,
  getBloodSugarCategory,
  getBloodSugarColor,
  convertBloodSugar,
  convertWeight
} from '../utils/healthCalculators';

interface AnalyticsChartsProps {
  records: HealthRecord[];
  userSettings: UserSettings;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ records, userSettings }) => {
  // Sort records chronologically (oldest to newest) for line charts
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => `${a.date}T${a.time || '00:00'}`.localeCompare(`${b.date}T${b.time || '00:00'}`));
  }, [records]);

  // Formatted chart data points
  const chartData = useMemo(() => {
    return sortedRecords.map((r) => {
      let bsDisplay: number | null = null;
      if (r.bloodSugar !== undefined) {
        bsDisplay = userSettings.bloodSugarUnit === 'mmol/L'
          ? Number((r.bloodSugar / 18.0182).toFixed(1))
          : r.bloodSugar;
      }

      let wtDisplay: number | null = null;
      if (r.weight !== undefined) {
        wtDisplay = userSettings.weightUnit === 'lbs'
          ? Number((r.weight * 2.20462).toFixed(1))
          : r.weight;
      }

      return {
        date: r.date,
        time: r.time || '08:00',
        label: `${r.date.slice(5)} ${r.time || ''}`,
        bloodSugar: bsDisplay,
        systolic: r.systolic || null,
        diastolic: r.diastolic || null,
        weight: wtDisplay,
        context: r.bloodSugarContext || 'Fasting'
      };
    });
  }, [sortedRecords, userSettings]);

  // Calculated Stats
  const bsList = records.filter((r) => r.bloodSugar !== undefined).map((r) => r.bloodSugar!);
  const avgBsMgDl = bsList.length > 0 ? Math.round(bsList.reduce((a, b) => a + b, 0) / bsList.length) : null;
  const avgBsCat = avgBsMgDl ? getBloodSugarCategory(avgBsMgDl, 'Fasting') : 'Unknown';
  const bsColors = getBloodSugarColor(avgBsCat);

  const bpList = records.filter((r) => r.systolic && r.diastolic);
  const avgSys = bpList.length > 0 ? Math.round(bpList.reduce((a, b) => a + b.systolic!, 0) / bpList.length) : null;
  const avgDia = bpList.length > 0 ? Math.round(bpList.reduce((a, b) => a + b.diastolic!, 0) / bpList.length) : null;
  const avgBpCat = (avgSys && avgDia) ? getBloodPressureCategory(avgSys, avgDia) : 'Unknown';
  const bpColors = getBloodPressureColor(avgBpCat);

  const wtList = records.filter((r) => r.weight !== undefined).map((r) => r.weight!);
  const avgWeightKg = wtList.length > 0 ? wtList.reduce((a, b) => a + b, 0) / wtList.length : null;

  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 p-12 text-center text-slate-400 rounded-none shadow-sm">
        <AlertCircle className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
        <p className="font-bold text-[#333333] dark:text-slate-200">No Analytics Available</p>
        <p className="text-xs text-slate-500">Log at least 1 record to generate trend charts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-[#333333] dark:text-slate-100">
      {/* 1. Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Blood Sugar Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 rounded-none p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#0078d7]" />
              Avg Blood Sugar
            </span>
            {avgBsCat !== 'Unknown' && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-none border ${bsColors.bg} ${bsColors.text} ${bsColors.border}`}>
                {avgBsCat}
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-[#333333] dark:text-white">
            {avgBsMgDl ? formatBloodSugar(avgBsMgDl, userSettings.bloodSugarUnit) : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Based on {bsList.length} blood glucose readings
          </p>
        </div>

        {/* Blood Pressure Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 rounded-none p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-600" />
              Avg Blood Pressure
            </span>
            {avgBpCat !== 'Unknown' && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-none border ${bpColors.bg} ${bpColors.text} ${bpColors.border}`}>
                {avgBpCat}
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-[#333333] dark:text-white">
            {(avgSys && avgDia) ? `${avgSys}/${avgDia} mmHg` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Based on {bpList.length} blood pressure readings
          </p>
        </div>

        {/* Weight Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 rounded-none p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-sky-600" />
              Avg Weight
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#cccccc]">
              {wtList.length} Entries
            </span>
          </div>
          <div className="text-2xl font-black text-[#333333] dark:text-white">
            {avgWeightKg ? formatWeight(avgWeightKg, userSettings.weightUnit) : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {records.length} total health logs saved
          </p>
        </div>
      </div>

      {/* 2. Blood Sugar Trend Chart */}
      <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 rounded-none p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#333333] dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0078d7]" />
              Blood Sugar Trend ({userSettings.bloodSugarUnit})
            </h3>
            <p className="text-xs text-slate-500">
              Target Fasting Range: {userSettings.bloodSugarUnit === 'mmol/L' ? '3.9 - 5.5 mmol/L' : '70 - 99 mg/dL'}
            </p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cccccc" />
              <XAxis dataKey="label" stroke="#666666" fontSize={10} tickLine={false} />
              <YAxis stroke="#666666" fontSize={10} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#333333',
                  borderColor: '#cccccc',
                  borderRadius: '0px',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
              />
              {/* Target Line */}
              <ReferenceLine
                y={userSettings.bloodSugarUnit === 'mmol/L' ? 5.5 : 100}
                stroke="#0078d7"
                strokeDasharray="4 4"
                label={{ value: 'Normal Target', fill: '#0078d7', fontSize: 10, position: 'top' }}
              />
              <Line
                type="monotone"
                dataKey="bloodSugar"
                name={`Blood Sugar (${userSettings.bloodSugarUnit})`}
                stroke="#0078d7"
                strokeWidth={2}
                dot={{ r: 4, fill: '#0078d7' }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Blood Pressure Trend Chart */}
      <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 rounded-none p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#333333] dark:text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              Blood Pressure Trend (Systolic & Diastolic mmHg)
            </h3>
            <p className="text-xs text-slate-500">
              Normal Target: Systolic &lt; 120, Diastolic &lt; 80 mmHg
            </p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cccccc" />
              <XAxis dataKey="label" stroke="#666666" fontSize={10} tickLine={false} />
              <YAxis stroke="#666666" fontSize={10} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#333333',
                  borderColor: '#cccccc',
                  borderRadius: '0px',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
              />
              <ReferenceLine
                y={120}
                stroke="#e11d48"
                strokeDasharray="3 3"
                label={{ value: 'Sys Target 120', fill: '#e11d48', fontSize: 10 }}
              />
              <ReferenceLine
                y={80}
                stroke="#0284c7"
                strokeDasharray="3 3"
                label={{ value: 'Dia Target 80', fill: '#0284c7', fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="systolic"
                name="Systolic (Top)"
                stroke="#e11d48"
                strokeWidth={2}
                dot={{ r: 4, fill: '#e11d48' }}
                activeDot={{ r: 6 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                name="Diastolic (Bottom)"
                stroke="#0284c7"
                strokeWidth={2}
                dot={{ r: 4, fill: '#0284c7' }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Weight Trend Chart */}
      {wtList.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-[#cccccc] dark:border-slate-800 rounded-none p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#333333] dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-sky-600" />
                Weight Progression ({userSettings.weightUnit})
              </h3>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cccccc" />
                <XAxis dataKey="label" stroke="#666666" fontSize={10} tickLine={false} />
                <YAxis stroke="#666666" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#333333',
                    borderColor: '#cccccc',
                    borderRadius: '0px',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name={`Weight (${userSettings.weightUnit})`}
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#0284c7' }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

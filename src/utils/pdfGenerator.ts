import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HealthRecord, UserSettings } from '../types';
import { formatBloodSugar, formatWeight, getBloodPressureCategory, getBloodSugarCategory } from './healthCalculators';

export interface PDFExportOptions {
  records: HealthRecord[];
  userSettings: UserSettings;
  title?: string;
  startDate?: string;
  endDate?: string;
  includeSummary?: boolean;
  notes?: string;
}

export function generateHealthPDFReport(options: PDFExportOptions) {
  const {
    records,
    userSettings,
    title = 'Health Vitals Log Report',
    startDate,
    endDate,
    includeSummary = true,
    notes: customNotes
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryColor = [16, 185, 129]; // Emerald 500
  const headerBgColor = [241, 245, 249]; // Slate 100
  const textColor = [30, 41, 59]; // Slate 800
  const mutedTextColor = [100, 116, 139]; // Slate 500

  // 1. Header Title Banner
  doc.setFillColor(15, 23, 42); // Dark Navy background
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Windows 10 Health Tracker Report', pageWidth - 14, 15, { align: 'right' });

  // Sub-header generated timestamp
  const dateTodayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated on: ${dateTodayStr}`, 14, 22);

  let startY = 36;

  // 2. Patient Info Block
  const pInfo = userSettings.patientInfo;
  doc.setFillColor(headerBgColor[0], headerBgColor[1], headerBgColor[2]);
  doc.roundedRect(14, startY, pageWidth - 28, 22, 2, 2, 'F');

  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Patient: ${pInfo.name || 'N/A'}`, 18, startY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Age: ${pInfo.age || 'N/A'}`, 18, startY + 14);
  doc.text(`Attending Doctor: ${pInfo.doctorName || 'N/A'}`, 80, startY + 7);

  const rangeText = (startDate || endDate)
    ? `${startDate || 'Start'} to ${endDate || 'Present'}`
    : `All Recorded Data (${records.length} entries)`;
  doc.text(`Log Range: ${rangeText}`, 80, startY + 14);

  startY += 28;

  // 3. Optional Summary KPIs Box
  if (includeSummary && records.length > 0) {
    // Calculate statistics
    const bsValid = records.filter(r => r.bloodSugar !== undefined).map(r => r.bloodSugar!);
    const avgBs = bsValid.length > 0 ? Math.round(bsValid.reduce((a, b) => a + b, 0) / bsValid.length) : null;

    const bpValid = records.filter(r => r.systolic && r.diastolic);
    const avgSys = bpValid.length > 0 ? Math.round(bpValid.reduce((a, b) => a + b!.systolic!, 0) / bpValid.length) : null;
    const avgDia = bpValid.length > 0 ? Math.round(bpValid.reduce((a, b) => a + b!.diastolic!, 0) / bpValid.length) : null;

    const wtValid = records.filter(r => r.weight !== undefined).map(r => r.weight!);
    const avgWt = wtValid.length > 0 ? (wtValid.reduce((a, b) => a + b, 0) / wtValid.length) : null;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Vitals Summary & Averages', 14, startY);

    startY += 4;

    const boxWidth = (pageWidth - 28 - 9) / 4;
    const boxHeight = 18;

    // KPI 1: Total Entries
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, startY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text('TOTAL LOGS', 17, startY + 5);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`${records.length}`, 17, startY + 13);

    // KPI 2: Avg Blood Sugar
    const kpi2X = 14 + boxWidth + 3;
    doc.roundedRect(kpi2X, startY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text(`AVG BLOOD SUGAR`, kpi2X + 3, startY + 5);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(avgBs ? formatBloodSugar(avgBs, userSettings.bloodSugarUnit) : 'N/A', kpi2X + 3, startY + 13);

    // KPI 3: Avg Blood Pressure
    const kpi3X = kpi2X + boxWidth + 3;
    doc.roundedRect(kpi3X, startY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text('AVG BLOOD PRESSURE', kpi3X + 3, startY + 5);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text((avgSys && avgDia) ? `${avgSys}/${avgDia} mmHg` : 'N/A', kpi3X + 3, startY + 13);

    // KPI 4: Avg Weight
    const kpi4X = kpi3X + boxWidth + 3;
    doc.roundedRect(kpi4X, startY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text('AVG WEIGHT', kpi4X + 3, startY + 5);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(avgWt ? formatWeight(avgWt, userSettings.weightUnit) : 'N/A', kpi4X + 3, startY + 13);

    startY += boxHeight + 8;
  }

  // Custom Report Notes if provided
  if (customNotes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Physician / Patient Notes:', 14, startY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text(customNotes, 14, startY + 5, { maxWidth: pageWidth - 28 });
    startY += 12;
  }

  // 4. Data Table via autoTable
  const tableData = records.map((r) => {
    const bsFormatted = formatBloodSugar(r.bloodSugar, userSettings.bloodSugarUnit);
    const bsCat = r.bloodSugar ? getBloodSugarCategory(r.bloodSugar, r.bloodSugarContext) : '';
    const bsFull = r.bloodSugar ? `${bsFormatted} (${r.bloodSugarContext || 'Fasting'})${bsCat !== 'Normal' ? ` [${bsCat}]` : ''}` : '-';

    const bpStr = (r.systolic && r.diastolic) ? `${r.systolic}/${r.diastolic} mmHg` : '-';
    const bpCat = (r.systolic && r.diastolic) ? getBloodPressureCategory(r.systolic, r.diastolic) : '';
    const bpFull = (r.systolic && r.diastolic) ? `${bpStr}${bpCat !== 'Normal' ? ` [${bpCat}]` : ''}` : '-';

    const wtFormatted = formatWeight(r.weight, userSettings.weightUnit);

    return [
      r.date,
      r.time || '08:00',
      bsFull,
      bpFull,
      wtFormatted,
      r.notes || '-'
    ];
  });

  autoTable(doc, {
    startY: startY,
    head: [['Date', 'Time', `Blood Sugar (${userSettings.bloodSugarUnit})`, 'Blood Pressure', `Weight (${userSettings.weightUnit})`, 'Notes']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 22 }, // Date
      1: { cellWidth: 16 }, // Time
      2: { cellWidth: 42 }, // Blood Sugar
      3: { cellWidth: 38 }, // Blood Pressure
      4: { cellWidth: 24 }, // Weight
      5: { cellWidth: 'auto' } // Notes
    },
    margin: { left: 14, right: 14, bottom: 18 },
    didDrawPage: (data) => {
      // Page number footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
      doc.text(
        `Page ${data.pageNumber} of ${totalPages} - Confidential Health Document`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }
  });

  // Trigger file download
  const dateSlug = startDate || dateTodayStr.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Health_Report_${pInfo.name ? pInfo.name.replace(/\s+/g, '_') : 'Patient'}_${dateSlug}.pdf`);
}

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as XLSX from 'xlsx';

/**
 * Generate sample DOCX file (minimal valid DOCX).
 * Since creating a real DOCX in the browser is complex, we generate a minimal one
 * using the docx XML format (which is what the format actually is - a ZIP of XML).
 */

/**
 * Generate a sample XLSX file with various data patterns for testing.
 */
export function generateSampleXlsx(rows: number = 50, cols: number = 8): Uint8Array {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Normal data
  const headers = Array.from({ length: cols }, (_, i) => `Column ${String.fromCharCode(65 + i)}`);
  const data = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      if (c === 0) return `Row ${r + 1}`;
      if (c === 1) return Math.round(Math.random() * 10000) / 100;
      if (c === 2) return new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      if (c === 3) return ['Active', 'Pending', 'Closed', 'Draft'][Math.floor(Math.random() * 4)];
      return `Data ${r + 1}-${c + 1}`;
    })
  );

  const ws1 = XLSX.utils.aoa_to_sheet([headers, ...data]);
  XLSX.utils.book_append_sheet(wb, ws1, 'Data');

  // Sheet 2: Wide table (for landscape testing)
  const wideHeaders = Array.from({ length: 15 }, (_, i) => `Col ${i + 1}`);
  const wideData = Array.from({ length: 20 }, (_, r) =>
    Array.from({ length: 15 }, (_, c) => `R${r + 1}C${c + 1}`)
  );
  const ws2 = XLSX.utils.aoa_to_sheet([wideHeaders, ...wideData]);
  XLSX.utils.book_append_sheet(wb, ws2, 'Wide Table');

  // Sheet 3: Summary
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Rows', rows],
    ['Total Columns', cols],
    ['Generated', new Date().toISOString()],
    ['Purpose', 'Document Conversion Spike Test'],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Summary');

  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(buf);
}

/**
 * Generate a sample PDF for reference.
 */
export async function generateSamplePdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([595, 842]);
  const { height } = page.getSize();

  page.drawText('Sample Document', {
    x: 50,
    y: height - 60,
    size: 24,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.3),
  });

  page.drawText('This is a sample PDF generated for the Document Conversion spike.', {
    x: 50,
    y: height - 100,
    size: 12,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  const lines = [
    'Features tested:',
    '• DOCX to PDF conversion (mammoth + html2canvas + jsPDF)',
    '• XLSX to PDF conversion (SheetJS + jspdf-autotable)',
    '• Image to PDF conversion (pdf-lib)',
    '• PPTX to PDF conversion (server-side LibreOffice)',
    '• Smart sizing for wide spreadsheets',
    '• Large file handling',
  ];

  lines.forEach((line, i) => {
    page.drawText(line, {
      x: 50,
      y: height - 140 - i * 22,
      size: 11,
      font: line.startsWith('•') ? font : boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return doc.save();
}

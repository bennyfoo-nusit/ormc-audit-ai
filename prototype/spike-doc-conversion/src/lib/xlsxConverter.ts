import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ConversionResult {
  pdfBytes: Uint8Array;
  pageCount: number;
  warnings: string[];
  duration: number;
}

export interface SheetInfo {
  name: string;
  rows: number;
  cols: number;
}

// Minimum readable column width in mm (at 6 pt font ≈ 4–5 chars per line)
const MIN_COL_WIDTH_MM = 18;
// Page margins
const MARGIN_MM = 10;

/**
 * Convert XLSX/XLS/CSV file to PDF using SheetJS + jspdf-autotable.
 * Fully client-side with:
 *  - smart orientation / page-size selection
 *  - horizontal column splitting when columns exceed the page width
 *  - overflow: linebreak to wrap long cell text
 *  - no content truncation — every cell value is fully readable
 */
export async function convertXlsxToPdf(file: File): Promise<ConversionResult> {
  const start = performance.now();
  const warnings: string[] = [];

  // 1. Read the file
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  if (workbook.SheetNames.length === 0) {
    throw new Error('Workbook contains no sheets');
  }

  // 2. Parse every sheet into header + rows
  const sheetData: Array<{
    name: string;
    headers: string[];
    rows: string[][];
    colCount: number;
    rowCount: number;
  }> = [];

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    if (!ws['!ref']) {
      warnings.push(`Sheet "${sheetName}" is empty, skipping`);
      continue;
    }

    const jsonData = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
    if (jsonData.length === 0) continue;

    const headers = (jsonData[0] || []).map(String);
    const rows = jsonData.slice(1).map((row) =>
      row.map((cell) => (cell != null ? String(cell) : ''))
    );

    sheetData.push({
      name: sheetName,
      headers,
      rows,
      colCount: headers.length,
      rowCount: rows.length,
    });
  }

  if (sheetData.length === 0) {
    throw new Error('No data found in workbook');
  }

  // 3. Determine orientation / page size from the widest sheet
  const maxCols = Math.max(...sheetData.map((s) => s.colCount));
  const orientation: 'p' | 'l' = maxCols > 6 ? 'l' : 'p';
  const pageSize: 'a4' | 'a3' = maxCols > 12 ? 'a3' : 'a4';

  if (maxCols > 6) {
    warnings.push(
      `Wide spreadsheet (${maxCols} cols) — using ${orientation === 'l' ? 'landscape' : 'portrait'} ${pageSize.toUpperCase()}`
    );
  }

  // 4. Usable page width after margins
  const pageDims = getPageDims(orientation, pageSize);
  const usableWidth = pageDims.w - 2 * MARGIN_MM;

  // 5. Create PDF
  const pdf = new jsPDF(orientation, 'mm', pageSize);
  let isFirstPage = true;

  for (const sheet of sheetData) {
    // Determine how many columns fit per horizontal "page group"
    const maxColsPerGroup = Math.max(
      1,
      Math.floor(usableWidth / MIN_COL_WIDTH_MM)
    );

    const needsSplit = sheet.colCount > maxColsPerGroup;

    // Build column groups.  Group 0 always includes the first column as a
    // row-identifier that is repeated on every horizontal split page.
    const groups = buildColumnGroups(
      sheet.colCount,
      maxColsPerGroup,
      needsSplit
    );

    if (needsSplit) {
      warnings.push(
        `Sheet "${sheet.name}" has ${sheet.colCount} columns — split into ${groups.length} horizontal page groups`
      );
    }

    for (let gi = 0; gi < groups.length; gi++) {
      const colIndices = groups[gi];

      if (!isFirstPage) pdf.addPage();
      isFirstPage = false;

      // Sheet title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const groupLabel =
        groups.length > 1 ? ` (columns ${gi + 1}/${groups.length})` : '';
      pdf.text(`Sheet: ${sheet.name}${groupLabel}`, MARGIN_MM + 4, 15);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `${sheet.rowCount} rows × ${sheet.colCount} columns`,
        MARGIN_MM + 4,
        21
      );

      const fontSize = smartFontSize(colIndices.length);

      // Extract the subset of headers / row data for this group
      const groupHeaders = colIndices.map((ci) => sheet.headers[ci] ?? '');
      const groupRows = sheet.rows.map((row) =>
        colIndices.map((ci) => row[ci] ?? '')
      );

      autoTable(pdf, {
        head: [groupHeaders],
        body: groupRows,
        startY: 25,
        styles: {
          fontSize,
          cellPadding: colIndices.length > 10 ? 1 : 2,
          overflow: 'linebreak', // wrap long text — never truncate
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          fontSize,
        },
        columnStyles: buildColumnStyles(groupHeaders, groupRows),
        margin: {
          top: 25,
          right: MARGIN_MM,
          bottom: 15,
          left: MARGIN_MM,
        },
        tableWidth: 'auto',
        didDrawPage: () => {
          const pageNum = pdf.getNumberOfPages();
          pdf.setFontSize(8);
          pdf.setTextColor(150);
          pdf.text(
            `Page ${pageNum} | ${sheet.name}${groupLabel}`,
            MARGIN_MM,
            pageDims.h - 8
          );
          pdf.setTextColor(0);
        },
      });
    }

    if (sheet.rowCount > 1000) {
      warnings.push(
        `Sheet "${sheet.name}" has ${sheet.rowCount} rows — PDF may be large`
      );
    }
  }

  const pageCount = pdf.getNumberOfPages();
  const pdfBytes = pdf.output('arraybuffer');
  const duration = performance.now() - start;

  return {
    pdfBytes: new Uint8Array(pdfBytes),
    pageCount,
    warnings,
    duration,
  };
}

/**
 * Get sheet information from a spreadsheet file.
 */
export async function getSheetInfo(file: File): Promise<SheetInfo[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  return workbook.SheetNames.map((name) => {
    const ws = workbook.Sheets[name];
    const range = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']) : null;
    return {
      name,
      rows: range ? range.e.r - range.s.r + 1 : 0,
      cols: range ? range.e.c - range.s.c + 1 : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPageDims(
  orientation: 'p' | 'l',
  size: 'a4' | 'a3'
): { w: number; h: number } {
  const dims = size === 'a3' ? { w: 297, h: 420 } : { w: 210, h: 297 };
  return orientation === 'l' ? { w: dims.h, h: dims.w } : dims;
}

function smartFontSize(colCount: number): number {
  if (colCount <= 5) return 10;
  if (colCount <= 8) return 9;
  if (colCount <= 12) return 8;
  if (colCount <= 16) return 7;
  return 6;
}

/**
 * Split columns into horizontal page groups.
 * When splitting, column 0 is repeated in every group as a row identifier.
 */
function buildColumnGroups(
  totalCols: number,
  maxPerGroup: number,
  needsSplit: boolean
): number[][] {
  if (!needsSplit) {
    return [Array.from({ length: totalCols }, (_, i) => i)];
  }

  const groups: number[][] = [];
  // Reserve 1 slot for the repeated row-identifier column (col 0)
  const dataColsPerGroup = Math.max(1, maxPerGroup - 1);
  let col = 1; // data columns start at 1

  while (col < totalCols) {
    const end = Math.min(col + dataColsPerGroup, totalCols);
    const group: number[] = [0]; // always include col 0
    for (let c = col; c < end; c++) group.push(c);
    groups.push(group);
    col = end;
  }

  return groups;
}

/**
 * Per-column style: cap very wide text columns at 50 mm so they
 * don't steal all the space, but ensure linebreak wrapping is used.
 */
function buildColumnStyles(
  headers: string[],
  rows: string[][]
): Record<number, { cellWidth: number | 'auto'; overflow: 'linebreak' }> {
  const styles: Record<
    number,
    { cellWidth: number | 'auto'; overflow: 'linebreak' }
  > = {};
  const sampleRows = rows.slice(0, Math.min(100, rows.length));

  for (let i = 0; i < headers.length; i++) {
    const maxLen = Math.max(
      headers[i].length,
      ...sampleRows.map((r) => (r[i] || '').length)
    );
    styles[i] = {
      cellWidth: maxLen > 60 ? 50 : 'auto',
      overflow: 'linebreak',
    };
  }
  return styles;
}

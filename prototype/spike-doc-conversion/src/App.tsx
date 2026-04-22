import { useState, useCallback } from 'react';
import { convertDocxToPdf, convertDocxToHtml } from './lib/docxConverter';
import { convertXlsxToPdf, getSheetInfo, type SheetInfo } from './lib/xlsxConverter';
import { convertImageToPdf } from './lib/imageConverter';
import { generateSampleXlsx } from './lib/sampleFiles';

type FileType = 'docx' | 'xlsx' | 'image' | 'pptx' | 'unknown';
type ConversionStatus = 'idle' | 'converting' | 'success' | 'error';

interface ConversionLog {
  timestamp: Date;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  status: 'success' | 'error';
  duration?: number;
  pageCount?: number;
  pdfSize?: number;
  warnings: string[];
  error?: string;
}

function detectFileType(file: File): FileType {
  const ext = file.name.toLowerCase().split('.').pop() || '';
  const mimeMap: Record<string, FileType> = {
    docx: 'docx',
    doc: 'docx',
    xlsx: 'xlsx',
    xls: 'xlsx',
    csv: 'xlsx',
    ods: 'xlsx',
    pptx: 'pptx',
    ppt: 'pptx',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    bmp: 'image',
    tiff: 'image',
    tif: 'image',
    svg: 'image',
  };
  return mimeMap[ext] || 'unknown';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export default function App() {
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>('unknown');
  const [statusMessage, setStatusMessage] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);
  const [sheetInfo, setSheetInfo] = useState<SheetInfo[] | null>(null);
  const [logs, setLogs] = useState<ConversionLog[]>([]);
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);

  // Check if conversion server is running
  const checkServer = useCallback(async () => {
    try {
      const resp = await fetch('/api/health');
      setServerAvailable(resp.ok);
    } catch {
      setServerAvailable(false);
    }
  }, []);

  // Auto-check server on mount
  useState(() => {
    checkServer();
  });

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSelectedFile(file);
      const type = detectFileType(file);
      setFileType(type);
      setPdfUrl(null);
      setPdfBytes(null);
      setHtmlPreview(null);
      setSheetInfo(null);
      setStatus('idle');
      setStatusMessage(`Selected: ${file.name} (${formatBytes(file.size)}) — Type: ${type}`);

      // Get preview info
      if (type === 'docx') {
        try {
          const { html } = await convertDocxToHtml(file);
          setHtmlPreview(html);
        } catch {
          /* ignore preview errors */
        }
      } else if (type === 'xlsx') {
        try {
          const info = await getSheetInfo(file);
          setSheetInfo(info);
        } catch {
          /* ignore preview errors */
        }
      }
    },
    []
  );

  const handleConvert = useCallback(async () => {
    if (!selectedFile) return;

    setStatus('converting');
    setStatusMessage(`Converting ${selectedFile.name}...`);
    setPdfUrl(null);
    setPdfBytes(null);

    try {
      let result: {
        pdfBytes: Uint8Array;
        pageCount: number;
        warnings: string[];
        duration: number;
      };

      switch (fileType) {
        case 'docx':
          result = await convertDocxToPdf(selectedFile);
          break;
        case 'xlsx':
          result = await convertXlsxToPdf(selectedFile);
          break;
        case 'image':
          result = await convertImageToPdf(selectedFile);
          break;
        case 'pptx':
          // Try server-side conversion
          if (!serverAvailable) {
            throw new Error(
              'PPTX conversion requires the server. Run: npm run server'
            );
          }
          result = await convertViaServer(selectedFile);
          break;
        default:
          if (serverAvailable) {
            result = await convertViaServer(selectedFile);
          } else {
            throw new Error(
              `Unsupported file type. Start the conversion server for universal format support.`
            );
          }
      }

      // Create blob URL for preview
      const blob = new Blob([result.pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfBytes(result.pdfBytes);

      const log: ConversionLog = {
        timestamp: new Date(),
        fileName: selectedFile.name,
        fileType,
        fileSize: selectedFile.size,
        status: 'success',
        duration: result.duration,
        pageCount: result.pageCount,
        pdfSize: result.pdfBytes.length,
        warnings: result.warnings,
      };
      setLogs((prev) => [log, ...prev]);

      setStatus('success');
      setStatusMessage(
        `✅ Converted in ${formatDuration(result.duration)} — ` +
          `${result.pageCount} page(s), ${formatBytes(result.pdfBytes.length)} — ` +
          (result.warnings.length > 0
            ? `${result.warnings.length} warning(s)`
            : 'No warnings')
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const log: ConversionLog = {
        timestamp: new Date(),
        fileName: selectedFile.name,
        fileType,
        fileSize: selectedFile.size,
        status: 'error',
        warnings: [],
        error: errorMsg,
      };
      setLogs((prev) => [log, ...prev]);
      setStatus('error');
      setStatusMessage(`❌ Error: ${errorMsg}`);
    }
  }, [selectedFile, fileType, serverAvailable]);

  const handleDownload = useCallback(() => {
    if (!pdfBytes || !selectedFile) return;
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name.replace(/\.[^.]+$/, '.pdf');
    a.click();
    URL.revokeObjectURL(url);
  }, [pdfBytes, selectedFile]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0, height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ background: '#1a1a2e', color: '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>📄 Document Conversion Spike</h1>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          DOCX • XLSX • Images • PPTX (server)
        </span>
        <div style={{ marginLeft: 'auto', fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: serverAvailable ? '#4caf50' : '#f44336', display: 'inline-block' }} />
          Server: {serverAvailable === null ? 'checking...' : serverAvailable ? 'online' : 'offline'}
          <button onClick={checkServer} style={{ fontSize: 11, padding: '2px 8px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none', borderRadius: 3 }}>
            Retry
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left panel - Controls */}
        <div style={{ width: 380, padding: 20, overflowY: 'auto', borderRight: '1px solid #ddd', background: '#fff' }}>
          {/* File input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Select a file to convert:
            </label>
            <input
              type="file"
              accept=".docx,.doc,.xlsx,.xls,.csv,.ods,.pptx,.ppt,.png,.jpg,.jpeg,.gif,.webp,.bmp,.tiff,.tif"
              onChange={handleFileSelect}
              style={{ width: '100%', fontSize: 13 }}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              <button
                onClick={() => {
                  const bytes = generateSampleXlsx(50, 8);
                  const file = new File([bytes], 'sample-50rows.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  handleFileSelect({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>);
                }}
                style={{ fontSize: 11, padding: '4px 8px', cursor: 'pointer', background: '#217346', color: '#fff', border: 'none', borderRadius: 3 }}
              >
                Sample XLSX (50 rows)
              </button>
              <button
                onClick={() => {
                  const bytes = generateSampleXlsx(500, 15);
                  const file = new File([bytes], 'sample-wide-500rows.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  handleFileSelect({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>);
                }}
                style={{ fontSize: 11, padding: '4px 8px', cursor: 'pointer', background: '#1b5e20', color: '#fff', border: 'none', borderRadius: 3 }}
              >
                Wide XLSX (500×15)
              </button>
              <button
                onClick={() => {
                  const bytes = generateSampleXlsx(2000, 8);
                  const file = new File([bytes], 'sample-large-2000rows.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  handleFileSelect({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>);
                }}
                style={{ fontSize: 11, padding: '4px 8px', cursor: 'pointer', background: '#004d40', color: '#fff', border: 'none', borderRadius: 3 }}
              >
                Large XLSX (2000 rows)
              </button>
            </div>
          </div>

          {/* File info */}
          {selectedFile && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f8f9fa', borderRadius: 6, fontSize: 13 }}>
              <div><strong>File:</strong> {selectedFile.name}</div>
              <div><strong>Size:</strong> {formatBytes(selectedFile.size)}</div>
              <div><strong>Type:</strong> <TypeBadge type={fileType} /></div>
              {sheetInfo && (
                <div style={{ marginTop: 8 }}>
                  <strong>Sheets:</strong>
                  <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
                    {sheetInfo.map((s) => (
                      <li key={s.name}>
                        {s.name} ({s.rows}×{s.cols})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Convert button */}
          <button
            onClick={handleConvert}
            disabled={!selectedFile || status === 'converting'}
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              background: status === 'converting' ? '#999' : '#2980b9',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: selectedFile && status !== 'converting' ? 'pointer' : 'not-allowed',
              marginBottom: 12,
            }}
          >
            {status === 'converting' ? '⏳ Converting...' : '🔄 Convert to PDF'}
          </button>

          {/* Status */}
          {statusMessage && (
            <div
              style={{
                padding: 10,
                borderRadius: 6,
                fontSize: 12,
                lineHeight: 1.5,
                marginBottom: 12,
                background:
                  status === 'success' ? '#e8f5e9' : status === 'error' ? '#ffebee' : '#e3f2fd',
                color:
                  status === 'success' ? '#2e7d32' : status === 'error' ? '#c62828' : '#1565c0',
                wordBreak: 'break-word',
              }}
            >
              {statusMessage}
            </div>
          )}

          {/* Download button */}
          {pdfBytes && (
            <button
              onClick={handleDownload}
              style={{
                width: '100%',
                padding: '8px 16px',
                fontSize: 13,
                background: '#27ae60',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                marginBottom: 16,
              }}
            >
              💾 Download PDF ({formatBytes(pdfBytes.length)})
            </button>
          )}

          {/* Conversion log */}
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 14, marginBottom: 8 }}>Conversion Log</h3>
            {logs.length === 0 ? (
              <div style={{ fontSize: 12, color: '#999' }}>No conversions yet</div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    padding: 8,
                    marginBottom: 6,
                    borderRadius: 4,
                    background: log.status === 'success' ? '#f1f8e9' : '#fce4ec',
                    fontSize: 11,
                    lineHeight: 1.5,
                  }}
                >
                  <div>
                    <strong>{log.fileName}</strong>{' '}
                    <TypeBadge type={log.fileType} />
                  </div>
                  <div>
                    {log.status === 'success'
                      ? `✅ ${formatDuration(log.duration!)} · ${log.pageCount} pg · ${formatBytes(log.pdfSize!)}`
                      : `❌ ${log.error}`}
                  </div>
                  {log.warnings.length > 0 && (
                    <div style={{ color: '#e65100' }}>
                      ⚠ {log.warnings.length} warning(s)
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Supported formats */}
          <div style={{ marginTop: 20, padding: 12, background: '#f5f5f5', borderRadius: 6, fontSize: 11 }}>
            <h4 style={{ margin: '0 0 6px', fontSize: 12 }}>Supported Formats</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '2px 4px' }}><TypeBadge type="docx" /></td>
                  <td style={{ padding: '2px 4px' }}>.docx, .doc</td>
                  <td style={{ padding: '2px 4px', color: '#4caf50' }}>Client ✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 4px' }}><TypeBadge type="xlsx" /></td>
                  <td style={{ padding: '2px 4px' }}>.xlsx, .xls, .csv, .ods</td>
                  <td style={{ padding: '2px 4px', color: '#4caf50' }}>Client ✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 4px' }}><TypeBadge type="image" /></td>
                  <td style={{ padding: '2px 4px' }}>.png, .jpg, .gif, .webp</td>
                  <td style={{ padding: '2px 4px', color: '#4caf50' }}>Client ✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 4px' }}><TypeBadge type="pptx" /></td>
                  <td style={{ padding: '2px 4px' }}>.pptx, .ppt</td>
                  <td style={{ padding: '2px 4px', color: '#ff9800' }}>Server ⚡</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel - Preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              style={{ flex: 1, border: 'none', width: '100%' }}
              title="PDF Preview"
            />
          ) : htmlPreview ? (
            <div style={{ flex: 1, overflow: 'auto', padding: 20, background: '#fff' }}>
              <div
                style={{
                  maxWidth: 800,
                  margin: '0 auto',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
              />
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: 16,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                <div>Select a file and convert to see the PDF preview</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: FileType }) {
  const colors: Record<FileType, string> = {
    docx: '#2b579a',
    xlsx: '#217346',
    image: '#7b1fa2',
    pptx: '#d24726',
    unknown: '#757575',
  };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 6px',
        borderRadius: 3,
        fontSize: 10,
        fontWeight: 600,
        color: '#fff',
        background: colors[type],
        textTransform: 'uppercase',
      }}
    >
      {type}
    </span>
  );
}

/**
 * Convert via the server-side LibreOffice endpoint.
 */
async function convertViaServer(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const start = performance.now();
  const resp = await fetch('/api/convert', {
    method: 'POST',
    body: formData,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Server error: ${text}`);
  }

  const pdfBytes = new Uint8Array(await resp.arrayBuffer());
  const duration = performance.now() - start;
  const pageCountHeader = resp.headers.get('X-Page-Count');

  return {
    pdfBytes,
    pageCount: pageCountHeader ? parseInt(pageCountHeader, 10) : 1,
    warnings: ['Converted via server-side LibreOffice'],
    duration,
  };
}

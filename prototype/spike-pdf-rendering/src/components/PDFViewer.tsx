import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure the pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface PDFViewerProps {
  file: string
  pageNumber: number
  scale: number
  onLoadSuccess: (data: { numPages: number }) => void
  onLoadError: (error: Error) => void
}

export function PDFViewer({ file, pageNumber, scale, onLoadSuccess, onLoadError }: PDFViewerProps) {
  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      loading={<div style={{ padding: 40, textAlign: 'center' }}>Loading PDF...</div>}
    >
      <Page
        pageNumber={pageNumber}
        scale={scale}
        renderTextLayer={true}
        renderAnnotationLayer={true}
      />
    </Document>
  )
}

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import libre from 'libreoffice-convert';
import { promisify } from 'util';

const convertAsync = promisify(libre.convert);

const app = express();
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', engine: 'libreoffice' });
});

app.post('/api/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).send('No file uploaded');
    return;
  }

  const startTime = Date.now();
  console.log(
    `Converting: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`
  );

  try {
    const pdfBuf = await convertAsync(req.file.buffer, '.pdf', undefined);
    const duration = Date.now() - startTime;

    console.log(
      `✅ Converted in ${duration}ms → ${(pdfBuf.length / 1024).toFixed(1)} KB`
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${req.file.originalname.replace(/\.[^.]+$/, '.pdf')}"`
    );
    res.setHeader('X-Conversion-Time', String(duration));
    res.send(pdfBuf);
  } catch (err) {
    console.error('❌ Conversion failed:', err);
    res.status(500).send(
      `Conversion failed: ${err instanceof Error ? err.message : String(err)}. ` +
        'Ensure LibreOffice is installed.'
    );
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Conversion server running on http://localhost:${PORT}`);
  console.log('   Requires LibreOffice installed for PPTX/universal conversion');
});

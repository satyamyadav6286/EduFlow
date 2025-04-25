import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import cors from 'cors';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
}));

// Create certificates directory if it doesn't exist
const certificatesDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true, mode: 0o777 });
  console.log(`Created certificates directory: ${certificatesDir}`);
} else {
  console.log(`Certificates directory exists: ${certificatesDir}`);
}

// Set permissions
try {
  fs.chmodSync(certificatesDir, 0o777);
  console.log(`Updated certificates directory permissions: ${certificatesDir}`);
} catch (err) {
  console.warn(`Warning: Could not update directory permissions: ${err.message}`);
}

// Serve certificate files directly
app.get('/certificates/:certificateId', (req, res) => {
  const { certificateId } = req.params;

  // Security check
  if (!certificateId || certificateId.includes('/') || certificateId.includes('\\')) {
    return res.status(400).send('Invalid certificate ID');
  }

  // Build path to certificate file
  const pdfPath = path.join(certificatesDir, `${certificateId}.pdf`);
  console.log(`Looking for certificate at: ${pdfPath}`);

  // Check if file exists
  if (!fs.existsSync(pdfPath)) {
    console.log(`Certificate file not found: ${pdfPath}`);
    
    // Create placeholder PDF
    const placeholderPdf = '%PDF-1.5\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[]/Count 0>>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \ntrailer\n<</Size 3/Root 1 0 R>>\nstartxref\n101\n%%EOF\n';
    
    try {
      fs.writeFileSync(pdfPath, placeholderPdf);
      fs.chmodSync(pdfPath, 0o666);
      console.log(`Created placeholder certificate: ${pdfPath}`);
    } catch (err) {
      console.error(`Could not create placeholder certificate: ${err.message}`);
      return res.status(404).send('Certificate not found and could not create placeholder');
    }
  }

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="Certificate_${certificateId}.pdf"`);
  res.setHeader('Cache-Control', 'no-cache');

  // Stream the file
  const fileStream = fs.createReadStream(pdfPath);
  fileStream.pipe(res);

  // Handle stream errors
  fileStream.on('error', (err) => {
    console.error(`Error streaming certificate: ${err}`);
    if (!res.headersSent) {
      res.status(500).send('Error reading certificate file');
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Certificate server is running. Use /certificates/[CERTIFICATE_ID] to access certificates.');
});

// Start server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Certificate server running on port ${PORT}`);
  console.log(`Access certificates at: http://localhost:${PORT}/certificates/[CERTIFICATE_ID]`);
});

export default app; 
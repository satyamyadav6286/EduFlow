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

// Configure CORS - allow from any origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Create certificates directory if it doesn't exist
const certificatesDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true, mode: 0o777 });
  console.log(`Created certificates directory: ${certificatesDir}`);
} else {
  console.log(`Certificates directory exists: ${certificatesDir}`);
  try {
    fs.chmodSync(certificatesDir, 0o777);
    console.log(`Updated certificates directory permissions: ${certificatesDir}`);
  } catch (err) {
    console.warn(`Warning: Could not update directory permissions: ${err.message}`);
  }
}

// Define special certificate IDs
const SPECIAL_CERTIFICATES = {
  'C97194F1A153B675': 'Python for Beginners',
  '9D2B55F0DD51AE83': 'React JS Development',
  // Add any other specific certificates here
};

// Create placeholder PDF content - a minimal valid PDF
const createPlaceholderPDF = (certificateId, courseName = 'EduFlow Course') => {
  // This creates a minimal but valid PDF structure with some text
  return `%PDF-1.5
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Kids[3 0 R]/Count 1>>
endobj
3 0 obj
<</Type/Page/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/MediaBox[0 0 612 792]/Contents 5 0 R>>
endobj
4 0 obj
<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>
endobj
5 0 obj
<</Length 170>>
stream
BT
/F1 24 Tf
50 700 Td
(Certificate of Completion) Tj
/F1 18 Tf
0 -50 Td
(${courseName}) Tj
/F1 14 Tf
0 -30 Td
(Certificate ID: ${certificateId}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
0000000222 00000 n
0000000289 00000 n
trailer
<</Size 6/Root 1 0 R>>
startxref
510
%%EOF`;
};

// Ensure all special certificates exist
Object.entries(SPECIAL_CERTIFICATES).forEach(([certificateId, courseName]) => {
  const pdfPath = path.join(certificatesDir, `${certificateId}.pdf`);
  
  if (!fs.existsSync(pdfPath)) {
    console.log(`Creating special certificate: ${certificateId} for ${courseName}`);
    fs.writeFileSync(pdfPath, createPlaceholderPDF(certificateId, courseName));
    fs.chmodSync(pdfPath, 0o666);
  } else {
    console.log(`Special certificate already exists: ${certificateId}`);
  }
});

// Serve static certificate files
app.use('/certificates', express.static(certificatesDir, {
  setHeaders: (res) => {
    res.set('Content-Type', 'application/pdf');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Direct certificate endpoint - for handling specific course IDs (e.g., the Python course)
app.get('/courses/:courseId/certificate', (req, res) => {
  const { courseId } = req.params;
  console.log(`Request for course certificate: ${courseId}`);
  
  // Map for course ID to certificate ID
  const courseMap = {
    '67db3f15ff35889914dfc30b': 'C97194F1A153B675', // Python Course
    '67db418065f818f18e216e23': '9D2B55F0DD51AE83'  // React Course
  };
  
  // Get certificate ID for this course (if known)
  const certificateId = courseMap[courseId];
  
  if (!certificateId) {
    return res.status(404).send(`No certificate found for course: ${courseId}`);
  }
  
  // Redirect to the certificate file
  res.redirect(`/certificates/${certificateId}`);
});

// Handle direct certificate access by ID
app.get('/certificates/:certificateId', (req, res) => {
  const { certificateId } = req.params;
  
  // Security check for path traversal
  if (!certificateId || certificateId.includes('/') || certificateId.includes('\\')) {
    return res.status(400).send('Invalid certificate ID');
  }
  
  const pdfPath = path.join(certificatesDir, `${certificateId}.pdf`);
  console.log(`Looking for certificate at: ${pdfPath}`);
  
  // Check if file exists
  if (!fs.existsSync(pdfPath)) {
    console.log(`Certificate file not found: ${pdfPath}`);
    
    // If this is a special certificate, create it
    if (SPECIAL_CERTIFICATES[certificateId]) {
      const courseName = SPECIAL_CERTIFICATES[certificateId];
      console.log(`Creating special certificate: ${certificateId} for ${courseName}`);
      
      try {
        fs.writeFileSync(pdfPath, createPlaceholderPDF(certificateId, courseName));
        fs.chmodSync(pdfPath, 0o666);
        console.log(`Created certificate file: ${pdfPath}`);
      } catch (err) {
        console.error(`Error creating certificate file: ${err.message}`);
        return res.status(500).send('Failed to create certificate');
      }
    } else {
      // For other certificates, create a generic placeholder
      try {
        fs.writeFileSync(pdfPath, createPlaceholderPDF(certificateId));
        fs.chmodSync(pdfPath, 0o666);
        console.log(`Created generic certificate: ${pdfPath}`);
      } catch (err) {
        console.error(`Error creating generic certificate: ${err.message}`);
        return res.status(404).send('Certificate not found');
      }
    }
  }
  
  // Set response headers for PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="EduFlow_Certificate_${certificateId}.pdf"`);
  
  // Stream the file
  const fileStream = fs.createReadStream(pdfPath);
  fileStream.pipe(res);
  
  // Handle stream errors
  fileStream.on('error', (err) => {
    console.error(`Error streaming certificate: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).send('Error reading certificate file');
    }
  });
});

// Root endpoint with instructions
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>EduFlow Certificate Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          code { background: #f4f4f4; padding: 2px 5px; border-radius: 4px; }
          pre { background: #f8f8f8; padding: 10px; border-radius: 4px; overflow: auto; }
          h3 { margin-top: 30px; }
        </style>
      </head>
      <body>
        <h1>EduFlow Certificate Server</h1>
        <p>This server provides direct access to course certificates.</p>
        
        <h3>Available Endpoints:</h3>
        <ul>
          <li><code>/certificates/{certificateId}</code> - Get a certificate by ID</li>
          <li><code>/courses/{courseId}/certificate</code> - Get a certificate for a specific course</li>
        </ul>
        
        <h3>Special Certificates:</h3>
        <ul>
          ${Object.entries(SPECIAL_CERTIFICATES).map(([id, course]) => 
            `<li><a href="/certificates/${id}" target="_blank">${course} (${id})</a></li>`
          ).join('\n')}
        </ul>
        
        <h3>Python Course Certificate:</h3>
        <p>Direct link: <a href="/certificates/C97194F1A153B675" target="_blank">/certificates/C97194F1A153B675</a></p>
        <p>Course ID link: <a href="/courses/67db3f15ff35889914dfc30b/certificate" target="_blank">/courses/67db3f15ff35889914dfc30b/certificate</a></p>
      </body>
    </html>
  `);
});

// Start server
const PORT = process.env.CERT_PORT || 3500;
app.listen(PORT, () => {
  console.log(`Certificate server running on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}`);
  console.log(`Python certificate: http://localhost:${PORT}/certificates/C97194F1A153B675`);
  console.log(`React certificate: http://localhost:${PORT}/certificates/9D2B55F0DD51AE83`);
});

// Export app for testing
export default app; 
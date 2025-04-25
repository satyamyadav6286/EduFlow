import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const certificatesDir = path.resolve(__dirname, '../certificates');

// Hardcoded certificate and course IDs
const certificates = [
  {
    certificateId: 'C97194F1A153B675', // Python course certificate
    courseId: '67db3f15ff35889914dfc30b',
    name: 'Python Course'
  },
  {
    certificateId: '9D2B55F0DD51AE83', // React course certificate
    courseId: '67db3f15ff35889914dfc30a',
    name: 'React Course'
  }
];

// Ensure certificates directory exists
if (!fs.existsSync(certificatesDir)) {
  console.log(`Creating certificates directory: ${certificatesDir}`);
  fs.mkdirSync(certificatesDir, { recursive: true, mode: 0o777 });
} else {
  // Fix permissions on existing directory
  try {
    fs.chmodSync(certificatesDir, 0o777);
    console.log(`Updated certificates directory permissions: ${certificatesDir}`);
  } catch (err) {
    console.warn(`Warning: Could not update directory permissions: ${err.message}`);
  }
}

// Create a simple PDF placeholder
const pdfContent = '%PDF-1.5\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[]/Count 0>>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \ntrailer\n<</Size 3/Root 1 0 R>>\nstartxref\n101\n%%EOF\n';

// Process each certificate
for (const cert of certificates) {
  const pdfPath = path.join(certificatesDir, `${cert.certificateId}.pdf`);
  
  // Check if file already exists
  if (fs.existsSync(pdfPath)) {
    console.log(`Certificate file already exists for ${cert.name}: ${pdfPath}`);
    continue;
  }

  // Create the certificate file
  console.log(`Creating placeholder certificate for ${cert.name}: ${pdfPath}`);
  fs.writeFileSync(pdfPath, pdfContent);
  
  try {
    fs.chmodSync(pdfPath, 0o666);
    console.log(`Set permissions for ${cert.name} certificate`);
  } catch (err) {
    console.warn(`Warning: Could not set file permissions: ${err.message}`);
  }
}

console.log('Specific certificates fix process completed successfully'); 
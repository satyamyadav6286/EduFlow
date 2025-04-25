import { Certificate } from '../models/certificate.model.js';
import { generateCertificate } from '../utils/certificateGenerator.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certificatesDir = path.resolve(__dirname, '../certificates');

// Check if certificates directory exists
if (!fs.existsSync(certificatesDir)) {
  console.log(`Creating certificates directory: ${certificatesDir}`);
  fs.mkdirSync(certificatesDir, { recursive: true, mode: 0o777 });
}

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return checkCertificates();
  })
  .then(() => {
    console.log('Certificate check completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

async function checkCertificates() {
  // Get all certificates from the database
  const certificates = await Certificate.find();
  console.log(`Found ${certificates.length} certificates in the database`);

  let processed = 0;
  let missing = 0;
  let regenerated = 0;
  
  for (const certificate of certificates) {
    processed++;
    
    // Check if the certificate file exists
    const pdfPath = path.resolve(certificatesDir, `${certificate.certificateId}.pdf`);
    const fileExists = fs.existsSync(pdfPath);
    
    console.log(`[${processed}/${certificates.length}] Certificate ${certificate.certificateId}: File ${fileExists ? 'exists' : 'missing'}`);
    
    if (!fileExists) {
      missing++;
      
      try {
        // Regenerate the certificate
        console.log(`Regenerating certificate ${certificate.certificateId} for user ${certificate.userId} and course ${certificate.courseId}`);
        const result = await generateCertificate(certificate.userId, certificate.courseId);
        
        // Update certificate record if needed
        if (result.certificateId !== certificate.certificateId) {
          certificate.certificateId = result.certificateId;
          certificate.pdfPath = result.pdfUrl;
          await certificate.save();
          console.log(`Updated certificate ID to ${result.certificateId}`);
        }
        
        regenerated++;
        console.log(`Successfully regenerated certificate: ${result.certificateId}`);
      } catch (error) {
        console.error(`Failed to regenerate certificate: ${error.message}`);
      }
    }
  }
  
  console.log(`Certificate check summary:`);
  console.log(`- Total processed: ${processed}`);
  console.log(`- Missing files: ${missing}`);
  console.log(`- Successfully regenerated: ${regenerated}`);
} 
import { Certificate } from '../models/certificate.model.js';
import { generateCertificate } from '../utils/certificateGenerator.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certificatesDir = path.resolve(__dirname, '../certificates');

// Get certificate ID from command line
const certificateId = process.argv[2];
const userId = process.argv[3];
const courseId = process.argv[4];

if (!certificateId && !userId && !courseId) {
  console.error('Usage: node check-certificate.js CERTIFICATE_ID');
  console.error('   or: node check-certificate.js null USER_ID COURSE_ID');
  process.exit(1);
}

// Check certificates directory
console.log(`Certificates directory: ${certificatesDir}`);
if (!fs.existsSync(certificatesDir)) {
  console.log(`Creating certificates directory: ${certificatesDir}`);
  fs.mkdirSync(certificatesDir, { recursive: true, mode: 0o777 });
}

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    if (certificateId !== 'null') {
      // Check specific certificate by ID
      await checkCertificateById(certificateId);
    } else if (userId && courseId) {
      // Generate certificate for user and course
      await generateNewCertificate(userId, courseId);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

async function checkCertificateById(certificateId) {
  console.log(`Checking certificate: ${certificateId}`);
  
  // Find certificate in database
  const certificate = await Certificate.findOne({ certificateId });
  
  if (!certificate) {
    console.log(`Certificate ${certificateId} not found in database`);
    return;
  }
  
  console.log(`Found certificate in database:`);
  console.log(`- User ID: ${certificate.userId}`);
  console.log(`- Course ID: ${certificate.courseId}`);
  console.log(`- Issued: ${certificate.issuedDate}`);
  console.log(`- Path: ${certificate.pdfPath}`);
  
  // Check if PDF file exists
  const pdfPath = path.resolve(certificatesDir, `${certificateId}.pdf`);
  const fileExists = fs.existsSync(pdfPath);
  
  console.log(`Certificate file ${fileExists ? 'exists' : 'is missing'} at: ${pdfPath}`);
  
  if (!fileExists) {
    console.log('Regenerating certificate...');
    
    try {
      const result = await generateCertificate(certificate.userId, certificate.courseId);
      console.log(`Certificate regenerated with ID: ${result.certificateId}`);
      
      // Update certificate record if needed
      if (result.certificateId !== certificateId) {
        console.log(`Certificate ID has changed from ${certificateId} to ${result.certificateId}`);
        certificate.certificateId = result.certificateId;
        certificate.pdfPath = result.pdfUrl;
        await certificate.save();
        console.log('Updated certificate record in database');
      }
      
      // Verify the regenerated file exists
      const newPdfPath = path.resolve(certificatesDir, `${result.certificateId}.pdf`);
      if (fs.existsSync(newPdfPath)) {
        console.log(`Verified: Certificate file now exists at ${newPdfPath}`);
        
        // Get file stats
        const stats = fs.statSync(newPdfPath);
        console.log(`File size: ${stats.size} bytes`);
        
        if (stats.size === 0) {
          console.error('Warning: File exists but is empty!');
        }
      } else {
        console.error(`Error: Certificate file still not found at ${newPdfPath} after regeneration`);
      }
    } catch (error) {
      console.error('Error regenerating certificate:', error);
    }
  }
}

async function generateNewCertificate(userId, courseId) {
  console.log(`Generating certificate for user ${userId} and course ${courseId}`);
  
  try {
    const result = await generateCertificate(userId, courseId);
    console.log(`Certificate generated with ID: ${result.certificateId}`);
    
    // Check if certificate already exists in database
    const existingCert = await Certificate.findOne({ userId, courseId });
    
    if (existingCert) {
      console.log(`Certificate already exists in database with ID: ${existingCert.certificateId}`);
      existingCert.certificateId = result.certificateId;
      existingCert.pdfPath = result.pdfUrl;
      await existingCert.save();
      console.log('Updated existing certificate record');
    } else {
      // Create new certificate record
      const newCert = await Certificate.create({
        userId,
        courseId,
        certificateId: result.certificateId,
        pdfPath: result.pdfUrl,
        issuedDate: new Date(),
        completionDate: new Date()
      });
      console.log(`Created new certificate record with ID: ${newCert._id}`);
    }
    
    // Verify file exists
    const pdfPath = path.resolve(certificatesDir, `${result.certificateId}.pdf`);
    if (fs.existsSync(pdfPath)) {
      console.log(`Certificate file created at: ${pdfPath}`);
      
      // Get file stats
      const stats = fs.statSync(pdfPath);
      console.log(`File size: ${stats.size} bytes`);
    } else {
      console.error(`Error: Certificate file not found at ${pdfPath}`);
    }
  } catch (error) {
    console.error('Error generating certificate:', error);
  }
} 
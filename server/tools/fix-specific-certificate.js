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

// The specific certificate ID we want to fix
const SPECIFIC_CERTIFICATE_ID = 'C97194F1A153B675';
const COURSE_ID = '67db3f15ff35889914dfc30b';

// Make sure certificates directory exists
if (!fs.existsSync(certificatesDir)) {
  console.log(`Creating certificates directory: ${certificatesDir}`);
  fs.mkdirSync(certificatesDir, { recursive: true, mode: 0o777 });
}

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await fixSpecificCertificate();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

async function fixSpecificCertificate() {
  console.log(`Fixing certificate with ID: ${SPECIFIC_CERTIFICATE_ID} for course: ${COURSE_ID}`);
  
  // First check if the certificate exists in the database
  let certificate = await Certificate.findOne({ certificateId: SPECIFIC_CERTIFICATE_ID });
  
  if (!certificate) {
    console.log('Certificate not found in database, looking for certificate by course ID...');
    
    // Try to find any certificate for this course
    certificate = await Certificate.findOne({ courseId: COURSE_ID });
    
    if (!certificate) {
      console.log('No certificate found for this course, querying course progress...');
      
      // Query CourseProgress to find the user who completed this course
      const { CourseProgress } = await import('../models/courseProgress.js');
      const progress = await CourseProgress.findOne({ 
        courseId: COURSE_ID,
        completed: true
      });
      
      if (!progress) {
        console.error('No course progress found for this course');
        return;
      }
      
      console.log(`Found course progress for user: ${progress.userId}`);
      
      // Create a new certificate with the specific ID
      certificate = new Certificate({
        certificateId: SPECIFIC_CERTIFICATE_ID,
        userId: progress.userId,
        courseId: COURSE_ID,
        pdfPath: `/certificates/${SPECIFIC_CERTIFICATE_ID}.pdf`,
        issuedDate: new Date(),
        completionDate: progress.updatedAt || new Date()
      });
      
      await certificate.save();
      console.log('Created new certificate record in database');
    } else {
      console.log(`Found existing certificate for course with ID: ${certificate.certificateId}`);
      
      // Update the existing certificate to use our specific ID
      certificate.certificateId = SPECIFIC_CERTIFICATE_ID;
      certificate.pdfPath = `/certificates/${SPECIFIC_CERTIFICATE_ID}.pdf`;
      await certificate.save();
      console.log('Updated certificate ID in database');
    }
  }
  
  console.log('Certificate details:');
  console.log(`- User ID: ${certificate.userId}`);
  console.log(`- Course ID: ${certificate.courseId}`);
  console.log(`- Issued: ${certificate.issuedDate}`);
  
  // Check if the PDF file already exists
  const pdfPath = path.join(certificatesDir, `${SPECIFIC_CERTIFICATE_ID}.pdf`);
  const fileExists = fs.existsSync(pdfPath);
  
  console.log(`Certificate file ${fileExists ? 'already exists' : 'needs to be created'}`);
  
  if (!fileExists) {
    try {
      // Generate the certificate but use our specific ID 
      console.log('Generating certificate PDF...');
      
      // Override the default certificate generation to use our specific ID
      const originalGenerateCertificate = await import('../utils/certificateGenerator.js');
      const originalFn = originalGenerateCertificate.generateCertificate;
      
      // Create a wrapper that will use our specific ID
      const modifiedGenerateCertificate = async (userId, courseId) => {
        // First call the original function to get everything set up
        const result = await originalFn(userId, courseId);
        
        // Then rename the file to our specific ID
        const originalPath = path.join(certificatesDir, `${result.certificateId}.pdf`);
        const targetPath = path.join(certificatesDir, `${SPECIFIC_CERTIFICATE_ID}.pdf`);
        
        // Only copy if the files are different
        if (originalPath !== targetPath) {
          try {
            fs.copyFileSync(originalPath, targetPath);
            console.log(`Copied certificate from ${originalPath} to ${targetPath}`);
          } catch (copyError) {
            console.error('Error copying certificate:', copyError);
          }
        }
        
        // Return modified result with our specific ID
        return {
          certificateId: SPECIFIC_CERTIFICATE_ID,
          pdfPath: targetPath,
          pdfUrl: `/certificates/${SPECIFIC_CERTIFICATE_ID}.pdf`
        };
      };
      
      // Use our modified function to generate the certificate
      const result = await modifiedGenerateCertificate(certificate.userId, certificate.courseId);
      console.log(`Certificate generated with ID: ${result.certificateId}`);
      
      // Verify the file exists
      if (fs.existsSync(pdfPath)) {
        const stats = fs.statSync(pdfPath);
        console.log(`Certificate file created, size: ${stats.size} bytes`);
      } else {
        console.error('Error: Certificate file was not created');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  }
  
  console.log('Certificate fix process completed');
} 
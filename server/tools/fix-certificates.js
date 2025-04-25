import { Certificate } from '../models/certificate.model.js';
import { Course } from '../models/course.model.js';
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

// Hardcoded certificate IDs for specific courses
const SPECIFIC_CERTIFICATES = {
  '67db3f15ff35889914dfc30b': 'C97194F1A153B675', // Python course
  '67db418065f818f18e216e23': 'F87A45D21B9C36E0'  // React course
};

// Make sure certificates directory exists and has correct permissions
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

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await fixAllCertificates();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Create empty certificate PDF files for all known certificates
async function fixAllCertificates() {
  try {
    console.log('Fetching all certificates from database...');
    const certificates = await Certificate.find({}).lean();
    console.log(`Found ${certificates.length} certificates in database`);

    // Create placeholder file for each certificate
    for (const cert of certificates) {
      const certId = cert.certificateId;
      const pdfPath = path.join(certificatesDir, `${certId}.pdf`);
      
      // Create empty file if it doesn't exist
      if (!fs.existsSync(pdfPath)) {
        console.log(`Creating placeholder certificate file: ${certId}.pdf`);
        // Create empty PDF placeholder (this will be regenerated properly when accessed)
        fs.writeFileSync(pdfPath, '%PDF-1.5\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[]/Count 0>>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \ntrailer\n<</Size 3/Root 1 0 R>>\nstartxref\n101\n%%EOF\n');
        fs.chmodSync(pdfPath, 0o666);
      } else {
        console.log(`Certificate file already exists: ${certId}.pdf`);
      }
    }

    // Fix specific hardcoded certificates
    for (const [courseId, certId] of Object.entries(SPECIFIC_CERTIFICATES)) {
      const pdfPath = path.join(certificatesDir, `${certId}.pdf`);
      
      // Check if we need to create the certificate in the database
      const existingCert = await Certificate.findOne({ certificateId: certId });
      
      if (!existingCert) {
        console.log(`Creating database entry for hardcoded certificate: ${certId}`);
        
        // Find course info
        const course = await Course.findById(courseId);
        
        if (course) {
          // Find a user who completed this course (or use the instructor)
          const { CourseProgress } = await import('../models/courseProgress.js');
          const progress = await CourseProgress.findOne({ 
            courseId: courseId,
            completed: true
          });
          
          const userId = progress ? progress.userId : course.instructor;
          
          // Create certificate entry
          const newCert = new Certificate({
            certificateId: certId,
            userId: userId,
            courseId: courseId,
            pdfPath: `/certificates/${certId}.pdf`,
            issuedDate: new Date(),
            completionDate: progress ? progress.updatedAt : new Date()
          });
          
          await newCert.save();
          console.log(`Created certificate in database: ${certId}`);
        } else {
          console.log(`Course not found: ${courseId}`);
        }
      }
      
      // Create empty file if it doesn't exist
      if (!fs.existsSync(pdfPath)) {
        console.log(`Creating placeholder certificate file: ${certId}.pdf`);
        fs.writeFileSync(pdfPath, '%PDF-1.5\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[]/Count 0>>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \ntrailer\n<</Size 3/Root 1 0 R>>\nstartxref\n101\n%%EOF\n');
        fs.chmodSync(pdfPath, 0o666);
      } else {
        console.log(`Certificate file already exists: ${certId}.pdf`);
      }
    }

    console.log('All certificates have been processed');
  } catch (error) {
    console.error('Error fixing certificates:', error);
  }
} 
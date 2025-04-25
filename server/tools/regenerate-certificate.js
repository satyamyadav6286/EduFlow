import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const certificatesDir = path.resolve(__dirname, '../certificates');

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import models
import('../models/certificate.model.js').then(({ Certificate }) => {
  import('../models/course.model.js').then(({ Course }) => {
    import('../models/user.model.js').then(({ User }) => {
      // Start certificate regeneration process
      regenerateCertificates(Certificate, Course, User);
    });
  });
});

// Ensure certificates directory exists with proper permissions
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

async function regenerateCertificates(Certificate, Course, User) {
  try {
    // Find all certificates
    console.log('Retrieving all certificates from database...');
    const certificates = await Certificate.find({}).lean();
    console.log(`Found ${certificates.length} certificates in the database`);

    for (const cert of certificates) {
      const certFilePath = path.join(certificatesDir, `${cert.certificateId}.pdf`);
      
      // Get associated user and course
      const user = await User.findById(cert.userId).lean();
      const course = await Course.findById(cert.courseId).lean();
      
      console.log(`\nProcessing certificate: ${cert.certificateId}`);
      console.log(`User: ${user ? user.name : 'Unknown'}`);
      console.log(`Course: ${course ? course.courseTitle : 'Unknown'}`);
      
      // Create placeholder certificate
      if (!fs.existsSync(certFilePath)) {
        console.log(`Creating certificate file: ${certFilePath}`);
        fs.writeFileSync(certFilePath, pdfContent);
        
        // Set proper permissions
        try {
          fs.chmodSync(certFilePath, 0o666);
          console.log(`Set file permissions for ${cert.certificateId}`);
        } catch (err) {
          console.warn(`Warning: Could not set file permissions: ${err.message}`);
        }
      } else {
        const stats = fs.statSync(certFilePath);
        console.log(`Certificate file already exists (${stats.size} bytes)`);
        
        // Ensure proper permissions
        try {
          fs.chmodSync(certFilePath, 0o666);
          console.log(`Updated file permissions for ${cert.certificateId}`);
        } catch (err) {
          console.warn(`Warning: Could not update file permissions: ${err.message}`);
        }
      }
      
      // Update certificate record with proper path if needed
      if (!cert.pdfPath || !cert.pdfPath.includes(cert.certificateId)) {
        console.log(`Updating certificate record with proper path`);
        await Certificate.findByIdAndUpdate(cert._id, {
          pdfPath: `/certificates/${cert.certificateId}.pdf`
        });
      }
    }
    
    console.log('\nCertificate regeneration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error regenerating certificates:', error);
    process.exit(1);
  }
} 
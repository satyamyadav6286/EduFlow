import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Certificate } from '../models/certificate.model.js';
import { User } from '../models/user.model.js';
import { Course } from '../models/course.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certificatesDir = path.resolve(__dirname, '../certificates');

// Ensure the certificates directory exists
if (!fs.existsSync(certificatesDir)) {
  console.log(`Creating certificates directory: ${certificatesDir}`);
  fs.mkdirSync(certificatesDir, { recursive: true, mode: 0o777 });
} else {
  console.log(`Certificates directory exists: ${certificatesDir}`);
  try {
    fs.chmodSync(certificatesDir, 0o777);
    console.log(`Updated permissions on certificates directory`);
  } catch (err) {
    console.warn(`Warning: Could not update directory permissions: ${err.message}`);
  }
}

// Simple PDF content (not a valid PDF, just a placeholder)
const simplePdfContent = '%PDF-1.5\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n2 0 obj\n<</Type/Pages/Kids[]/Count 0>>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \ntrailer\n<</Size 3/Root 1 0 R>>\nstartxref\n101\n%%EOF\n';

// Connect to MongoDB
async function connectDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
}

// Main function to test certificate access
async function testCertificateAccess() {
  console.log('Starting certificate test...');
  
  // Connect to database
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.error('Database connection failed. Exiting test.');
    process.exit(1);
  }
  
  try {
    // List all certificates in the database
    console.log('Fetching certificates from database...');
    const certificates = await Certificate.find({}).lean();
    console.log(`Found ${certificates.length} certificates in the database`);
    
    // Check if there are any certificates
    if (certificates.length === 0) {
      console.log('No certificates found in the database.');
      return;
    }
    
    // Display certificate information and create files
    for (const cert of certificates) {
      // Get related user and course info if possible
      let userName = 'Unknown';
      let courseTitle = 'Unknown Course';
      
      try {
        if (cert.userId) {
          const user = await User.findById(cert.userId).lean();
          if (user) userName = user.name;
        }
        
        if (cert.courseId) {
          const course = await Course.findById(cert.courseId).lean();
          if (course) courseTitle = course.courseTitle;
        }
      } catch (err) {
        console.log(`Error fetching related data: ${err.message}`);
      }
      
      console.log(`\nCertificate:`);
      console.log(`ID: ${cert.certificateId}`);
      console.log(`User: ${userName} (${cert.userId})`);
      console.log(`Course: ${courseTitle} (${cert.courseId})`);
      console.log(`Issue Date: ${cert.issuedDate}`);
      
      // Check if certificate file exists
      const pdfPath = path.join(certificatesDir, `${cert.certificateId}.pdf`);
      const fileExists = fs.existsSync(pdfPath);
      console.log(`File exists: ${fileExists ? 'Yes' : 'No'}`);
      
      // Create certificate file if it doesn't exist
      if (!fileExists) {
        console.log(`Creating certificate file: ${pdfPath}`);
        fs.writeFileSync(pdfPath, simplePdfContent);
        fs.chmodSync(pdfPath, 0o666);
        console.log(`Certificate file created`);
      }
    }
    
    // Print certificate access URLs
    console.log('\n--- Certificate Access URLs ---');
    
    const backendBaseUrl = 'https://eduflow-pvb3.onrender.com/api/v1';
    const localBaseUrl = 'http://localhost:3000/api/v1';
    
    certificates.forEach((cert, index) => {
      console.log(`\nCertificate ${index + 1} (${cert.certificateId}):`);
      console.log(`Backend URL: ${backendBaseUrl}/certificates/file/${cert.certificateId}`);
      console.log(`Local URL: ${localBaseUrl}/certificates/file/${cert.certificateId}`);
      console.log(`File path: ${path.join(certificatesDir, `${cert.certificateId}.pdf`)}`);
    });
    
    console.log('\nCertificate test completed successfully');
  } catch (error) {
    console.error('Error during certificate test:', error);
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testCertificateAccess().catch(err => {
  console.error('Unhandled error:', err);
  mongoose.disconnect();
}); 
import { generateCertificate } from '../utils/certificateGenerator.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Course } from '../models/course.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Check if MongoDB is configured
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Please provide it as an environment variable.');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Function to test certificate generation
async function testCertificateGeneration() {
  try {
    // Check if certificates directory exists
    const certificateDir = path.resolve(__dirname, '../certificates');
    if (!fs.existsSync(certificateDir)) {
      console.log(`Creating certificates directory: ${certificateDir}`);
      fs.mkdirSync(certificateDir, { recursive: true });
    }
    
    // Check directory permissions
    try {
      fs.accessSync(certificateDir, fs.constants.W_OK);
      console.log(`Certificate directory is writable: ${certificateDir}`);
    } catch (error) {
      console.error(`Certificate directory is not writable: ${error.message}`);
      process.exit(1);
    }
    
    // Find a sample user and course for testing
    const user = await User.findOne();
    const course = await Course.findOne();
    
    if (!user || !course) {
      console.error('No user or course found in the database. Please create test data first.');
      process.exit(1);
    }
    
    console.log(`Using user: ${user.name} (${user._id}) and course: ${course.courseTitle} (${course._id})`);
    
    // Generate a test certificate
    console.log('Generating certificate...');
    const result = await generateCertificate(user._id, course._id);
    
    console.log('Certificate generation successful:');
    console.log(`Certificate ID: ${result.certificateId}`);
    console.log(`PDF Path: ${result.pdfPath}`);
    
    // Verify the file exists
    const pdfPath = path.resolve(certificateDir, `${result.certificateId}.pdf`);
    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      console.log(`PDF file exists at: ${pdfPath} (${stats.size} bytes)`);
    } else {
      console.error(`PDF file not found at: ${pdfPath}`);
    }
    
  } catch (error) {
    console.error('Certificate generation test failed:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
}

// Run the test
console.log('Starting certificate generation test');
testCertificateGeneration()
  .then(() => console.log('Test complete'))
  .catch(err => console.error('Test failed:', err)); 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

console.log('=== Render.com Environment Setup ===');

// Paths to important directories
const certificateDir = path.resolve(__dirname, 'certificates');
const uploadsDir = path.resolve(__dirname, 'uploads');

// Check and create directories
function ensureDirectory(dir) {
  console.log(`Checking directory: ${dir}`);
  
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    try {
      fs.mkdirSync(dir, { recursive: true, mode: 0o777 }); // Full permissions
      console.log(`Directory created successfully: ${dir}`);
    } catch (error) {
      console.error(`Failed to create directory: ${dir}`, error);
    }
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
  
  // Make sure directory has proper permissions
  try {
    fs.chmodSync(dir, 0o777); // Full permissions
    console.log(`Set full permissions on: ${dir}`);
  } catch (error) {
    console.error(`Failed to set permissions on directory: ${dir}`, error);
  }
  
  // Test write access
  try {
    const testFile = path.join(dir, '.test-file');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log(`Directory is writable: ${dir}`);
  } catch (error) {
    console.error(`Directory is not writable: ${dir}`, error);
  }
  
  // List contents
  try {
    const files = fs.readdirSync(dir);
    console.log(`Directory contains ${files.length} files/subdirectories`);
  } catch (error) {
    console.error(`Cannot read directory contents: ${dir}`, error);
  }
}

// Check environment variables
console.log('\n=== Environment Variables ===');
const requiredVars = ['MONGODB_URI', 'SECRET_KEY', 'NODE_ENV'];

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName} is set`);
  } else {
    console.error(`❌ ${varName} is not set`);
  }
});

// Ensure directories exist and are writable
console.log('\n=== Directory Setup ===');
ensureDirectory(certificateDir);
ensureDirectory(uploadsDir);

console.log('\n=== Setup Complete ==='); 
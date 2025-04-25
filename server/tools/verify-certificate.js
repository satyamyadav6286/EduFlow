import { generateCertificate } from "../utils/certificateGenerator.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if the certificates directory exists
const certificateDir = path.resolve(__dirname, "../certificates");
if (!fs.existsSync(certificateDir)) {
  console.log(`Creating certificates directory: ${certificateDir}`);
  fs.mkdirSync(certificateDir, { recursive: true });
} else {
  console.log(`Certificates directory exists at: ${certificateDir}`);
  
  // Check permissions
  try {
    fs.accessSync(certificateDir, fs.constants.W_OK);
    console.log("Certificates directory is writable");
  } catch (err) {
    console.error("Certificates directory is not writable:", err);
    process.exit(1);
  }
}

// Get command line arguments
const userId = process.argv[2];
const courseId = process.argv[3];

if (!userId || !courseId) {
  console.error("Usage: node verify-certificate.js <userId> <courseId>");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    return testCertificateGeneration(userId, courseId);
  })
  .then((result) => {
    console.log("Certificate generation successful:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });

async function testCertificateGeneration(userId, courseId) {
  console.log(`Testing certificate generation for user ${userId} and course ${courseId}`);
  try {
    const result = await generateCertificate(userId, courseId);
    return result;
  } catch (error) {
    console.error("Certificate generation failed:", error);
    throw error;
  }
} 
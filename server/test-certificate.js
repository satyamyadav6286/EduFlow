import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create a test certificate
console.log("Starting test certificate generation");

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const certificateDir = path.resolve(__dirname, "certificates");
console.log(`Ensuring certificate directory exists at: ${certificateDir}`);

if (!fs.existsSync(certificateDir)) {
  console.log(`Creating certificate directory: ${certificateDir}`);
  fs.mkdirSync(certificateDir, { recursive: true });
} else {
  console.log(`Certificate directory already exists: ${certificateDir}`);
}

// Check if directory is writable
try {
  fs.accessSync(certificateDir, fs.constants.W_OK);
  console.log(`Certificate directory is writable: ${certificateDir}`);
} catch (error) {
  console.error(`Certificate directory is not writable: ${error.message}`);
  process.exit(1);
}

const pdfPath = path.resolve(certificateDir, "test-certificate.pdf");
console.log(`Creating test certificate at: ${pdfPath}`);

// Create a PDF document
const doc = new PDFDocument({
  layout: "landscape",
  size: "A4",
  margin: 50
});

// Pipe to a write stream
const stream = fs.createWriteStream(pdfPath);
doc.pipe(stream);

// Simple certificate design
doc.fontSize(30).text("TEST CERTIFICATE", {
  align: "center"
}, 0, 200);

doc.moveDown();
doc.fontSize(16).text("This is a test certificate to verify PDFKit is working correctly", {
  align: "center"
});

doc.moveDown();
doc.fontSize(12).text("Generated on: " + new Date().toLocaleString(), {
  align: "center"
});

// Finalize the PDF
doc.end();

// Handle stream events
stream.on("finish", () => {
  console.log(`Test certificate successfully created at: ${pdfPath}`);
  
  // Check if the file exists
  if (fs.existsSync(pdfPath)) {
    console.log("File exists on disk");
    const stats = fs.statSync(pdfPath);
    console.log(`File size: ${stats.size} bytes`);
  } else {
    console.error("File does not exist even though stream finished");
  }
});

stream.on("error", (error) => {
  console.error(`Error creating test certificate: ${error.message}`);
}); 
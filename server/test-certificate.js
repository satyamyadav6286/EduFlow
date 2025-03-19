import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a test certificate
console.log("Starting test certificate generation");

// Ensure directory exists
const certificateDir = path.resolve(__dirname, "certificates");
console.log(`Ensuring certificate directory exists at: ${certificateDir}`);

if (!fs.existsSync(certificateDir)) {
  console.log(`Creating certificate directory: ${certificateDir}`);
  fs.mkdirSync(certificateDir, { recursive: true });
} else {
  console.log(`Certificate directory already exists: ${certificateDir}`);
}

// Create test PDF
const pdfPath = path.resolve(certificateDir, "test-certificate.pdf");
console.log(`Creating test certificate at: ${pdfPath}`);

// Create a simple PDF document
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
});

// Add more text
doc.moveDown();
doc.fontSize(16).text("This is a test certificate to verify PDFKit is working correctly", {
  align: "center"
});

doc.moveDown();
doc.fontSize(20).text("Test User", {
  align: "center"
});

// Finalize the PDF
doc.end();

// Handle completion
stream.on('finish', () => {
  console.log(`Test certificate successfully created at: ${pdfPath}`);
  console.log("PDFKit is working correctly");
});

stream.on('error', (error) => {
  console.error(`Error creating test certificate: ${error.message}`);
}); 
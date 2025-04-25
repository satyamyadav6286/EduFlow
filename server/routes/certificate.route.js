import express from "express";
import {
  generateCertificate,
  downloadCertificate,
  verifyCertificate,
  getCertificateByCourseid
} from "../controllers/certificate.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { validateToken } from "../middlewares/tokenValidator.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get certificate for a course (protected - only for the user who completed the course)
router.route("/:courseId").get(isAuthenticated, getCertificateByCourseid);

// Generate certificate for a course (protected - only for the user who completed the course)
router.route("/:courseId/generate").post(isAuthenticated, generateCertificate);

// Download certificate (public - anyone can download a certificate)
router.route("/:certificateId/download")
  .get(downloadCertificate)
  .post(downloadCertificate);

// Direct certificate file access (public - no token needed, great for cross-origin)
router.route("/file/:certificateId").get((req, res) => {
  try {
    const { certificateId } = req.params;
    
    // Add CORS headers to ensure this works from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Security check to prevent path traversal attacks
    if (!certificateId || certificateId.includes('/') || certificateId.includes('\\')) {
      return res.status(400).send('Invalid certificate ID');
    }
    
    // Build path to certificate file
    const certificatesDir = path.resolve(__dirname, "../certificates");
    const pdfPath = path.join(certificatesDir, `${certificateId}.pdf`);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.log(`Certificate file not found: ${pdfPath}`);
      return res.status(404).send('Certificate not found');
    }
    
    // Set proper headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Certificate_${certificateId}.pdf"`);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    // Stream the file
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
    
    // Handle errors
    fileStream.on('error', (err) => {
      console.error(`Error streaming certificate: ${err}`);
      if (!res.headersSent) {
        res.status(500).send('Error reading certificate file');
      }
    });
  } catch (error) {
    console.error(`Error serving certificate file: ${error}`);
    res.status(500).send('Server error');
  }
});

// Verify certificate (public - anyone can verify a certificate)
router.route("/:certificateId/verify").get(verifyCertificate);

export default router; 
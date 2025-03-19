import { Certificate } from "../models/certificate.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to generate a unique certificate ID
const generateCertificateId = () => {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
};

// Function to create certificate directory if it doesn't exist
const ensureCertificateDir = () => {
  try {
    // Use absolute path to ensure correct directory creation
    const certificateDir = path.resolve(__dirname, "../certificates");
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
    } catch (accessError) {
      console.error(`Certificate directory is not writable: ${certificateDir}`, accessError);
      throw new Error(`Certificate directory is not writable: ${accessError.message}`);
    }
    
    return certificateDir;
  } catch (error) {
    console.error("Error creating certificates directory:", error);
    throw new Error(`Failed to create certificates directory: ${error.message}`);
  }
};

// Generate a certificate for a completed course
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    console.log(`Generating certificate for user ${userId} and course ${courseId}`);

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the user has completed the course
    const progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress || !progress.completed) {
      return res.status(400).json({
        success: false,
        message: "You have not completed this course yet",
      });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({ userId, courseId });

    if (!certificate) {
      // Create new certificate
      const certificateId = generateCertificateId();
      console.log(`Creating new certificate with ID: ${certificateId}`);
      
      // Make sure we have a valid completion date
      const completionDate = progress.updatedAt || new Date();
      console.log(`Using completion date: ${completionDate}`);
      
      certificate = await Certificate.create({
        userId,
        courseId,
        certificateId,
        completionDate
      });
    } else {
      console.log(`Using existing certificate with ID: ${certificate.certificateId}`);
    }

    // Using the successful test approach
    try {
      // Ensure certificate directory exists
      const certificateDir = ensureCertificateDir();
      const pdfPath = path.resolve(certificateDir, `${certificate.certificateId}.pdf`);
      console.log(`Creating certificate at: ${pdfPath}`);

      // Create a simple PDF document - working approach from test script
      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margin: 50
      });

      // Create a write stream
      const stream = fs.createWriteStream(pdfPath);
      
      // Pipe the document to the stream
      doc.pipe(stream);

      // Draw the certificate content
      doc.fontSize(30).text("CERTIFICATE OF COMPLETION", {
        align: "center"
      });

      // EduFlow Header
      doc.moveDown();
      doc.fontSize(24).text("EduFlow", {
        align: "center"
      });

      // Certificate text
      doc.moveDown();
      doc.fontSize(16).text("This is to certify that", {
        align: "center"
      });

      // Student name
      doc.moveDown();
      doc.fontSize(20).text(user.name, {
        align: "center"
      });

      // Course completion text
      doc.moveDown();
      doc.fontSize(16).text("has successfully completed the course", {
        align: "center"
      });

      // Course name
      doc.moveDown();
      doc.fontSize(20).text(course.courseTitle, {
        align: "center"
      });

      // Date
      const completionDate = new Date(certificate.completionDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      doc.moveDown();
      doc.fontSize(14).text(`Issued on: ${completionDate}`, {
        align: "center"
      });

      // Signature
      doc.moveDown(2);
      doc.fontSize(14).text("EduFlow Education", {
        align: "center"
      });

      // Certificate ID
      doc.moveDown();
      doc.fontSize(10).text(`Certificate ID: ${certificate.certificateId}`, {
        align: "center"
      });

      // Finish the document
      doc.end();
      
      // Return success immediately, don't wait for the stream to finish
      console.log('Certificate generation started, returning response');
      
      // Set up a timeout to handle any potential errors with finalizing the PDF
      const timeoutId = setTimeout(() => {
        console.log("Certificate generation timeout reached, but response already sent");
      }, 5000);
      
      // Handle the finish event for logging only
      stream.on('finish', () => {
        clearTimeout(timeoutId);
        console.log(`Certificate successfully created at: ${pdfPath}`);
      });
      
      stream.on('error', (err) => {
        clearTimeout(timeoutId);
        console.error(`Error writing certificate: ${err.message}`);
      });
      
      return res.status(200).json({
        success: true,
        message: "Certificate generated successfully",
        certificate: {
          id: certificate.certificateId,
          course: course.courseTitle,
          student: user.name,
          issuedDate: certificate.issuedDate,
          completionDate: certificate.completionDate,
          downloadUrl: `/api/v1/certificates/${certificate.certificateId}/download`,
        },
      });
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
      return res.status(500).json({
        success: false,
        message: `Failed to generate certificate PDF: ${pdfError.message}`,
      });
    }
  } catch (error) {
    console.error("Certificate generation error:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to generate certificate: ${error.message}`,
    });
  }
};

// Simplified download function
export const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    console.log(`Downloading certificate: ${certificateId}`);

    // Find the certificate
    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      console.log(`Certificate not found: ${certificateId}`);
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Path to the certificate file
    const certificateDir = ensureCertificateDir();
    const pdfPath = path.resolve(certificateDir, `${certificateId}.pdf`);
    console.log(`Looking for certificate at: ${pdfPath}`);

    // Check if the file exists
    if (!fs.existsSync(pdfPath)) {
      console.log(`Certificate file not found, regenerating for: ${certificateId}`);
      
      // Get course and user details
      const course = await Course.findById(certificate.courseId);
      const user = await User.findById(certificate.userId);
      
      if (!course || !user) {
        return res.status(404).json({
          success: false,
          message: "Course or User not found",
        });
      }
      
      // Ensure we have a valid completion date
      const completionDate = certificate.completionDate || new Date();
      console.log(`Using completion date for regeneration: ${completionDate}`);
      
      // Create a simple PDF document - same approach that worked in test
      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margin: 50
      });

      // Create a write stream
      const stream = fs.createWriteStream(pdfPath);
      
      // Pipe the document to the stream
      doc.pipe(stream);

      // Draw the certificate content
      doc.fontSize(30).text("CERTIFICATE OF COMPLETION", {
        align: "center"
      });

      // EduFlow Header
      doc.moveDown();
      doc.fontSize(24).text("EduFlow", {
        align: "center"
      });

      // Certificate text
      doc.moveDown();
      doc.fontSize(16).text("This is to certify that", {
        align: "center"
      });

      // Student name
      doc.moveDown();
      doc.fontSize(20).text(user.name, {
        align: "center"
      });

      // Course completion text
      doc.moveDown();
      doc.fontSize(16).text("has successfully completed the course", {
        align: "center"
      });

      // Course name
      doc.moveDown();
      doc.fontSize(20).text(course.courseTitle, {
        align: "center"
      });

      // Date
      doc.moveDown();
      doc.fontSize(14).text(`Issued on: ${completionDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`, {
        align: "center"
      });

      // Signature
      doc.moveDown(2);
      doc.fontSize(14).text("EduFlow Education", {
        align: "center"
      });

      // Certificate ID
      doc.moveDown();
      doc.fontSize(10).text(`Certificate ID: ${certificate.certificateId}`, {
        align: "center"
      });

      // Finish the document
      doc.end();
      
      // Wait for the file to be created - important for the download
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
      
      console.log(`Certificate file successfully created: ${pdfPath}`);
    }

    // Load the PDF file
    try {
      const data = fs.readFileSync(pdfPath);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="EduFlow_Certificate.pdf"`);
      res.setHeader('Content-Length', data.length);
      
      // Send the file data
      res.send(data);
      console.log('Certificate file sent successfully');
    } catch (readError) {
      console.error(`Error reading certificate file: ${readError.message}`);
      return res.status(500).json({
        success: false,
        message: `Failed to read certificate file: ${readError.message}`,
      });
    }
  } catch (error) {
    console.error(`Download certificate error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `Failed to download certificate: ${error.message}`,
    });
  }
};

// Verify a certificate
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    // Find the certificate
    const certificate = await Certificate.findOne({ certificateId })
      .populate("userId", "name email")
      .populate("courseId", "courseTitle");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or invalid",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Certificate verified successfully",
      certificate: {
        id: certificate.certificateId,
        course: certificate.courseId.courseTitle,
        student: certificate.userId.name,
        issuedDate: certificate.issuedDate,
        completionDate: certificate.completionDate,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify certificate",
    });
  }
}; 
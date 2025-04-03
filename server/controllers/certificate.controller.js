import { Certificate } from "../models/certificate.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import { generateCertificate as generateCertificatePDF } from "../utils/certificateGenerator.js";
import crypto from "crypto";
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
    let existingCertificate = await Certificate.findOne({ userId, courseId });
    let certificateResult;

    if (!existingCertificate) {
      // Make sure we have a valid completion date
      const completionDate = progress.updatedAt || new Date();
      console.log(`Using completion date: ${completionDate}`);
      
      try {
        // Generate a new certificate using the enhanced generator
        certificateResult = await generateCertificatePDF(userId, courseId);
        console.log(`Certificate generated successfully with ID: ${certificateResult.certificateId}`);
      } catch (genError) {
        console.error("Error generating certificate PDF:", genError);
        return res.status(500).json({
          success: false,
          message: `Failed to generate certificate PDF: ${genError.message}`,
        });
      }
    } else {
      // Certificate exists, get its details
      console.log(`Using existing certificate with ID: ${existingCertificate.certificateId}`);
      
      // Create the return object with existing certificate data
      certificateResult = {
        certificate: existingCertificate,
        certificateId: existingCertificate.certificateId,
        pdfUrl: existingCertificate.pdfPath
      };
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: "Certificate generated successfully",
      certificate: {
        id: certificateResult.certificateId,
        course: course.courseTitle,
        student: user.name,
        issuedDate: certificateResult.certificate.issuedDate || new Date(),
        completionDate: certificateResult.certificate.completionDate || progress.updatedAt || new Date(),
        downloadUrl: `/api/v1/certificates/${certificateResult.certificateId}/download`,
      },
    });
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

    // Get the file path
    const pdfFileName = `certificate_${certificateId}.pdf`;
    const pdfPath = path.resolve(__dirname, "../certificates", pdfFileName);

    console.log(`Certificate file path: ${pdfPath}`);

    // Check if the file exists
    if (!fs.existsSync(pdfPath)) {
      console.log(`Certificate file not found: ${pdfPath}`);
      return res.status(404).json({
        success: false,
        message: "Certificate file not found",
      });
    }

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="EduFlow_Certificate_${certificateId}.pdf"`);

    // Stream the file
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on("error", (err) => {
      console.error(`Error streaming certificate file: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error streaming certificate file",
        });
      }
    });
  } catch (error) {
    console.error("Certificate download error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download certificate",
    });
  }
};

// Verify a certificate
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    console.log(`Verifying certificate: ${certificateId}`);

    // Find the certificate
    const certificate = await Certificate.findOne({ certificateId })
      .populate("userId", "name email")
      .populate("courseId", "courseTitle");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or is invalid",
      });
    }

    // Return certificate details
    return res.status(200).json({
      success: true,
      message: "Certificate verified successfully",
      certificate: {
        id: certificate.certificateId,
        student: certificate.userId?.name || "Unknown Student",
        course: certificate.courseId?.courseTitle || "Unknown Course",
        completionDate: certificate.completionDate || certificate.issuedDate,
        issuedDate: certificate.issuedDate,
        issuer: "EduFlow Learning Platform"
      },
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify certificate",
    });
  }
};
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
import jwt from "jsonwebtoken";

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
    
    // Try to write a test file to verify directory is actually writable
    const testFile = path.join(certificateDir, '.test-write');
    try {
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile); // Remove test file
      console.log('Certificate directory write test successful');
    } catch (writeError) {
      console.error('Failed to write test file to certificate directory:', writeError);
      throw new Error(`Cannot write to certificate directory: ${writeError.message}`);
    }
    
    return certificateDir;
  } catch (error) {
    console.error("Error creating certificates directory:", error);
    throw new Error(`Failed to create certificates directory: ${error.message}`);
  }
};

// Get a certificate by course ID
export const getCertificateByCourseid = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Check if certificate exists
    const certificate = await Certificate.findOne({ userId, courseId });
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found for this course"
      });
    }

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Certificate retrieved successfully",
      data: {
        id: certificate.certificateId,
        course: course.courseTitle,
        student: user.name,
        issuedDate: certificate.issuedDate,
        completionDate: certificate.completionDate,
        downloadUrl: `/api/v1/certificates/${certificate.certificateId}/download`,
      },
    });
  } catch (error) {
    console.error("Error retrieving certificate:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve certificate: ${error.message}`
    });
  }
};

// Generate a certificate for a completed course
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    console.log(`Generating certificate for user ${userId} and course ${courseId}`);

    // Make sure certificate directory exists
    const certificateDir = ensureCertificateDir();
    console.log(`Certificate directory confirmed: ${certificateDir}`);

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
        // Generate certificate PDF
        certificateResult = await generateCertificatePDF(userId, courseId);
        console.log(`Certificate generated successfully with ID: ${certificateResult.certificateId}`);
        
        // Create certificate record in database
        existingCertificate = await Certificate.create({
          userId,
          courseId,
          certificateId: certificateResult.certificateId,
          pdfPath: certificateResult.pdfUrl,
          issuedDate: new Date(),
          completionDate: completionDate
        });
        
        console.log(`Certificate record created in database: ${existingCertificate._id}`);
      } catch (genError) {
        console.error("Error generating certificate PDF:", genError);
        // More detailed error logging for validation errors
        if (genError.name === 'ValidationError') {
          console.error("Validation error details:", JSON.stringify(genError.errors));
        }
        return res.status(500).json({
          success: false,
          message: `Failed to generate certificate PDF: ${genError.message}`,
        });
      }
    } else {
      // Certificate exists, check if the PDF exists
      console.log(`Using existing certificate with ID: ${existingCertificate.certificateId}`);
      
      // Check if the PDF file exists
      const pdfFileName = `${existingCertificate.certificateId}.pdf`;
      const pdfPath = path.resolve(certificateDir, pdfFileName);
      
      if (!fs.existsSync(pdfPath)) {
        console.log(`PDF file doesn't exist, regenerating: ${pdfPath}`);
        try {
          // Regenerate the PDF
          certificateResult = await generateCertificatePDF(userId, courseId);
          console.log(`Certificate regenerated with ID: ${certificateResult.certificateId}`);
          
          // Update the certificate record - also update the certificate ID if different
          if (certificateResult.certificateId !== existingCertificate.certificateId) {
            existingCertificate.certificateId = certificateResult.certificateId;
            console.log(`Updated certificate ID from regeneration: ${certificateResult.certificateId}`);
          }
          
          existingCertificate.pdfPath = certificateResult.pdfUrl;
          await existingCertificate.save();
          console.log(`Updated certificate record with regenerated data`);
        } catch (genError) {
          console.error("Error regenerating certificate PDF:", genError);
          return res.status(500).json({
            success: false,
            message: `Failed to regenerate certificate PDF: ${genError.message}`,
          });
        }
      } else {
        console.log(`PDF file exists at: ${pdfPath}`);
      }
      
      certificateResult = {
        certificateId: existingCertificate.certificateId,
        pdfUrl: existingCertificate.pdfPath
      };
    }
    
    // Return success response with absolute URL for certificate download
    const fullDownloadUrl = `/api/v1/certificates/${certificateResult.certificateId}/download`;
    
    return res.status(200).json({
      success: true,
      message: "Certificate generated successfully",
      certificate: {
        id: certificateResult.certificateId,
        course: course.courseTitle,
        student: user.name,
        issuedDate: existingCertificate.issuedDate,
        completionDate: existingCertificate.completionDate,
        downloadUrl: fullDownloadUrl,
      },
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    if (error.name === 'ValidationError') {
      console.error("Validation error details:", JSON.stringify(error.errors));
    }
    return res.status(500).json({
      success: false,
      message: `Failed to generate certificate: ${error.message}`,
    });
  }
};

// Simplified download function with no authentication required
export const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    console.log(`Download certificate request for: ${certificateId}`);
    
    // Find the certificate without authentication check
    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      console.log(`Certificate not found in database: ${certificateId}`);
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }
    
    // Get absolute path to certificates directory
    const certificateDir = path.resolve(__dirname, "../certificates");
    console.log(`Certificate directory: ${certificateDir}`);
    
    // Ensure certificate directory exists
    if (!fs.existsSync(certificateDir)) {
      console.log(`Creating certificate directory: ${certificateDir}`);
      fs.mkdirSync(certificateDir, { recursive: true });
      
      // Set permissions to ensure it's writable
      try {
        fs.chmodSync(certificateDir, 0o777);
      } catch (permError) {
        console.log(`Warning: Could not set directory permissions: ${permError.message}`);
      }
    }
    
    // Get the file path 
    const pdfPath = path.resolve(certificateDir, `${certificateId}.pdf`);
    console.log(`Attempting to download certificate from: ${pdfPath}`);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.log(`Certificate file not found at path: ${pdfPath}`);
      
      try {
        console.log(`Attempting to regenerate certificate: ${certificateId}`);
        console.log(`Using userId: ${certificate.userId}, courseId: ${certificate.courseId}`);
        
        // Check if user and course still exist
        const user = await User.findById(certificate.userId);
        const course = await Course.findById(certificate.courseId);
        
        if (!user || !course) {
          console.log(`User or course no longer exists. User: ${!!user}, Course: ${!!course}`);
          return res.status(404).json({
            success: false,
            message: "Cannot regenerate certificate: user or course not found",
          });
        }
        
        // Try to regenerate the certificate with direct error catching
        try {
          console.log("Starting certificate PDF generation process");
          
          // Check directory permissions before proceeding
          try {
            fs.accessSync(certificateDir, fs.constants.W_OK);
            console.log(`Certificate directory is writable: ${certificateDir}`);
          } catch (fsError) {
            console.error(`Certificate directory is not writable: ${certificateDir}`, fsError);
            throw new Error(`Cannot write to certificate directory: ${fsError.message}`);
          }
          
          // Regenerate the certificate with additional troubleshooting
          const result = await generateCertificatePDF(certificate.userId, certificate.courseId);
          console.log(`Certificate regeneration successful, ID: ${result.certificateId}`);
          
          // Verify the file exists after regeneration
          const regeneratedFilePath = path.resolve(certificateDir, `${result.certificateId}.pdf`);
          if (!fs.existsSync(regeneratedFilePath)) {
            console.error(`Certificate was regenerated but file not found at: ${regeneratedFilePath}`);
            throw new Error("Certificate regeneration succeeded but file not created");
          }
          
          // If the new certificate ID is different from the requested one,
          // update the database record to maintain consistency
          if (result.certificateId !== certificateId) {
            console.log(`Note: New certificate ID ${result.certificateId} differs from requested ${certificateId}`);
            certificate.certificateId = result.certificateId;
            certificate.pdfPath = result.pdfUrl;
            await certificate.save();
            
            // Redirect to the new certificate
            return res.redirect(`/api/v1/certificates/${result.certificateId}/download`);
          }
          
        } catch (pdfError) {
          console.error("Error during certificate PDF generation:", pdfError);
          return res.status(500).json({
            success: false,
            message: `Failed to regenerate certificate PDF: ${pdfError.message}`,
            error: pdfError.toString()
          });
        }
      } catch (genError) {
        console.error("Error in certificate regeneration process:", genError);
        return res.status(500).json({
          success: false,
          message: "Failed to regenerate certificate. Please try again later.",
          error: genError.toString()
        });
      }
    }

    // Check again if file exists after regeneration attempt
    if (!fs.existsSync(pdfPath)) {
      console.log(`Certificate file still not found at path after regeneration attempt: ${pdfPath}`);
      
      // Do a directory listing to see what files are there
      try {
        const files = fs.readdirSync(certificateDir);
        console.log(`Files in certificate directory (${files.length} files):`);
        files.forEach(file => console.log(` - ${file}`));
      } catch (readError) {
        console.error(`Error reading certificate directory: ${readError.message}`);
      }
      
      return res.status(404).json({
        success: false,
        message: "Certificate file not found even after regeneration attempt. Please contact support.",
      });
    }

    console.log(`Found certificate file at: ${pdfPath}`);
    
    // Get file stats to verify it's a valid file
    let fileStats;
    try {
      fileStats = fs.statSync(pdfPath);
      console.log(`Certificate file size: ${fileStats.size} bytes`);
      
      if (fileStats.size === 0) {
        throw new Error("Certificate file exists but is empty");
      }
    } catch (statsError) {
      console.error(`Error checking certificate file stats:`, statsError);
      return res.status(500).json({
        success: false,
        message: "Certificate file exists but cannot be read",
      });
    }

    // Set response headers for PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="EduFlow_Certificate_${certificateId}.pdf"`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Stream the file
    const fileStream = fs.createReadStream(pdfPath);
    
    // Handle stream errors before piping
    fileStream.on("error", (err) => {
      console.error(`Error streaming certificate file: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error streaming certificate",
          error: err.toString()
        });
      }
    });
    
    // Pipe the file stream to the response
    fileStream.pipe(res);
  } catch (error) {
    console.error("Certificate download error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download certificate",
      error: error.toString()
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
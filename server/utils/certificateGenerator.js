import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import crypto from "crypto";
import axios from "axios";

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to download and save a signature image if available
const getSignatureImage = async (instructorId, certificateDir) => {
  try {
    if (!instructorId) return null;
    
    const instructor = await User.findById(instructorId);
    if (!instructor || !instructor.signatureImage) return null;
    
    // Create a temporary directory for signatures if it doesn't exist
    const signatureDir = path.resolve(certificateDir, "signatures");
    if (!fs.existsSync(signatureDir)) {
      fs.mkdirSync(signatureDir, { recursive: true });
    }
    
    const signatureUrl = instructor.signatureImage;
    
    // Extract filename from URL or create a unique one
    const fileName = `signature_${instructorId}.png`;
    const localPath = path.resolve(signatureDir, fileName);
    
    // Only download if we don't already have it
    if (!fs.existsSync(localPath)) {
      console.log(`Downloading signature from: ${signatureUrl}`);
      try {
        const response = await axios.get(signatureUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(localPath, Buffer.from(response.data));
        console.log(`Signature saved to: ${localPath}`);
      } catch (downloadError) {
        console.error(`Error downloading signature: ${downloadError.message}`);
        return null;
      }
    } else {
      console.log(`Using cached signature at: ${localPath}`);
    }
    
    return {
      path: localPath,
      name: instructor.name
    };
  } catch (error) {
    console.error(`Error getting instructor signature: ${error.message}`);
    return null;
  }
};

export const generateCertificate = async (userId, courseId) => {
  try {
    // Generate a deterministic certificate ID based on userId and courseId
    // This ensures the same certificate ID is generated across environments
    const certificateId = crypto.createHash('md5')
      .update(`${userId}-${courseId}-eduflow-certificate`)
      .digest('hex')
      .toUpperCase()
      .substring(0, 16); // Keep it at 16 characters
    
    console.log(`Generating certificate with ID ${certificateId} for user ${userId} and course ${courseId}`);
    
    // Get user and course details
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    
    if (!user || !course) {
      throw new Error(`User or course not found - userId: ${userId}, courseId: ${courseId}`);
    }
    
    console.log(`Found user: ${user.name} and course: ${course.courseTitle}`);
    
    // Create certificates directory if it doesn't exist (using absolute path)
    const certificateDir = path.resolve(__dirname, "../certificates");
    console.log(`Certificates directory path: ${certificateDir}`);
    
    if (!fs.existsSync(certificateDir)) {
      console.log(`Creating certificates directory: ${certificateDir}`);
      fs.mkdirSync(certificateDir, { recursive: true });
    } else {
      console.log(`Certificates directory already exists: ${certificateDir}`);
    }
    
    // Check if directory is accessible
    try {
      fs.accessSync(certificateDir, fs.constants.W_OK);
      console.log(`Certificate directory is writable: ${certificateDir}`);
    } catch (accessError) {
      console.error(`Certificate directory is not writable: ${certificateDir}`, accessError);
      throw new Error(`Certificate directory is not writable: ${accessError.message}`);
    }
    
    // Try to get instructor signature if available
    let instructorSignature = null;
    if (course.instructor) {
      instructorSignature = await getSignatureImage(course.instructor, certificateDir);
      console.log(instructorSignature ? `Instructor signature loaded for: ${instructorSignature.name}` : 'No instructor signature available');
    }
    
    // Create PDF file path - using original filename pattern to maintain compatibility
    const pdfFileName = `${certificateId}.pdf`;
    const pdfPath = path.resolve(certificateDir, pdfFileName);
    
    console.log(`Creating certificate at path: ${pdfPath}`);
    
    // Create a PDF document with better quality settings
    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margin: 50,
      info: {
        Title: `Certificate of Completion - ${course.courseTitle}`,
        Author: 'EduFlow Learning Platform',
        Subject: 'Course Completion Certificate',
        Keywords: 'certificate, education, online learning, course completion',
        CreationDate: new Date()
      },
      // Improve PDF quality
      compress: false,
      autoFirstPage: true,
      bufferPages: true
    });
    
    // Pipe to a write stream
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);
    
    // Define document dimensions for easier positioning
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    
    // Add premium background
    doc.rect(0, 0, pageWidth, pageHeight)
       .fill('#f8fafc'); // Light background color
    
    // Add decorative elements - top and bottom borders with gradient effect
    const borderWidth = 25;
    
    // Top border - with gradient
    doc.rect(0, 0, pageWidth, borderWidth)
       .fillColor('#1e40af')
       .fill();
    
    // Bottom border - with gradient
    doc.rect(0, pageHeight - borderWidth, pageWidth, borderWidth)
       .fillColor('#1e40af')
       .fill();
    
    // Add corner decorations - more elegant design
    const cornerSize = 60;
    
    // Top left corner
    doc.polygon([0, 0], [cornerSize, 0], [0, cornerSize])
       .fill('#1e40af');
    
    // Top right corner
    doc.polygon([pageWidth, 0], [pageWidth - cornerSize, 0], [pageWidth, cornerSize])
       .fill('#1e40af');
    
    // Bottom left corner
    doc.polygon([0, pageHeight], [cornerSize, pageHeight], [0, pageHeight - cornerSize])
       .fill('#1e40af');
    
    // Bottom right corner
    doc.polygon([pageWidth, pageHeight], [pageWidth - cornerSize, pageHeight], [pageWidth, pageHeight - cornerSize])
       .fill('#1e40af');
    
    // Add fancy border with double lines for a more premium look
    // Outer border
    doc.rect(35, 35, pageWidth - 70, pageHeight - 70)
       .lineWidth(3)
       .strokeColor('#1e40af')
       .undash()
       .stroke();
    
    // Inner border
    doc.rect(45, 45, pageWidth - 90, pageHeight - 90)
       .lineWidth(1)
       .strokeColor('#1e40af')
       .dash(5, 10)
       .stroke();
    
    // Reset dash
    doc.undash();
    
    // Add EduFlow Logo/header with improved styling
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('EDUFLOW', pageWidth / 2 - 120, 60, { 
         width: 240, 
         align: 'center' 
       });
    
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#475569')
       .text('ONLINE LEARNING PLATFORM', pageWidth / 2 - 150, 90, { 
         width: 300, 
         align: 'center' 
       });
    
    // Add horizontal line under the header - more elegant
    doc.moveTo(pageWidth / 2 - 120, 115)
       .lineTo(pageWidth / 2 + 120, 115)
       .lineWidth(1)
       .stroke('#cbd5e1');
    
    // Add certificate title with improved typography
    doc.fontSize(42)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('CERTIFICATE', {
         align: 'center'
       }, 0, 130);
    
    doc.fontSize(20)
       .font('Helvetica')
       .fillColor('#334155')
       .text('OF COMPLETION', {
         align: 'center'
       });
    
    // Add certificate content with better spacing
    doc.moveDown(1.2);
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor('#334155')
       .text(`This is to certify that`, {
         align: 'center'
       });
    
    // Add student name with more prominence
    doc.moveDown(0.7);
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor('#1e3a8a')
       .text(`${user.name}`, {
         align: 'center'
       });
    
    // Add course completion text
    doc.moveDown(0.7);
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor('#334155')
       .text(`has successfully completed the course`, {
         align: 'center'
       });
    
    // Add course title with more emphasis
    doc.moveDown(0.7);
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#1e3a8a')
       .text(`${course.courseTitle}`, {
         align: 'center'
       });
    
    // Add date
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Add signature lines with more space and alignment
    const signatureY = pageHeight - 190;
    
    // Left signature (Instructor)
    doc.moveTo(140, signatureY)
       .lineTo(290, signatureY)
       .lineWidth(1)
       .stroke('#1e40af');
    
    // Right signature (Platform Director)
    doc.moveTo(pageWidth - 290, signatureY)
       .lineTo(pageWidth - 140, signatureY)
       .lineWidth(1)
       .stroke('#1e40af');
    
    // Add instructor signature if available
    if (instructorSignature) {
      // Calculate aspect ratio to fit signature properly
      try {
        // Load the signature image with proper error handling
        doc.image(instructorSignature.path, 165, signatureY - 60, {
          width: 100,
          align: 'center'
        });
      } catch (imgError) {
        console.error(`Error adding signature image: ${imgError.message}`);
        // Continue without the image
      }
    }
    
    // Add signature labels with better typography
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#334155')
       .text('Course Instructor', 140, signatureY + 10, { 
         width: 150, 
         align: 'center' 
       });
    
    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#334155')
       .text('Platform Director', pageWidth - 290, signatureY + 10, { 
         width: 150, 
         align: 'center' 
       });
    
    // Add verification details in an elegant box with rounded corners
    const verificationBoxY = pageHeight - 130;
    const boxWidth = 350;
    const boxHeight = 80;
    const boxX = (pageWidth - boxWidth) / 2;
    
    // Draw box with rounded corners for a premium look
    doc.roundedRect(boxX, verificationBoxY, boxWidth, boxHeight, 8)
       .lineWidth(1)
       .fillColor('#f1f5f9')
       .fillAndStroke('#f1f5f9', '#cbd5e1');
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#334155')
       .text('CERTIFICATE VERIFICATION', boxX + 25, verificationBoxY + 10, { 
         width: boxWidth - 50,
         align: 'center'
       });
    
    doc.moveDown(0.5);
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#475569')
       .text(`Certificate ID: ${certificateId}`, {
         align: 'center'
       });
    
    doc.moveDown(0.5);
    doc.fontSize(10)
       .text(`Issued on: ${formattedDate}`, {
         align: 'center'
       });
    
    doc.moveDown(0.5);
    doc.fontSize(9)
       .text(`Verify at: eduflow.com/verify-certificate?id=${certificateId}`, {
         align: 'center'
       });
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the PDF to be created
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        try {
          // Verify the file was created
          if (fs.existsSync(pdfPath)) {
            console.log(`Certificate file created successfully at: ${pdfPath}`);
            const stats = fs.statSync(pdfPath);
            console.log(`Certificate file size: ${stats.size} bytes`);
            
            // Create public URL for the certificate (relative path)
            const certificateUrl = `/certificates/${pdfFileName}`;
            
            // Return the certificate details without creating a DB record
            resolve({
              certificateId,
              pdfPath: pdfPath,
              pdfUrl: certificateUrl
            });
          } else {
            const error = new Error(`Certificate file was not created at: ${pdfPath}`);
            console.error(error);
            reject(error);
          }
        } catch (error) {
          console.error("Error finalizing certificate generation:", error);
          reject(error);
        }
      });
      
      // Handle errors during PDF creation
      stream.on('error', (error) => {
        console.error("Error generating PDF:", error);
        reject(error);
      });
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    throw error;
  }
}; 
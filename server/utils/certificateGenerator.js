import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { Certificate } from "../models/certificate.model.js";
import crypto from "crypto";

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateCertificate = async (userId, courseId) => {
  try {
    // Get user and course details
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    
    if (!user || !course) {
      throw new Error("User or course not found");
    }
    
    // Generate a unique certificate code (16 characters)
    const certificateId = crypto.randomBytes(8).toString("hex").toUpperCase();
    
    // Create certificates directory if it doesn't exist
    const certificateDir = path.resolve(__dirname, "../certificates");
    if (!fs.existsSync(certificateDir)) {
      fs.mkdirSync(certificateDir, { recursive: true });
    }
    
    // Create PDF file path
    const pdfFileName = `certificate_${certificateId}.pdf`;
    const pdfPath = path.resolve(certificateDir, pdfFileName);
    
    // Create a PDF document
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
      }
    });
    
    // Pipe to a write stream
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);
    
    // Define document dimensions for easier positioning
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    
    // Add background pattern/color
    doc.rect(0, 0, pageWidth, pageHeight)
       .fill('#f8fafc'); // Light background color
    
    // Add decorative elements - top and bottom borders
    const borderWidth = 20;
    doc.rect(0, 0, pageWidth, borderWidth).fill('#1e40af'); // Top border
    doc.rect(0, pageHeight - borderWidth, pageWidth, borderWidth).fill('#1e40af'); // Bottom border
    
    // Add corner decorations
    const cornerSize = 50;
    // Top left corner
    doc.polygon([0, 0], [cornerSize, 0], [0, cornerSize]).fill('#1e40af');
    // Top right corner
    doc.polygon([pageWidth, 0], [pageWidth - cornerSize, 0], [pageWidth, cornerSize]).fill('#1e40af');
    // Bottom left corner
    doc.polygon([0, pageHeight], [cornerSize, pageHeight], [0, pageHeight - cornerSize]).fill('#1e40af');
    // Bottom right corner
    doc.polygon([pageWidth, pageHeight], [pageWidth - cornerSize, pageHeight], [pageWidth, pageHeight - cornerSize]).fill('#1e40af');
    
    // Add fancy border
    doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
       .lineWidth(2)
       .strokeColor('#1e40af')
       .dash(10, { space: 5 })
       .stroke();
    
    // Reset dash
    doc.undash();
    
    // Add EduFlow Logo/header
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('EDUFLOW', pageWidth / 2 - 100, 60, { 
         width: 200, 
         align: 'center' 
       });
    
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#475569')
       .text('ONLINE LEARNING PLATFORM', pageWidth / 2 - 100, 80, { 
         width: 200, 
         align: 'center' 
       });
    
    // Add horizontal line under the header
    doc.moveTo(pageWidth / 2 - 100, 100)
       .lineTo(pageWidth / 2 + 100, 100)
       .stroke('#cbd5e1');
    
    // Add certificate title
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('CERTIFICATE', {
         align: 'center'
       }, 0, 130);
    
    doc.fontSize(18)
       .font('Helvetica')
       .fillColor('#334155')
       .text('OF COMPLETION', {
         align: 'center'
       });
    
    // Add certificate content
    doc.moveDown(1);
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor('#334155')
       .text(`This is to certify that`, {
         align: 'center'
       });
    
    // Add student name
    doc.moveDown(0.5);
    doc.fontSize(32)
       .font('Helvetica-Bold')
       .fillColor('#1e3a8a')
       .text(`${user.name}`, {
         align: 'center'
       });
    
    // Add course completion text
    doc.moveDown(0.5);
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor('#334155')
       .text(`has successfully completed the course`, {
         align: 'center'
       });
    
    // Add course title
    doc.moveDown(0.5);
    doc.fontSize(24)
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
    
    // Add verification details in a box
    const verificationBoxY = pageHeight - 150;
    doc.rect(pageWidth / 2 - 150, verificationBoxY, 300, 80)
       .lineWidth(1)
       .fillColor('#f1f5f9')
       .fillAndStroke('#f1f5f9', '#cbd5e1');
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#334155')
       .text('CERTIFICATE VERIFICATION', pageWidth / 2 - 130, verificationBoxY + 10, { 
         width: 260,
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
    
    // Add signature lines
    doc.moveTo(120, pageHeight - 180)
       .lineTo(270, pageHeight - 180)
       .stroke('#cbd5e1');
    
    doc.moveTo(pageWidth - 270, pageHeight - 180)
       .lineTo(pageWidth - 120, pageHeight - 180)
       .stroke('#cbd5e1');
    
    // Add signature labels
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#475569')
       .text('Course Instructor', 120, pageHeight - 170, { width: 150, align: 'center' });
    
    doc.text('Platform Director', pageWidth - 270, pageHeight - 170, { width: 150, align: 'center' });
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the PDF to be created
    return new Promise((resolve, reject) => {
      stream.on('finish', async () => {
        try {
          // Create public URL for the certificate
          const certificateUrl = `/certificates/${pdfFileName}`;
          
          // Save certificate details to database
          const certificate = await Certificate.create({
            userId,
            courseId,
            certificateId,
            issuedDate: date,
            pdfPath: certificateUrl
          });
          
          resolve({
            certificate,
            certificateId,
            pdfUrl: certificateUrl
          });
        } catch (error) {
          reject(error);
        }
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
}; 
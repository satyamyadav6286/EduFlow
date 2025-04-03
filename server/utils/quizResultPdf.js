import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generates a PDF showing quiz results
 * @param {Object} user - User object
 * @param {Object} course - Course object
 * @param {Object} quizResults - Quiz results object
 * @param {Array} submissions - Quiz submissions
 * @returns {Promise<Object>} - Object with the file path
 */
export const generateQuizResultPdf = async (user, course, quizResults, submissions) => {
  try {
    // Create directory for quiz results if it doesn't exist
    const resultsDir = path.join(__dirname, "../quiz-results");
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    console.log(`Quiz results directory: ${resultsDir}`);

    // Generate unique filename
    const timestamp = new Date().getTime();
    const fileName = `quiz_certificate_${user._id}_${course._id}_${timestamp}.pdf`;
    const filePath = path.join(resultsDir, fileName);
    
    console.log(`Generating quiz certificate PDF at: ${filePath}`);
    
    // Path for API response
    const publicPath = `/api/v1/quiz/download-results/${fileName}`;

    // Create new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      info: {
        Title: `Quiz Certificate - ${quizResults.quiz.title}`,
        Author: 'EduFlow',
        Subject: 'Quiz Achievement Certificate',
        Keywords: 'quiz, certificate, achievement, education'
      },
      margin: 50
    });

    // Create write stream
    console.log(`Creating write stream for: ${filePath}`);
    const stream = fs.createWriteStream(filePath);
    
    // Handle stream errors
    stream.on('error', (err) => {
      console.error(`Error creating PDF write stream: ${err.message}`);
      throw new Error(`Failed to create PDF file: ${err.message}`);
    });
    
    // Pipe the PDF to the file
    doc.pipe(stream);

    // Document styling
    doc.font('Helvetica');
    doc.fillColor('#f0f9ff').rect(0, 0, doc.page.width, doc.page.height).fill(); // Light blue background
    doc.fillColor('#1e293b'); // Dark text color

    // Add decorative border
    doc.lineWidth(2)
      .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .stroke('#3b82f6');
      
    // Add decorative corner embellishments
    const cornerSize = 20;
    // Top left
    doc.lineWidth(3)
      .moveTo(30, 30 + cornerSize)
      .lineTo(30, 30)
      .lineTo(30 + cornerSize, 30)
      .stroke('#1d4ed8');
    // Top right
    doc.lineWidth(3)
      .moveTo(doc.page.width - 30 - cornerSize, 30)
      .lineTo(doc.page.width - 30, 30)
      .lineTo(doc.page.width - 30, 30 + cornerSize)
      .stroke('#1d4ed8');
    // Bottom left
    doc.lineWidth(3)
      .moveTo(30, doc.page.height - 30 - cornerSize)
      .lineTo(30, doc.page.height - 30)
      .lineTo(30 + cornerSize, doc.page.height - 30)
      .stroke('#1d4ed8');
    // Bottom right
    doc.lineWidth(3)
      .moveTo(doc.page.width - 30 - cornerSize, doc.page.height - 30)
      .lineTo(doc.page.width - 30, doc.page.height - 30)
      .lineTo(doc.page.width - 30, doc.page.height - 30 - cornerSize)
      .stroke('#1d4ed8');

    // Header
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#1e40af').text('QUIZ ACHIEVEMENT CERTIFICATE', { align: 'center' });
    doc.moveDown(0.5);
    
    // Add EduFlow logo/header
    doc.fontSize(16).fillColor('#334155').text('EduFlow Learning Platform', { align: 'center' });
    doc.moveDown(2);
    
    // Certificate statement
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#0f172a')
      .text('This is to certify that', { align: 'center' });
    doc.moveDown(0.5);
    
    // Student name (prominently displayed)
    doc.fontSize(24).fillColor('#1e40af').text(user.name, { align: 'center' });
    doc.moveDown(0.5);
    
    // Successfully completed statement
    doc.fontSize(14).fillColor('#0f172a').font('Helvetica')
      .text('has successfully demonstrated knowledge by completing the quiz for', { align: 'center' });
    doc.moveDown(0.5);
    
    // Course title (prominently displayed)
    doc.fontSize(20).fillColor('#1e40af').font('Helvetica-Bold')
      .text(course.title || course.courseTitle, { align: 'center' });
    doc.moveDown(1);
    
    // Draw a decorative separator
    doc.strokeColor('#3b82f6').lineWidth(1);
    doc.moveTo(150, doc.y).lineTo(doc.page.width - 150, doc.y).stroke();
    doc.moveDown(1);

    // Course information
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af').text('Achievement Details', { align: 'left' });
    doc.moveDown(0.5);
    
    doc.font('Helvetica').fontSize(12).fillColor('#334155');
    
    // Quiz title
    doc.text(`Quiz: ${quizResults.quiz.title}`);
    doc.moveDown(0.2);
    
    // Best score with checkmark icon
    doc.text(`Best Score: ${Math.round(quizResults.bestScore)}%`);
    doc.moveDown(0.2);
    
    // Pass status with visual indicator
    const passStatus = quizResults.hasPassed ? 'PASSED' : 'COMPLETED';
    const passColor = quizResults.hasPassed ? '#22c55e' : '#f59e0b';
    doc.text(`Status: `).fillColor(passColor).font('Helvetica-Bold').text(passStatus, {continued: true});
    doc.fillColor('#334155').font('Helvetica');
    doc.moveDown(0.5);
    
    // Date of completion
    const mostRecentSubmission = submissions[0];
    const completionDate = new Date(mostRecentSubmission?.submittedAt || Date.now()).toLocaleDateString();
    doc.text(`Date Completed: ${completionDate}`);
    doc.moveDown(2);

    // Score visualization
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af').text('Performance', { align: 'left' });
    doc.moveDown(0.5);
    
    // Score gauge - draw a background bar
    const gaugeY = doc.y + 10;
    const gaugeWidth = 300;
    const gaugeHeight = 30;
    
    // Background bar
    doc.fillColor('#e2e8f0').roundedRect(100, gaugeY, gaugeWidth, gaugeHeight, 5).fill();
    
    // Progress bar
    const scoreWidth = (quizResults.bestScore / 100) * gaugeWidth;
    doc.fillColor(quizResults.hasPassed ? '#22c55e' : '#f59e0b')
      .roundedRect(100, gaugeY, scoreWidth, gaugeHeight, 5)
      .fill();
    
    // Score text
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#ffffff')
      .text(`${Math.round(quizResults.bestScore)}%`, 
        100 + (scoreWidth / 2) - 10, 
        gaugeY + (gaugeHeight / 2) - 6);
    
    // Required score marker
    const passingScorePosition = 100 + ((quizResults.quiz.passingScore / 100) * gaugeWidth);
    doc.moveTo(passingScorePosition, gaugeY - 5)
      .lineTo(passingScorePosition, gaugeY + gaugeHeight + 5)
      .lineWidth(2)
      .stroke('#ef4444');
    
    // Add passing score label
    doc.fontSize(10).fillColor('#334155')
      .text(`Passing: ${quizResults.quiz.passingScore}%`, 
        passingScorePosition - 20, 
        gaugeY + gaugeHeight + 10);
        
    doc.moveDown(3);

    // Attempt history
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af').text('Attempt History');
    doc.moveDown(0.5);
    
    if (submissions && submissions.length > 0) {
      // Table header
      const tableTop = doc.y;
      const tableWidth = 500;
      const columnWidth = tableWidth / 4;
      
      // Draw table header
      doc.rect(50, tableTop, tableWidth, 30).fill('#e2e8f0');
      
      // Header text
      doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold')
        .text('Attempt #', 60, tableTop + 10)
        .text('Date', 60 + columnWidth, tableTop + 10)
        .text('Score', 60 + columnWidth * 2, tableTop + 10)
        .text('Status', 60 + columnWidth * 3, tableTop + 10);
      
      // Draw rows - max 10 attempts to fit on the page
      const maxAttempts = Math.min(submissions.length, 10);
      const rowHeight = 30;
      
      for (let i = 0; i < maxAttempts; i++) {
        const submission = submissions[i];
        const rowY = tableTop + 30 + (rowHeight * i);
        
        // Alternate row backgrounds
        if (i % 2 === 0) {
          doc.rect(50, rowY, tableWidth, rowHeight).fill('#f8fafc');
        } else {
          doc.rect(50, rowY, tableWidth, rowHeight).fill('#f1f5f9');
        }
        
        // Row data
        doc.fillColor('#334155').fontSize(11).font('Helvetica')
          .text(`${i + 1}`, 60, rowY + 10)
          .text(new Date(submission.submittedAt).toLocaleDateString(), 60 + columnWidth, rowY + 10)
          .text(`${Math.round(submission.score)}%`, 60 + columnWidth * 2, rowY + 10);
        
        // Status with color
        doc.fillColor(submission.isPassed ? '#22c55e' : '#ef4444')
          .text(submission.isPassed ? 'Passed' : 'Failed', 60 + columnWidth * 3, rowY + 10);
      }
      
      // If there are more attempts than we showed
      if (submissions.length > 10) {
        doc.moveDown(maxAttempts + 1.5);
        doc.fillColor('#64748b').fontSize(10)
          .text(`Showing ${maxAttempts} most recent attempts of ${submissions.length} total attempts.`, 
            { align: 'center' });
      }
    } else {
      doc.fontSize(12).fillColor('#64748b').text('No attempts recorded.', { align: 'center' });
    }
    
    // Certificate verification
    doc.moveDown(2);
    const verificationY = doc.y;
    
    // Add certificate ID
    const certificateId = `QC-${user._id.substring(0, 4)}-${course._id.substring(0, 4)}-${timestamp.toString().substring(0, 8)}`;
    doc.fontSize(10).fillColor('#334155')
      .text(`Certificate ID: ${certificateId}`, 50, verificationY);
    
    // Add verification text
    doc.fontSize(10).fillColor('#334155')
      .text(`Verify this certificate at: ${process.env.FRONTEND_URL || 'eduflow.yourdomain.com'}/verify-quiz/${certificateId}`, 
        50, verificationY + 15);
    
    // Footer
    const footerY = doc.page.height - 70;
    
    doc.fontSize(10).fillColor('#64748b').text(
      'This certificate acknowledges the quiz performance of the student named above.',
      50, footerY, { align: 'center', width: 500 }
    );
    
    doc.moveDown(0.5);
    doc.text(
      `Generated on ${new Date().toLocaleString()} • EduFlow Learning Platform`,
      { align: 'center' }
    );
    
    // Finalize the PDF
    doc.end();
    
    console.log(`Quiz certificate PDF generation in progress...`);
    
    // Return a promise that resolves when the PDF is written
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log(`PDF generated successfully at: ${filePath}`);
        resolve({
          path: filePath,
          filename: fileName,
          publicPath,
          certificateId
        });
      });
      
      stream.on('error', (error) => {
        console.error(`Error while finalizing PDF: ${error.message}`);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error generating quiz result PDF:', error);
    throw error;
  }
}; 
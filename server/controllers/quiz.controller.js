import { Quiz, QuizSubmission } from "../models/quiz.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import { Certificate } from "../models/certificate.model.js";
import mongoose from "mongoose";
import { generateCertificate } from "../utils/certificateGenerator.js";
import { generateQuizResultPdf } from "../utils/quizResultPdf.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a new quiz for a course
export const createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, questions, passingScore, timeLimit } = req.body;
    
    // Validate the course exists and belongs to this instructor
    const course = await Course.findOne({ 
      _id: courseId,
      creator: req.id 
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found or you are not authorized to modify it."
      });
    }
    
    // Check if a quiz already exists for this course
    const existingQuiz = await Quiz.findOne({ courseId });
    if (existingQuiz) {
      return res.status(400).json({
        success: false,
        message: "A quiz already exists for this course. Please update the existing quiz."
      });
    }
    
    // Create new quiz
    const quiz = await Quiz.create({
      courseId,
      title: title || `Quiz for ${course.courseTitle}`,
      description,
      questions,
      passingScore: passingScore || 70,
      timeLimit: timeLimit || 30,
      isActive: true
    });
    
    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create quiz"
    });
  }
};

// Get a quiz by course ID
export const getQuizByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const quiz = await Quiz.findOne({ courseId });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found for this course"
      });
    }
    
    return res.status(200).json({
      success: true,
      quiz
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz"
    });
  }
};

// Update a quiz
export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const updateData = req.body;
    
    // Find the quiz and check authorization
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }
    
    // Check if the course belongs to this instructor
    const course = await Course.findOne({
      _id: quiz.courseId,
      creator: req.id
    });
    
    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this quiz."
      });
    }
    
    // Update the quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      updateData,
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz: updatedQuiz
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update quiz"
    });
  }
};

// Submit a quiz attempt
export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId, answers, timeSpent } = req.body;
    const userId = req.id;
    
    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }
    
    // Calculate the score
    let correctAnswers = 0;
    const answeredQuestions = new Set(answers.map(a => a.questionId));
    
    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId);
      if (!question) continue;
      
      const selectedOption = question.options.id(answer.selectedOption);
      if (selectedOption && selectedOption.isCorrect) {
        correctAnswers++;
      }
    }
    
    const totalQuestions = quiz.questions.length;
    const attemptedQuestions = answeredQuestions.size;
    
    // Penalize unanswered questions
    const score = (correctAnswers / totalQuestions) * 100;
    const isPassed = score >= quiz.passingScore;
    
    // Get previous submissions to check if this is an improvement
    const previousSubmissions = await QuizSubmission.find({
      userId,
      quizId,
    }).sort({ score: -1 }).limit(1);
    
    const previousBestScore = previousSubmissions.length > 0 ? previousSubmissions[0].score : 0;
    const isImprovement = score > previousBestScore;
    
    console.log(`Quiz submission: Score=${score}, PassingScore=${quiz.passingScore}, isPassed=${isPassed}, previousBest=${previousBestScore}`);
    
    // Create the submission
    const submission = await QuizSubmission.create({
      userId,
      quizId,
      courseId: quiz.courseId,
      answers,
      score,
      isPassed,
      timeSpent: timeSpent || 0,
      completedAt: new Date()
    });
    
    // If passed, update course progress
    if (isPassed) {
      // Update course progress to mark course as completed
      await CourseProgress.findOneAndUpdate(
        { userId, courseId: quiz.courseId },
        { completed: true },
        { upsert: true, new: true }
      );
      
      // Check if this is the first time passing or if we're improving our score
      if (isImprovement || !previousSubmissions.some(sub => sub.isPassed)) {
        try {
          // Check if certificate already exists
          const existingCertificate = await Certificate.findOne({
            userId,
            courseId: quiz.courseId
          });
          
          if (!existingCertificate) {
            // Generate a new certificate
            console.log(`Generating certificate for user ${userId} and course ${quiz.courseId}`);
            await generateCertificate(userId, quiz.courseId);
          }
        } catch (certError) {
          console.error("Certificate generation error:", certError);
          // Don't fail the submission if certificate generation fails
        }
      }
    }
    
    // Create response message based on result
    let message = isPassed 
      ? "Congratulations! You passed the quiz." 
      : `You scored ${Math.round(score)}%, which is below the passing score of ${quiz.passingScore}%. Please try again.`;
      
    if (isPassed && isImprovement && previousBestScore > 0) {
      message = `Congratulations! You improved your score from ${Math.round(previousBestScore)}% to ${Math.round(score)}%.`;
    } else if (isPassed && !isImprovement && previousBestScore > 0) {
      message = `You passed the quiz with ${Math.round(score)}%, but your previous best score was ${Math.round(previousBestScore)}%.`;
    }
    
    return res.status(201).json({
      success: true,
      message,
      submission: {
        score,
        isPassed,
        correctAnswers,
        totalQuestions,
        attemptedQuestions,
        isImprovement
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit quiz"
    });
  }
};

// Get quiz results for a user and course
export const getQuizResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    
    // Find the quiz for this course
    const quiz = await Quiz.findOne({ courseId });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found for this course"
      });
    }
    
    // Get all submissions for this user and quiz
    const submissions = await QuizSubmission.find({
      userId,
      quizId: quiz._id
    }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      results: {
        quiz: {
          title: quiz.title,
          passingScore: quiz.passingScore
        },
        submissions: submissions.map(sub => ({
          _id: sub._id,
          id: sub._id,
          score: sub.score,
          isPassed: sub.isPassed,
          submittedAt: sub.completedAt,
          timeSpent: sub.timeSpent
        })),
        bestScore: submissions.length > 0 
          ? Math.max(...submissions.map(sub => sub.score))
          : 0,
        hasPassed: submissions.some(sub => sub.isPassed)
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz results"
    });
  }
};

// Generate a quiz result PDF
export const generateQuizResultsPDF = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get quiz for the course
    const quiz = await Quiz.findOne({ courseId });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found for this course"
      });
    }

    // Get all submissions for this user and quiz
    const submissions = await QuizSubmission.find({
      userId,
      quizId: quiz._id
    }).sort({ createdAt: -1 });

    if (submissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No quiz attempts found. Please attempt the quiz first."
      });
    }

    // Calculate best score
    const bestScore = Math.max(...submissions.map(sub => sub.score));
    const hasPassed = submissions.some(sub => sub.isPassed);

    // Generate the PDF
    const quizResults = {
      quiz: {
        title: quiz.title,
        passingScore: quiz.passingScore
      },
      bestScore,
      hasPassed
    };

    const pdfResult = await generateQuizResultPdf(user, course, quizResults, submissions);

    // Return the result
    return res.status(200).json({
      success: true,
      message: "Quiz results PDF generated successfully",
      pdfUrl: pdfResult.publicPath
    });
  } catch (error) {
    console.error("Error generating quiz results PDF:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate quiz results PDF"
    });
  }
};

// Download quiz results PDF
export const downloadQuizResultsPDF = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { token } = req.query;
    const userId = req.id;
    
    console.log(`Download quiz certificate request for course: ${courseId}, user: ${userId}`);
    
    // Verify token if provided via query parameter (for direct access in new tabs)
    if (token && !req.isAuthenticated) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) {
          console.log("Query token verified, user ID:", decoded.id);
          req.isAuthenticated = true;
          req.id = decoded.id;
        }
      } catch (tokenError) {
        console.error("Token verification failed:", tokenError);
        // Continue with the request, but authentication status remains false
      }
    }
    
    // Require authentication
    if (!req.isAuthenticated || !req.id) {
      console.error("Access denied: User not authenticated for quiz certificate download");
      return res.status(401).json({
        success: false,
        message: "Authentication required to access quiz certificate"
      });
    }
    
    // Verify the user has attempted the quiz for this course
    const quiz = await Quiz.findOne({ courseId });
    if (!quiz) {
      console.error(`Quiz not found for course: ${courseId}`);
      return res.status(404).json({
        success: false,
        message: "Quiz not found for this course"
      });
    }
    
    // Check if user has any quiz attempts
    const submissions = await QuizSubmission.find({ 
      userId: req.id, 
      quizId: quiz._id 
    }).sort({ score: -1 }); // Sort by highest score first
    
    if (!submissions || submissions.length === 0) {
      console.error(`No quiz attempts found for user ${req.id} in course ${courseId}`);
      return res.status(404).json({
        success: false,
        message: "No quiz attempts found for this course"
      });
    }
    
    // Use the best submission for the certificate
    const bestSubmission = submissions[0];
    
    // Generate filename for the quiz certificate
    const filename = `quiz_certificate_${req.id}_${courseId}.pdf`;
    const filePath = path.resolve(__dirname, `../quiz-results/${filename}`);
    console.log(`Attempting to serve quiz certificate from: ${filePath}`);
    
    // Check if file exists, if not, regenerate it
    if (!fs.existsSync(filePath)) {
      console.log(`Quiz certificate PDF not found: ${filePath}. Regenerating...`);
      
      try {
        // Get course information
        const course = await Course.findById(courseId);
        if (!course) {
          return res.status(404).json({
            success: false,
            message: "Course not found"
          });
        }
        
        // Get user information
        const user = await User.findById(req.id);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found"
          });
        }
        
        // Generate the PDF
        await generateQuizResultPdf(user, course, quiz, submissions);
        
        // Check if generation was successful
        if (!fs.existsSync(filePath)) {
          throw new Error("Failed to generate quiz certificate PDF");
        }
      } catch (genError) {
        console.error("Error generating quiz certificate PDF:", genError);
        return res.status(500).json({
          success: false,
          message: "Failed to generate quiz certificate PDF"
        });
      }
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${filename}`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on('error', (err) => {
      console.error(`Error streaming quiz certificate PDF: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error streaming quiz certificate PDF"
        });
      }
    });
  } catch (error) {
    console.error("Error downloading quiz certificate PDF:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download quiz certificate PDF"
    });
  }
};

export const downloadScorecard = async (req, res) => {
  try {
    // Define server base URL
    const serverBaseUrl = process.env.SERVER_BASE_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    
    // Extract the quiz result ID from the URL
    const { resultId } = req.params;
    
    if (!resultId) {
      return res.status(400).json({ 
        success: false, 
        message: "Quiz result ID is required" 
      });
    }
    
    console.log(`Attempting to download scorecard for submission ID: ${resultId}`);
    
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      console.error(`Invalid MongoDB ID format: ${resultId}`);
      return res.status(400).json({
        success: false,
        message: "Invalid quiz result ID format"
      });
    }
    
    // Find the quiz result - using QuizSubmission model
    const quizResult = await QuizSubmission.findById(resultId)
      .populate('quizId', 'title passingScore')
      .populate('userId', 'name email')
      .populate('courseId', 'courseTitle');
    
    if (!quizResult) {
      console.error(`Quiz submission not found with ID: ${resultId}`);
      return res.status(404).json({ 
        success: false, 
        message: "Quiz result not found" 
      });
    }
    
    console.log(`Found quiz submission: ${quizResult._id} for user ${quizResult.userId?.name || 'Unknown'}`);
    
    // Create PDF document - set to A4 with smaller margins for better space usage
    const pdfDoc = new PDFDocument({
      size: 'A4',
      margin: 30, // Reduced margins
      info: {
        Title: `${quizResult.quizId?.title || 'Quiz'} - Quiz Scorecard`,
        Author: 'EduFlow Learning Platform',
        Subject: 'Quiz Scorecard',
        Keywords: 'quiz, score, certificate, education'
      }
    });
    
    // Set filename for download
    const fileName = `EduFlow_Quiz_Scorecard_${resultId}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Pipe PDF to response
    pdfDoc.pipe(res);
    
    // Constants for consistent styling
    const primaryColor = '#3B82F6';  // Blue
    const secondaryColor = '#111827'; // Dark gray
    const successColor = '#10B981';  // Green
    const warningColor = '#F59E0B';  // Amber
    const lightGray = '#F3F4F6';
    
    // ===== PDF Content =====
    
    // ----- Header -----
    // Professional header with logo and line
    pdfDoc.lineWidth(1);
    
    // Logo circle
    pdfDoc.circle(70, 40, 15)
      .fill(primaryColor);
      
    // EduFlow text logo
    pdfDoc.font('Helvetica-Bold')
      .fontSize(12)
      .fill('white')
      .text('EF', 65, 36);
    
    // Company name
    pdfDoc.font('Helvetica-Bold')
      .fontSize(18)
      .fill(secondaryColor)
      .text('EduFlow Learning Platform', 95, 33);
      
    // Horizontal line
    pdfDoc.moveTo(30, 60)
      .lineTo(pdfDoc.page.width - 30, 60)
      .stroke(primaryColor);
      
    // Document type
    pdfDoc.fontSize(12)
      .fill(primaryColor)
      .text('QUIZ SCORECARD', pdfDoc.page.width - 130, 33);
      
    // ----- Title Section -----
    pdfDoc.font('Helvetica-Bold')
      .fontSize(14)
      .fill(secondaryColor)
      .text(quizResult.quizId?.title || 'Quiz', 30, 70);
      
    // Course name if available
    if (quizResult.courseId?.courseTitle) {
      pdfDoc.font('Helvetica')
        .fontSize(10)
        .fill('#6B7280')
        .text(`Course: ${quizResult.courseId.courseTitle}`, 30, 87);
    }
    
    // ----- Student Information -----
    // Gray background box
    pdfDoc.roundedRect(30, 100, pdfDoc.page.width - 60, 65, 5)
      .fill(lightGray);
      
    // Student details
    pdfDoc.font('Helvetica-Bold')
      .fontSize(11)
      .fill(secondaryColor)
      .text('STUDENT INFORMATION', 40, 105);
      
    // Student details - left column
    pdfDoc.font('Helvetica-Bold')
      .fontSize(10)
      .fill('#4B5563')
      .text('Name:', 40, 120);
      
    pdfDoc.font('Helvetica')
      .fontSize(10)
      .fill(secondaryColor)
      .text(quizResult.userId?.name || 'Student', 80, 120);
      
    pdfDoc.font('Helvetica-Bold')
      .fontSize(10)
      .fill('#4B5563')
      .text('Email:', 40, 135);
      
    pdfDoc.font('Helvetica')
      .fontSize(10)
      .fill(secondaryColor)
      .text(quizResult.userId?.email || 'N/A', 80, 135);
      
    // Student details - right column  
    pdfDoc.font('Helvetica-Bold')
      .fontSize(10)
      .fill('#4B5563')
      .text('Completion Date:', 280, 120);
      
    pdfDoc.font('Helvetica')
      .fontSize(10)
      .fill(secondaryColor)
      .text(new Date(quizResult.completedAt || quizResult.createdAt).toLocaleDateString(), 360, 120);
      
    pdfDoc.font('Helvetica-Bold')
      .fontSize(10)
      .fill('#4B5563')
      .text('Verification ID:', 280, 135);
      
    pdfDoc.font('Helvetica')
      .fontSize(10)
      .fill(secondaryColor)
      .text(resultId, 360, 135);
      
    // ----- Score Circle & Results -----
    const isPassed = quizResult.isPassed;
    const score = Math.round(quizResult.score);
    const scoreColor = isPassed ? successColor : warningColor;
    
    // Draw circular score indicator - make it smaller
    const circleX = 90;
    const circleY = 200;
    const circleRadius = 35;
    
    // Outer circle
    pdfDoc.circle(circleX, circleY, circleRadius)
      .lineWidth(3)
      .stroke(scoreColor);
      
    // Background fill
    pdfDoc.circle(circleX, circleY, circleRadius - 1.5)
      .fill('#FFFFFF');
      
    // Score text
    pdfDoc.font('Helvetica-Bold')
      .fontSize(20)
      .fill(scoreColor)
      .text(`${score}%`, circleX - 20, circleY - 10);
      
    // Score label
    pdfDoc.fontSize(9)
      .fill('#6B7280')
      .text('SCORE', circleX - 15, circleY + 10);
      
    // Status badge
    const statusY = 250;
    const statusText = isPassed ? 'PASSED' : 'NOT PASSED';
    const textWidth = pdfDoc.widthOfString(statusText);
    
    // Draw status badge
    pdfDoc.roundedRect(circleX - textWidth/2 - 10, statusY - 15, textWidth + 20, 25, 15)
      .fill(isPassed ? successColor : warningColor);
      
    pdfDoc.font('Helvetica-Bold')
      .fontSize(12)
      .fill('white')
      .text(statusText, circleX - textWidth/2, statusY - 10);
      
    // ----- Results Details -----
    // Draw results table
    const tableX = 180;
    const tableY = 170;
    const tableWidth = 280;
    
    pdfDoc.font('Helvetica-Bold')
      .fontSize(12)
      .fill(secondaryColor)
      .text('QUIZ RESULTS DETAILS', tableX, tableY);
      
    // Calculate statistics
    const answeredQuestions = quizResult.answers?.length || 0;
    const correctAnswers = Math.round((quizResult.score / 100) * answeredQuestions);
    const passingScore = quizResult.quizId?.passingScore || 70;
    
    // Table setup
    const rowHeight = 25; // Smaller rows
    const colWidth = tableWidth / 2;
    
    // Helper function to draw a row
    const drawRow = (label, value, rowY, isEven = false) => {
      // Row background
      pdfDoc.rect(tableX, rowY, tableWidth, rowHeight)
        .fill(isEven ? lightGray : '#FFFFFF');
        
      // Add border
      pdfDoc.rect(tableX, rowY, tableWidth, rowHeight)
        .lineWidth(1)
        .stroke('#E5E7EB');
        
      // Add label
      pdfDoc.font('Helvetica')
        .fontSize(10)
        .fill('#4B5563')
        .text(label, tableX + 10, rowY + 8); // Adjusted vertical position
        
      // Add value
      pdfDoc.font('Helvetica-Bold')
        .fontSize(10)
        .fill(secondaryColor)
        .text(value, tableX + colWidth, rowY + 8); // Adjusted vertical position
    };
    
    // Draw table rows
    drawRow('Questions Attempted', answeredQuestions.toString(), tableY + 25, true);
    drawRow('Correct Answers', correctAnswers.toString(), tableY + 25 + rowHeight, false);
    drawRow('Score Percentage', `${score}%`, tableY + 25 + rowHeight * 2, true);
    drawRow('Passing Threshold', `${passingScore}%`, tableY + 25 + rowHeight * 3, false);
    
    // ----- Verification Instructions -----
    const verifyY = 300;
    
    pdfDoc.font('Helvetica-Bold')
      .fontSize(10)
      .fill(secondaryColor)
      .text('Verify this scorecard', 30, verifyY);
      
    pdfDoc.font('Helvetica')
      .fontSize(9)
      .fill('#6B7280')
      .text(`Visit ${serverBaseUrl || 'https://eduflow.com'}/verify and enter the Verification ID: ${resultId}`, 30, verifyY + 15);
      
    // ----- Footer -----
    const footerY = 370; // Fixed position higher on the page
    
    // Footer line
    pdfDoc.moveTo(30, footerY)
      .lineTo(pdfDoc.page.width - 30, footerY)
      .lineWidth(1)
      .stroke('#E5E7EB');
      
    // Consolidated footer text with copyright
    pdfDoc.font('Helvetica')
      .fontSize(8)
      .fill('#9CA3AF')
      .text(`This document serves as an official record of quiz completion, generated on ${new Date().toLocaleDateString()}.`, 30, footerY + 10, {
        align: 'center',
        width: pdfDoc.page.width - 60
      });
      
    pdfDoc.font('Helvetica')
      .fontSize(8)
      .fill('#9CA3AF')
      .text('© EduFlow Learning Platform', 30, footerY + 25, {
        align: 'center',
        width: pdfDoc.page.width - 60
      });
    
    // Finalize PDF document
    pdfDoc.end();
    
  } catch (error) {
    console.error('Error generating quiz scorecard:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to generate quiz scorecard",
      error: error.message
    });
  }
};

// Verify quiz scorecard
export const verifyScorecard = async (req, res) => {
  try {
    // Extract the scorecard ID from the URL
    const { resultId } = req.params;
    
    if (!resultId) {
      return res.status(400).json({ 
        success: false, 
        message: "Scorecard ID is required" 
      });
    }
    
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scorecard ID format"
      });
    }
    
    // Find the quiz submission with references to quiz and user
    const submission = await QuizSubmission.findById(resultId)
      .populate('quizId', 'title passingScore')
      .populate('userId', 'name email')
      .populate('courseId', 'courseTitle');
    
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: "Scorecard not found" 
      });
    }
    
    // Format the response data
    const scorecardData = {
      _id: submission._id,
      quizTitle: submission.quizId?.title || 'Quiz',
      courseName: submission.courseId?.courseTitle || 'Course',
      userName: submission.userId?.name || 'Student',
      userEmail: submission.userId?.email || 'Not available',
      score: submission.score,
      isPassed: submission.isPassed,
      completedAt: submission.completedAt || submission.createdAt,
      timeSpent: submission.timeSpent || 0,
      questionsAttempted: submission.answers?.length || 0
    };
    
    return res.status(200).json({
      success: true,
      message: "Scorecard verified successfully",
      submission: scorecardData
    });
    
  } catch (error) {
    console.error('Error verifying scorecard:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to verify scorecard",
      error: error.message
    });
  }
}; 
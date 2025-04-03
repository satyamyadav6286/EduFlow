import { Quiz, QuizSubmission } from "../models/quiz.model.js";
import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.js";
import { Certificate } from "../models/certificate.model.js";
import mongoose from "mongoose";
import { generateCertificate } from "../utils/certificateGenerator.js";

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
    
    // Check if user has already passed this quiz
    const existingSubmission = await QuizSubmission.findOne({
      userId,
      quizId,
      isPassed: true
    });
    
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "You have already passed this quiz."
      });
    }
    
    // Calculate the score
    let correctAnswers = 0;
    
    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId);
      if (!question) continue;
      
      const selectedOption = question.options.id(answer.selectedOption);
      if (selectedOption && selectedOption.isCorrect) {
        correctAnswers++;
      }
    }
    
    const totalQuestions = quiz.questions.length;
    const score = (correctAnswers / totalQuestions) * 100;
    const isPassed = score >= quiz.passingScore;
    
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
    
    // If passed, update course progress and generate certificate
    if (isPassed) {
      // Update course progress to mark course as completed
      await CourseProgress.findOneAndUpdate(
        { userId, courseId: quiz.courseId },
        { completed: true },
        { new: true }
      );
      
      // Check if certificate already exists
      const existingCertificate = await Certificate.findOne({
        userId,
        courseId: quiz.courseId
      });
      
      if (!existingCertificate) {
        // Generate a new certificate
        await generateCertificate(userId, quiz.courseId);
      }
    }
    
    return res.status(201).json({
      success: true,
      message: isPassed ? "Congratulations! You passed the quiz." : "You did not pass the quiz. Please try again.",
      submission: {
        score,
        isPassed,
        correctAnswers,
        totalQuestions
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
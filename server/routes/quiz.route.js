import express from "express";
import {
  createQuiz,
  getQuizByCourse,
  updateQuiz,
  submitQuizAttempt,
  getQuizResults,
  generateQuizResultsPDF,
  downloadQuizResultsPDF,
  downloadScorecard,
  verifyScorecard
} from "../controllers/quiz.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { validateToken } from "../middlewares/tokenValidator.js";

const router = express.Router();

// Instructor routes (require instructor auth)
router.route("/")
  .post(isAuthenticated, createQuiz);

router.route("/:quizId")
  .put(isAuthenticated, updateQuiz);

// Student routes (require regular auth)
router.route("/course/:courseId")
  .get(isAuthenticated, getQuizByCourse);

router.route("/submit")
  .post(isAuthenticated, submitQuizAttempt);

router.route("/results/:courseId")
  .get(isAuthenticated, getQuizResults);

// Quiz results PDF routes
router.route("/results-pdf/:courseId")
  .get(isAuthenticated, generateQuizResultsPDF);

router.route("/download-results/:filename")
  .get(isAuthenticated, downloadQuizResultsPDF);

// Public route for downloading quiz scorecard (no authentication required)
router.route("/scorecard/:resultId/download")
  .get(downloadScorecard)
  .post(downloadScorecard);

// Public route for verifying quiz scorecard (no authentication required)
router.route("/scorecard/:resultId/verify")
  .get(verifyScorecard);

// Generate PDF for quiz results (protected - only for the student who took the quiz)
router.route("/:courseId/results/pdf").post(isAuthenticated, generateQuizResultsPDF);

// Download PDF for quiz results (protected - only for the student who took the quiz)
// Use token validator to support token in query params
router.route("/:courseId/results/pdf/download").get(validateToken, downloadQuizResultsPDF);

export default router; 
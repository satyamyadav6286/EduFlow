import express from "express";
import {
  createQuiz,
  getQuizByCourse,
  updateQuiz,
  submitQuizAttempt,
  getQuizResults
} from "../controllers/quiz.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isInstructor from "../middlewares/isInstructor.js";

const router = express.Router();

// Instructor routes (require instructor auth)
router.route("/")
  .post(isAuthenticated, isInstructor, createQuiz);

router.route("/:quizId")
  .put(isAuthenticated, isInstructor, updateQuiz);

// Student routes (require regular auth)
router.route("/course/:courseId")
  .get(isAuthenticated, getQuizByCourse);

router.route("/submit")
  .post(isAuthenticated, submitQuizAttempt);

router.route("/results/:courseId")
  .get(isAuthenticated, getQuizResults);

export default router; 
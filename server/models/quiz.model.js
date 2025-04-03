import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [optionSchema],
  explanation: {
    type: String,
    default: ""
  }
});

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  questions: [questionSchema],
  passingScore: {
    type: Number,
    required: true,
    default: 70, // Percentage required to pass
    min: 0,
    max: 100
  },
  timeLimit: {
    type: Number, // In minutes
    default: 30
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const Quiz = mongoose.model("Quiz", quizSchema);

export const QuizSubmission = mongoose.model("QuizSubmission", new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    selectedOption: {
      type: mongoose.Schema.Types.ObjectId
    }
  }],
  score: {
    type: Number,
    required: true
  },
  isPassed: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number, // In seconds
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true })); 
import React, { useState, useEffect } from "react";
import { useGetQuizByCourseQuery, useSubmitQuizAttemptMutation, useGetQuizResultsQuery } from "@/features/api/quizApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Award, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const CourseQuiz = ({ courseId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Fetch quiz data
  const { data: quizData, isLoading: isLoadingQuiz, isError: isQuizError } = 
    useGetQuizByCourseQuery(courseId, { skip: !courseId });
    
  // Fetch quiz results (past attempts)
  const { data: resultsData, isLoading: isLoadingResults } = 
    useGetQuizResultsQuery(courseId, { skip: !courseId || !quizCompleted });
    
  // Submit quiz attempt
  const [submitQuiz, { isLoading: isSubmitting }] = useSubmitQuizAttemptMutation();

  // Timer effect
  useEffect(() => {
    if (quizData?.quiz?.timeLimit && !quizCompleted && !showResults) {
      // Convert minutes to milliseconds
      const timeLimit = quizData.quiz.timeLimit * 60 * 1000;
      
      if (!startTime) {
        setStartTime(Date.now());
        setTimeRemaining(timeLimit);
      }
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, timeLimit - elapsed);
        
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          handleSubmitQuiz();
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [quizData, startTime, quizCompleted, showResults]);

  // Format time remaining
  const formatTimeRemaining = () => {
    if (timeRemaining === null) return "--:--";
    
    const totalSeconds = Math.floor(timeRemaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Calculate time spent
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    
    // Format the answers for submission
    const answers = Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
      questionId,
      selectedOption: optionId
    }));
    
    try {
      // Check if all questions are answered
      if (answers.length < quizData.quiz.questions.length) {
        const isConfirmed = window.confirm(
          `You have only answered ${answers.length} out of ${quizData.quiz.questions.length} questions. Are you sure you want to submit?`
        );
        if (!isConfirmed) return;
      }
      
      // Submit the quiz
      const response = await submitQuiz({
        quizId: quizData.quiz._id,
        answers,
        timeSpent
      }).unwrap();
      
      setQuizCompleted(true);
      
      toast.success("Quiz completed!", {
        description: response.message
      });
      
      setShowResults(true);
    } catch (error) {
      toast.error("Failed to submit quiz", {
        description: error.data?.message || "There was an error submitting your answers. Please try again."
      });
    }
  };

  // Show loading state
  if (isLoadingQuiz) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Loading Quiz</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (isQuizError) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-red-500">Quiz Not Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            The quiz for this course is not available. Please contact your instructor.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show results of past attempts
  if (showResults) {
    if (isLoadingResults) {
      return (
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Loading Results</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      );
    }

    // Extract latest attempt (current one)
    const latestSubmission = resultsData?.results?.submissions?.[0];
    const bestScore = resultsData?.results?.bestScore || 0;
    const passingScore = resultsData?.results?.quiz?.passingScore || 70;
    const hasPassed = bestScore >= passingScore;
    const currentScore = latestSubmission?.score || 0;
    const isCurrentScoreBest = currentScore >= bestScore;
    
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className={`text-center ${hasPassed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
          <CardTitle className={`flex items-center justify-center gap-2 ${hasPassed ? 'text-green-600 dark:text-green-300' : 'text-amber-600 dark:text-amber-300'}`}>
            {hasPassed ? (
              <>
                <Award className="h-6 w-6" />
                Quiz Passed!
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6" />
                Quiz Results
              </>
            )}
          </CardTitle>
          <CardDescription className={hasPassed ? 'text-green-600 dark:text-green-300' : 'text-amber-600 dark:text-amber-300'}>
            {hasPassed 
              ? 'Congratulations! You have successfully completed this quiz.' 
              : `You need to score at least ${passingScore}% to pass this quiz.`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Latest score (current attempt) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm text-gray-500">Your Current Score</h3>
                {isCurrentScoreBest && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Best Score</span>}
              </div>
              <div className="flex items-center gap-4">
                <Progress value={currentScore} className="h-3" />
                <span className="font-bold">{Math.round(currentScore)}%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Completed on {new Date(latestSubmission?.submittedAt).toLocaleString()}
              </p>
            </div>
            
            {/* Show best score if different from current */}
            {!isCurrentScoreBest && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-gray-500">Best Score</h3>
                <div className="flex items-center gap-4">
                  <Progress value={bestScore} className="h-3" />
                  <span className="font-bold">{Math.round(bestScore)}%</span>
                </div>
              </div>
            )}
            
            {/* Attempt history */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Attempt History</h3>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                  {resultsData?.results?.submissions?.length || 0} {resultsData?.results?.submissions?.length === 1 ? 'attempt' : 'attempts'}
                </span>
              </div>
              {resultsData?.results?.submissions?.length > 0 ? (
                <div className="divide-y">
                  {resultsData.results.submissions.map((submission, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {submission.isPassed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span>Attempt {idx + 1}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{Math.round(submission.score)}%</p>
                        <p className="text-sm text-gray-500">
                          {Math.floor(submission.timeSpent / 60)}m {submission.timeSpent % 60}s
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No previous attempts found.</p>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col md:flex-row justify-between gap-4">
          {hasPassed ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to={`/certificate?courseId=${courseId}`} className="w-full">
                <Button className="w-full flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  View Certificate
                </Button>
              </Link>
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowResults(false);
                    setQuizCompleted(false);
                    setSelectedAnswers({});
                    setCurrentQuestionIndex(0);
                    setStartTime(null);
                  }}
                >
                  Try Again
                </Button>
                <Link to={`/course-progress/${courseId}`} className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Back to Course
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full flex gap-4">
              <Button 
                variant="outline" 
                className="w-1/2"
                onClick={() => {
                  setShowResults(false);
                  setQuizCompleted(false);
                  setSelectedAnswers({});
                  setCurrentQuestionIndex(0);
                  setStartTime(null);
                }}
              >
                Try Again
              </Button>
              <Link to={`/course-progress/${courseId}`} className="w-1/2">
                <Button variant="secondary" className="w-full">
                  Back to Course
                </Button>
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Get current question
  const quiz = quizData?.quiz;
  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  
  // Check if quiz exists and has questions
  if (!quiz || questions.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">No Quiz Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            There is no quiz available for this course yet. Please check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{quiz.title}</CardTitle>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{formatTimeRemaining()}</span>
          </div>
        </div>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {questions.length}
        </CardDescription>
        <Progress 
          value={((currentQuestionIndex + 1) / questions.length) * 100} 
          className="h-2"
        />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
          
          <RadioGroup
            value={selectedAnswers[currentQuestion._id] || ""}
            onValueChange={(value) => handleAnswerSelect(currentQuestion._id, value)}
          >
            {currentQuestion.options.map((option) => (
              <div key={option._id} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50">
                <RadioGroupItem value={option._id} id={option._id} />
                <Label htmlFor={option._id} className="flex-grow cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          {currentQuestionIndex === questions.length - 1 ? (
            <Button 
              onClick={handleSubmitQuiz} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              Next
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseQuiz; 
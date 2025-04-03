import React, { useState, useEffect } from "react";
import { 
  useGetQuizByCourseQuery, 
  useSubmitQuizAttemptMutation, 
  useGetQuizResultsQuery
} from "@/features/api/quizApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Award, Clock, AlertCircle, CheckCircle, XCircle, FileQuestion, Trophy, BarChart3, ArrowUpRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const CourseQuiz = ({ courseId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  // Fetch quiz data
  const { data: quizData, isLoading: isLoadingQuiz, isError: isQuizError } = 
    useGetQuizByCourseQuery(courseId, { skip: !courseId });
    
  // Fetch quiz results (past attempts)
  const { data: resultsData, isLoading: isLoadingResults } = 
    useGetQuizResultsQuery(courseId, { skip: !courseId });
    
  // Submit quiz attempt
  const [submitQuiz, { isLoading: isSubmitting }] = useSubmitQuizAttemptMutation();

  // Timer effect
  useEffect(() => {
    if (quizData?.quiz?.timeLimit && quizStarted && !quizCompleted && !showResults) {
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
  }, [quizData, startTime, quizCompleted, showResults, quizStarted]);

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

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setStartTime(null);
    setQuizCompleted(false);
    setShowResults(false);
    
    toast.info("Quiz started! Good luck!", {
      description: quizData?.quiz?.timeLimit 
        ? `You have ${quizData.quiz.timeLimit} minutes to complete the quiz.`
        : "Take your time to answer all questions."
    });
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

  // Show quiz intro/previous results when not started
  if (!quizStarted && !showResults) {
    const hasPreviousAttempts = resultsData?.results?.submissions?.length > 0;
    const bestScore = resultsData?.results?.bestScore || 0;
    const passingScore = resultsData?.results?.quiz?.passingScore || 70;
    const hasPassed = resultsData?.results?.hasPassed;
    
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FileQuestion className="h-8 w-8 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <CardTitle>{quizData?.quiz?.title || "Course Quiz"}</CardTitle>
          <CardDescription>
            Test your knowledge of the course material
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Quiz details */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
              <h3 className="font-medium">Quiz Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Questions</p>
                  <p className="font-medium">{quizData?.quiz?.questions?.length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Passing Score</p>
                  <p className="font-medium">{quizData?.quiz?.passingScore || 70}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Time Limit</p>
                  <p className="font-medium">
                    {quizData?.quiz?.timeLimit 
                      ? `${quizData.quiz.timeLimit} minutes` 
                      : "No time limit"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Attempts</p>
                  <p className="font-medium">Unlimited</p>
                </div>
              </div>
            </div>
            
            {/* Display previous attempts if any */}
            {isLoadingResults ? (
              <div className="flex justify-center p-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : hasPreviousAttempts ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Your Previous Results</h3>
                  {hasPassed && (
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                      <CheckCircle className="h-3 w-3" /> Passed
                    </span>
                  )}
                </div>
                
                {/* Best score */}
                <div className="space-y-2 border p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      Your Best Score
                    </h4>
                    <span className="text-sm font-bold">{Math.round(bestScore)}%</span>
                  </div>
                  <Progress 
                    value={bestScore} 
                    className={`h-3 ${bestScore >= passingScore ? '[&>div]:bg-green-500' : '[&>div]:bg-amber-500'}`} 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {bestScore >= passingScore 
                      ? "You have passed this quiz! You can retake it to improve your score." 
                      : `You need ${passingScore}% to pass this quiz.`}
                  </p>
                  
                  {bestScore >= passingScore && (
                    <div className="mt-3">
                      <Link to={`/quiz-certificate?courseId=${courseId}`}>
                        <Button 
                          size="sm"
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-1"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Download Quiz Scorecard
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Latest submission */}
                {resultsData?.results?.submissions?.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b">
                      <h4 className="font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Recent Attempts
                      </h4>
                    </div>
                    <div className="divide-y max-h-40 overflow-y-auto">
                      {resultsData.results.submissions.slice(0, 3).map((submission, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {submission.isPassed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm">{Math.round(submission.score)}%</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                    {resultsData.results.submissions.length > 3 && (
                      <div className="px-4 py-2 text-xs text-center border-t bg-gray-50 dark:bg-gray-800">
                        Showing the 3 most recent attempts of {resultsData.results.submissions.length} total
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  You haven't attempted this quiz yet. Click the button below to start.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleStartQuiz}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {hasPreviousAttempts ? "Retake Quiz" : "Start Quiz"} 
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          
          {hasPassed && (
            <>
              <Link to={`/certificate?courseId=${courseId}`} className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  View Certificate
                </Button>
              </Link>
              
              <Link to={`/quiz-certificate?courseId=${courseId}`} className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download Scorecard
                </Button>
              </Link>
            </>
          )}
        </CardFooter>
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
    const isPassing = currentScore >= passingScore;
    const isCurrentScoreBest = currentScore >= bestScore;
    
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className={`text-center ${isPassing ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
          <CardTitle className={`flex items-center justify-center gap-2 ${isPassing ? 'text-green-600 dark:text-green-300' : 'text-amber-600 dark:text-amber-300'}`}>
            {isPassing ? (
              <>
                <Award className="h-6 w-6" />
                Congratulations! You Passed!
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6" />
                Quiz Result: Not Passed
              </>
            )}
          </CardTitle>
          <CardDescription className={isPassing ? 'text-green-600 dark:text-green-300' : 'text-amber-600 dark:text-amber-300'}>
            {isPassing 
              ? `You scored ${Math.round(currentScore)}%, above the required ${passingScore}% passing score.` 
              : `You scored ${Math.round(currentScore)}%. You need at least ${passingScore}% to pass this quiz.`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Latest score (current attempt) */}
            <div className="space-y-2 border p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Your Latest Attempt</h3>
                {isCurrentScoreBest && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Best Score</span>}
              </div>
              <div className="flex items-center gap-4">
                <Progress 
                  value={currentScore} 
                  className={`h-4 ${
                    currentScore >= passingScore 
                      ? 'bg-green-100 [&>div]:bg-green-500' 
                      : 'bg-red-100 [&>div]:bg-red-500'
                  }`}
                />
                <span className={`font-bold text-lg ${
                  currentScore >= passingScore ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.round(currentScore)}%
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Completed on {new Date(latestSubmission?.submittedAt).toLocaleString()}
              </p>
              <div className="flex mt-2 justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Time: {Math.floor(latestSubmission?.timeSpent / 60)}m {latestSubmission?.timeSpent % 60}s</span>
                </div>
                <div className={`flex items-center gap-1 ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                  {isPassing ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span>Status: {isPassing ? 'Passed' : 'Failed'}</span>
                </div>
              </div>
            </div>
            
            {/* Show best score if different from current */}
            {!isCurrentScoreBest && bestScore > currentScore && (
              <div className="space-y-2 border p-4 rounded-lg">
                <h3 className="font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  Your Best Score
                </h3>
                <div className="flex items-center gap-4">
                  <Progress 
                    value={bestScore} 
                    className={`h-3 ${bestScore >= passingScore ? '[&>div]:bg-green-500' : '[&>div]:bg-amber-500'}`} 
                  />
                  <span className="font-bold">{Math.round(bestScore)}%</span>
                </div>
                <p className="text-sm text-gray-500">
                  {hasPassed ? "This score qualifies you for a certificate." : ""}
                </p>
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
        
        <CardFooter className="flex flex-col gap-4">
          {hasPassed && (
            <div className="w-full border-t pt-4">
              <div className="text-center mb-4">
                <h3 className="font-medium text-green-700">You have qualified for a certificate!</h3>
                <p className="text-sm text-gray-500">Generate your certificate to showcase your achievement</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link to={`/certificate?courseId=${courseId}`} className="flex-1 block">
                  <Button className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 py-6">
                    <Award className="h-5 w-5" />
                    Get Course Certificate
                  </Button>
                </Link>
                <Link to={`/quiz-certificate?courseId=${courseId}`} className="flex-1 block">
                  <Button 
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-6"
                  >
                    <FileText className="h-5 w-5" />
                    Download Quiz Scorecard
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          {!hasPassed && (
            <Link to={`/quiz-certificate?courseId=${courseId}`} className="w-full block">
              <Button 
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="h-5 w-5" />
                Download Quiz Scorecard
              </Button>
            </Link>
          )}
          
          <div className="w-full flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setQuizStarted(false);
                setShowResults(false);
                setQuizCompleted(false);
                setSelectedAnswers({});
                setCurrentQuestionIndex(0);
                setStartTime(null);
                toast.info("Quiz reset. You can take the quiz again when ready.", {
                  description: "Your previous attempts are saved for reference."
                });
              }}
            >
              Back to Quiz Overview
            </Button>
            <Link to={`/course-progress/${courseId}`} className="flex-1">
              <Button variant="secondary" className="w-full">
                Back to Course
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Only render the actual quiz if it has been started
  if (quizStarted) {
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
  }
};

export default CourseQuiz; 
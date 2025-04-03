import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetQuizResultsQuery } from '@/features/api/quizApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2, Award, Copy, ExternalLink, BarChart3, CheckCircle2, XCircle, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { serverBaseUrl } from '@/config/constants';
import { Progress } from '@/components/ui/progress';

const QuizScorecard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const courseId = searchParams.get('courseId');
  const user = useSelector((state) => state.auth.user);
  
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Fetch quiz results
  const { 
    data: resultsData, 
    isLoading, 
    error,
    refetch
  } = useGetQuizResultsQuery(courseId, { skip: !courseId });
  
  // Debug the submissions data structure
  useEffect(() => {
    if (resultsData?.results?.submissions?.length > 0) {
      console.log('Quiz submissions data:', resultsData.results.submissions);
      console.log('Latest submission:', resultsData.results.submissions[0]);
    }
  }, [resultsData]);
  
  // Extract the quiz results data
  const quizResults = resultsData?.results;
  const bestScore = quizResults?.bestScore || 0;
  const submissions = quizResults?.submissions || [];
  const latestSubmission = submissions[0] || {}; // Most recent submission
  const isPass = latestSubmission.isPassed || false;
  const hasPassed = quizResults?.hasPassed || false;
  const passingScore = quizResults?.quiz?.passingScore || 70;
  
  // Function to download the most recent scorecard
  const handleDownloadScorecard = () => {
    if (!latestSubmission?._id) {
      toast.error('Quiz attempt not found');
      return;
    }
    
    try {
      setIsDownloading(true);
      console.log(`Downloading quiz scorecard for attempt: ${latestSubmission._id}`);
      toast.info("Preparing scorecard...");
      
      // Create the download URL using the proper API endpoint 
      // and correct path established in the server routes
      const downloadUrl = `${serverBaseUrl}/api/v1/quiz/scorecard/${latestSubmission._id}/download`;
      
      // Open in a new tab for download
      window.open(downloadUrl, '_blank');
      
      // Set a timeout to hide the loading state
      setTimeout(() => {
        setIsDownloading(false);
        toast.success("Scorecard download initiated");
      }, 1000);
    } catch (error) {
      console.error("Download failed:", error);
      setIsDownloading(false);
      toast.error("Failed to download scorecard");
    }
  };
  
  const handleRetry = () => {
    refetch()
      .then(() => toast.success("Quiz results refreshed"))
      .catch(() => toast.error("Failed to refresh quiz results"));
  };
  
  const handleCopyLink = () => {
    if (!latestSubmission?.id) {
      toast.error('Quiz attempt not found');
      return;
    }
    
    const url = `${window.location.origin}/quiz-results/${latestSubmission.id}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Quiz results link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleShareToLinkedIn = () => {
    if (!latestSubmission?.id) {
      toast.error('Quiz attempt not found');
      return;
    }

    const quizTitle = quizResults?.quiz?.title || 'Quiz';
    const quizUrl = `${window.location.origin}/quiz-results/${latestSubmission.id}`;
    const title = `${quizTitle} - Completion Results`;
    const summary = `I scored ${latestSubmission.score}% on the ${quizTitle} on EduFlow Learning Platform`;
    
    const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(quizUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
    
    window.open(linkedinShareUrl, '_blank', 'width=600,height=600');
    toast.success('Opening LinkedIn sharing window');
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Loading Quiz Results</CardTitle>
            <CardDescription>
              Please wait while we load your quiz results...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show error state
  if (error || !quizResults || submissions.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="border-red-200">
          <CardHeader className="text-center bg-red-50">
            <CardTitle className="text-red-600">Quiz Results Not Available</CardTitle>
            <CardDescription className="text-red-500">
              {error?.data?.message || "No quiz attempts found"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-center mb-4">
              You need to attempt the quiz for this course first.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate(`/course-progress/${courseId}`)}>
                Return to Course
              </Button>
              <Button variant="secondary" onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Prepare the data for the most recent attempt
  const currentScore = latestSubmission.score || 0;
  const submissionDate = latestSubmission.submittedAt 
    ? new Date(latestSubmission.submittedAt) 
    : new Date();
  
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className={`border-2 ${hasPassed ? 'border-green-100 dark:border-green-900' : 'border-yellow-100 dark:border-yellow-900'}`}>
        <CardHeader className={`text-center ${hasPassed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
          <div className="flex justify-center mb-4">
            <div className={`inline-flex items-center justify-center p-3 rounded-full ${hasPassed ? 'bg-green-100 dark:bg-green-800' : 'bg-yellow-100 dark:bg-yellow-800'}`}>
              {hasPassed ? (
                <Award className="h-8 w-8 text-green-600 dark:text-green-300" />
              ) : (
                <BarChart3 className="h-8 w-8 text-yellow-600 dark:text-yellow-300" />
              )}
            </div>
          </div>
          <CardTitle className={`text-2xl ${hasPassed ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
            {hasPassed ? 'Quiz Passed!' : 'Quiz Results'}
          </CardTitle>
          <CardDescription className={hasPassed ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
            {hasPassed 
              ? 'Congratulations! You have successfully completed the quiz.' 
              : 'Here are your quiz results. You can try again to improve your score.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-6">
          {/* Scorecard View */}
          <div className="p-8 border rounded-lg bg-white dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-4">Quiz Scorecard</h3>
            
            {/* Score Percentage with Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Score</span>
                <span className="font-bold text-lg">{Math.round(currentScore)}%</span>
                </div>
                <Progress 
                value={currentScore} 
                className={`h-3 ${
                  currentScore >= 80 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : currentScore >= 60 
                    ? 'bg-yellow-100 dark:bg-yellow-900' 
                    : 'bg-red-100 dark:bg-red-900'
                }`}
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                Pass Threshold: {passingScore}%
              </div>
                </div>
            
            {/* Quiz Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                <div className="text-sm text-gray-500 dark:text-gray-400">Quiz Name</div>
                <div className="font-medium">{quizResults?.quiz?.title || 'Quiz'}</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                <div className="text-sm text-gray-500 dark:text-gray-400">Attempt Date</div>
                <div className="font-medium">{submissionDate.toLocaleDateString()}</div>
          </div>
        
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                <div className="text-sm text-gray-500 dark:text-gray-400">Best Score</div>
                <div className="font-medium">{Math.round(bestScore)}%</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded">
                <div className="text-sm text-gray-500 dark:text-gray-400">Attempts</div>
                <div className="font-medium">{submissions.length}</div>
              </div>
            </div>
            
            {/* Result Status */}
            <div className={`p-4 rounded-lg flex items-center gap-3 ${isPass ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
              {isPass ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              )}
              <span className={`font-medium ${isPass ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {isPass ? 'Passed' : 'Not Passed'} - {Math.round(currentScore)}% score achieved
              </span>
            </div>
          </div>
          
          {/* Previous attempts section */}
          {submissions.length > 1 && (
            <div className="mt-6 border rounded-lg p-4 bg-white dark:bg-gray-800">
              <h3 className="font-semibold mb-3">Previous Attempts</h3>
              <div className="space-y-2">
                {submissions.slice(1, 4).map((submission, index) => (
                  <div 
                    key={submission._id || index} 
                    className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <span className={`mr-2 ${submission.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.round(submission.score)}%
                        </span>
                        {submission.isPassed && <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                      </div>
                    </div>
                <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        // Use the correct API path for downloading previous attempt scorecards
                        const downloadUrl = `${serverBaseUrl}/api/v1/quiz/scorecard/${submission._id}/download`;
                        window.open(downloadUrl, '_blank');
                        toast.success("Downloading previous attempt scorecard");
                      }}
                    >
                      <Download className="h-4 w-4" />
                </Button>
                  </div>
                ))}
                {submissions.length > 4 && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    + {submissions.length - 4} more attempts
                  </div>
                )}
              </div>
            </div>
          )}
          
            {/* Share section */}
          <div className="space-y-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-blue-500" />
                Share Your Results
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Share your quiz results with others or add them to your LinkedIn profile.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="flex items-center gap-1">
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </Button>
                <Button size="sm" onClick={handleShareToLinkedIn} className="flex items-center gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Share on LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleDownloadScorecard} 
            className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Downloading...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Download Scorecard
              </>
            )}
          </Button>
          <Button 
            onClick={() => navigate(`/course-progress/${courseId}`)} 
            variant="secondary" 
            className="flex-1"
          >
            Back to Course
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizScorecard; 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import MediaDisplay from "@/components/MediaDisplay";
import CourseQuiz from "@/components/CourseQuiz";
import StudentNotes from "@/components/StudentNotes";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { 
  useGenerateCertificateMutation,
  useDownloadCertificateMutation
} from "@/features/api/certificateApi";
import { useGetQuizResultsQuery } from "@/features/api/quizApi";
import { Award, CheckCircle, CheckCircle2, CirclePlay, Download, FileQuestion, Pencil, FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [
    completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();
  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();
  const [
    generateCertificate,
    { isLoading: isGeneratingCertificate, isSuccess: certificateGenerated, data: certificateData }
  ] = useGenerateCertificateMutation();
  const [downloadCertificate, { isLoading: isDownloadingCertificate }] = useDownloadCertificateMutation();
  
  // Quiz results
  const { data: quizResults } = useGetQuizResultsQuery(courseId, { skip: !courseId });
  const hasPassedQuiz = quizResults?.results?.hasPassed;

  const [currentLecture, setCurrentLecture] = useState(null);
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
    if (certificateGenerated && certificateData) {
      console.log("Certificate generated successfully:", certificateData);
      refetch();
    }
  }, [
    completedSuccess, 
    inCompletedSuccess, 
    markCompleteData, 
    markInCompleteData, 
    certificateGenerated, 
    certificateData, 
    refetch
  ]);

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (isError) return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="text-center">
        <p className="text-xl font-semibold text-red-500">Failed to load course</p>
        <p className="text-gray-500">Please try refreshing the page</p>
      </div>
    </div>
  );

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle, subTitle, courseThumbnail } = courseDetails;

  // initialize the first lecture if none is selected
  const initialLecture =
    currentLecture || (courseDetails.lectures && courseDetails.lectures[0]);

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  const handleLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };
  
  // Handle select a specific lecture to watch
  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    handleLectureProgress(lecture._id);
    setActiveTab("content");
  };

  const handleCompleteCourse = async () => {
    // Check if the quiz has been passed
    if (quizResults && !hasPassedQuiz) {
      toast.warning("You need to pass the quiz before completing the course", {
        description: "Please complete the quiz to proceed.",
        action: {
          label: "Go to Quiz",
          onClick: () => setActiveTab("quiz")
        }
      });
      setActiveTab("quiz");
      return;
    }
    
    try {
      await completeCourse(courseId);
      // Auto-generate certificate upon course completion
      if (!courseDetails?.certificate?.id) {
        handleGenerateCertificate();
      }
    } catch (error) {
      toast.error("Failed to mark course as complete");
    }
  };
  
  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };

  const handleVideoStart = (lectureId) => {
    handleLectureProgress(lectureId);
  };

  const handleGenerateCertificate = async () => {
    try {
      // Check if the quiz has been passed
      if (quizResults && !hasPassedQuiz) {
        toast.warning("You need to pass the quiz before generating a certificate", {
          description: "Please complete the quiz to proceed.",
          action: {
            label: "Go to Quiz",
            onClick: () => setActiveTab("quiz")
          }
        });
        setActiveTab("quiz");
        return;
      }
      
      // Check if course is marked as completed
      if (!completed) {
        const shouldComplete = window.confirm(
          "Course needs to be marked as complete first. Would you like to mark it as complete now?"
        );
        
        if (shouldComplete) {
          await completeCourse(courseId);
        } else {
          return;
        }
      }
      
      console.log(`Initiating certificate generation for course: ${courseId}`);
      const response = await generateCertificate(courseId).unwrap();
      console.log('Certificate generation response:', response);
      
      if (response.success) {
        toast.success("Certificate generated successfully", {
          description: "You can now view and download your certificate.",
          action: {
            label: "View Certificate",
            onClick: () => window.open(`/certificate?courseId=${courseId}`, '_blank')
          }
        });
        
        // Refetch course progress to update the certificate info
        refetch();
      } else {
        toast.error(response.message || "Something went wrong");
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      toast.error(error?.data?.message || error.message || "Failed to generate certificate");
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      console.log(`Initiating certificate download for ID: ${certificateId}`);
      if (!certificateId && courseDetails?.certificate?.id) {
        certificateId = courseDetails.certificate.id;
      }
      
      if (!certificateId) {
        toast.error("Certificate ID not found. Please generate certificate first.");
        return;
      }
      
      // Navigate to certificate view page instead of direct download
      window.open(`/certificate?courseId=${courseId}`, '_blank');
      toast.success("Certificate opened in a new window");
    } catch (error) {
      console.error('Certificate download error:', error);
      toast.error(error.message || "Failed to download certificate");
    }
  };

  const completedLectures = progress.filter(prog => prog.viewed).length;
  const completionPercentage = Math.round((completedLectures / courseDetails.lectures.length) * 100);

  const currentLectureId = currentLecture?._id || initialLecture?._id;
  
  const renderCertificateButton = () => {
    if (data?.hasCertificate) {
      return (
        <div className="mt-4 space-y-2">
          <Link to={`/certificate?courseId=${courseId}`}>
            <Button className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700">
              <Award className="h-4 w-4" />
              View Course Certificate
            </Button>
          </Link>
          {quizResults?.results?.hasPassed && (
            <Link to={`/quiz-certificate?courseId=${courseId}`}>
              <Button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4" />
                Download Quiz Scorecard
              </Button>
            </Link>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 mb-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">{courseTitle}</h1>
        {subTitle && <p className="text-gray-500">{subTitle}</p>}
        
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Course Progress</p>
            <div className="h-2 w-60 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs mt-1">{completedLectures} of {courseDetails.lectures.length} completed ({completionPercentage}%)</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {completed ? (
              <>
                <Button variant="outline" onClick={handleInCompleteCourse} size="sm">
                  <CheckCircle size={16} className="mr-2 text-green-500" /> Mark as Incomplete
                </Button>
                
                {courseDetails?.certificate?.id ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="default" 
                      onClick={() => navigate(`/certificate?courseId=${courseId}`)}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <Award size={16} className="mr-2" />
                      View Course Certificate
                    </Button>
                    {quizResults?.results?.hasPassed && (
                      <Button 
                        variant="default" 
                        onClick={() => navigate(`/quiz-certificate?courseId=${courseId}`)}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <FileText size={16} className="mr-2" />
                        Download Quiz Scorecard
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button 
                    variant="default" 
                    onClick={handleGenerateCertificate} 
                    disabled={isGeneratingCertificate}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Award size={16} className="mr-2" /> 
                    {isGeneratingCertificate ? "Generating..." : "Get Certificate"}
                  </Button>
                )}
              </>
            ) : (
              <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2">
                {hasPassedQuiz && completionPercentage === 100 ? (
                  <Button 
                    onClick={handleCompleteCourse} 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Mark Course as Complete
                  </Button>
                ) : completionPercentage === 100 ? (
                  <Button 
                    onClick={() => setActiveTab("quiz")} 
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <FileQuestion size={16} className="mr-2" />
                    Take Quiz to Complete
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content area with tabs */}
        <div className="flex-1 md:w-3/5 rounded-lg shadow-lg p-4 bg-white dark:bg-gray-900">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Course Content</TabsTrigger>
              <TabsTrigger value="quiz" className="relative">
                Quiz
                {hasPassedQuiz && (
                  <span className="absolute -top-1 -right-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="notes">
                <Pencil className="h-4 w-4 mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>
            
            {/* Course Content Tab */}
            <TabsContent value="content" className="mt-4">
              <div className="relative aspect-video">
                <MediaDisplay
                  type="video"
                  src={currentLecture?.videoUrl || initialLecture.videoUrl}
                  className="rounded-lg overflow-hidden"
                  videoProps={{
                    width: "100%",
                    height: "100%",
                    controls: true,
                    onStart: () => handleVideoStart(currentLecture?._id || initialLecture._id),
                    config: {
                      file: {
                        attributes: {
                          controlsList: 'nodownload',
                          preload: 'auto'
                        }
                      }
                    }
                  }}
                />
              </div>
              
              {/* Display current watching lecture title */}
              <div className="mt-4">
                <h3 className="font-medium text-lg">
                  {`Lecture ${
                    courseDetails.lectures.findIndex(
                      (lec) =>
                        lec._id === (currentLecture?._id || initialLecture._id)
                    ) + 1
                  }: ${currentLecture?.lectureTitle || initialLecture.lectureTitle}`}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {currentLecture?.description || initialLecture.description}
                </p>
              </div>
            </TabsContent>
            
            {/* Quiz Tab */}
            <TabsContent value="quiz" className="mt-4">
              <CourseQuiz courseId={courseId} />
            </TabsContent>
            
            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-4">
              <StudentNotes 
                courseId={courseId} 
                lectureId={currentLectureId} 
              />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar with lectures list */}
        <div className="md:w-2/5">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4">Course Lectures</h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {courseDetails.lectures.map((lecture, index) => {
                  const isCompleted = isLectureCompleted(lecture._id);
                  const isSelected =
                    lecture._id === (currentLecture?._id || initialLecture._id);

                  return (
                    <div
                      key={lecture._id}
                      onClick={() => handleSelectLecture(lecture)}
                      className={`p-3 rounded-md cursor-pointer transition-colors flex items-start gap-3 ${
                        isSelected
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <CirclePlay size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {index + 1}. {lecture.lectureTitle}
                        </p>
                        {lecture.isPreviewFree && (
                          <Badge className="mt-1" variant="outline">Free Preview</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {renderCertificateButton()}
    </div>
  );
};

export default CourseProgress;

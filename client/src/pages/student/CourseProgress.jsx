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
import { useDispatch } from "react-redux";
import { getCourseInfo, getCourseProgress, markLectureComplete } from "@/features/courseSlice";

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  const [selectedLecture, setSelectedLecture] = useState(null);

  useEffect(() => {
    if (courseId) {
      // Fetch the course info and structure
      dispatch(getCourseInfo(courseId));
      // Fetch user's progress for this course
      dispatch(getCourseProgress(courseId));
    }
  }, [courseId, dispatch]);

  // Ensure first lecture is loaded immediately on data load, but only once
  useEffect(() => {
    if (data?.data?.courseDetails?.lectures?.length > 0 && !selectedLecture) {
      const firstLecture = data.data.courseDetails.lectures[0];
      setCurrentLecture(firstLecture);
      setSelectedLecture(firstLecture);
      
      // Only mark as viewed if we haven't done so before and first lecture exists
      if (firstLecture && 
          data?.data?.progress && 
          !data.data.progress.some(p => p.lectureId === firstLecture._id && p.viewed)) {
        // Using a timeout to prevent potential race conditions
        const timer = setTimeout(() => {
          // Wrap in try/catch to prevent unhandled errors
          try {
            updateLectureProgress({ courseId, lectureId: firstLecture._id });
          } catch (error) {
            console.error("Error marking first lecture as viewed:", error);
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [data, selectedLecture, courseId, updateLectureProgress]);

  // Create an array of completed lecture IDs for easier checking
  const completedLectures = data?.data?.progress?.filter(prog => prog.viewed).map(prog => prog.lectureId) || [];
  const completionPercentage = data?.data?.courseDetails?.lectures?.length 
    ? Math.round((completedLectures.length / data.data.courseDetails.lectures.length) * 100)
    : 0;

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
    try {
      // Store current selected lecture object
      const currentSelectedLecture = selectedLecture;
      
      // Call API to update progress
      await updateLectureProgress({ courseId, lectureId }).unwrap();
      
      // Manually update completedLectures array to provide immediate feedback
      // This prevents UI jumps while waiting for refetch
      
      // Refetch data in the background for consistency
      await refetch();
      
      // Ensure we maintain the same selected lecture
      if (currentSelectedLecture) {
        setSelectedLecture(currentSelectedLecture);
      }
    } catch (error) {
      console.error("Failed to update lecture progress:", error);
      toast.error("Failed to mark lecture as complete");
    }
  };
  
  // Handle select a specific lecture to watch
  const handleSelectLecture = (lecture) => {
    setSelectedLecture(lecture);
    // Don't automatically mark as complete when selecting
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

  // Mark lecture as complete separately using Redux
  const handleMarkComplete = () => {
    if (selectedLecture && !completedLectures.includes(selectedLecture._id)) {
      try {
        // Keep track of the current selected lecture
        const currentLectureToKeep = selectedLecture;
        
        // Use the Redux approach
        dispatch(markLectureComplete({ courseId, lectureId: selectedLecture._id }))
          .then(() => {
            // Ensure we don't lose our selected lecture
            setSelectedLecture(currentLectureToKeep);
            // Refetch to update the UI
            refetch();
          })
          .catch(error => {
            console.error("Error marking lecture complete:", error);
            toast.error("Failed to mark lecture as complete");
          });
      } catch (error) {
        console.error("Error in handleMarkComplete:", error);
        toast.error("Failed to mark lecture as complete");
      }
    }
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
            <p className="text-xs mt-1">{completedLectures.length} of {courseDetails.lectures.length} completed ({completionPercentage}%)</p>
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
              <div className="col-span-12 md:col-span-9 p-4 bg-white dark:bg-gray-800 rounded-lg shadow overflow-y-auto" style={{ height: 'calc(100vh - 160px)' }}>
                {selectedLecture ? (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                      {selectedLecture?.lectureTitle || selectedLecture?.title}
                    </h2>
                    
                    {/* Media player */}
                    <div className="aspect-w-16 aspect-h-9 mb-6 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {selectedLecture?.type === 'video' || selectedLecture?.videoUrl ? (
                        <MediaDisplay
                          type="video"
                          src={selectedLecture?.content || selectedLecture?.videoUrl}
                          alt={selectedLecture?.title || selectedLecture?.lectureTitle}
                          className="w-full h-full"
                          videoProps={{
                            width: '100%',
                            height: '100%',
                            onEnded: handleMarkComplete,
                            controls: true,
                            config: {
                              file: {
                                attributes: {
                                  controlsList: 'nodownload',
                                  preload: 'metadata'
                                }
                              }
                            }
                          }}
                        />
                      ) : selectedLecture?.type === 'pdf' || (selectedLecture?.content && selectedLecture?.content.includes('.pdf')) ? (
                        <div className="h-full flex items-center justify-center p-4">
                          <Button 
                            onClick={() => window.open(selectedLecture?.content, '_blank')}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            View PDF
                          </Button>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700">
                          <p className="text-gray-500 dark:text-gray-300">
                            This content type is not supported for preview.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Completion button */}
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Prevent any default behavior
                          e.stopPropagation(); // Stop event propagation
                          if (selectedLecture && !completedLectures.includes(selectedLecture._id)) {
                            // Store the current selected lecture to ensure we don't lose focus
                            const lectureToMark = {...selectedLecture};
                            
                            // Use the direct API call for more control
                            updateLectureProgress({ 
                              courseId, 
                              lectureId: lectureToMark._id 
                            })
                              .unwrap()
                              .then(() => {
                                // Force the same lecture to stay selected
                                setSelectedLecture(lectureToMark);
                                // Refetch to update UI
                                refetch();
                                toast.success("Lecture marked as complete");
                              })
                              .catch(error => {
                                console.error("Error marking lecture as complete:", error);
                                toast.error("Failed to mark lecture as complete");
                              });
                          }
                        }}
                        disabled={!selectedLecture || completedLectures.includes(selectedLecture?._id)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          !selectedLecture || completedLectures.includes(selectedLecture?._id)
                            ? 'bg-green-500 text-white cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {!selectedLecture ? 'Select a lecture' : 
                          completedLectures.includes(selectedLecture?._id) ? 'Completed' : 'Mark as Complete'}
                      </button>
                    </div>

                    {/* Description */}
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Description</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {(selectedLecture?.description || courseDetails?.description || 'No description available.')
                          .replace(/<\/?[^>]+(>|$)/g, '')  // Strips all HTML tags
                        }
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center items-center h-60">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
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
                  const isCompleted = completedLectures.includes(lecture._id);
                  const isSelected = selectedLecture?._id === lecture._id || currentLecture?._id === lecture._id;

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
                          {index + 1}. {lecture.lectureTitle || lecture.title}
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

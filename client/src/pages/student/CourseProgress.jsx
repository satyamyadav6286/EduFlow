import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import MediaDisplay from "@/components/MediaDisplay";
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
import { Award, CheckCircle, CheckCircle2, CirclePlay, Download } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
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

  const [currentLecture, setCurrentLecture] = useState(null);

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
  };

  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
  };
  
  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };

  const handleVideoStart = (lectureId) => {
    handleLectureProgress(lectureId);
  };

  const handleGenerateCertificate = async () => {
    try {
      console.log(`Initiating certificate generation for course: ${courseId}`);
      const response = await generateCertificate(courseId).unwrap();
      console.log('Certificate generation response:', response);
      
      if (response.success) {
        toast.success("Certificate generated successfully");
        
        // Directly open the certificate in a new window
        if (response.certificate && response.certificate.id) {
          const certificateUrl = `http://localhost:3000/api/v1/certificates/${response.certificate.id}/download`;
          window.open(certificateUrl, '_blank');
        }
        
        // Refetch course progress to update the certificate info
        refetch();
      } else {
        toast.error(response.message || "Something went wrong");
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      toast.error(error.message || "Failed to generate certificate");
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
      
      // Open the certificate in a new window instead of using the API
      const certificateUrl = `http://localhost:3000/api/v1/certificates/${certificateId}/download`;
      window.open(certificateUrl, '_blank');
      toast.success("Certificate opened in a new window");
    } catch (error) {
      console.error('Certificate download error:', error);
      toast.error(error.message || "Failed to download certificate");
    }
  };

  const completedLectures = progress.filter(prog => prog.viewed).length;
  const completionPercentage = Math.round((completedLectures / courseDetails.lectures.length) * 100);

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
          
          <div className="flex gap-2">
            {completed ? (
              <>
                <Button variant="outline" onClick={handleInCompleteCourse} size="sm">
                  <CheckCircle size={16} className="mr-2 text-green-500" /> Mark as Incomplete
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleGenerateCertificate} 
                  disabled={isGeneratingCertificate}
                  size="sm"
                >
                  <Award size={16} className="mr-2" /> 
                  {isGeneratingCertificate ? "Generating..." : "Get Certificate"}
                </Button>
                {courseDetails?.certificate?.id && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownloadCertificate(courseDetails.certificate.id)} 
                    disabled={isDownloadingCertificate}
                    size="sm"
                  >
                    <Download size={16} className="mr-2" />
                    {isDownloadingCertificate ? "Downloading..." : "Download Certificate"}
                  </Button>
                )}
              </>
            ) : completionPercentage === 100 ? (
              <Button onClick={handleCompleteCourse} size="sm">
                Mark as Complete
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Video section */}
        <div className="flex-1 md:w-3/5 rounded-lg shadow-lg p-4 bg-white dark:bg-gray-900">
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
              } : ${
                currentLecture?.lectureTitle || initialLecture.lectureTitle
              }`}
            </h3>
          </div>
        </div>
        
        {/* Lecture Sidebar */}
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Lectures</h2>
          
          <div className="flex-1 overflow-y-auto">
            {courseDetails?.lectures.map((lecture, index) => (
              <Card
                key={lecture._id}
                className={`mb-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition ${
                  lecture._id === (currentLecture?._id || initialLecture._id)
                    ? "bg-gray-100 border-blue-500 dark:bg-gray-800"
                    : ""
                } `}
                onClick={() => handleSelectLecture(lecture)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    {isLectureCompleted(lecture._id) ? (
                      <CheckCircle2 size={24} className="text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                      <CirclePlay size={24} className="text-blue-500 mr-3 flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Lecture {index + 1}</div>
                      <CardTitle className="text-base font-medium">
                        {lecture.lectureTitle}
                      </CardTitle>
                    </div>
                  </div>
                  {isLectureCompleted(lecture._id) && (
                    <Badge
                      variant={"outline"}
                      className="bg-green-100 text-green-600 ml-2"
                    >
                      Completed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;

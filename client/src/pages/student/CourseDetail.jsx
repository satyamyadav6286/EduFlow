import BuyCourseButtonRazorpay from "@/components/BuyCourseButtonRazorpay";
import SocialShare from "@/components/SocialShare";
import BookmarkButton from "@/components/BookmarkButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MediaDisplay from "@/components/MediaDisplay";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { COURSE_PURCHASE_API } from "@/config/apiConfig";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } =
    useGetCourseDetailWithStatusQuery(courseId);

  useEffect(() => {
    if (isError) {
      console.error("Course detail error:", error);
      console.error("Error details:", {
        status: error?.status,
        message: error?.message || "Unknown error",
        data: error?.data
      });
    }
  }, [isError, error]);

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (isError) return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="text-center max-w-md">
        <p className="text-xl font-semibold text-red-500 mb-4">Failed to load course details</p>
        <p className="text-gray-500 mb-4">Error: {error?.message || "Unknown error"}</p>
        <p className="text-gray-500 mb-4">API URL: {`${COURSE_PURCHASE_API}/course/${courseId}/detail-with-status`}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    </div>
  );

  const { course, purchased } = data;

  const handleContinueCourse = () => {
    if(purchased){
      navigate(`/course-progress/${courseId}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl md:text-3xl">
              {course?.courseTitle}
            </h1>
            <p className="text-base md:text-lg">{course?.subTitle || "Comprehensive course"}</p>
            <p>
              Created By{" "}
              <span className="text-[#C0C4FC] underline italic">
                {course?.creator.name}
              </span>
            </p>
            <div className="flex items-center gap-2 text-sm">
              <BadgeInfo size={16} />
              <p>Last updated {course?.createdAt.split("T")[0]}</p>
            </div>
            <p>Students enrolled: {course?.enrolledStudents.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-1/2 space-y-5">
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-xl md:text-2xl">Description</h1>
            <div className="flex items-center space-x-2">
              <BookmarkButton 
                courseId={courseId}
                courseTitle={course?.courseTitle}
                courseThumbnail={course?.courseThumbnail}
              />
              <SocialShare 
                title={`${course?.courseTitle} - EduFlow`}
                description={`Check out this course: ${course?.subTitle || course?.courseTitle}`}
              />
            </div>
          </div>
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>{course.lectures.length} lectures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.lectures.map((lecture, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span>
                    {lecture.isPreviewFree || purchased ? (
                      <PlayCircle size={14} className="text-blue-500" />
                    ) : (
                      <Lock size={14} />
                    )}
                  </span>
                  <p>{lecture.lectureTitle}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3">
          <Card className="sticky top-20">
            <CardContent className="p-4 flex flex-col">
              <div className="w-full aspect-video mb-4">
                <img 
                  src={course?.courseThumbnail || "https://via.placeholder.com/600x400?text=Course+Image"} 
                  alt={course?.courseTitle || "Course thumbnail"}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <h1 className="font-medium">Introduction to {course?.courseTitle}</h1>
              <Separator className="my-2" />
              <h1 className="text-xl md:text-2xl font-bold">₹{course.coursePrice || 0}</h1>
              
              <div className="mt-4">
                {purchased ? (
                  <Button 
                    onClick={handleContinueCourse}
                    className="w-full"
                  >
                    Continue Learning
                  </Button>
                ) : (
                  <BuyCourseButtonRazorpay courseId={courseId} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

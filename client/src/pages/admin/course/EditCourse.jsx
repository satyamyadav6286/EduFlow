import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRemoveCourseMutation, useGetCourseByIdQuery } from "@/features/api/courseApi";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CourseTab from "./CourseTab";
import { toast } from "sonner";

const EditCourse = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data: courseData, isLoading, isError } = useGetCourseByIdQuery(courseId);
  const [removeCourse, { isSuccess, isError: isRemoveError, error }] = useRemoveCourseMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success("Course deleted successfully");
      navigate("/admin/course");
    }
    if (isRemoveError) {
      toast.error(error?.data?.message || "Failed to delete course");
    }
  }, [isSuccess, isRemoveError, error, navigate]);

  const handleDeleteCourse = async () => {
    await removeCourse(courseId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-10">
        <h2 className="text-xl text-red-500 mb-4">Failed to load course details</h2>
        <Button onClick={() => navigate("/admin/course")}>Back to Courses</Button>
      </div>
    );
  }

  // If course is not found
  if (!courseData || !courseData.course) {
    return (
      <div className="text-center p-10">
        <h2 className="text-xl mb-4">Course not found</h2>
        <Button onClick={() => navigate("/admin/course")}>Back to Courses</Button>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-bold text-xl">
          Add detail information regarding course
        </h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Remove Course</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  course {courseData?.course?.courseTitle && `"${courseData.course.courseTitle}"`} and all its lectures.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteCourse}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Link to="lecture">
            <Button className="hover:text-blue-600" variant="link">Go to lectures page</Button>
          </Link>
        </div>
      </div>
      <CourseTab courseData={courseData} />
    </div>
  );
};

export default EditCourse;

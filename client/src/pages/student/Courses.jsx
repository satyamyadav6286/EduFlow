import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect, useState } from "react";
import Course from "./Course";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import testBackendConnection from "@/utils/testBackendConnection";
import { Button } from "@/components/ui/button";
 
const Courses = () => {
  const {data, isLoading, isError, error, refetch} = useGetPublishedCourseQuery();
  const [connectionTest, setConnectionTest] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Test the backend connection when there's an error
  const runConnectionTest = async () => {
    setIsTesting(true);
    try {
      const result = await testBackendConnection();
      setConnectionTest(result);
    } catch (err) {
      console.error("Connection test error:", err);
      setConnectionTest({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  };
 
  useEffect(() => {
    // Log detailed error information if there's an error
    if (isError) {
      console.error("Error in Courses component:", error);
      console.error("Error details:", {
        status: error?.status,
        message: error?.message || "Unknown error",
        data: error?.data
      });
      
      // Run the connection test automatically when an error occurs
      runConnectionTest();
    }
  }, [isError, error]);

  if(isError) return (
    <div className="bg-gray-50 dark:bg-[#141414] min-h-[50vh] flex items-center justify-center">
      <div className="max-w-lg mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Fetching Courses</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          {error?.message || "Some error occurred while fetching courses."}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Status: {error?.status || "Unknown"}
        </p>
        
        {connectionTest && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-left mb-4">
            <h3 className="font-semibold mb-2">{connectionTest.success ? "✅ Connection Test Passed" : "❌ Connection Test Failed"}</h3>
            {connectionTest.isNetworkError && (
              <p className="text-red-500 mb-2">Network Error: Cannot reach the backend server.</p>
            )}
            {connectionTest.status && (
              <p className="mb-1 text-sm">Status: {connectionTest.status}</p>
            )}
            {connectionTest.error && (
              <p className="mb-1 text-sm text-red-500">Error: {connectionTest.error}</p>
            )}
          </div>
        )}
        
        <div className="flex space-x-4 justify-center">
          <Button 
            onClick={runConnectionTest} 
            disabled={isTesting}
            variant="outline"
          >
            {isTesting ? "Testing Connection..." : "Test Connection"}
          </Button>
          <Button 
            onClick={() => refetch()} 
            variant="default"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-[#141414]">
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="font-bold text-3xl text-center mb-10">Our Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))
          ) : (
           data?.courses && data.courses.map((course, index) => <Course key={index} course={course}/>) 
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;

const CourseSkeleton = () => {
  return (
    <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
      <Skeleton className="w-full h-36" />
      <div className="px-5 py-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
};

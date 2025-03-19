import { Badge } from "@/components/ui/badge";
import MediaDisplay from "@/components/MediaDisplay";
import React from "react";
import { Link } from "react-router-dom";

const SearchResult = ({ course }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-300 py-4 gap-4">
      <Link
        to={`/course-detail/${course._id}`}
        className="flex flex-col md:flex-row gap-4 w-full md:w-auto"
      >
        <div className="h-32 w-full md:w-56 rounded overflow-hidden">
          <MediaDisplay
            type="image"
            src={course.courseThumbnail}
            alt={course.courseTitle}
            className="h-full w-full object-cover"
            fallbackImage="https://via.placeholder.com/600x400?text=Course+Image"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-lg md:text-xl">{course.courseTitle}</h1>
          <p className="text-sm text-gray-600">{course.subTitle || `A comprehensive ${course.category} course`}</p>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="text-xs px-2 py-0.5 border-gray-400">{course.category}</Badge>
            <Badge className="w-fit bg-blue-500">{course.courseLevel}</Badge>
            {course.lectures && (
              <span className="text-xs text-gray-600">{course.lectures.length || 0} lectures</span>
            )}
          </div>
          <p className="text-sm text-gray-700">
            Instructor: <span className="font-medium">{course.creator?.name || 'Unknown'}</span>
          </p>
        </div>
      </Link>
      <div className="mt-4 md:mt-0 md:text-right w-full md:w-auto">
        <h1 className="font-bold text-lg md:text-xl">₹{course.coursePrice}</h1>
      </div>
    </div>
  );
};

export default SearchResult;

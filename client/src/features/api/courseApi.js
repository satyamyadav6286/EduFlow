import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { COURSE_API } from "../../config/apiConfig";

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: ["Refetch_Creator_Course", "Refetch_Lecture"],
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createCourse: builder.mutation({
      query: ({ courseTitle, category }) => ({
        url: "",
        method: "POST",
        body: { courseTitle, category },
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
    getSearchCourse:builder.query({
      query: ({searchQuery, categories, sortByPrice}) => {
        // Build query string
        let queryString = `/search?query=${encodeURIComponent(searchQuery || '')}`

        // append categories - ensure they are passed exactly as stored in the database
        if(categories && categories.length > 0) {
          const categoriesString = categories.join(",");
          queryString += `&categories=${encodeURIComponent(categoriesString)}`; 
        }

        // Append sortByPrice if available
        if(sortByPrice){
          queryString += `&sortByPrice=${encodeURIComponent(sortByPrice)}`; 
        }
        
        console.log("Search query string:", queryString);

        return {
          url: queryString,
          method: "GET", 
        }
      },
      // Handle error and empty responses
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.message || 'Failed to search courses'
        };
      },
      transformResponse: (response) => {
        if (!response) return { courses: [] };
        return response;
      }
    }),
    getPublishedCourse: builder.query({
      query: () => ({
        url: "/published-courses",
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          console.log("Starting API request to fetch published courses");
          const response = await queryFulfilled;
          console.log("Published courses API response:", response.data);
        } catch (error) {
          console.error("Error fetching published courses:", error);
          console.error("Error details:", {
            status: error?.error?.status,
            data: error?.error?.data,
            message: error?.error?.message || "Unknown error"
          });
        }
      },
      // Handle error and empty responses
      transformErrorResponse: (response) => {
        console.error("Published courses API error response:", response);
        return {
          status: response.status,
          message: response.data?.message || 'Failed to fetch published courses'
        };
      },
      transformResponse: (response) => {
        console.log("Transforming published courses response:", response);
        if (!response) return { courses: [] };
        return response;
      }
    }),
    getCreatorCourse: builder.query({
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: ["Refetch_Creator_Course"],
      // Handle error and empty responses
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.message || 'Failed to fetch your courses'
        };
      },
      transformResponse: (response) => {
        if (!response) return { courses: [] };
        return response;
      }
    }),
    editCourse: builder.mutation({
      query: ({ courseId, formData }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: formData,
        formData: true, // This tells RTK Query that we're sending FormData
        // Remove the Content-Type header to let the browser set it with the boundary
        prepareHeaders: (headers) => {
          headers.delete('Content-Type');
          return headers;
        },
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
    getCourseById: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
      // Handle error and empty responses
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.message || 'Failed to fetch course details'
        };
      },
      transformResponse: (response) => {
        if (!response || !response.course) return { course: null };
        return response;
      }
    }),
    createLecture: builder.mutation({
      query: ({ lectureTitle, courseId }) => ({
        url: `/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle },
      }),
    }),
    getCourseLecture: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/lecture`,
        method: "GET",
      }),
      providesTags: ["Refetch_Lecture"],
      // Handle error and empty responses
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.message || 'Failed to fetch lectures'
        };
      },
      transformResponse: (response) => {
        if (!response || !response.lectures) return { lectures: [] };
        return response;
      }
    }),
    editLecture: builder.mutation({
      query: ({
        lectureTitle,
        videoInfo,
        isPreviewFree,
        courseId,
        lectureId,
      }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "POST",
        body: { lectureTitle, videoInfo, isPreviewFree },
      }),
    }),
    removeLecture: builder.mutation({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Lecture"],
    }),
    getLectureById: builder.query({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "GET",
      }),
    }),
    publishCourse: builder.mutation({
      query: ({ courseId, query }) => ({
        url: `/${courseId}?publish=${query}`,
        method: "PATCH",
      }),
    }),
    removeCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "DELETE",
      }),
    }),
  }),
});
export const {
  useCreateCourseMutation,
  useGetSearchCourseQuery,
  useGetPublishedCourseQuery,
  useGetCreatorCourseQuery,
  useEditCourseMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  usePublishCourseMutation,
  useRemoveCourseMutation,
} = courseApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseUrl } from "../../config/apiConfig";

const QUIZ_API = `${getBaseUrl()}/quiz`;

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery: fetchBaseQuery({
    baseUrl: QUIZ_API,
    credentials: "include"
  }),
  tagTypes: ["Quiz", "QuizResults"],
  endpoints: (builder) => ({
    // Instructor endpoints
    createQuiz: builder.mutation({
      query: (quizData) => ({
        url: "/",
        method: "POST",
        body: quizData
      }),
      invalidatesTags: ["Quiz"]
    }),
    
    updateQuiz: builder.mutation({
      query: ({ quizId, quizData }) => ({
        url: `/${quizId}`,
        method: "PUT",
        body: quizData
      }),
      invalidatesTags: ["Quiz"]
    }),
    
    // Student endpoints
    getQuizByCourse: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}`,
        method: "GET"
      }),
      providesTags: ["Quiz"]
    }),
    
    submitQuizAttempt: builder.mutation({
      query: (submissionData) => ({
        url: "/submit",
        method: "POST",
        body: submissionData
      }),
      invalidatesTags: ["QuizResults"]
    }),
    
    getQuizResults: builder.query({
      query: (courseId) => ({
        url: `/results/${courseId}`,
        method: "GET"
      }),
      providesTags: ["QuizResults"]
    })
  })
});

export const {
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useGetQuizByCourseQuery,
  useSubmitQuizAttemptMutation,
  useGetQuizResultsQuery
} = quizApi; 
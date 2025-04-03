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
    }),
    
    // Quiz results PDF endpoints
    generateQuizResultsPDF: builder.mutation({
      query: (courseId) => ({
        url: `/results-pdf/${courseId}`,
        method: "GET"
      })
    }),
    
    downloadQuizResultsPDF: builder.query({
      query: (filename) => ({
        url: `/download-results/${filename}`,
        method: "GET",
        responseHandler: (response) => response.blob()
      })
    }),

    // New endpoint for verification
    getQuizCertificateDetails: builder.query({
      query: (certificateId) => ({
        url: `/certificate/${certificateId}`,
        method: "GET"
      })
    }),
    
    // New endpoint for downloading scorecard without authentication
    downloadScorecard: builder.query({
      query: (resultId) => ({
        url: `/scorecard/${resultId}/download`,
        method: "GET",
        responseHandler: (response) => response.blob()
      })
    }),

    // New endpoint for verifying a scorecard
    verifyScorecard: builder.query({
      query: (scorecardId) => ({
        url: `/scorecard/${scorecardId}/verify`,
        method: "GET"
      })
    })
  })
});

export const {
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useGetQuizByCourseQuery,
  useSubmitQuizAttemptMutation,
  useGetQuizResultsQuery,
  useGenerateQuizResultsPDFMutation,
  useDownloadQuizResultsPDFQuery,
  useGetQuizCertificateDetailsQuery,
  useDownloadScorecardQuery,
  useVerifyScorecardQuery
} = quizApi; 
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { COURSE_PURCHASE_API } from "../../config/apiConfig";
import { getBestToken } from "@/middlewares/tokenValidator";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
    prepareHeaders: (headers) => {
      // Get the token from localStorage
      const token = getBestToken();
      
      // If we have a token, add it to the headers
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        console.log('Adding auth token to purchase API headers:', token.substring(0, 10) + '...');
      } else {
        console.log('No auth token available for purchase request');
      }
      
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (courseId) => ({
        url: "/checkout/create-checkout-session",
        method: "POST",
        body: { courseId },
      }),
    }),
    verifyPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/verify-payment",
        method: "POST",
        body: paymentData,
      }),
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
      async onQueryStarted(courseId, { dispatch, queryFulfilled }) {
        try {
          console.log(`Fetching course details for ID: ${courseId}`);
          console.log(`API URL being used: ${COURSE_PURCHASE_API}/course/${courseId}/detail-with-status`);
          const response = await queryFulfilled;
          console.log("Course details fetched successfully:", response.data);
        } catch (error) {
          console.error(`Error fetching course details for ID ${courseId}:`, error);
          console.error("Error details:", {
            status: error?.error?.status,
            data: error?.error?.data,
            message: error?.error?.message || "Unknown error"
          });
        }
      },
      transformErrorResponse: (response) => {
        console.error("Course details API error response:", response);
        return {
          status: response.status,
          message: response.data?.message || 'Failed to fetch course details',
          data: response.data
        };
      },
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
    }),
    getInstructorSales: builder.query({
      query: () => ({
        url: `/instructor-sales`,
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          console.log("Fetching instructor sales data");
          console.log(`API URL being used: ${COURSE_PURCHASE_API}/instructor-sales`);
          const response = await queryFulfilled;
          console.log("Instructor sales data fetched successfully:", response.data);
        } catch (error) {
          console.error("Error fetching instructor sales data:", error);
          console.error("Error details:", {
            status: error?.error?.status,
            data: error?.error?.data,
            message: error?.error?.message || "Unknown error"
          });
        }
      },
      transformErrorResponse: (response) => {
        console.error("Instructor sales API error response:", response);
        return {
          status: response.status,
          message: response.data?.message || 'Failed to fetch sales data',
          data: response.data
        };
      },
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useVerifyPaymentMutation,
  useGetCourseDetailWithStatusQuery,
  useGetPurchasedCoursesQuery,
  useGetInstructorSalesQuery,
} = purchaseApi;

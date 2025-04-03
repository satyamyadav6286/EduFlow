import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CERTIFICATE_API } from "../../config/apiConfig";

export const certificateApi = createApi({
  reducerPath: "certificateApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CERTIFICATE_API,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    generateCertificate: builder.mutation({
      query: (courseId) => {
        console.log(`Generating certificate for course: ${courseId}`);
        return {
          url: `/${courseId}/generate`,
          method: "POST",
        };
      },
      transformErrorResponse: (response) => {
        console.error("Certificate generation error:", response);
        return {
          status: response.status,
          message: response.data?.message || "Failed to generate certificate",
        };
      },
    }),
    
    getCertificate: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
      transformErrorResponse: (response) => {
        console.error("Certificate get error:", response);
        return {
          status: response.status,
          message: response.data?.message || "Failed to get certificate",
        };
      },
    }),
    
    verifyCertificate: builder.query({
      query: (certificateId) => ({
        url: `/${certificateId}/verify`,
        method: "GET",
      }),
    }),

    downloadCertificate: builder.mutation({
      query: (certificateId) => {
        console.log(`Downloading certificate: ${certificateId}`);
        return {
          url: `/${certificateId}/download`,
          method: "GET",
          responseHandler: (response) => response.blob(),
        };
      },
      transformErrorResponse: (response) => {
        console.error("Certificate download error:", response);
        return {
          status: response.status,
          message: response.data?.message || "Failed to download certificate",
        };
      },
    }),
  }),
});

export const { 
  useGenerateCertificateMutation,
  useGetCertificateQuery,
  useVerifyCertificateQuery,
  useDownloadCertificateMutation
} = certificateApi; 
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CERTIFICATE_API } from "../../config/apiConfig";

export const certificateApi = createApi({
  reducerPath: "certificateApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CERTIFICATE_API,
    credentials: "include",
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
        };
      },
    }),
  }),
});

export const { 
  useGenerateCertificateMutation,
  useVerifyCertificateQuery,
  useDownloadCertificateMutation
} = certificateApi; 
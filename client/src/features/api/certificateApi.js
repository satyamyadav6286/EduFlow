import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CERTIFICATE_API } from "../../config/apiConfig";

// Log the certificate API URL for debugging
console.log("Certificate API URL:", CERTIFICATE_API);

export const certificateApi = createApi({
  reducerPath: "certificateApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CERTIFICATE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getCertificate: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
    }),
    generateCertificate: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}/generate`,
        method: "POST",
      }),
    }),
    downloadCertificate: builder.mutation({
      query: (certificateId) => {
        console.log("Attempting to download certificate:", certificateId);
        // Append timestamp to prevent caching
        const timestamp = Date.now();
        return {
          url: `/file/${certificateId}?t=${timestamp}`,
          method: "GET",
          responseHandler: async (response) => {
            if (!response.ok) {
              throw new Error(`Server responded with ${response.status}`);
            }
            try {
              return await response.blob();
            } catch (error) {
              console.error("Error processing certificate response:", error);
              throw error;
            }
          },
        };
      },
    }),
    verifyCertificate: builder.query({
      query: (certificateId) => ({
        url: `/verify/${certificateId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetCertificateQuery,
  useGenerateCertificateMutation,
  useDownloadCertificateMutation,
  useVerifyCertificateQuery,
} = certificateApi; 
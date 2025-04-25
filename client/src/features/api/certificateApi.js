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
      query: (certificateId) => ({
        url: `/file/${certificateId}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
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
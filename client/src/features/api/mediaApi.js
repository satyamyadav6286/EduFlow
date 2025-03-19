import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MEDIA_API } from "../../config/apiConfig";

export const mediaApi = createApi({
  reducerPath: "mediaApi",
  baseQuery: fetchBaseQuery({
    baseUrl: MEDIA_API,
    credentials: "include",
    prepareHeaders: (headers) => {
      // Add any required headers here
      return headers;
    },
  }),
  endpoints: (builder) => ({
    uploadMedia: builder.mutation({
      query: (formData) => ({
        url: "/upload-video",
        method: "POST",
        body: formData,
        formData: true,
      }),
      // Handle error and response transformation
      transformErrorResponse: (response) => {
        console.error("Media upload error:", response);
        return {
          status: response.status,
          message: response.data?.message || "Failed to upload media"
        };
      },
      transformResponse: (response) => {
        if (!response || !response.success || !response.data) {
          return { 
            success: false, 
            message: "Invalid response from server", 
            data: null 
          };
        }
        return response;
      }
    }),
  }),
});

export const { useUploadMediaMutation } = mediaApi; 
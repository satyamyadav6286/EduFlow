import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CONTACT_API } from "../../config/apiConfig";

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CONTACT_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createContact: builder.mutation({
      query: (contactData) => ({
        url: "",
        method: "POST",
        body: contactData,
      }),
    }),
    getContacts: builder.query({
      query: () => ({
        url: "",
        method: "GET",
      }),
    }),
  }),
});

export const { useCreateContactMutation, useGetContactsQuery } = contactApi; 
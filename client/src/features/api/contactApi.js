import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CONTACT_API = "http://localhost:3000/api/v1/contact";

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
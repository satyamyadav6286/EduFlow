import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";
import { USER_API } from "../../config/apiConfig";
import { getBestToken, refreshToken, ensureValidToken } from "@/middlewares/tokenValidator";

// Create a custom fetch function that will handle token refresh
const customFetchWithAuth = async (args, api, extraOptions) => {
    // Check if this is a login or register endpoint - these don't need auth tokens
    const url = typeof args === 'string' ? args : args.url;
    const isAuthEndpoint = url === 'login' || url === 'register';
    
    // For login/register, use simple baseQuery without token logic
    if (isAuthEndpoint) {
        const simpleBaseQuery = fetchBaseQuery({
            baseUrl: USER_API,
            credentials: 'include',
        });
        return await simpleBaseQuery(args, api, extraOptions);
    }
    
    // For other endpoints, use token-based auth
    const baseQuery = fetchBaseQuery({
        baseUrl: USER_API,
        credentials: 'include',
        prepareHeaders: async (headers) => {
            // Try to get a valid token (with automatic refresh if needed)
            const token = await ensureValidToken();
            
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
                console.log('Adding auth token to headers');
            } else {
                console.log('No auth token available for request');
            }
            
            return headers;
        },
    });
    
    // First attempt
    let result = await baseQuery(args, api, extraOptions);
    
    // If we get a 401 or 403, try to refresh the token and retry once
    if (result.error && (result.error.status === 401 || result.error.status === 403)) {
        console.log('Received 401/403, attempting token refresh');
        
        // Force token refresh
        const refreshResult = await refreshToken(true);
        
        if (refreshResult.success) {
            console.log('Token refreshed, retrying request');
            // Retry the original request
            result = await baseQuery(args, api, extraOptions);
        } else {
            // If refresh failed, dispatch logout
            api.dispatch(userLoggedOut());
        }
    }
    
    return result;
};

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: customFetchWithAuth,
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => {
                console.log("Register request data:", inputData);
                return {
                    url: "register",
                    method: "POST",
                    body: inputData
                };
            },
            transformErrorResponse: (response) => {
                console.error("Register API error response:", response);
                return {
                    status: response.status,
                    message: response.data?.message || 'Registration failed',
                    data: response.data
                };
            }
        }),
        loginUser: builder.mutation({
            query: (inputData) => {
                console.log("Login request data:", inputData);
                return {
                    url: "login",
                    method: "POST",
                    body: inputData
                };
            },
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    // Store token if it's in the response
                    if (result.data.token) {
                        localStorage.setItem('token', result.data.token);
                    }
                    dispatch(userLoggedIn({user: result.data.user}));
                } catch (error) {
                    console.error("Login error:", error);
                    // Error is handled by RTK Query and will be available in loginError
                }
            },
            transformErrorResponse: (response) => {
                console.error("Login API error response:", response);
                return {
                    status: response.status,
                    message: response.data?.message || 'Login failed',
                    data: response.data
                };
            }
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url: "logout",
                method: "GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try { 
                    // Clear token on logout
                    localStorage.removeItem('token');
                    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    dispatch(userLoggedOut());
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        loadUser: builder.query({
            query: () => ({
                url: "profile",
                method: "GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user: result.data.user}));
                } catch (error) {
                    console.error("Error loading user data:", error);
                }
            }
        }),
        updateUser: builder.mutation({
            query: (formData) => ({
                url: "profile/update",
                method: "PUT",
                body: formData,
                credentials: "include"
            })
        }),
        createInstructor: builder.mutation({
            query: (instructorData) => ({
                url: "instructor",
                method: "POST",
                body: instructorData
            })
        }),
        getAllInstructors: builder.query({
            query: () => ({
                url: "instructors",
                method: "GET"
            })
        })
    })
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation,
    useCreateInstructorMutation,
    useGetAllInstructorsQuery
} = authApi;

import {configureStore} from "@reduxjs/toolkit" 
import rootRedcuer from "./rootRedcuer";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { contactApi } from "@/features/api/contactApi";
import { mediaApi } from "@/features/api/mediaApi";
import { certificateApi } from "@/features/api/certificateApi";
import { quizApi } from "@/features/api/quizApi";

export const appStore = configureStore({
    reducer: rootRedcuer,
    middleware:(defaultMiddleware) => defaultMiddleware().concat(
        authApi.middleware, 
        courseApi.middleware, 
        purchaseApi.middleware, 
        courseProgressApi.middleware,
        contactApi.middleware,
        mediaApi.middleware,
        certificateApi.middleware,
        quizApi.middleware
    )
});

// Remove or comment out the initializeApp function that auto-loads user data
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice"; 
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { contactApi } from "@/features/api/contactApi";
import { mediaApi } from "@/features/api/mediaApi";
import { certificateApi } from "@/features/api/certificateApi";
import { quizApi } from "@/features/api/quizApi";

const rootReducer = combineReducers({
    [authApi.reducerPath]:authApi.reducer,
    [courseApi.reducerPath]:courseApi.reducer,
    [purchaseApi.reducerPath]:purchaseApi.reducer,
    [courseProgressApi.reducerPath]:courseProgressApi.reducer,
    [contactApi.reducerPath]:contactApi.reducer,
    [mediaApi.reducerPath]:mediaApi.reducer,
    [certificateApi.reducerPath]:certificateApi.reducer,
    [quizApi.reducerPath]:quizApi.reducer,
    auth:authReducer, 
});
export default rootReducer; 
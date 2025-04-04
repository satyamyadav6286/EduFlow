import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { COURSE_API, COURSE_PROGRESS_API } from '../config/apiConfig';

// Async thunks for course actions
export const getCourseInfo = createAsyncThunk(
  'course/getCourseInfo',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${COURSE_API}/${courseId}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch course information');
    }
  }
);

export const getCourseProgress = createAsyncThunk(
  'course/getCourseProgress',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${COURSE_PROGRESS_API}/${courseId}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch course progress');
    }
  }
);

export const markLectureComplete = createAsyncThunk(
  'course/markLectureComplete',
  async ({ courseId, lectureId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${COURSE_PROGRESS_API}/${courseId}/lecture/${lectureId}/view`, 
        {}, 
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to mark lecture as complete');
    }
  }
);

// Initial state
const initialState = {
  courseInfo: null,
  courseProgress: null,
  loading: false,
  error: null,
  successMessage: ''
};

// Create the slice
const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    clearCourseState: (state) => {
      state.courseInfo = null;
      state.courseProgress = null;
      state.error = null;
      state.successMessage = '';
    }
  },
  extraReducers: (builder) => {
    // getCourseInfo reducers
    builder.addCase(getCourseInfo.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCourseInfo.fulfilled, (state, action) => {
      state.loading = false;
      state.courseInfo = action.payload;
    });
    builder.addCase(getCourseInfo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // getCourseProgress reducers
    builder.addCase(getCourseProgress.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCourseProgress.fulfilled, (state, action) => {
      state.loading = false;
      state.courseProgress = action.payload;
    });
    builder.addCase(getCourseProgress.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // markLectureComplete reducers
    builder.addCase(markLectureComplete.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(markLectureComplete.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload?.message || 'Lecture marked as complete';
      // Update the course progress if needed
      if (state.courseProgress && action.payload?.data) {
        state.courseProgress = action.payload.data;
      }
    });
    builder.addCase(markLectureComplete.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

// Export actions and reducer
export const { clearCourseState } = courseSlice.actions;
export default courseSlice.reducer;

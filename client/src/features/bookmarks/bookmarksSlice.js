import { createSlice } from '@reduxjs/toolkit';

// Get bookmarks from localStorage or use empty array
const loadBookmarks = () => {
  try {
    const savedBookmarks = localStorage.getItem('eduflow_bookmarks');
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  } catch (error) {
    console.error('Failed to load bookmarks from localStorage:', error);
    return [];
  }
};

// Save bookmarks to localStorage
const saveBookmarks = (bookmarks) => {
  try {
    localStorage.setItem('eduflow_bookmarks', JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Failed to save bookmarks to localStorage:', error);
  }
};

const initialState = {
  items: loadBookmarks(),
};

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark: (state, action) => {
      // Avoid duplicates
      if (!state.items.some(bookmark => bookmark.courseId === action.payload.courseId)) {
        state.items.push(action.payload);
        saveBookmarks(state.items);
      }
    },
    removeBookmark: (state, action) => {
      state.items = state.items.filter(bookmark => bookmark.courseId !== action.payload);
      saveBookmarks(state.items);
    },
    clearAllBookmarks: (state) => {
      state.items = [];
      saveBookmarks(state.items);
    }
  }
});

export const { addBookmark, removeBookmark, clearAllBookmarks } = bookmarksSlice.actions;
export default bookmarksSlice.reducer; 
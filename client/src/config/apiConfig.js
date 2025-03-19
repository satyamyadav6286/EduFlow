// API URL configuration
// Gets the API base URL from environment variables or falls back to the deployed server URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://eduflow-server.onrender.com/api/v1';

// API endpoints
export const USER_API = `${API_BASE_URL}/user`;
export const COURSE_API = `${API_BASE_URL}/course`;
export const MEDIA_API = `${API_BASE_URL}/media`;
export const COURSE_PURCHASE_API = `${API_BASE_URL}/purchase`;
export const COURSE_PROGRESS_API = `${API_BASE_URL}/progress`;
export const CONTACT_API = `${API_BASE_URL}/contact`;
export const CERTIFICATE_API = `${API_BASE_URL}/certificates`;

// Export the base URL for other uses
export const getBaseUrl = () => API_BASE_URL; 
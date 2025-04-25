// This file contains application-wide constants

// Server base URL (without API path) for direct server requests
export const serverBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Other application constants can be added here
export const APP_NAME = 'EduFlow';
export const COPYRIGHT_YEAR = new Date().getFullYear();
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
export const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm'];
export const SUPPORTED_DOCUMENT_FORMATS = ['application/pdf']; 
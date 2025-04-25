/**
 * API URL Logger - Development Utility
 * 
 * This component provides logging of API configuration details
 * to help diagnose issues with API communication.
 * 
 * Import and use in a development component or page to see what
 * environment variables and API URLs are being used.
 */

import { useEffect } from 'react';
import { serverBaseUrl } from '../config/constants';
import { getBaseUrl } from '../config/apiConfig';

export const ApiUrlLogger = () => {
  useEffect(() => {
    // Only log in development or when debugging is enabled
    if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUGGING === 'true') {
      console.group('🔌 API URL Configuration');
      console.log('Environment:', import.meta.env.MODE);
      console.log('VITE_API_URL:', import.meta.env.VITE_API_URL || 'Not set');
      console.log('Server Base URL:', serverBaseUrl);
      console.log('API Base URL:', getBaseUrl());
      console.log('Current Origin:', window.location.origin);
      console.groupEnd();
    }
  }, []);

  // This component doesn't render anything
  return null;
};

/**
 * Log API URL configuration once on import
 * This is useful for debugging in production where you might not 
 * want to import the React component
 */
export const logApiUrlConfig = () => {
  console.group('🔌 API URL Configuration');
  console.log('Environment:', import.meta.env.MODE);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL || 'Not set');
  console.log('Server Base URL:', serverBaseUrl);
  console.log('API Base URL:', getBaseUrl());
  console.log('Current Origin:', window.location.origin);
  console.groupEnd();
};

// Log immediately when this file is imported
if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUGGING === 'true') {
  logApiUrlConfig();
}

export default ApiUrlLogger; 
/**
 * Comprehensive API connection verification utility
 * This script helps diagnose issues with API connectivity in different environments
 */

export const verifyApiConnection = async () => {
  const results = {
    environment: {
      apiUrl: import.meta.env.VITE_API_URL || 'Not set',
      nodeEnv: import.meta.env.NODE_ENV,
      baseUrl: window.location.origin
    },
    tests: []
  };

  // Test 1: Verify environment variables
  const envTest = {
    name: 'Environment Variables',
    status: 'unknown'
  };
  
  if (!import.meta.env.VITE_API_URL) {
    envTest.status = 'failed';
    envTest.message = 'VITE_API_URL environment variable is not set';
  } else {
    envTest.status = 'passed';
    envTest.message = `VITE_API_URL is set to: ${import.meta.env.VITE_API_URL}`;
  }
  results.tests.push(envTest);

  // Test 2: Attempt a simple GET request to the API
  const apiTest = {
    name: 'API Connection',
    status: 'unknown'
  };
  
  try {
    const apiUrl = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/v1/course/published-courses`;
    apiTest.requestUrl = apiUrl;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    apiTest.status = response.ok ? 'passed' : 'failed';
    apiTest.statusCode = response.status;
    apiTest.statusText = response.statusText;
    
    // Get response headers for debugging
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    apiTest.headers = headers;
    
    // Check if we received valid JSON
    try {
      const data = await response.json();
      apiTest.response = data;
      apiTest.isValidJson = true;
    } catch (jsonError) {
      apiTest.isValidJson = false;
      apiTest.jsonError = jsonError.message;
    }
  } catch (error) {
    apiTest.status = 'failed';
    apiTest.error = error.message;
    apiTest.isNetworkError = error.name === 'TypeError' && error.message.includes('Failed to fetch');
  }
  
  results.tests.push(apiTest);

  // Test 3: CORS test
  const corsTest = {
    name: 'CORS Configuration',
    status: 'unknown'
  };
  
  if (apiTest.status === 'failed') {
    if (apiTest.isNetworkError) {
      corsTest.status = 'unknown';
      corsTest.message = 'Network error occurred, cannot test CORS';
    } else if (apiTest.statusCode === 0) {
      corsTest.status = 'failed';
      corsTest.message = 'Received status code 0, likely a CORS error';
    } else if (apiTest.headers && apiTest.headers['access-control-allow-origin']) {
      // Check if the current origin is in the allowed origins
      const allowedOrigins = apiTest.headers['access-control-allow-origin'];
      if (allowedOrigins === '*' || allowedOrigins.includes(window.location.origin)) {
        corsTest.status = 'passed';
        corsTest.message = `CORS properly configured: ${allowedOrigins}`;
      } else {
        corsTest.status = 'failed';
        corsTest.message = `Current origin (${window.location.origin}) not in allowed origins: ${allowedOrigins}`;
      }
    } else {
      corsTest.status = 'failed';
      corsTest.message = 'No CORS headers found in response';
    }
  } else if (apiTest.status === 'passed') {
    corsTest.status = 'passed';
    corsTest.message = 'API request successful, CORS is properly configured';
  }
  
  results.tests.push(corsTest);

  // Log the full results for debugging
  console.log('API Connection Verification Results:', results);
  
  return results;
};

export default verifyApiConnection; 
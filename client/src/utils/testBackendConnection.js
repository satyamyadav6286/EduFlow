/**
 * Utility function to test the connection to the backend API
 * This can be imported and called from any component to verify connectivity
 */

const testBackendConnection = async () => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  console.log("Testing connection to backend at:", baseUrl);
  
  try {
    const response = await fetch(`${baseUrl}/api/v1/course/published-courses`);
    const responseStatus = response.status;
    const responseHeaders = Object.fromEntries(response.headers.entries());
    
    // Check if CORS is properly configured
    const corsHeaders = {
      'Access-Control-Allow-Origin': responseHeaders['access-control-allow-origin'],
      'Access-Control-Allow-Methods': responseHeaders['access-control-allow-methods'],
      'Access-Control-Allow-Headers': responseHeaders['access-control-allow-headers']
    };
    
    console.log(`Backend connection test status: ${responseStatus}`);
    console.log('Response headers:', responseHeaders);
    console.log('CORS headers:', corsHeaders);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Backend connection successful. Data:', data);
      return { success: true, data, status: responseStatus };
    } else {
      console.error('Backend connection failed with status:', responseStatus);
      return { 
        success: false, 
        status: responseStatus, 
        headers: responseHeaders,
        corsHeaders
      };
    }
  } catch (error) {
    console.error('Backend connection error:', error);
    return { 
      success: false, 
      error: error.message,
      isNetworkError: error.name === 'TypeError' && error.message.includes('Failed to fetch')
    };
  }
};

export default testBackendConnection; 
import { serverBaseUrl } from '@/config/constants';

// Track the last time we refreshed the token to avoid too many refresh attempts
let lastRefreshTime = 0;
const MIN_REFRESH_INTERVAL = 5000; // 5 seconds minimum between refreshes

/**
 * Attempts to refresh the authentication token
 * @param {boolean} force Force refresh even if we recently refreshed
 * @returns {Promise<{success: boolean, token: string|null, message: string}>}
 */
export const refreshToken = async (force = false) => {
  try {
    // Check if we've recently refreshed to avoid spamming the server
    const now = Date.now();
    if (!force && now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
      console.log("Skipping refresh - too soon since last refresh");
      return { 
        success: false, 
        token: null, 
        message: "Skipped refresh - too recent" 
      };
    }
    
    console.log("Attempting to refresh authentication token");
    console.log("Using server base URL:", serverBaseUrl);
    lastRefreshTime = now;
    
    // Try to refresh the token by calling the auth refresh endpoint
    const refreshResponse = await fetch(`${serverBaseUrl}/api/v1/user/refresh-token`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!refreshResponse.ok) {
      console.error(`Token refresh failed with status: ${refreshResponse.status}`);
      // Clear any invalid tokens
      localStorage.removeItem('token');
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      return { 
        success: false, 
        token: null, 
        message: `Token refresh failed with status: ${refreshResponse.status}` 
      };
    }
    
    // Get the response data
    const refreshData = await refreshResponse.json();
    
    if (!refreshData.token) {
      console.error("Token refresh response missing token");
      return { 
        success: false, 
        token: null, 
        message: "Token refresh response missing token" 
      };
    }
    
    // Update localStorage with the new token
    localStorage.setItem('token', refreshData.token);
    
    // Also set in cookies for cross-tab consistency
    document.cookie = `token=${refreshData.token}; path=/; max-age=86400`;
    
    console.log("Token refreshed successfully");
    
    return { 
      success: true, 
      token: refreshData.token, 
      message: "Token refreshed successfully" 
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return { 
      success: false, 
      token: null, 
      message: error.message || "Unknown error during token refresh" 
    };
  }
};

/**
 * Gets the most recent token from all possible sources
 * @returns {string|null} The most recent token or null if none found
 */
export const getBestToken = () => {
  // Disabled automatic token retrieval to require manual login
  return null;
};

/**
 * Ensures a valid token is available, refreshing if necessary
 * @returns {Promise<string|null>} A valid token or null if unavailable
 */
export const ensureValidToken = async () => {
  // Disabled automatic token validation to require manual login
  return null;
}; 
import jwt from "jsonwebtoken";

/**
 * Middleware to validate JWT token from various sources
 * Checks Authorization header, token in query param, or cookies
 */
export const validateToken = (req, res, next) => {
  try {
    console.log("Validating token from multiple sources");
    
    // First check if token validation was already done by another middleware
    if (req.isAuthenticated && req.id) {
      console.log("Request already authenticated by previous middleware");
      return next();
    }
    
    // Get token from Authorization header, query param, or cookies
    let token = null;
    
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log("Found token in Authorization header");
    }
    
    // If no token in header, check query params
    if (!token && req.query.token) {
      token = req.query.token;
      console.log("Found token in query parameters");
    }
    
    // If still no token, check cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log("Found token in cookies");
    }
    
    // If no token found, check if endpoint requires authentication
    if (!token) {
      console.log("No token found in request");
      // Allow endpoint to decide if authentication is required
      return next();
    }
    
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Token verification failed:", err.message);
        // Allow endpoint to handle authentication failure
        return next();
      }
      
      // Set authentication info
      req.isAuthenticated = true;
      req.id = decoded.id;
      req.role = decoded.role || 'student';
      
      console.log(`Request authenticated for user: ${req.id}, role: ${req.role}`);
      next();
    });
  } catch (error) {
    console.error("Token validation error:", error);
    // Allow endpoint to handle errors
    next();
  }
}; 
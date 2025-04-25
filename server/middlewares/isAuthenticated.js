import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    console.log('isAuthenticated middleware called');
    
    // First check for token in cookies
    let token = req.cookies.token;
    
    // Then check for token in Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('Using token from Authorization header');
    } else if (token) {
      console.log('Using token from cookies');
    }
    
    if (!token) {
      console.log('No token found in cookies or Authorization header');
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }
    
    // Check if SECRET_KEY is properly set
    if (!process.env.SECRET_KEY) {
      console.error('ERROR: SECRET_KEY is not set in environment variables');
      return res.status(500).json({
        message: "Server authentication configuration error",
        success: false,
      });
    }
    
    console.log('Token found, verifying with SECRET_KEY');
    
    try {
      const decode = jwt.verify(token, process.env.SECRET_KEY);
      console.log('Token verified successfully, userId:', decode.userId);
      req.id = decode.userId;
      // Also add the full user object to the request for middleware use
      req.user = { _id: decode.userId, role: decode.role };
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: "Token expired",
          success: false,
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: "Invalid token format",
          success: false,
        });
      } else {
        return res.status(401).json({
          message: "Token verification failed",
          success: false,
        });
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      message: "Authentication error",
      success: false,
      error: error.message
    });
  }
};
export default isAuthenticated;

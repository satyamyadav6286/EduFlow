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
    
    console.log('Token found, verifying...');
    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      console.log('Token verification failed');
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }
    
    console.log('Token verified, userId:', decode.userId);
    req.id = decode.userId;
    next();
  } catch (error) {
    console.log('Authentication error:', error);
    return res.status(401).json({
      message: "Authentication error",
      success: false,
    });
  }
};
export default isAuthenticated;

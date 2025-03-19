import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    console.log('isAuthenticated middleware called');
    console.log('Cookies:', req.cookies);
    
    const token = req.cookies.token;
    if (!token) {
      console.log('No token found in cookies');
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

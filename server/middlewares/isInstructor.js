import { User } from "../models/user.model.js";

const isInstructor = async (req, res, next) => {
  try {
    console.log('isInstructor middleware called');
    
    // If user is already available from isAuthenticated middleware, use it
    if (req.user && req.user.role) {
      console.log('Using user data from previous middleware:', req.user.role);
      
      if (req.user.role === 'INSTRUCTOR' || req.user.role === 'instructor') {
        return next();
      } else {
        return res.status(403).json({
          message: "Access denied. Only instructors can perform this action.",
          success: false,
        });
      }
    }
    
    // Otherwise try to fetch the user from the database
    console.log('Fetching user data from database, ID:', req.id);
    const user = await User.findById(req.id);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    
    console.log('User found, role:', user.role);
    
    if (user.role !== 'INSTRUCTOR' && user.role !== 'instructor') {
      return res.status(403).json({
        message: "Access denied. Only instructors can perform this action.",
        success: false,
      });
    }
    
    next();
  } catch (error) {
    console.error('Instructor verification error:', error);
    return res.status(500).json({
      message: "Server error during authorization",
      success: false,
    });
  }
};

export default isInstructor; 
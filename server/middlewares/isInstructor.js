import { User } from "../models/user.model.js";

const isInstructor = async (req, res, next) => {
  try {
    const user = await User.findById(req.id);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    
    if (user.role !== 'INSTRUCTOR' && user.role !== 'instructor') {
      return res.status(403).json({
        message: "Access denied. Only instructors can perform this action.",
        success: false,
      });
    }
    
    next();
  } catch (error) {
    console.log('Instructor verification error:', error);
    return res.status(500).json({
      message: "Server error during authorization",
      success: false,
    });
  }
};

export default isInstructor; 
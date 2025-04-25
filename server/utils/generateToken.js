import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign({ 
    userId: user._id, 
    role: user.role 
  }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });

  // Set cookie options based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Configure cookie for cross-domain use in production
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // Use secure cookies in production
    sameSite: isProduction ? 'none' : 'strict', // Allow cross-site cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  console.log('Setting authentication token cookie with options:', cookieOptions);

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message,
      user,
      token // Include token in response body for client storage
    });
};

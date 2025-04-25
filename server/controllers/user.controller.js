import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

export const register = async (req,res) => {
    try {
       
        const {name, email, password} = req.body; // patel214
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                success:false,
                message:"User already exist with this email."
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password:hashedPassword
        });
        return res.status(201).json({
            success:true,
            message:"Account created successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to register"
        })
    }
}
export const login = async (req,res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            });
        }
        generateToken(res, user, `Welcome back ${user.name}`);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to login"
        })
    }
}
export const logout = async (_,res) => {
    try {
        return res.status(200).cookie("token", "", {maxAge:0}).json({
            message:"Logged out successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to logout"
        }) 
    }
}
export const getUserProfile = async (req,res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password").populate("enrolledCourses");
        if(!user){
            return res.status(404).json({
                message:"Profile not found",
                success:false
            })
        }
        return res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to load user"
        })
    }
}
export const updateProfile = async (req,res) => {
    try {
        const userId = req.id;
        const {name} = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false
            }) 
        }
        // extract public id of the old image from the url is it exists;
        if(user.photoUrl){
            const publicId = user.photoUrl.split("/").pop().split(".")[0]; // extract public id
            deleteMediaFromCloudinary(publicId);
        }

        // upload new photo
        const cloudResponse = await uploadMedia(profilePhoto.path);
        const photoUrl = cloudResponse.secure_url;

        const updatedData = {name, photoUrl};
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password");

        return res.status(200).json({
            success:true,
            user:updatedUser,
            message:"Profile updated successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to update profile"
        })
    }
}

export const createInstructor = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email."
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new instructor
        const newInstructor = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "instructor"
        });
        
        // Return success (without password)
        return res.status(201).json({
            success: true,
            message: "Instructor account created successfully.",
            instructor: {
                id: newInstructor._id,
                name: newInstructor.name,
                email: newInstructor.email,
                role: newInstructor.role
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create instructor account"
        });
    }
}

export const getAllInstructors = async (req, res) => {
    try {
        // Find all instructors
        const instructors = await User.find({ role: "instructor" }).select("-password");
        
        return res.status(200).json({
            success: true,
            instructors
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch instructors"
        });
    }
}

export const refreshToken = async (req, res) => {
    try {
        const userId = req.id; // Extract from authenticated request
        
        console.log('Refreshing token for user:', userId);
        
        // Find the user to include updated user data in response
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Generate a new token
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });
        
        // Set cookie options based on environment
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Configure cookie for cross-domain use in production
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        };
        
        console.log('Setting refreshed token cookie with options:', cookieOptions);
        
        return res
            .status(200)
            .cookie("token", token, cookieOptions)
            .json({
                success: true,
                message: "Token refreshed successfully",
                token, // Include token in response for client-side storage
                user
            });
    } catch (error) {
        console.log('Token refresh error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to refresh token"
        });
    }
}

// Update instructor signature
export const updateInstructorSignature = async (req, res) => {
    try {
        const userId = req.id;
        const signatureFile = req.file;

        // Check if user exists and is an instructor
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role !== 'INSTRUCTOR' && user.role !== 'instructor') {
            return res.status(403).json({
                success: false,
                message: "Only instructors can upload signature images"
            });
        }

        // Delete old signature image if it exists
        if (user.signatureImage) {
            const publicId = user.signatureImage.split("/").pop().split(".")[0]; // extract public id
            await deleteMediaFromCloudinary(publicId);
        }

        // Upload new signature image
        if (!signatureFile) {
            return res.status(400).json({
                success: false,
                message: "No signature image provided"
            });
        }

        const cloudResponse = await uploadMedia(signatureFile.path);
        const signatureImageUrl = cloudResponse.secure_url;

        // Update user with new signature image URL
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { signatureImage: signatureImageUrl }, 
            { new: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Signature updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update signature"
        });
    }
}
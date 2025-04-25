import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minLength: [3, "Name must be at least 3 character"],
        maxLength: [50, "Name can't exceed 50 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [6, "Password must be at least 6 characters"],
        select: false
    },
    role: {
        type: String,
        enum: ['USER', 'INSTRUCTOR', 'ADMIN', 'user', 'instructor', 'admin'],
        default: 'USER'
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    signatureImage: {
        type: String,
        default: ''  // URL to the instructor's digital signature image
    },
    courses: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Course',
        default: []
    },
    enrolledCourses: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Course',
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Encrypt password before save - HOOKS
userSchema.pre("save", async function (next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified("password")) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare user password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getJwtToken = function() {
    return jwt.sign(
        { 
            id: this._id,
            email: this.email,
            role: this.role,
            subscription: this.subscription
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);
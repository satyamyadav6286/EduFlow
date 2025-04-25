import express from "express";
import { 
    getUserProfile, 
    login, 
    logout, 
    register, 
    updateProfile, 
    createInstructor, 
    getAllInstructors,
    refreshToken,
    updateInstructorSignature
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isInstructor from "../middlewares/isInstructor.js";
import upload from "../utils/multer.js";

const router = express.Router();

// Add a test endpoint to diagnose server issues
router.route("/auth-test").get((req, res) => {
    return res.status(200).json({
        success: true,
        message: "Auth test endpoint is working",
        environment: {
            nodeEnv: process.env.NODE_ENV || 'not set',
            secretKeySet: process.env.SECRET_KEY ? true : false,
            mongoDbSet: process.env.MONGODB_URI ? true : false
        }
    });
});

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);
router.route("/instructor").post(isAuthenticated, isInstructor, createInstructor);
router.route("/instructors").get(isAuthenticated, isInstructor, getAllInstructors);
router.route("/refresh-token").post(isAuthenticated, refreshToken);
router.route("/signature/update").post(isAuthenticated, isInstructor, upload.single("signature"), updateInstructorSignature);

export default router;
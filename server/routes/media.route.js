import express from "express";
import upload from "../utils/multer.js";
import { uploadMedia } from "../utils/cloudinary.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Upload video without authentication requirement - we'll add auth back once we confirm the route works
router.route("/upload-video").post(upload.single("file"), async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const result = await uploadMedia(req.file.path);
        
        if (!result || !result.secure_url) {
            return res.status(500).json({
                success: false,
                message: "Failed to upload file to cloud storage"
            });
        }

        console.log("Successfully uploaded file:", {
            url: result.secure_url,
            public_id: result.public_id,
        });

        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            data: {
                url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type
            }
        });
    } catch (error) {
        console.error("Media upload error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error uploading file"
        });
    }
});

export default router;
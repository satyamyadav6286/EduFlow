import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import contactRoute from "./routes/contact.route.js";
import certificateRoute from "./routes/certificate.route.js";
import quizRoute from "./routes/quiz.route.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load and check environment variables
dotenv.config();

// Check critical environment variables
if (!process.env.SECRET_KEY) {
  console.error("❌ CRITICAL ERROR: SECRET_KEY environment variable is not set!");
  console.error("Authentication will fail until this is fixed.");
  // Continue execution but log the error
}

if (!process.env.MONGO_URI) {
  console.error("❌ CRITICAL ERROR: MONGO_URI environment variable is not set!");
  console.error("Database connection will fail.");
  // Continue execution but log the error  
}

// call database connection here
connectDB();
const app = express();

const PORT = process.env.PORT || 3000;

// default middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS to allow requests from client and Cloudinary
app.use(cors({
    origin: [
      "http://localhost:5173", 
      "https://res.cloudinary.com", 
      // Add Vercel domains
      "https://eduflow-web.vercel.app", 
      "https://eduflow-git-main.vercel.app", 
      "https://eduflow.vercel.app",
      // Additional Vercel domains
      "https://edu-flow-satyam-yadavs-projects-73e3f153.vercel.app",
      "https://edu-flow-git-main-satyam-yadavs-projects-73e3f153.vercel.app",
      "https://edu-flow-brown.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "Cache-Control", 
      "Pragma", 
      "X-Requested-With", 
      "Accept", 
      "Origin", 
      "Access-Control-Request-Method", 
      "Access-Control-Request-Headers"
    ],
    exposedHeaders: ["set-cookie"]
}));
 
// Serve static certificate files
const uploadsDir = path.join(__dirname, 'uploads');
console.log('Uploads directory:', uploadsDir);
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o777 }); // Full permissions
  // Set permissions explicitly as a separate step
  try {
    fs.chmodSync(uploadsDir, 0o777);
    console.log(`Permissions set on uploads directory: ${uploadsDir}`);
  } catch (permError) {
    console.error(`Failed to set permissions on uploads directory: ${permError}`);
  }
} else {
  console.log(`Uploads directory exists: ${uploadsDir}`);
  // Update permissions on existing directory
  try {
    fs.chmodSync(uploadsDir, 0o777);
    console.log(`Permissions updated on uploads directory: ${uploadsDir}`);
  } catch (permError) {
    console.error(`Failed to update permissions on uploads directory: ${permError}`);
  }
}
app.use('/uploads', express.static(uploadsDir));

// Ensure certificates directory exists with proper permissions
const certificatesDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certificatesDir)) {
  console.log(`Creating certificates directory: ${certificatesDir}`);
  fs.mkdirSync(certificatesDir, { recursive: true, mode: 0o777 }); // Full permissions
  // Set permissions explicitly
  try {
    fs.chmodSync(certificatesDir, 0o777);
    console.log(`Permissions set on certificates directory: ${certificatesDir}`);
  } catch (permError) {
    console.error(`Failed to set permissions on certificates directory: ${permError}`);
  }
} else {
  console.log(`Certificates directory exists: ${certificatesDir}`);
  // Update permissions on existing directory
  try {
    fs.chmodSync(certificatesDir, 0o777);
    console.log(`Permissions updated on certificates directory: ${certificatesDir}`);
  } catch (permError) {
    console.error(`Failed to update permissions on certificates directory: ${permError}`);
  }
}
console.log('Certificates directory:', certificatesDir);
app.use('/certificates', express.static(certificatesDir));

// apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/contact", contactRoute);
app.use("/api/v1/certificates", certificateRoute);
app.use("/api/v1/quiz", quizRoute);
app.use("/api/v1/quizzes", quizRoute);
 
// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : null
    });
});

app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`SECRET_KEY set: ${process.env.SECRET_KEY ? 'Yes' : 'NO - AUTHENTICATION WILL FAIL'}`);
});



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

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({});

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
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
 
// Serve static certificate files
const uploadsDir = path.join(__dirname, 'uploads');
console.log('Uploads directory:', uploadsDir);
app.use('/uploads', express.static(uploadsDir));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

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
});



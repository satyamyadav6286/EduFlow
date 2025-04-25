import { CourseProgress } from "../models/courseProgress.js";
import { Course } from "../models/course.model.js";
import { Certificate } from "../models/certificate.model.js";
import { generateCertificate as generateCertificatePDF } from "../utils/certificateGenerator.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to ensure certificate directory exists
const ensureCertificateDir = () => {
  const certificateDir = path.resolve(__dirname, "../certificates");
  if (!fs.existsSync(certificateDir)) {
    fs.mkdirSync(certificateDir, { recursive: true });
  }
  
  // Ensure directory has proper permissions
  try {
    fs.chmodSync(certificateDir, 0o777);
  } catch (err) {
    console.warn(`Warning: Could not set directory permissions: ${err.message}`);
  }
  
  return certificateDir;
};

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // step-1 fetch the user course progress
    let courseProgress = await CourseProgress.findOne({
      courseId,
      userId,
    }).populate("courseId");

    const courseDetails = await Course.findById(courseId).populate("lectures");

    if (!courseDetails) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Check if user has a certificate for this course
    const certificate = await Certificate.findOne({
      userId,
      courseId,
    });

    let certificateInfo = null;
    if (certificate) {
      certificateInfo = {
        id: certificate.certificateId,
        issuedDate: certificate.issuedDate,
        completionDate: certificate.completionDate,
      };
    }

    // Step-2 If no progress found, return course details with an empty progress
    if (!courseProgress) {
      return res.status(200).json({
        data: {
          courseDetails,
          progress: [],
          completed: false,
          certificate: certificateInfo,
        },
      });
    }

    // Step-3 Return the user's course progress along with course details
    return res.status(200).json({
      data: {
        courseDetails,
        progress: courseProgress.lectureProgress,
        completed: courseProgress.completed,
        certificate: certificateInfo,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
      message: "Internal Server Error",
    });
  }
};

export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    // fetch or create course progress
    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      // If no progress exist, create a new record
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }

    // find the lecture progress in the course progress
    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId === lectureId
    );

    if (lectureIndex !== -1) {
      // if lecture already exist, update its status
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      // Add new lecture progress
      courseProgress.lectureProgress.push({
        lectureId,
        viewed: true,
      });
    }

    // if all lecture is complete
    const lectureProgressLength = courseProgress.lectureProgress.filter(
      (lectureProg) => lectureProg.viewed
    ).length;

    const course = await Course.findById(courseId);

    if (course.lectures.length === lectureProgressLength)
      courseProgress.completed = true;

    await courseProgress.save();

    return res.status(200).json({
      message: "Lecture progress updated successfully.",
    });
  } catch (error) {
    console.log(error);
  }
};

export const markAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ userId, courseId });

    if (!courseProgress) {
      return res.status(404).json({
        message: "Course progress not found",
      });
    }

    const updatedCourseProgress = await CourseProgress.findOneAndUpdate(
      { userId, courseId },
      { completed: true },
      { new: true }
    );

    // Automatically generate certificate upon completion
    let certificateInfo = null;
    try {
      // Check if certificate already exists
      let existingCertificate = await Certificate.findOne({ userId, courseId });
      
      if (!existingCertificate) {
        // Make sure certificate directory exists
        ensureCertificateDir();
        
        // Generate the certificate PDF
        const certificateResult = await generateCertificatePDF(userId, courseId);
        console.log(`Certificate generated with ID: ${certificateResult.certificateId}`);
        
        // Create certificate record
        existingCertificate = await Certificate.create({
          userId,
          courseId,
          certificateId: certificateResult.certificateId,
          pdfPath: certificateResult.pdfUrl,
          issuedDate: new Date(),
          completionDate: new Date()
        });
        
        console.log(`Certificate record created: ${existingCertificate._id}`);
      }
      
      // Add certificate info to response
      certificateInfo = {
        id: existingCertificate.certificateId,
        issuedDate: existingCertificate.issuedDate,
        completionDate: existingCertificate.completionDate,
      };
    } catch (certificateError) {
      console.error("Error automatically generating certificate:", certificateError);
      // Don't fail the request, just log the error
    }

    return res.status(200).json({
      message: "Course marked as completed",
      data: {
        progress: updatedCourseProgress,
        certificate: certificateInfo
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
      message: "Internal Server Error",
    });
  }
};

export const markAsInCompleted = async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.id;
  
      const courseProgress = await CourseProgress.findOne({ courseId, userId });
      if (!courseProgress)
        return res.status(404).json({ message: "Course progress not found" });
  
      courseProgress.lectureProgress.map(
        (lectureProgress) => (lectureProgress.viewed = false)
      );
      courseProgress.completed = false;
      await courseProgress.save();
      return res.status(200).json({ message: "Course marked as incompleted." });
    } catch (error) {
      console.log(error);
    }
  };

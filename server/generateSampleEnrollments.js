import mongoose from "mongoose";
import { Course } from "./models/course.model.js";
import { User } from "./models/user.model.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

// Function to generate sample enrollments
const generateSampleEnrollments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find or create a test student user
    let testStudent = await User.findOne({ email: "student@test.com" });
    
    if (!testStudent) {
      // Create a test student if none exists
      const hashedPassword = await bcrypt.hash("Test@123", 10);
      
      testStudent = new User({
        name: "Test Student",
        email: "student@test.com",
        password: hashedPassword,
        role: "student"
      });
      
      await testStudent.save();
      console.log("Created test student user:", testStudent.email);
    } else {
      console.log("Using existing test student:", testStudent.email);
    }
    
    // Get random courses to enroll the student in
    const courses = await Course.find({ isPublished: true }).limit(5);
    
    if (courses.length === 0) {
      console.log("No courses found to enroll in");
      await mongoose.connection.close();
      return;
    }
    
    // Enroll the student in each course
    for (const course of courses) {
      // Check if student is already enrolled
      if (!course.enrolledStudents.includes(testStudent._id)) {
        // Add student to course's enrolled students
        course.enrolledStudents.push(testStudent._id);
        await course.save();
        console.log(`Enrolled ${testStudent.name} in course: ${course.courseTitle}`);
      } else {
        console.log(`${testStudent.name} is already enrolled in: ${course.courseTitle}`);
      }
    }
    
    console.log("Sample enrollments completed!");
    
  } catch (error) {
    console.error('Error generating sample enrollments:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the function
generateSampleEnrollments(); 
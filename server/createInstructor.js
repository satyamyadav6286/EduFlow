import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const createInstructor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Instructor details with the user's information
    const instructorDetails = {
      name: "Satyam Govind Yadav",
      email: "satyamyadav6286@gmail.com", // Added the missing @ symbol
      password: "satyam@6286",
      role: "instructor"
    };
    
    // Check if an instructor with this email already exists
    const existingUser = await User.findOne({ email: instructorDetails.email });
    
    if (existingUser) {
      console.log('An account with this email already exists');
      console.log('Details:');
      console.log(JSON.stringify({
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      }, null, 2));
      
      // Update to instructor if not already
      if (existingUser.role !== 'instructor') {
        await User.findByIdAndUpdate(existingUser._id, { role: 'instructor' });
        console.log('Updated user role to instructor');
      }
    } else {
      // Create new instructor account
      const hashedPassword = await bcrypt.hash(instructorDetails.password, 10);
      
      const newInstructor = new User({
        name: instructorDetails.name,
        email: instructorDetails.email,
        password: hashedPassword,
        role: instructorDetails.role
      });
      
      await newInstructor.save();
      console.log('Instructor account created successfully:');
      console.log(JSON.stringify({
        name: instructorDetails.name,
        email: instructorDetails.email,
        role: instructorDetails.role
      }, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

createInstructor(); 
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Function to create the admin instructor account
const createAdminInstructor = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eduflow');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'satyamyadav6286@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin instructor account already exists');
    } else {
      // Create new admin instructor
      const hashedPassword = await bcrypt.hash('satyam@6286', 10);
      
      await User.create({
        name: 'Satyam Yadav',
        email: 'satyamyadav6286@gmail.com',
        password: hashedPassword,
        role: 'instructor',
      });
      
      console.log('Admin instructor account created successfully');
    }

    // Disconnect from MongoDB
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    
    // Ensure connection is closed even if there's an error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Disconnected from MongoDB after error');
    }
  }
};

// Run the function
createAdminInstructor(); 
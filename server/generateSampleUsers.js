import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models/user.model.js';
import connectDB from './database/db.js';

dotenv.config();

// Connect to database
connectDB();

const sampleUsers = [
  {
    name: 'Mohit Pardeshi',
    email: 'mohit.pardeshi@example.com',
    password: 'Password123!',
    role: 'student'
  },
  {
    name: 'Sohel Solkar',
    email: 'sohel.solkar@example.com',
    password: 'Password123!',
    role: 'student'
  },
  {
    name: 'Munaf Lanjekar',
    email: 'munaf.lanjekar@example.com',
    password: 'Password123!',
    role: 'student'
  },
  {
    name: 'Muhammad Mitha',
    email: 'muhammad.mitha@example.com',
    password: 'Password123!',
    role: 'student'
  },
  {
    name: 'Prashant Yadav',
    email: 'prashant.yadav@example.com',
    password: 'Password123!',
    role: 'student'
  }
];

const createUsers = async () => {
  try {
    // Clear existing users (optional)
    // await User.deleteMany({});
    
    // Check if users already exist
    for (const user of sampleUsers) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Create the user with hashed password
        await User.create({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role
        });
        
        console.log(`Created user: ${user.name}`);
      } else {
        console.log(`User ${user.name} already exists, skipping...`);
      }
    }
    
    console.log('Sample users created successfully!');
    process.exit();
  } catch (error) {
    console.error('Error creating sample users:', error);
    process.exit(1);
  }
};

createUsers(); 
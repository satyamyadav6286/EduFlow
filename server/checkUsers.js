import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';
import connectDB from './database/db.js';

dotenv.config();

// Connect to database
connectDB();

const checkUsers = async () => {
  try {
    // Find all users
    const users = await User.find().select('name email role');
    
    console.log('Total users found:', users.length);
    console.log('\nUsers in the database:');
    console.log('--------------------------');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log('--------------------------');
    });
    
    // Check for instructors
    const instructors = users.filter(user => user.role === 'instructor');
    console.log(`\nTotal instructors: ${instructors.length}`);
    
    if (instructors.length > 0) {
      console.log('Instructor accounts:');
      instructors.forEach(instructor => {
        console.log(`- ${instructor.name} (${instructor.email})`);
      });
    } else {
      console.log('No instructor accounts found. You need to create one.');
    }
    
    // Check for students
    const students = users.filter(user => user.role === 'student');
    console.log(`\nTotal students: ${students.length}`);
    
    process.exit();
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
};

checkUsers(); 
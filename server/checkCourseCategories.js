import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from './models/course.model.js';
import connectDB from './database/db.js';

dotenv.config();

const main = async () => {
  try {
    await connectDB();
    console.log('=== Checking Course Categories ===');
    
    // Get all categories and course counts
    const categories = await Course.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('Categories and course counts:');
    categories.forEach(cat => {
      console.log(`- ${cat._id}: ${cat.count} courses`);
    });
    
    // Get course levels counts
    const levels = await Course.aggregate([
      { $group: { _id: "$courseLevel", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\nCourse levels:');
    levels.forEach(level => {
      console.log(`- ${level._id}: ${level.count} courses`);
    });
    
    // Get total lectures
    const totalLectures = await Course.aggregate([
      { $project: { lectureCount: { $size: "$lectures" } } },
      { $group: { _id: null, total: { $sum: "$lectureCount" } } }
    ]);
    
    console.log(`\nTotal lectures: ${totalLectures[0]?.total || 0}`);
    
    // Close database connection
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Error checking course data:', error);
    process.exit(1);
  }
};

// Run the function
main(); 
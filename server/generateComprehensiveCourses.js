import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { User } from './models/user.model.js';
import connectDB from './database/db.js';

dotenv.config();

// Connect to database
connectDB();

// Define categories
const categories = [
  'Next JS',
  'Data Science',
  'Frontend Development',
  'Fullstack Development',
  'MERN Stack Development',
  'Javascript',
  'Python',
  'Docker',
  'MongoDB',
  'HTML',
  'Web Development',
  'Mobile Development',
  'Machine Learning',
  'Web Design',
  'Programming Languages'
];

// Levels for courses
const levels = ['Beginner', 'Medium', 'Advance'];

// Sample video URLs - provide one sample URL that works in your Cloudinary account
const sampleVideoUrl = "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4";

// Sample thumbnail URLs - you can add more or replace these with URLs from your Cloudinary account
const sampleThumbnailUrls = [
  "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716020000/course-thumbnails/python_course_ahngfd.jpg",
  "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716020000/course-thumbnails/javascript_course_dymgqe.jpg",
  "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716020000/course-thumbnails/web_development_fpogqw.jpg",
  "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716020000/course-thumbnails/data_science_vohpwe.jpg",
  "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716020000/course-thumbnails/machine_learning_uy4fgz.jpg"
];

// Function to generate a random price between 499 and 1999
const generateRandomPrice = () => Math.floor(Math.random() * (1999 - 499 + 1) + 499);

// Function to get a random thumbnail URL
const getRandomThumbnail = () => {
  const defaultThumbnail = "https://via.placeholder.com/640x360?text=Course+Thumbnail";
  
  if (sampleThumbnailUrls.length === 0) return defaultThumbnail;
  
  return sampleThumbnailUrls[Math.floor(Math.random() * sampleThumbnailUrls.length)];
};

// Generate courses across all categories
const generateComprehensiveCourses = async () => {
  try {
    // Find an instructor user (if not present, you may need to create one)
    let instructor = await User.findOne({ role: 'instructor' });
    
    if (!instructor) {
      console.log('No instructor found. Creating one...');
      
      // Create an instructor if none exists
      const hashedPassword = await bcrypt.hash('Instructor123!', 10);
      instructor = await User.create({
        name: 'Course Instructor',
        email: 'instructor@example.com',
        password: hashedPassword,
        role: 'instructor'
      });
      
      console.log('Created instructor:', instructor.name);
    } else {
      console.log('Using existing instructor:', instructor.name);
    }
    
    // Generate courses for each category
    for (const category of categories) {
      // Create at least one course per category
      const numCoursesInCategory = Math.floor(Math.random() * 2) + 1; // 1-2 courses per category
      
      for (let i = 0; i < numCoursesInCategory; i++) {
        // Generate basic course info
        const courseLevel = levels[Math.floor(Math.random() * levels.length)];
        const coursePrice = generateRandomPrice();
        const courseTitle = `${category} ${courseLevel === 'Beginner' ? 'Fundamentals' : courseLevel === 'Medium' ? 'Intermediate' : 'Advanced'} Course`;
        const subTitle = `Comprehensive ${category} course for ${courseLevel.toLowerCase()} level students`;
        
        // Create a detailed description
        const description = `
          <h2>About this course</h2>
          <p>This comprehensive ${category} course is designed for ${courseLevel.toLowerCase()} level students who want to master the skills needed in today's competitive job market.</p>
          
          <h3>What you'll learn</h3>
          <ul>
            <li>Understanding core ${category} concepts and principles</li>
            <li>Building real-world projects with industry best practices</li>
            <li>Solving common problems and debugging techniques</li>
            <li>Advanced patterns and optimization strategies</li>
            <li>Deployment and maintenance in production environments</li>
          </ul>
          
          <h3>Requirements</h3>
          <ul>
            <li>${courseLevel === 'Beginner' ? 'No prior experience needed' : 'Basic understanding of programming concepts'}</li>
            <li>A computer with internet access</li>
            <li>Dedication and willingness to learn</li>
          </ul>
          
          <h3>Who this course is for</h3>
          <p>This course is perfect for ${courseLevel === 'Beginner' ? 'absolute beginners' : courseLevel === 'Medium' ? 'those with some experience' : 'experienced developers'} looking to ${courseLevel === 'Beginner' ? 'start their journey' : 'advance their skills'} in ${category}.</p>
        `;
        
        // Create the course
        const course = new Course({
          courseTitle,
          subTitle,
          description,
          category,
          courseLevel,
          coursePrice,
          courseThumbnail: getRandomThumbnail(),
          creator: instructor._id,
          isPublished: true,
          lectures: [] // We'll add lectures and then update this
        });
        
        // Create 5 lectures for the course
        const lecturePromises = [];
        
        for (let j = 1; j <= 5; j++) {
          const lectureTitle = `Lecture ${j}: ${getLectureTitle(category, j)}`;
          const isPreviewFree = j === 1; // Make the first lecture free
          
          const lecture = new Lecture({
            lectureTitle,
            videoUrl: sampleVideoUrl,
            publicId: `sample-video-${j}`,
            isPreviewFree
          });
          
          lecturePromises.push(lecture.save());
        }
        
        // Save all lectures
        const savedLectures = await Promise.all(lecturePromises);
        
        // Add lecture IDs to the course
        course.lectures = savedLectures.map(lecture => lecture._id);
        
        // Save the course
        await course.save();
        
        console.log(`Created course: ${courseTitle} with ${savedLectures.length} lectures`);
      }
    }
    
    console.log('All courses generated successfully!');
    process.exit();
  } catch (error) {
    console.error('Error generating courses:', error);
    process.exit(1);
  }
};

// Helper function to generate lecture titles based on category and number
function getLectureTitle(category, lectureNumber) {
  const introTitles = [
    'Introduction and Overview',
    'Getting Started',
    'Setting Up Your Environment',
    'Understanding the Basics',
    'Core Concepts'
  ];
  
  const intermediateTitles = [
    'Building Your First Project',
    'Working with Data',
    'Implementing Core Features',
    'Error Handling and Debugging',
    'Best Practices and Patterns'
  ];
  
  const advancedTitles = [
    'Advanced Techniques',
    'Performance Optimization',
    'Security Considerations',
    'Deployment Strategies',
    'Production-Ready Applications'
  ];
  
  if (lectureNumber <= 1) {
    return introTitles[0];
  } else if (lectureNumber <= 3) {
    return intermediateTitles[lectureNumber - 2];
  } else {
    return advancedTitles[lectureNumber - 4];
  }
}

// Run the function to generate courses
generateComprehensiveCourses(); 
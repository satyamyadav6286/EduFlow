import express from "express";
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Course } from '../models/course.model.js';
import { Lecture } from '../models/lecture.model.js';

const router = express.Router();

// Sample users data
const sampleUsers = [
  {
    name: 'Satyam Govind Yadav',
    email: 'satyamyadav6286@gmail.com',
    password: 'satyam@6286',
    role: 'instructor'
  },
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

// Sample courses data
const sampleCourses = [
  // Web Development Course
  {
    courseTitle: "Complete Web Development Bootcamp",
    subTitle: "Learn HTML, CSS, JavaScript, React, Node.js, and more",
    description: `<p>This comprehensive web development bootcamp will take you from beginner to pro with hands-on projects and real-world applications.</p>
    <p>You'll learn:</p>
    <ul>
      <li>HTML5 and CSS3 fundamentals</li>
      <li>JavaScript programming</li>
      <li>Frontend development with React</li>
      <li>Backend development with Node.js and Express</li>
      <li>Database management with MongoDB</li>
      <li>Full-stack application deployment</li>
    </ul>
    <p>By the end of this course, you'll be able to build complete web applications from scratch!</p>`,
    category: "Web Development",
    courseLevel: "Beginner",
    coursePrice: 699,
    isPublished: true,
    lectures: [
      {
        lectureTitle: "Introduction to Web Development",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: true
      },
      {
        lectureTitle: "HTML Fundamentals",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4", 
        isPreviewFree: false
      }
    ]
  },
  // Data Science Course
  {
    courseTitle: "Data Science and Analytics Bootcamp",
    subTitle: "Transform data into insights and business value",
    description: `<p>Learn to extract meaningful insights from complex datasets and drive data-informed decision making.</p>
    <p>This comprehensive course covers:</p>
    <ul>
      <li>Data collection, cleaning, and preprocessing</li>
      <li>Exploratory data analysis and visualization</li>
      <li>Statistical analysis and hypothesis testing</li>
      <li>Machine learning for predictive analytics</li>
      <li>Business intelligence and reporting dashboards</li>
    </ul>
    <p>Real-world projects include market analysis, customer segmentation, and predictive modeling for business outcomes.</p>`,
    category: "Data Science",
    courseLevel: "Beginner",
    coursePrice: 899,
    isPublished: true,
    lectures: [
      {
        lectureTitle: "Introduction to Data Science",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: true
      },
      {
        lectureTitle: "Data Collection and Preprocessing",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: false
      }
    ]
  },
  // Machine Learning Course
  {
    courseTitle: "Machine Learning Fundamentals with Python",
    subTitle: "Master machine learning algorithms and techniques",
    description: `<p>Learn the core concepts of machine learning and how to implement algorithms using Python and popular libraries.</p>
    <p>This course covers:</p>
    <ul>
      <li>Supervised and unsupervised learning</li>
      <li>Classification and regression techniques</li>
      <li>Neural networks and deep learning</li>
      <li>Feature engineering and model evaluation</li>
      <li>Practical applications in real-world scenarios</li>
    </ul>
    <p>Hands-on projects include image classification, natural language processing, and predictive analytics.</p>`,
    category: "Machine Learning",
    courseLevel: "Medium",
    coursePrice: 999,
    isPublished: true,
    lectures: [
      {
        lectureTitle: "Introduction to Machine Learning",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: true
      },
      {
        lectureTitle: "Supervised Learning Algorithms",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: false
      }
    ]
  }
];

// Temporary route for seeding the database
router.route('/run-db-seed').get(async (req, res) => {
  try {
    console.log('=== Starting Database Seeding ===');
    const results = {
      admin: [],
      instructor: [],
      users: [],
      courses: []
    };

    // Create Admin User (but using an 'instructor' role since 'admin' is not valid)
    const adminExists = await User.findOne({ email: 'admin@eduflow.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@eduflow.com',
        password: hashedPassword,
        role: 'instructor'
      });
      results.admin.push(admin.email);
      console.log('Admin user created:', admin.email);
    } else {
      results.admin.push(`${adminExists.email} (already exists)`);
      console.log('Admin user already exists');
    }
    
    // Create Regular Users
    for (const user of sampleUsers) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = await User.create({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role
        });
        results.users.push(newUser.email);
        
        if (user.role === 'instructor') {
          results.instructor.push(newUser.email);
        }
        
        console.log(`Created user: ${user.name}`);
      } else {
        results.users.push(`${existingUser.email} (already exists)`);
        console.log(`User ${user.name} already exists, skipping...`);
      }
    }
    console.log('Sample users created successfully!');
    
    // Create Courses
    const instructor = await User.findOne({ email: 'satyamyadav6286@gmail.com' });
    if (!instructor) {
      console.error('Instructor user not found, cannot create courses');
      return res.status(400).json({
        success: false,
        message: 'Instructor user not found, cannot create courses',
        results
      });
    }

    for (const course of sampleCourses) {
      const existingCourse = await Course.findOne({ courseTitle: course.courseTitle });
      if (!existingCourse) {
        // Create the course
        const newCourse = await Course.create({
          courseTitle: course.courseTitle,
          subTitle: course.subTitle,
          description: course.description,
          category: course.category,
          courseLevel: course.courseLevel,
          coursePrice: course.coursePrice,
          isPublished: course.isPublished,
          instructor: instructor._id,
          thumbnail: 'https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg'
        });
        
        // Create lectures for the course
        for (const lecture of course.lectures) {
          await Lecture.create({
            lectureTitle: lecture.lectureTitle,
            course: newCourse._id,
            videoInfo: {
              url: lecture.videoUrl,
              provider: 'cloudinary'
            },
            isPreviewFree: lecture.isPreviewFree
          });
        }
        
        results.courses.push(course.courseTitle);
        console.log(`Created course: ${course.courseTitle}`);
      } else {
        results.courses.push(`${course.courseTitle} (already exists)`);
        console.log(`Course ${course.courseTitle} already exists, skipping...`);
      }
    }
    console.log('Sample courses created successfully!');
    
    console.log('=== Database Seeding Completed Successfully ===');

    return res.status(200).json({
      success: true,
      message: 'Database seeded successfully',
      results
    });
  } catch (error) {
    console.error('Database seeding failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Database seeding failed',
      error: error.message
    });
  }
});

export default router; 
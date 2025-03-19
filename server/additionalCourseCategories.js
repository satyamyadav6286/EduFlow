import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { User } from './models/user.model.js';
import connectDB from './database/db.js';

dotenv.config();

// Connect to database
const main = async () => {
  try {
    await connectDB();
    console.log('=== Adding Additional Category-Based Courses ===');
    
    // Find instructor (Satyam)
    const instructor = await User.findOne({ email: 'satyamyadav6286@gmail.com' });
    if (!instructor) {
      console.error('Instructor not found, cannot create courses');
      process.exit(1);
    }
    
    console.log('Found instructor:', instructor.email);

    // Define categories to ensure we have courses in all categories
    const categories = [
      "Web Development",
      "Mobile Development",
      "Data Science", 
      "Machine Learning",
      "Python",
      "JavaScript",
      "Cloud Computing",
      "DevOps",
      "Cybersecurity",
      "Design",
      "Blockchain",
      "Game Development"
    ];
    
    // Create courses for each category (at least 2 per category)
    for (const category of categories) {
      // Check if we already have courses in this category
      const existingCount = await Course.countDocuments({ category });
      console.log(`${category}: ${existingCount} existing courses`);
      
      // If we need more courses for this category
      if (existingCount < 2) {
        // How many courses to add
        const coursesToAdd = 2 - existingCount;
        
        for (let i = 1; i <= coursesToAdd; i++) {
          // Create course
          const courseTitle = `${category} ${getCourseSuffix(category, i)}`;
          const courseLevel = getRandomLevel();
          const coursePrice = getRandomPrice();
          
          const course = await Course.create({
            courseTitle,
            subTitle: `Comprehensive guide to ${category.toLowerCase()}`,
            description: `<p>This in-depth course covers everything you need to know about ${category}.</p>
            <p>From beginner fundamentals to advanced techniques, you'll gain practical skills through hands-on projects and real-world examples.</p>
            <p>By the end, you'll be able to build professional-quality projects and apply for jobs in this field.</p>`,
            category,
            courseLevel,
            coursePrice,
            isPublished: true,
            creator: instructor._id,
            courseThumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg"
          });
          
          // Create 5 lectures for each course
          for (let j = 1; j <= 5; j++) {
            const lecture = await Lecture.create({
              lectureTitle: getLectureTitle(category, j),
              videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
              isPreviewFree: j === 1 // Only first lecture is free preview
            });
            
            // Add lecture to course
            course.lectures.push(lecture._id);
          }
          
          // Save course with lectures
          await course.save();
          console.log(`Created ${category} course: ${courseTitle} with 5 lectures`);
        }
      }
    }

    console.log('=== All Categories Now Have Multiple Courses ===');

    // Close database connection
    mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Adding category courses failed:', error);
    process.exit(1);
  }
};

// Helper function to get course suffix based on category
function getCourseSuffix(category, index) {
  const suffixes = {
    "Web Development": ["Bootcamp", "Masterclass"],
    "Mobile Development": ["Professional", "Complete Guide"],
    "Data Science": ["Fundamentals", "Professional Certification"],
    "Machine Learning": ["Engineering", "Deep Dive"],
    "Python": ["for Professionals", "Advanced Techniques"],
    "JavaScript": ["Framework Mastery", "Full Stack"],
    "Cloud Computing": ["Solutions", "Architecture"],
    "DevOps": ["CI/CD Mastery", "Infrastructure Automation"],
    "Cybersecurity": ["Ethical Hacking", "Defense Strategies"],
    "Design": ["UI/UX Principles", "Creative Process"],
    "Blockchain": ["Development", "Smart Contracts"],
    "Game Development": ["Unity Masterclass", "Unreal Engine"]
  };
  
  return suffixes[category]?.[index - 1] || `Course ${index}`;
}

// Helper function to get lecture titles based on category
function getLectureTitle(category, index) {
  const introLectures = {
    "Web Development": [
      "Introduction to Web Development",
      "HTML and CSS Fundamentals",
      "JavaScript Essentials",
      "Responsive Design Principles",
      "Building Your First Website"
    ],
    "Mobile Development": [
      "Introduction to Mobile App Development",
      "UI Design for Mobile Apps",
      "Data Management in Mobile Apps",
      "API Integration",
      "Publishing Your App"
    ],
    "Data Science": [
      "Introduction to Data Science",
      "Data Collection and Cleaning",
      "Exploratory Data Analysis",
      "Statistical Analysis Methods",
      "Data Visualization Techniques"
    ],
    "Machine Learning": [
      "Introduction to Machine Learning",
      "Supervised Learning Algorithms",
      "Unsupervised Learning Techniques",
      "Neural Networks Fundamentals",
      "Building Production ML Models"
    ],
    "Python": [
      "Python Basics",
      "Data Structures in Python",
      "Functions and OOP",
      "Working with Libraries",
      "Python for Data Analysis"
    ],
    "JavaScript": [
      "JavaScript Fundamentals",
      "Working with DOM",
      "Asynchronous JavaScript",
      "Modern JS Frameworks",
      "Building Full Stack JS Applications"
    ],
    "Cloud Computing": [
      "Cloud Computing Fundamentals",
      "Cloud Architecture Design",
      "Deployment Strategies",
      "Scaling and Performance",
      "Cloud Security"
    ],
    "DevOps": [
      "DevOps Principles",
      "Continuous Integration",
      "Continuous Deployment",
      "Infrastructure as Code",
      "Monitoring and Logging"
    ],
    "Cybersecurity": [
      "Cybersecurity Fundamentals",
      "Threat Assessment",
      "Security Protocols",
      "Penetration Testing",
      "Incident Response"
    ],
    "Design": [
      "Design Principles",
      "User Research",
      "Wireframing and Prototyping",
      "UI Component Design",
      "User Testing"
    ],
    "Blockchain": [
      "Blockchain Fundamentals",
      "Cryptography Basics",
      "Smart Contract Development",
      "Decentralized Applications",
      "Blockchain Security"
    ],
    "Game Development": [
      "Game Development Fundamentals",
      "Game Physics",
      "Character Animation",
      "Level Design",
      "Multiplayer Integration"
    ]
  };
  
  return introLectures[category]?.[index - 1] || `Lecture ${index}`;
}

// Helper function to get random course level
function getRandomLevel() {
  const levels = ["Beginner", "Medium", "Advance"];
  return levels[Math.floor(Math.random() * levels.length)];
}

// Helper function to get random price
function getRandomPrice() {
  const prices = [499, 599, 699, 799, 899, 999, 1099, 1199, 1299];
  return prices[Math.floor(Math.random() * prices.length)];
}

// Run the seeding function
main(); 
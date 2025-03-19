import mongoose from "mongoose";
import { Course } from "./models/course.model.js";
import { User } from "./models/user.model.js";
import { Lecture } from "./models/lecture.model.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

// Sample course data
const sampleCourses = [
  // Web Development Courses
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
  {
    courseTitle: "Advanced JavaScript Programming",
    subTitle: "Master modern JavaScript features and patterns",
    description: `<p>Take your JavaScript skills to the next level with this advanced course covering the latest features and best practices.</p>
    <p>Topics covered include:</p>
    <ul>
      <li>ES6+ features and syntax</li>
      <li>Asynchronous JavaScript with Promises and async/await</li>
      <li>Functional programming concepts</li>
      <li>Design patterns and architecture</li>
      <li>Performance optimization techniques</li>
      <li>Testing and debugging</li>
    </ul>
    <p>This course is perfect for developers who want to deepen their JavaScript knowledge.</p>`,
    category: "Web Development",
    courseLevel: "Advance",
    coursePrice: 899,
    isPublished: true,
    lectures: [
      {
        lectureTitle: "Modern JavaScript Overview",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: true
      },
      {
        lectureTitle: "Advanced Functions and Closures",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: false
      }
    ]
  },
  
  // Mobile Development Courses
  {
    courseTitle: "React Native for Beginners",
    subTitle: "Build cross-platform mobile apps from scratch",
    description: `<p>Learn to build native mobile applications for both iOS and Android using React Native framework.</p>
    <p>In this course, you'll:</p>
    <ul>
      <li>Set up your React Native development environment</li>
      <li>Understand core React Native components and APIs</li>
      <li>Implement navigation and state management</li>
      <li>Connect to backend services and APIs</li>
      <li>Deploy your app to app stores</li>
    </ul>
    <p>By the end, you'll have built several complete mobile applications ready for distribution!</p>`,
    category: "Mobile Development",
    courseLevel: "Beginner",
    coursePrice: 799,
    isPublished: true,
    lectures: [
      {
        lectureTitle: "Introduction to React Native",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: true
      },
      {
        lectureTitle: "Setting Up Your Development Environment",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: false
      }
    ]
  },
  {
    courseTitle: "Flutter Mobile App Development",
    subTitle: "Create beautiful native apps with Flutter and Dart",
    description: `<p>Master Flutter, Google's UI toolkit for building beautiful, natively compiled applications from a single codebase.</p>
    <p>This course covers:</p>
    <ul>
      <li>Dart programming language fundamentals</li>
      <li>Flutter widgets and UI development</li>
      <li>State management solutions</li>
      <li>Integration with Firebase and other services</li>
      <li>Animations and advanced UI techniques</li>
      <li>Publishing to Apple App Store and Google Play</li>
    </ul>
    <p>You'll learn through hands-on projects including a full-featured social media app!</p>`,
    category: "Mobile Development",
    courseLevel: "Medium",
    coursePrice: 849,
    isPublished: true,
    lectures: [
      {
        lectureTitle: "Flutter and Dart Introduction",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: true
      },
      {
        lectureTitle: "Building Your First Flutter App",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: false
      }
    ]
  },
  
  // Machine Learning Courses
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
  },
  {
    courseTitle: "Deep Learning Specialization",
    subTitle: "Become an expert in neural networks and AI applications",
    description: `<p>Dive deep into the world of artificial intelligence with this comprehensive deep learning specialization.</p>
    <p>Topics covered include:</p>
    <ul>
      <li>Neural networks architecture and optimization</li>
      <li>Convolutional neural networks for computer vision</li>
      <li>Sequence models for natural language processing</li>
      <li>Generative adversarial networks</li>
      <li>Deploying AI models in production environments</li>
    </ul>
    <p>You'll work on cutting-edge projects similar to those at major tech companies and research labs.</p>`,
    category: "Machine Learning",
    courseLevel: "Advance",
    coursePrice: 1299,
    isPublished: true,
    lectures: [
      {
        lectureTitle: "Neural Networks Fundamentals",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: true
      },
      {
        lectureTitle: "Backpropagation and Gradient Descent",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: false
      }
    ]
  },
  
  // Data Science Courses
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
  {
    courseTitle: "Advanced SQL for Data Analysis",
    subTitle: "Master SQL for complex data manipulation and analytics",
    description: `<p>Elevate your SQL skills to perform sophisticated data analysis and build powerful data pipelines.</p>
    <p>This specialized course covers:</p>
    <ul>
      <li>Advanced querying techniques</li>
      <li>Window functions and analytical processing</li>
      <li>Performance optimization for large datasets</li>
      <li>Database design for analytics</li>
      <li>Integration with data visualization tools</li>
    </ul>
    <p>You'll work with real-world datasets to solve complex business problems using SQL.</p>`,
    category: "Data Science",
    courseLevel: "Advance",
    coursePrice: 799,
    isPublished: true,
    lectures: [
      {
        lectureTitle: "SQL Review and Advanced Concepts",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: true
      },
      {
        lectureTitle: "Window Functions and Analytics",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: false
      }
    ]
  },
  
  // Web Design Courses
  {
    courseTitle: "UI/UX Design Fundamentals",
    subTitle: "Create beautiful, user-centered designs",
    description: `<p>Learn the principles of effective user interface and experience design to create compelling digital products.</p>
    <p>This hands-on course covers:</p>
    <ul>
      <li>Design thinking and user-centered design processes</li>
      <li>Visual design principles and typography</li>
      <li>Wireframing and prototyping</li>
      <li>User research and usability testing</li>
      <li>Design systems and component libraries</li>
    </ul>
    <p>Projects include designing responsive websites, mobile apps, and creating a professional portfolio.</p>`,
    category: "Web Design",
    courseLevel: "Beginner",
    coursePrice: 749,
    isPublished: true,
    lectures: [
      {
        lectureTitle: "Introduction to UI/UX Design",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: true
      },
      {
        lectureTitle: "Design Principles and Elements",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: false
      }
    ]
  },
  {
    courseTitle: "Advanced Figma for UI/UX Designers",
    subTitle: "Master Figma for professional design workflows",
    description: `<p>Take your Figma skills to the professional level with advanced techniques used in top design teams.</p>
    <p>This specialized course covers:</p>
    <ul>
      <li>Component systems and variants</li>
      <li>Auto layout and responsive design</li>
      <li>Design system creation and management</li>
      <li>Advanced prototyping and animations</li>
      <li>Collaboration workflows with developers</li>
      <li>Plugins and automation techniques</li>
    </ul>
    <p>By the end, you'll be able to create complex, scalable designs and collaborate effectively in team environments.</p>`,
    category: "Web Design",
    courseLevel: "Advance",
    coursePrice: 849,
    isPublished: true,
    lectures: [
      {
        lectureTitle: "Figma Overview and Setup",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: true
      },
      {
        lectureTitle: "Advanced Component Systems",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: false
      }
    ]
  },

  // Programming Language Courses
  {
    courseTitle: "Python Programming Masterclass",
    subTitle: "From beginner to advanced Python developer",
    description: `<p>Comprehensive Python course covering all aspects of the language for real-world applications.</p>
    <p>Topics include:</p>
    <ul>
      <li>Python syntax and programming fundamentals</li>
      <li>Object-oriented programming</li>
      <li>Data structures and algorithms</li>
      <li>File handling and database integration</li>
      <li>Web development with Django or Flask</li>
      <li>Automation and scripting for productivity</li>
    </ul>
    <p>You'll build multiple projects including web applications, data analysis tools, and automation scripts.</p>`,
    category: "Programming Languages",
    courseLevel: "Beginner",
    coursePrice: 699,
    isPublished: true,
    lectures: [
      {
        lectureTitle: "Introduction to Python Programming",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: true
      },
      {
        lectureTitle: "Variables and Data Types",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: false
      }
    ]
  },
  {
    courseTitle: "Rust Programming for System Development",
    subTitle: "Build high-performance, memory-safe applications",
    description: `<p>Learn Rust, the modern systems programming language focused on safety and performance.</p>
    <p>In this advanced course, you'll learn:</p>
    <ul>
      <li>Rust syntax and unique features</li>
      <li>Ownership, borrowing, and lifetimes</li>
      <li>Concurrency without data races</li>
      <li>Systems programming and low-level operations</li>
      <li>Web assembly and cross-platform development</li>
      <li>High-performance network programming</li>
    </ul>
    <p>Projects include building a command-line tool, a high-performance web server, and embedded systems applications.</p>`,
    category: "Programming Languages",
    courseLevel: "Advance",
    coursePrice: 999,
    isPublished: true,
    lectures: [
      {
        lectureTitle: "Introduction to Rust",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: true
      },
      {
        lectureTitle: "Ownership and Borrowing",
        videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
        isPreviewFree: false
      }
    ]
  }
];

// Function to generate sample courses
const generateSampleCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find instructor user
    const instructor = await User.findOne({ role: 'instructor' });
    
    if (!instructor) {
      console.log('No instructor found. Please create an instructor first.');
      await mongoose.connection.close();
      return;
    }
    
    console.log(`Using instructor: ${instructor.name} (${instructor.email})`);
    
    // Create courses and lectures
    for (const courseData of sampleCourses) {
      // Extract lectures data
      const { lectures, ...courseInfo } = courseData;
      
      // Create a new course
      const course = new Course({
        ...courseInfo,
        creator: instructor._id,
        courseThumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716011406/placeholder-image_b5ebkv.png" // Default placeholder
      });
      
      // Create lectures for this course
      if (lectures && lectures.length > 0) {
        const createdLectures = [];
        
        for (const lectureData of lectures) {
          const lecture = new Lecture({
            ...lectureData,
            course: course._id
          });
          
          await lecture.save();
          createdLectures.push(lecture._id);
        }
        
        // Add lecture IDs to course
        course.lectures = createdLectures;
      }
      
      // Save the course
      await course.save();
      console.log(`Created course: ${course.courseTitle}`);
    }
    
    console.log('Sample courses generation completed!');
    
  } catch (error) {
    console.error('Error generating sample courses:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the function
generateSampleCourses(); 
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models/user.model.js';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { Contact } from './models/contact.model.js';
import connectDB from './database/db.js';

dotenv.config();

// Connect to database
const main = async () => {
  try {
    await connectDB();
    console.log('=== Starting Database Restoration ===');
    
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lecture.deleteMany({});
    await Contact.deleteMany({});
    
    console.log('Cleared existing data');

    // Create instructor (Satyam)
    const hashedInstructorPassword = await bcrypt.hash('satyam@6286', 10);
    const instructor = await User.create({
      name: 'Satyam Govind Yadav',
      email: 'satyamyadav6286@gmail.com',
      password: hashedInstructorPassword,
      role: 'instructor'
    });
    console.log('Created instructor:', instructor.email);

    // Create student users
    const students = [
      {
        name: 'Mohit Pardeshi',
        email: 'mohit.pardeshi@example.com',
        password: 'Password123!'
      },
      {
        name: 'Sohel Solkar',
        email: 'sohel.solkar@example.com',
        password: 'Password123!'
      },
      {
        name: 'Munaf Lanjekar',
        email: 'munaf.lanjekar@example.com',
        password: 'Password123!'
      },
      {
        name: 'Muhammad Mitha',
        email: 'muhammad.mitha@example.com',
        password: 'Password123!'
      },
      {
        name: 'Prashant Yadav',
        email: 'prashant.yadav@example.com',
        password: 'Password123!'
      }
    ];

    const createdStudents = [];
    for (const student of students) {
      const hashedPassword = await bcrypt.hash(student.password, 10);
      const newStudent = await User.create({
        name: student.name,
        email: student.email,
        password: hashedPassword,
        role: 'student'
      });
      createdStudents.push(newStudent);
      console.log(`Created student: ${student.name}`);
    }

    // Create original courses
    const coursesData = [
      {
        courseTitle: "Python for Beginners",
        subTitle: "Learn Python programming from scratch",
        description: "<p>This course will take you from zero to hero in Python programming.</p><p>You'll learn essential programming concepts, data structures, and more.</p>",
        category: "Python",
        courseLevel: "Beginner",
        coursePrice: 599,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "Introduction to Python",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Python Data Types",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "Python for Data Science",
        subTitle: "Harness the power of Python for data analysis",
        description: "<p>Learn how to use Python libraries like Pandas, NumPy, and Matplotlib to analyze data.</p><p>Build data visualization, perform statistical analysis, and create predictive models.</p>",
        category: "Data Science",
        courseLevel: "Medium",
        coursePrice: 799,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "Introduction to Data Science",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Working with Pandas",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "Responsive Web Design Masterclass",
        subTitle: "Create beautiful, responsive websites with HTML, CSS and JavaScript",
        description: "<p>Master the art of responsive web design to create websites that look great on any device.</p><p>Learn HTML5, CSS3, CSS Grid, Flexbox, and JavaScript.</p>",
        category: "Web Development",
        courseLevel: "Beginner",
        coursePrice: 699,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "HTML Basics",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "CSS Fundamentals",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "Full Stack React & Node.js",
        subTitle: "Build complete web applications with React and Node.js",
        description: "<p>Learn to build modern web applications using React.js for frontend and Node.js for backend.</p><p>Create RESTful APIs, implement authentication, and deploy your applications.</p>",
        category: "Web Development",
        courseLevel: "Medium",
        coursePrice: 1099,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "Getting Started with React",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Node.js Fundamentals",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "iOS App Development with Swift",
        subTitle: "Learn to build iOS apps from scratch",
        description: "<p>Master Swift programming and iOS app development to create your own iPhone and iPad apps.</p><p>Build real-world apps and publish them on the App Store.</p>",
        category: "Mobile Development",
        courseLevel: "Medium",
        coursePrice: 999,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "Swift Programming Basics",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Building User Interfaces",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "Android App Development with Kotlin",
        subTitle: "Build modern Android applications with Kotlin",
        description: "<p>Learn to develop Android apps using Kotlin, the modern programming language for Android development.</p><p>Create responsive and user-friendly mobile applications.</p>",
        category: "Mobile Development",
        courseLevel: "Medium",
        coursePrice: 899,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "Introduction to Kotlin",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Building Android UIs",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "SQL for Data Analysis",
        subTitle: "Master database queries for data analysis",
        description: "<p>Learn SQL for data analysis and business intelligence.</p><p>Extract, transform, and analyze data from relational databases.</p>",
        category: "Data Science",
        courseLevel: "Beginner",
        coursePrice: 599,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "SQL Fundamentals",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Advanced SQL Queries",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "Business Intelligence with Power BI",
        subTitle: "Transform data into actionable insights",
        description: "<p>Learn to use Microsoft Power BI to create interactive visualizations and business intelligence dashboards.</p><p>Connect to different data sources and create reports for decision making.</p>",
        category: "Data Science",
        courseLevel: "Medium",
        coursePrice: 799,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "Introduction to Power BI",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Creating Interactive Dashboards",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "Natural Language Processing",
        subTitle: "Master text analysis and language AI",
        description: "<p>Learn to process and analyze natural language data using Python and machine learning.</p><p>Build sentiment analysis, text classification, and language generation models.</p>",
        category: "Machine Learning",
        courseLevel: "Advance",
        coursePrice: 1299,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "Introduction to NLP",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Text Classification with Machine Learning",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "Computer Vision with PyTorch",
        subTitle: "Build AI systems that can see and understand images",
        description: "<p>Learn to develop computer vision applications using PyTorch.</p><p>Implement image classification, object detection, and image generation models.</p>",
        category: "Machine Learning",
        courseLevel: "Advance",
        coursePrice: 1199,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "Introduction to Computer Vision",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Convolutional Neural Networks",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "AWS Certified Solutions Architect",
        subTitle: "Prepare for the AWS Solutions Architect certification",
        description: "<p>Learn to design available, cost-efficient, fault-tolerant, and scalable systems on AWS.</p><p>Prepare for the AWS Certified Solutions Architect - Associate exam.</p>",
        category: "Cloud Computing",
        courseLevel: "Medium",
        coursePrice: 999,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "AWS Core Services",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Designing Resilient Architectures",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "Docker and Kubernetes for DevOps",
        subTitle: "Master containerization and orchestration",
        description: "<p>Learn to use Docker and Kubernetes to build, deploy, and scale containerized applications.</p><p>Implement CI/CD pipelines and cloud-native architectures.</p>",
        category: "DevOps",
        courseLevel: "Medium",
        coursePrice: 899,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "Docker Fundamentals",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Kubernetes Orchestration",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "UI/UX Design Fundamentals",
        subTitle: "Learn user-centered design principles",
        description: "<p>Master the fundamentals of UI/UX design to create user-friendly digital products.</p><p>Learn design thinking, wireframing, prototyping, and user testing.</p>",
        category: "Design",
        courseLevel: "Beginner",
        coursePrice: 799,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "Introduction to UI/UX Design",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Wireframing and Prototyping",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      },
      {
        courseTitle: "Figma Masterclass",
        subTitle: "Design professional interfaces with Figma",
        description: "<p>Learn to use Figma to design beautiful user interfaces and create interactive prototypes.</p><p>Master components, auto-layout, design systems, and collaboration features.</p>",
        category: "Design",
        courseLevel: "Medium",
        coursePrice: 699,
        thumbnail: "https://res.cloudinary.com/dvdukwlqz/image/upload/v1716142402/samples/course-thumbnail_yb6h5d.jpg",
        isPublished: true,
        lectures: [
          {
            lectureTitle: "Figma Basics",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: true
          },
          {
            lectureTitle: "Components and Design Systems",
            videoUrl: "https://res.cloudinary.com/dvdukwlqz/video/upload/v1716011390/video-sample_ixapuv.mp4",
            isPreviewFree: false
          }
        ]
      }
    ];

    for (const courseData of coursesData) {
      // Create course
      const course = await Course.create({
        courseTitle: courseData.courseTitle,
        subTitle: courseData.subTitle,
        description: courseData.description,
        category: courseData.category,
        courseLevel: courseData.courseLevel,
        coursePrice: courseData.coursePrice,
        isPublished: courseData.isPublished,
        creator: instructor._id,
        courseThumbnail: courseData.thumbnail
      });

      // Create lectures for the course
      for (const lectureData of courseData.lectures) {
        const lecture = await Lecture.create({
          lectureTitle: lectureData.lectureTitle,
          videoUrl: lectureData.videoUrl,
          isPreviewFree: lectureData.isPreviewFree
        });
        
        // Add lecture to course
        course.lectures.push(lecture._id);
      }
      
      // Save course with lectures
      await course.save();
      console.log(`Created course: ${courseData.courseTitle}`);
    }

    // Create contact messages
    const contactMessages = [
      {
        name: "John Smith",
        email: "john.smith@example.com",
        subject: "Inquiry about Python courses",
        message: "Hello, I'm interested in your Python courses. Do you offer any discounts for students?"
      },
      {
        name: "Emily Johnson",
        email: "emily.johnson@example.com",
        subject: "Problem with course access",
        message: "I purchased the Web Development course yesterday but I can't access the lectures. Can you help me?"
      },
      {
        name: "Michael Brown",
        email: "michael.brown@example.com",
        subject: "Course suggestion",
        message: "I would love to see a course on cybersecurity. Do you have plans to add one in the future?"
      },
      {
        name: "Sarah Davis",
        email: "sarah.davis@example.com",
        subject: "Certificate issue",
        message: "I completed the Data Science course but my certificate doesn't show the correct date. Could you fix this please?"
      },
      {
        name: "David Wilson",
        email: "david.wilson@example.com",
        subject: "Corporate training inquiry",
        message: "I'm looking for training solutions for my team of 15 developers. Do you offer corporate packages?"
      },
      {
        name: "Jennifer Martinez",
        email: "jennifer.martinez@example.com",
        subject: "Video quality issues",
        message: "The videos in the React course seem to be low resolution. Is there a way to access higher quality versions?"
      },
      {
        name: "Robert Taylor",
        email: "robert.taylor@example.com",
        subject: "Payment method question",
        message: "Do you accept PayPal for course purchases? I couldn't find this option at checkout."
      },
      {
        name: "Lisa Anderson",
        email: "lisa.anderson@example.com",
        subject: "Course duration question",
        message: "How long do I have access to the course materials after purchase? Is it lifetime access?"
      },
      {
        name: "Thomas Garcia",
        email: "thomas.garcia@example.com",
        subject: "Technical problem",
        message: "I'm having trouble with the coding exercises in lecture 5 of the JavaScript course. The code editor isn't working properly."
      },
      {
        name: "Amanda Lee",
        email: "amanda.lee@example.com",
        subject: "Feedback on UI/UX course",
        message: "I just completed the UI/UX Design course and wanted to say it was excellent! The practical projects were particularly helpful."
      }
    ];

    for (const contactData of contactMessages) {
      await Contact.create(contactData);
      console.log(`Created contact message from: ${contactData.name}`);
    }

    console.log('=== Database Restoration Completed Successfully ===');

    // Close database connection
    mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Database restoration failed:', error);
    process.exit(1);
  }
};

// Run the seeding function
main(); 
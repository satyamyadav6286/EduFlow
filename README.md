# EduFlow - Modern Learning Management System

<div align="center">
  <img src="https://img.shields.io/badge/version-1.2.0-blue?style=for-the-badge" alt="Version 1.2.0">
  <img src="https://img.shields.io/badge/license-MIT-success?style=for-the-badge" alt="License MIT">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge" alt="PRs Welcome">
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</div>

<div align="center">
  <p><strong>Transform education with our powerful, intuitive learning platform.</strong></p>
  <p>Built with modern web technologies to deliver seamless learning experiences.</p>
</div>

---

## 🚀 About EduFlow

EduFlow is a comprehensive Learning Management System designed for creating, managing, and delivering online courses. With dedicated interfaces for both instructors and students, it provides robust functionality for course management, content delivery, payment processing, interactive quizzes, certificate generation, and learning analytics.

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Usage Guide](#-usage-guide)
- [API Reference](#-api-reference)
- [Security Features](#-security-features)
- [Recent Updates](#-recent-updates)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## ✨ Key Features

### For Instructors

- **Intuitive Dashboard** - Real-time analytics for course performance and revenue
- **Course Builder** - Drag-and-drop interface for content organization
- **Quiz Creator** - Build assessments with various question types
- **Student Management** - Track progress, engagement, and completion rates
- **Revenue Analytics** - Comprehensive sales and conversion metrics

### For Students

- **Engaging Interface** - Distraction-free learning environment
- **Interactive Quizzes** - Test knowledge with dynamic assessments
- **Progress Tracking** - Visual completion indicators and achievements
- **Verified Certificates** - Downloadable, verifiable course certificates
- **Quiz Scorecards** - Detailed performance metrics and downloadable results
- **Multi-device Access** - Seamless experience across all devices

### Platform Highlights

- **Certificate Verification System** - Public verification portal for certificates and quiz scorecards
- **Secure Downloads** - Token-independent document retrieval
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Payment Integration** - Secure checkout with Razorpay
- **Cloud Media Delivery** - Fast content streaming with Cloudinary CDN

## 🛠️ Technology Stack

### Frontend
- **React 18** - Component-based UI development
- **Redux Toolkit** - State management with RTK Query
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Vite** - Next-generation build tooling

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication and authorization
- **PDFKit** - Certificate and scorecard generation

### Infrastructure
- **Cloudinary** - Media management
- **Razorpay** - Payment processing
- **MongoDB Atlas** - Database hosting

## 🏗️ Project Structure

```
.
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature modules and API slices
│   │   ├── pages/          # Application pages
│   │   └── app/            # Store configuration
│   └── ...
└── server/                 # Backend application
    ├── controllers/        # Request handlers
    ├── models/             # Database schemas
    ├── routes/             # API endpoints
    ├── middlewares/        # Express middlewares
    ├── utils/              # Helper functions
    └── ...
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/satyamyadav6286/EduFlow.git
   cd EduFlow
   ```

2. **Server Setup**
   ```bash
   cd server
   npm install
   
   # Create .env file (see .env.example for required variables)
   # Start development server
   npm run dev
   ```

3. **Client Setup**
   ```bash
   cd client
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/v1

> 📝 **Note:** PowerShell users should run commands separately since PowerShell doesn't support the '&&' operator for command chaining.

## 💻 Usage Guide

### For Instructors

1. **Create Courses**
   - Design curriculum with sections and lectures
   - Upload videos and learning materials
   - Create interactive quizzes and assessments
   - Set pricing and publish to the marketplace

2. **Monitor Performance**
   - Track enrollment metrics
   - Review student progress and quiz scores
   - Analyze revenue and conversion rates

### For Students

1. **Learn Effectively**
   - Browse and enroll in courses
   - Access structured learning content
   - Take quizzes to test knowledge
   - Download certificates and scorecards upon completion

2. **Track Your Progress**
   - Monitor completion percentage
   - Review quiz performance
   - Earn and share verified achievements

## 📚 API Reference

Our RESTful API is organized by resource:

| Endpoint | Description |
|----------|-------------|
| `/api/v1/auth` | Authentication and user management |
| `/api/v1/course` | Course creation and management |
| `/api/v1/lecture` | Lecture content and organization |
| `/api/v1/quiz` | Quiz creation and submission |
| `/api/v1/purchase` | Enrollment and payment processing |
| `/api/v1/certificate` | Certificate generation and verification |
| `/api/v1/progress` | Learning progress tracking |

## 🔒 Security Features

- **JWT Authentication** - Secure, token-based authentication
- **Password Encryption** - Bcrypt hashing for sensitive data
- **CORS Protection** - Configured security headers
- **Input Validation** - Request validation and sanitization
- **Rate Limiting** - Protection against brute force attacks
- **Public Document Verification** - Secure certificate validation system

## 🆕 Recent Updates

### Version 1.2.0

#### UI Improvements
- **Enhanced Course Detail Page** - Improved layout with course thumbnail in the purchase card
- **Streamlined Course Progress Page** - Better visual presentation of lecture content
- **Cleaner Descriptions** - HTML tag stripping for better readability
- **Improved Video Player** - Non-autoplay videos that respect user interaction

#### Bug Fixes
- **Fixed Mark as Complete Bug** - Resolved issue where marking lectures as complete would redirect to first lecture
- **Lecture Selection Persistence** - Selected lectures now remain active after course progress updates
- **Certificate Display Issues** - Fixed rendering problems with certificates and scorecard downloads
- **Media Loading Optimization** - Improved video loading with metadata preloading
- **Course Content Navigation** - Enhanced sidebar selection states and completion indicators

#### Under the Hood
- **Redux State Management** - Added courseSlice for better client-side data handling
- **Race Condition Prevention** - Added safeguards against state conflicts during API calls
- **Error Handling** - Improved error feedback and recovery mechanisms
- **Admin Seed Script** - Added utility to create instructor accounts

## 🔮 Future Roadmap

- **Live Sessions** - Real-time virtual classrooms
- **Community Forums** - Discussion boards for each course
- **AI Learning Assistant** - Personalized learning recommendations
- **Mobile Applications** - Native iOS and Android apps
- **Advanced Analytics** - Detailed learning behavior insights
- **Multi-language Support** - Internationalization capabilities

## 👥 Contributing

We welcome contributions to EduFlow! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and commit (`git commit -m 'Add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss proposed changes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Developed by [Satyam Govind Yadav](https://github.com/satyamyadav6286)
- Special thanks to all contributors
- Built with open-source technologies

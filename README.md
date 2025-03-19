# EduFlow - Learning Management System

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/license-MIT-success?style=for-the-badge" alt="License MIT">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge" alt="PRs Welcome">
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
</div>

EduFlow is a comprehensive Learning Management System designed for creating, managing, and delivering online courses. With dedicated interfaces for both instructors and students, it provides robust functionality for course management, content delivery, payment processing, and learning analytics.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation Guide](#-installation-guide)
- [Usage Instructions](#-usage-instructions)
- [API Reference](#-api-reference)
- [Security Measures](#-security-measures)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## ✨ Features

### For Instructors
- **Comprehensive Dashboard** - Monitor sales, revenue, and student engagement metrics
- **Course Studio** - Create and manage courses with drag-and-drop content organization
- **Rich Media Support** - Upload videos, documents, and presentations with cloud storage
- **Student Management** - View enrolled students and their progress statistics
- **Sales Analytics** - Track revenue per course, conversion rates, and growth trends

### For Students
- **Course Marketplace** - Browse, search, and filter courses by category, price, and level
- **Learning Interface** - Intuitive video player with note-taking and bookmarking capabilities
- **Progress Tracking** - Visual indicators of course completion and achievement milestones
- **Certificate Generation** - Automatic certificate issuance upon course completion
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile devices

### Platform Features
- **Secure Payments** - PCI-compliant payment processing with Razorpay integration
- **Cloud Storage** - Efficient media delivery with Cloudinary CDN integration
- **Authentication** - JWT-based secure user authentication and authorization
- **Search & Filters** - Advanced search with multiple filtering options for course discovery
- **Responsive UI** - Fully responsive design built with TailwindCSS

## 🛠️ Technology Stack

### Frontend
- **React** - Component-based UI library
- **Redux Toolkit** - State management with RTK Query for data fetching
- **TailwindCSS** - Utility-first CSS framework
- **Vite** - Next-generation frontend tooling
- **React Router** - Declarative routing for React

### Backend
- **Node.js** - JavaScript runtime environment
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - Elegant MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication

### Third-party Services
- **Cloudinary** - Cloud-based image and video management
- **Razorpay** - Payment gateway integration
- **MongoDB Atlas** - Cloud database service

## 🏗️ Project Structure

```
.
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature-based modules and API slices
│   │   ├── pages/          # Page components
│   │   ├── styles/         # Global styles
│   │   └── app/            # Redux store configuration
│   └── ...
└── server/                 # Backend Node.js application
    ├── controllers/        # Request handlers
    ├── models/             # Database models
    ├── routes/             # API routes
    ├── middlewares/        # Express middlewares
    ├── utils/              # Utility functions
    ├── uploads/            # File upload directory
    └── certificates/       # Generated certificates
```

## 🚀 Installation Guide

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account (for payment processing)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/satyamyadav6286/EduFlow.git
   cd EduFlow
   ```

2. **Setup environment variables**

   For the server:
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

   For the client:
   ```bash
   cd client
   cp .env.example .env
   # Edit .env as needed (default works for local development)
   ```

3. **Install dependencies**

   For the server:
   ```bash
   cd server
   npm install
   ```

   For the client:
   ```bash
   cd client
   npm install
   ```

4. **Start the development servers**

   Start the server:
   ```bash
   cd server
   npm run dev
   ```

   Start the client (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```

5. **Access the application**
   
   The client will be available at http://localhost:5173  
   The server API will be available at http://localhost:3000/api/v1

## 💻 Usage Instructions

### Instructor Account

1. Register as an instructor
2. Create your first course by clicking the "Create Course" button
3. Add course details, thumbnail, and pricing information
4. Create sections and lectures with video content
5. Publish your course when ready
6. Monitor sales and student engagement from your dashboard

### Student Account

1. Register as a student
2. Browse courses in the marketplace
3. Enroll in courses (free or paid)
4. Access course content through the learning interface
5. Track your progress and complete courses
6. Download certificates upon course completion

## 📚 API Reference

The backend API follows RESTful principles and is organized by resource:

| Endpoint | Description |
|----------|-------------|
| `/api/v1/user` | User authentication and profile management |
| `/api/v1/course` | Course creation and management |
| `/api/v1/purchase` | Course enrollment and payment processing |
| `/api/v1/media` | Media upload and management |
| `/api/v1/progress` | Course progress tracking |
| `/api/v1/contact` | Contact form submissions |
| `/api/v1/certificates` | Certificate generation and verification |

## 🔒 Security Measures

- Environment variables for sensitive information
- JWT authentication with secure HTTP-only cookies
- Password hashing with bcrypt
- CORS protection and request rate limiting
- Input validation and sanitization
- Secure file uploads with validation

> **Important Note**: Never commit your `.env` files to version control. The repository includes `.env.example` files as templates, but you must create your own `.env` files with actual credentials.

## 🔮 Future Roadmap

- Live webinar functionality
- Discussion forums and community features
- Mobile application development
- Advanced analytics dashboard
- AI-powered content recommendations
- Internationalization and localization

## 👥 Contributing

We welcome contributions to EduFlow! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Developed by [Satyam Govind Yadav](https://github.com/satyamyadav6286)
- Special thanks to all contributors and testers
- Built with open-source technologies and communities 

# EduFlow Server

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-6.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT">
</div>

<div align="center">
  <p><strong>Robust backend for the EduFlow learning platform</strong></p>
</div>

---

## ✨ Overview

The EduFlow Server is a powerful, scalable backend built with Node.js and Express, powering the EduFlow learning management system. It provides secure RESTful APIs for course management, user authentication, payment processing, and learning analytics.

## 🚀 Key Features

### Core Functionality
- **RESTful API Architecture** - Well-structured, consistent endpoint design
- **Advanced Authentication** - Secure JWT-based auth with token refresh
- **Role-Based Access Control** - Distinct instructor and student permissions
- **Comprehensive Error Handling** - Detailed error responses and logging

### Course Management
- **Content Organization** - Structured course, section, and lecture management
- **Media Handling** - Secure video and document storage with Cloudinary
- **Interactive Quizzes** - Assessment creation and submission processing
- **Progress Tracking** - Student advancement monitoring

### Certificate System
- **Dynamic Certificate Generation** - PDF certificates with unique IDs
- **Public Verification API** - Certificate validation without authentication
- **Quiz Scorecards** - Detailed performance PDFs with verification
- **Secure Downloads** - Token-independent document retrieval

### Payment Integration
- **Razorpay Integration** - Secure payment processing
- **Transaction Management** - Purchase history and verification
- **Revenue Analytics** - Instructor earnings and platform metrics

## 🛠️ Technology Stack

- **Node.js** - JavaScript runtime environment
- **Express** - Web application framework
- **MongoDB** - NoSQL document database
- **Mongoose** - Elegant MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **PDFKit** - Dynamic PDF generation
- **Cloudinary** - Cloud-based media management
- **Razorpay** - Payment gateway integration
- **Multer** - File upload middleware
- **Nodemailer** - Email functionality

## 🚀 Getting Started

### Prerequisites

- Node.js 14+
- MongoDB (local or Atlas)
- Cloudinary account (for media storage)
- Razorpay account (for payments)

### Installation

```bash
# Clone the repository (if not already done)
git clone https://github.com/satyamyadav6286/eduflow.git
cd eduflow/server

# Install dependencies
npm install

# Create .env file (see below for required variables)
```

### Environment Setup

Create a `.env` file in the server directory with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE=60d

# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Razorpay Configuration (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Application URLs
CLIENT_URL=http://localhost:5173
SERVER_BASE_URL=http://localhost:3000
```

### Development Server

```bash
npm run dev
```

This will start the development server with nodemon at `http://localhost:3000`

### Production Build

```bash
npm start
```

## 📁 Project Structure

```
server/
├── controllers/           # Request handlers by resource
│   ├── auth.controller.js     # Authentication logic
│   ├── course.controller.js   # Course management
│   ├── lecture.controller.js  # Lecture content
│   ├── quiz.controller.js     # Quiz functionality
│   ├── certificate.controller.js # Certificate generation
│   └── ...
├── models/                # Mongoose data models
│   ├── User.js                # User schema
│   ├── Course.js              # Course schema
│   ├── QuizSubmission.js      # Quiz attempts
│   └── ...
├── routes/                # API route definitions
│   ├── auth.route.js          # Auth endpoints
│   ├── course.route.js        # Course endpoints
│   └── ...
├── middlewares/           # Express middlewares
│   ├── auth.js                # Authentication middleware
│   ├── error.js               # Error handling
│   └── ...
├── utils/                 # Utility functions
│   ├── errorResponse.js       # Error formatting
│   ├── certificateGenerator.js # PDF generation
│   └── ...
├── database/              # Database connection
├── uploads/               # Temporary file storage
├── certificates/          # Generated certificates
├── quiz-results/          # Quiz scorecard PDFs
├── config/                # Configuration files
└── index.js               # Server entry point
```

## 📝 API Documentation

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | User login | No |
| GET | `/api/v1/auth/logout` | User logout | Yes |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| POST | `/api/v1/auth/refresh-token` | Refresh JWT token | No |

### Courses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/v1/course` | Get all courses | No |
| POST | `/api/v1/course` | Create a course | Yes (Instructor) |
| GET | `/api/v1/course/:id` | Get course by ID | No |
| PUT | `/api/v1/course/:id` | Update course | Yes (Owner) |
| DELETE | `/api/v1/course/:id` | Delete course | Yes (Owner) |

### Lectures

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/v1/course/:courseId/lecture` | Get all lectures | Yes (Enrolled) |
| POST | `/api/v1/course/:courseId/lecture` | Create lecture | Yes (Owner) |
| PUT | `/api/v1/lecture/:id` | Update lecture | Yes (Owner) |
| DELETE | `/api/v1/lecture/:id` | Delete lecture | Yes (Owner) |

### Quizzes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/v1/quiz` | Create quiz | Yes (Instructor) |
| GET | `/api/v1/quiz/course/:courseId` | Get course quizzes | Yes (Enrolled) |
| POST | `/api/v1/quiz/submit` | Submit quiz attempt | Yes |
| GET | `/api/v1/quiz/results/:courseId` | Get quiz results | Yes |

### Certificates

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/v1/certificate/generate` | Generate certificate | Yes |
| GET | `/api/v1/certificate/:certificateId/download` | Download certificate | No |
| GET | `/api/v1/certificate/verify/:certificateId` | Verify certificate | No |

### Quiz Scorecards

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/v1/quiz/scorecard/:resultId/download` | Download scorecard | No |
| GET | `/api/v1/quiz/scorecard/:resultId/verify` | Verify scorecard | No |

## ✅ Recent Improvements

- **Public Certificate Verification** - Authentication-free verification endpoints
- **Quiz Scorecard Generation** - PDF generation with verification IDs
- **Token Management** - Improved authentication with refresh tokens
- **Download Security** - Enhanced document retrieval system
- **Error Handling** - Comprehensive error management and logging
- **Documentation** - Expanded API documentation

## 🔒 Security Features

- **JWT Authentication** - Secure, stateless authentication
- **Password Hashing** - bcrypt password encryption
- **CORS Protection** - Configured security headers
- **Rate Limiting** - Prevention of brute force attacks
- **Input Validation** - Request validation and sanitization
- **Error Sanitization** - Production-safe error messages

## 📚 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Populate database with sample data
- `npm run lint` - Run ESLint for code quality

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details. 
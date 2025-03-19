# EduFlow Server

The backend API server for EduFlow - an online learning platform built with Node.js, Express, and MongoDB.

## Features

- **RESTful API** - Well-structured endpoints following REST principles
- **Authentication** - JWT-based authentication and authorization
- **Database Integration** - MongoDB with Mongoose ODM
- **File Management** - Cloudinary integration for media storage
- **Payment Processing** - Razorpay payment gateway integration
- **PDF Generation** - Course certificate generation
- **Error Handling** - Consistent error handling and logging
- **Security** - Implementation of security best practices

## Getting Started

### Prerequisites

- Node.js 14+
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account

### Installation

1. Clone the repository (if not already done)
```bash
git clone https://github.com/satyamyadav6286/eduflow.git
cd eduflow/server
```

2. Install dependencies
```bash
npm install
```

3. Environment Setup
Create a `.env` file with the following variables:
```
PORT=3000
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key
JWT_SECRET=your_jwt_secret

# Cloudinary credentials
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Razorpay credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

4. Start the development server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration
- `GET /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Courses
- `GET /api/v1/course` - Get all courses
- `POST /api/v1/course` - Create a new course
- `GET /api/v1/course/:courseId` - Get course by ID
- `PUT /api/v1/course/:courseId` - Update course
- `DELETE /api/v1/course/:courseId` - Delete course
- `PATCH /api/v1/course/:courseId` - Publish/unpublish course

### Lectures
- `GET /api/v1/course/:courseId/lecture` - Get all lectures for a course
- `POST /api/v1/course/:courseId/lecture` - Add a lecture to a course
- `PUT /api/v1/course/:courseId/lecture/:lectureId` - Update a lecture
- `DELETE /api/v1/lecture/:lectureId` - Delete a lecture

### Course Purchases
- `POST /api/v1/purchase/checkout-session` - Create a checkout session
- `POST /api/v1/purchase/verify` - Verify payment
- `GET /api/v1/purchase/courses` - Get all purchased courses

### Certificates
- `POST /api/v1/certificate/generate` - Generate a certificate
- `GET /api/v1/certificate/verify/:certificateId` - Verify a certificate

## File Structure

```
server/
├── controllers/           # API route controllers
├── models/                # Mongoose data models
├── routes/                # API route definitions
├── middlewares/           # Express middlewares
├── utils/                 # Utility functions
├── database/              # Database connection
├── uploads/               # Temporary file storage
├── certificates/          # Generated certificates
└── index.js               # Server entry point
```

## Error Handling

The API uses consistent error handling with appropriate HTTP status codes:

- `400` - Bad Request
- `401` - Unauthorized 
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Measures

- JWT for authentication
- Password hashing with bcrypt
- CORS protection
- Environment variables for sensitive data
- Input validation
- Rate limiting 
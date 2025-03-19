# EduFlow - Online Learning Platform

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933.svg?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-6.0-47A248.svg?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Vite-4.x-646CFF.svg?logo=vite&logoColor=white" alt="Vite">
</div>

<div align="center">
  <img src="https://raw.githubusercontent.com/satyamyadav6286/EduFlow/main/client/public/new-logo.svg" alt="EduFlow Platform" width="300">
</div>

## 📋 Overview

EduFlow is a comprehensive online learning platform that enables instructors to create and publish engaging courses while providing students with a seamless learning experience. The platform features secure payment processing, interactive video content, progress tracking, and certificate generation.

## ✨ Features

- **🔐 User Authentication** - Secure signup and login for both students and instructors
- **📚 Course Management** - Create, edit, and publish courses with rich content
- **💳 Payment Integration** - Seamless Razorpay payment gateway for course purchases
- **🎬 Content Delivery** - Stream video lectures and access course materials
- **📊 Progress Tracking** - Monitor student progress through interactive dashboards
- **🏆 Certificate Generation** - Automated certificate issuance upon course completion
- **📱 Responsive Design** - Optimized for all devices from mobile to desktop
- **🔍 Search & Filter** - Advanced search functionality with multiple filtering options
- **⭐ Rating System** - Course rating and review system for quality feedback
- **📢 Announcements** - Course-specific announcements and updates

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library for building interactive interfaces
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **TailwindCSS** - Utility-first CSS framework
- **Vite** - Next-generation frontend tooling

### Backend
- **Node.js** - JavaScript runtime environment
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication mechanism
- **Mongoose** - MongoDB object modeling

### Third-party Services
- **Cloudinary** - Media storage and delivery
- **Razorpay** - Payment processing
- **PDF Kit** - Certificate generation

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- Cloudinary account
- Razorpay account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/satyamyadav6286/eduflow.git
   cd eduflow
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Variables**
   
   Create `.env` files in both the client and server directories based on the provided `.env.example` files.

   **Server variables:**
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

   **Client variables:**
   ```
   VITE_API_URL=http://localhost:3000/api/v1
   ```

4. **Start the application**

   **Development mode:**
   ```bash
   # Start server
   cd server
   npm run dev

   # In a separate terminal, start client
   cd client
   npm run dev
   ```

   For more detailed instructions, see [HOW_TO_START_APPLICATION.md](HOW_TO_START_APPLICATION.md)

## 📊 Application Architecture

```
.
├── client                  # Frontend React application
│   ├── public              # Public assets
│   │   ├── components      # Reusable components
│   │   ├── features        # Feature-based modules
│   │   ├── pages           # Application pages
│   │   ├── app             # Redux store and reducers
│   │   └── ...
│   └── ...
└── server                  # Backend Node.js application
    ├── controllers         # Route controllers
    ├── models              # Database models
    ├── routes              # API routes
    ├── middlewares         # Express middlewares
    ├── utils               # Utility functions
    └── ...
```

## 🔒 Security

- All API keys and secrets are stored in environment variables
- Authentication using JWT tokens
- Password hashing using bcrypt
- CORS protection
- Input validation and sanitization
- Request rate limiting

## 🌐 API Documentation

The backend API follows RESTful principles and is organized by resource:

- **Auth**: `/api/v1/auth` - User authentication and registration
- **Courses**: `/api/v1/course` - Course CRUD operations
- **Lectures**: `/api/v1/course/:courseId/lecture` - Lecture management
- **Purchases**: `/api/v1/purchase` - Course purchase and payment processing
- **Certificates**: `/api/v1/certificate` - Certificate generation and verification

## 💡 Future Enhancements

- Live webinar functionality
- Discussion forums
- Student community features
- Mobile application
- Advanced analytics dashboard
- AI-powered content recommendations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React.js](https://reactjs.org/) - UI library
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Cloudinary](https://cloudinary.com/) - Media management
- [Razorpay](https://razorpay.com/) - Payment gateway
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework 
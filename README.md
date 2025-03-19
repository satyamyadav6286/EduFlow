# EduFlow - Learning Management System

EduFlow is a comprehensive Learning Management System designed for creating, managing, and delivering online courses. It features both instructor and student interfaces with robust functionality for course management and consumption.

## Features

- **Instructor Dashboard** - Create and manage courses, track sales and revenue
- **Student Portal** - Enroll in courses, track progress, and earn certificates
- **Course Creation** - Easily upload videos, create lectures, and organize content
- **Payment Processing** - Secure integration with Razorpay
- **Media Storage** - Cloud storage for course videos and thumbnails
- **Responsive Design** - Works on desktop, tablet, and mobile

## Technology Stack

- **Frontend**: React, Tailwind CSS, Redux Toolkit
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Media Storage**: Cloudinary
- **Payment Processing**: Razorpay

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account (for payment processing)

### Setup Instructions

1. **Clone the repository**
   ```
   git clone https://github.com/your-username/eduflow.git
   cd eduflow
   ```

2. **Setup environment variables**

   For the server:
   - Copy `.env.example` to `.env` in the server directory
   - Fill in your MongoDB URI, JWT secret, Cloudinary and Razorpay credentials

   For the client:
   - Copy `.env.example` to `.env` in the client directory
   - Set the API URL (use the default for local development)

3. **Install dependencies**

   For the server:
   ```
   cd server
   npm install
   ```

   For the client:
   ```
   cd client
   npm install
   ```

4. **Start the development servers**

   Start the server:
   ```
   cd server
   npm run dev
   ```

   Start the client (in a new terminal):
   ```
   cd client
   npm run dev
   ```

5. **Access the application**
   
   The client will be available at http://localhost:5173
   The server API will be available at http://localhost:3000/api/v1

## Security Notes

- Never commit your `.env` files to version control
- Keep your Razorpay API keys secure
- The repository includes `.env.example` files as templates, but you need to create your own `.env` files with actual credentials

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built by Satyam Govind Yadav
- Special thanks to all contributors 
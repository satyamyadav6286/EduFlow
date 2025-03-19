# EduFlow - Online Learning Platform

EduFlow is a comprehensive online learning platform that allows instructors to create and publish courses, and students to purchase and consume educational content.

## Features

- **User Authentication**: Secure signup and login for students and instructors
- **Course Management**: Create, edit, and publish courses with rich content
- **Payment Integration**: Razorpay payment gateway for course purchases
- **Content Delivery**: Video lectures and course materials
- **Progress Tracking**: Track student progress through courses
- **Certificate Generation**: Generate certificates upon course completion

## Tech Stack

- **Frontend**: React.js with Vite
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Payment Processing**: Razorpay

## Installation

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- Cloudinary account
- Razorpay account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/eduflow.git
cd eduflow
```

2. Install dependencies for both server and client:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Environment Variables:

   Create `.env` files in both the client and server directories based on the provided `.env.example` files:

   **Server**:
   - `PORT`: Port for the server (default: 3000)
   - `MONGO_URI`: MongoDB connection string
   - `SECRET_KEY`: Secret key for JWT
   - `JWT_SECRET`: Secret for JWT token generation
   - `CLOUD_NAME`: Cloudinary cloud name
   - `API_KEY`: Cloudinary API key
   - `API_SECRET`: Cloudinary API secret
   - `RAZORPAY_KEY_ID`: Razorpay key ID
   - `RAZORPAY_KEY_SECRET`: Razorpay key secret

   **Client**:
   - Any client-specific environment variables

4. Start the application:

   **Development mode**:
   ```bash
   # Start server
   cd server
   npm run dev

   # In a separate terminal, start client
   cd client
   npm run dev
   ```

## Deployment

For production deployment, follow these steps:

1. Build the client:
```bash
cd client
npm run build
```

2. Configure the server to serve the static files.

3. Use environment variables for sensitive information.

## Security Notes

- All API keys and secrets are stored in environment variables
- Never commit `.env` files to version control
- Use `.env.example` to document required environment variables without values

## License

[Your License Here]

## Acknowledgements

[Your Acknowledgements Here] 
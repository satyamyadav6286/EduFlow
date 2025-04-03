# EduFlow Deployment Guide

This guide will help you deploy the EduFlow application for free using Render.com for the backend and Vercel for the frontend.

## Prerequisites

1. GitHub account with your EduFlow repository
2. Accounts on [Render.com](https://render.com) and [Vercel.com](https://vercel.com)
3. MongoDB Atlas account for the database
4. Cloudinary account for media storage
5. Razorpay account for payments

## Backend Deployment on Render

1. **Create a Web Service on Render**
   - Sign up or log in to [Render.com](https://render.com)
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - Name: `eduflow-api` (or your preferred name)
     - Root Directory: `server`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Plan: Free

2. **Set Environment Variables**
   - In the Render dashboard, go to your web service
   - Click on "Environment" tab
   - Add all environment variables from your server's `.env` file:
     ```
     NODE_ENV=production
     PORT=10000
     MONGO_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRE=30d
     REFRESH_TOKEN_SECRET=your_refresh_token_secret
     REFRESH_TOKEN_EXPIRE=60d
     CLOUD_NAME=your_cloudinary_cloud_name
     API_KEY=your_cloudinary_api_key
     API_SECRET=your_cloudinary_api_secret
     RAZORPAY_KEY_ID=your_razorpay_key_id
     RAZORPAY_KEY_SECRET=your_razorpay_key_secret
     CLIENT_URL=your_frontend_vercel_url
     SERVER_BASE_URL=your_backend_render_url
     ```

3. **Deploy the Backend**
   - Click "Create Web Service"
   - Wait for the deployment to complete
   - Note the URL of your deployed API (e.g., `https://eduflow-api.onrender.com`)

## Frontend Deployment on Vercel

1. **Update API URL**
   - In the client directory, update `.env` file with your new backend URL:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api/v1
     ```
   - Commit and push these changes to GitHub

2. **Deploy on Vercel**
   - Sign up or log in to [Vercel.com](https://vercel.com)
   - Click "Add New" and select "Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: `Vite`
     - Root Directory: `client`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Set environment variables:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api/v1
     ```
   - Click "Deploy"
   - Wait for the deployment to complete
   - Note the URL of your deployed frontend

3. **Update Backend CORS**
   - Return to Render dashboard
   - Update the `CLIENT_URL` environment variable with your Vercel URL
   - Trigger a new deployment

## Database Setup (MongoDB Atlas)

1. **Create a Free Cluster**
   - Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free tier is sufficient)
   - Configure Network Access to allow connections from anywhere (`0.0.0.0/0`)

2. **Create Database User**
   - In MongoDB Atlas dashboard, go to "Database Access"
   - Add a new database user with password authentication
   - Give the user read/write permissions

3. **Get Connection String**
   - In MongoDB Atlas dashboard, go to "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Add this connection string as the `MONGO_URI` environment variable in Render

## Cloudinary Setup

1. **Configure Cloudinary**
   - Sign up or log in to [Cloudinary](https://cloudinary.com/)
   - From the dashboard, get your Cloud name, API Key, and API Secret
   - Add these as environment variables in Render

## Razorpay Setup

1. **Configure Razorpay for Testing**
   - Sign up or log in to [Razorpay](https://razorpay.com/)
   - Go to Settings > API Keys
   - Generate Test API keys
   - Add the Key ID and Key Secret as environment variables in Render

## Testing Your Deployment

1. **Visit your frontend URL**
2. **Create an account and try out the features**
3. **Test certificate generation and verification**
4. **Test quiz scorecard generation and downloads**

## Troubleshooting

### Render Free Tier Limitations
- The free tier will "sleep" after 15 minutes of inactivity
- First request after inactivity will take longer to respond
- Limited to 750 hours per month

### CORS Issues
- Ensure the `CLIENT_URL` in backend environment variables matches your Vercel URL exactly
- Check for missing protocol (`https://`) or trailing slashes

### Connection Issues
- Verify MongoDB connection string is correctly formatted
- Ensure MongoDB Atlas IP access list allows connections from Render

### Database Limits
- MongoDB Atlas free tier is limited to 512MB storage
- Monitor database size and clean up unnecessary data if needed

### Cloudinary Limits
- Free tier has 25 credits/month (~25GB storage and bandwidth combined)
- Optimize image uploads to reduce storage usage

## Scaling Options

If your application grows beyond the free tier limits:

1. **Render Paid Plans**
   - Start at $7/month for always-on service
   - Improved performance and no sleeping

2. **MongoDB Atlas Paid Tiers**
   - Start at $9/month for 2GB storage
   - Better performance and more features

3. **Cloudinary Paid Plans**
   - Start at $89/month for more storage and features
   - Consider alternate storage options if needed

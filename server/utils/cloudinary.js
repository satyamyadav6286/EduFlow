import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config({});

// Validate required environment variables
const requiredEnvVars = ['API_KEY', 'API_SECRET', 'CLOUD_NAME'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

cloudinary.config({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  cloud_name: process.env.CLOUD_NAME,
});

export const uploadMedia = async (file) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    console.log("Uploading file to Cloudinary:", file);
    
    // Add more detailed error checking for the file path
    if (typeof file !== 'string' || !fs.existsSync(file)) {
      throw new Error(`File path is invalid or file does not exist: ${file}`);
    }

    const fileStats = fs.statSync(file);
    console.log(`File size: ${fileStats.size} bytes`);
    
    if (fileStats.size === 0) {
      throw new Error(`File is empty: ${file}`);
    }

    // Read the file as a buffer instead of passing the path directly
    // This avoids Windows path issues with Cloudinary
    const fileBuffer = fs.readFileSync(file);
    
    console.log(`File ${file} read successfully, size: ${fileBuffer.length} bytes`);
    
    // Use a promise to handle the stream upload
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        resource_type: "auto",
        folder: "eduflow", // Organize files in a folder
        use_filename: true, // Use original filename
        unique_filename: true, // Ensure unique filenames
      }, (error, result) => {
        if (error) {
          console.error("Error in Cloudinary upload_stream:", error);
          return reject(error);
        }
        console.log("Successfully uploaded to Cloudinary:", result.secure_url);
        return resolve(result);
      });
      
      // Write the buffer to the stream
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error("No public ID provided");
    }

    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok') {
      throw new Error(`Failed to delete media: ${result.result}`);
    }
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error("No public ID provided");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video"
    });
    if (result.result !== 'ok') {
      throw new Error(`Failed to delete video: ${result.result}`);
    }
    return result;
  } catch (error) {
    console.error("Cloudinary video delete error:", error);
    throw error;
  }
};


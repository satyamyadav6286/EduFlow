import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      const instructors = await User.find({ role: 'instructor' });
      console.log('Instructor accounts:');
      console.log(JSON.stringify(instructors, null, 2));
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }); 
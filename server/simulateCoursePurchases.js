import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from './models/course.model.js';
import { CoursePurchase } from './models/coursePurchase.model.js';
import { User } from './models/user.model.js';
import connectDB from './database/db.js';

dotenv.config();

// Connect to database
const main = async () => {
  try {
    await connectDB();
    console.log('=== Simulating Course Purchases ===');
    
    // Find instructor
    const instructor = await User.findOne({ email: 'satyamyadav6286@gmail.com' });
    if (!instructor) {
      console.error('Instructor not found');
      process.exit(1);
    }
    
    // Find student users
    const students = await User.find({ role: 'student' });
    if (students.length === 0) {
      console.error('No students found');
      process.exit(1);
    }
    console.log(`Found ${students.length} students`);
    
    // Find courses by the instructor
    const courses = await Course.find({ creator: instructor._id });
    if (courses.length === 0) {
      console.error('No courses found for this instructor');
      process.exit(1);
    }
    console.log(`Found ${courses.length} courses by instructor`);
    
    // Create purchases (each student buys 1-3 random courses)
    const purchases = [];
    
    for (const student of students) {
      // Determine how many courses this student will purchase (1-3)
      const purchaseCount = Math.floor(Math.random() * 3) + 1;
      const studentCourses = getRandomCourses(courses, purchaseCount);
      
      for (const course of studentCourses) {
        // Create a course purchase
        const existingPurchase = await CoursePurchase.findOne({
          userId: student._id,
          courseId: course._id
        });
        
        if (!existingPurchase) {
          const purchase = await CoursePurchase.create({
            courseId: course._id,
            userId: student._id,
            amount: course.coursePrice,
            status: 'completed',
            paymentId: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`
          });
          
          purchases.push(purchase);
          
          // Update user's enrolledCourses
          await User.findByIdAndUpdate(
            student._id,
            { $addToSet: { enrolledCourses: course._id } },
            { new: true }
          );
          
          // Update course enrolledStudents
          await Course.findByIdAndUpdate(
            course._id,
            { $addToSet: { enrolledStudents: student._id } },
            { new: true }
          );
          
          console.log(`${student.name} purchased ${course.courseTitle} for ₹${course.coursePrice}`);
        } else {
          console.log(`${student.name} already purchased ${course.courseTitle}`);
        }
      }
    }
    
    // Calculate and show total purchases and revenue
    const totalPurchases = await CoursePurchase.countDocuments({ status: 'completed' });
    
    const totalRevenue = await CoursePurchase.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    console.log('\nPurchase Summary:');
    console.log(`- Total purchases: ${totalPurchases}`);
    console.log(`- Total revenue: ₹${totalRevenue[0]?.total || 0}`);
    
    // Calculate revenue per category
    const revenueByCategory = await CoursePurchase.aggregate([
      { $match: { status: 'completed' } },
      { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $group: { _id: '$course.category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);
    
    console.log('\nRevenue by Category:');
    revenueByCategory.forEach(cat => {
      console.log(`- ${cat._id}: ₹${cat.total}`);
    });
    
    // Close database connection
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Error simulating purchases:', error);
    process.exit(1);
  }
};

// Helper function to get random courses
function getRandomCourses(courses, count) {
  const shuffled = [...courses].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, courses.length));
}

// Run the function
main(); 
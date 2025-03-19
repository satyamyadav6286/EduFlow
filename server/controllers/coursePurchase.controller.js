import Razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    // Get current user details for prefilling
    const user = await User.findById(userId).select('name email');

    // Create a Razorpay order
    const options = {
      amount: course.coursePrice * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`,
      notes: {
        courseId: courseId,
        userId: userId
      }
    };

    const order = await razorpay.orders.create(options);

    // Create a new course purchase record
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
      paymentId: order.id
    });

    // Save the purchase record
    await newPurchase.save();

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: course.coursePrice * 100,
      key_id: process.env.RAZORPAY_KEY_ID, // Only send the public key, never the secret
      product_name: course.courseTitle,
      description: course.subTitle || `Course: ${course.courseTitle}`,
      contact: user?.mobileNumber || "",
      name: user?.name || "",
      email: user?.email || ""
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Could not create order"
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Creating hmac object with the secret key 
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);

    // Passing the data to be hashed
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    
    // Creating the hmac in the required format
    const generated_signature = hmac.digest('hex');
    
    // Verifying signature
    if (generated_signature === razorpay_signature) {
      // Payment is successful
      const purchase = await CoursePurchase.findOne({
        paymentId: razorpay_order_id
      }).populate({ path: "courseId" });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      purchase.status = "completed";

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } },
        { new: true }
      );

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        redirectUrl: `/course-progress/${purchase.courseId._id}`
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ userId, courseId });

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to get course details" 
    });
  }
};

export const getAllPurchasedCourse = async (req, res) => {
  try {
    const userId = req.id; // Get user ID from auth middleware

    // Filter purchases by the current user's ID
    const purchasedCourse = await CoursePurchase.find({
      userId: userId,
      status: "completed",
    }).populate({
      path: "courseId",
      select: "courseTitle subTitle coursePrice courseThumbnail category creator",
      populate: {
        path: "creator",
        select: "name"
      }
    });
    
    if (!purchasedCourse || purchasedCourse.length === 0) {
      return res.status(200).json({
        purchasedCourse: [],
      });
    }
    
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to get purchased courses" 
    });
  }
};

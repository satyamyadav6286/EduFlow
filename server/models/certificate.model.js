import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    certificateId: {
        type: String,
        required: true,
        unique: true
    },
    issuedDate: {
        type: Date,
        default: Date.now
    },
    completionDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Compound index to ensure a user can only have one certificate per course
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Certificate = mongoose.model("Certificate", certificateSchema); 
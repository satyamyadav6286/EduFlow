import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Contact } from './models/contact.model.js';
import { User } from './models/user.model.js';
import connectDB from './database/db.js';

dotenv.config();

// Connect to database
connectDB();

const sampleMessages = [
  {
    subject: 'Question about course availability',
    message: 'I was wondering if the Python course will be available next month? I\'m interested in enrolling but need some time to prepare.'
  },
  {
    subject: 'Technical issues with video playback',
    message: 'I\'m having trouble with the video playback in the JavaScript course. The videos keep buffering and sometimes don\'t load at all. Can you please help me resolve this issue?'
  },
  {
    subject: 'Request for new course topic',
    message: 'I would like to suggest a new course on mobile app development with Flutter. I think many students would benefit from this as Flutter is becoming increasingly popular.'
  },
  {
    subject: 'Payment issue',
    message: 'I made a payment for the Machine Learning course but haven\'t received access yet. My transaction ID is TX123456789. Could you please check this for me?'
  },
  {
    subject: 'Feedback on Data Science course',
    message: 'I recently completed the Data Science course and wanted to share my feedback. The content was excellent and I learned a lot, but I think some more practical examples would make it even better.'
  }
];

const createContactSubmissions = async () => {
  try {
    // Get the users we created
    const users = await User.find({ role: 'student' });
    
    if (users.length === 0) {
      console.log('No users found. Please run generateSampleUsers.js first.');
      process.exit(1);
    }
    
    // Generate 2 contact submissions per user
    for (const user of users) {
      for (let i = 0; i < 2; i++) {
        // Pick a random message template
        const messageTemplate = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
        
        await Contact.create({
          name: user.name,
          email: user.email,
          subject: messageTemplate.subject,
          message: `${messageTemplate.message}\n\nRegards,\n${user.name}`
        });
        
        console.log(`Created contact submission from: ${user.name}`);
      }
    }
    
    console.log('Sample contact submissions created successfully!');
    process.exit();
  } catch (error) {
    console.error('Error creating sample contact submissions:', error);
    process.exit(1);
  }
};

createContactSubmissions(); 
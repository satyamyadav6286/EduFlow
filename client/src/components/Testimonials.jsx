import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Frontend Developer',
    content: 'The Web Development course completely transformed my career. The instructors are knowledgeable and the content is up-to-date with industry standards. Highly recommended!',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    rating: 5
  },
  {
    id: 2,
    name: 'Rahul Patel',
    role: 'Data Scientist',
    content: 'The Data Science bootcamp provided me with all the skills needed to land my dream job. The hands-on projects were particularly valuable and made my portfolio stand out.',
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
    rating: 5
  },
  {
    id: 3,
    name: 'Aisha Khan',
    role: 'UI/UX Designer',
    content: 'I enrolled in the Web Design course as a complete beginner, and now I\'m confidently creating professional designs. The course structure and mentorship were exceptional.',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    rating: 5
  },
  {
    id: 4,
    name: 'Vikram Singh',
    role: 'Full Stack Developer',
    content: 'The MERN Stack Development course was comprehensive and practical. The real-world projects helped me understand the entire development workflow. Worth every penny!',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    rating: 5
  },
  {
    id: 5,
    name: 'Neha Gupta',
    role: 'Mobile App Developer',
    content: 'Learning React Native through this platform was a game-changer. The course content was well-structured and the community support was amazing. I\'ve already recommended it to my colleagues.',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    rating: 5
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Our Students Say</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Hear from our community of successful learners
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.slice(3, 5).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 flex flex-col h-full transition-transform hover:scale-[1.02]">
      <div className="flex items-center mb-4">
        <img 
          src={testimonial.avatar} 
          alt={testimonial.name} 
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role}</p>
        </div>
      </div>
      
      <div className="flex mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-current text-yellow-500" />
        ))}
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 flex-grow">{testimonial.content}</p>
    </div>
  );
};

export default Testimonials; 
import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full">
      {/* Bottom section with copyright and links */}
      <div className="bg-gray-950 text-gray-300 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>Designed and Developed by <span className="font-bold">Satyam Govind Yadav</span></p>
          </div>
          
          <div className="flex space-x-6">
            <a href="https://github.com/satyamyadav6286" target="_blank" rel="noopener noreferrer">
              <Github className="w-5 h-5 hover:text-white" />
            </a>
            <a href="https://x.com/satyamyadav_29" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-5 h-5 hover:text-white" />
            </a>
            <a href="https://www.linkedin.com/in/satyamgovindyadav" target="_blank" rel="noopener noreferrer">
              <Linkedin className="w-5 h-5 hover:text-white" />
            </a>
            <a href="https://www.instagram.com/satyamyadav_29" target="_blank" rel="noopener noreferrer">
              <Instagram className="w-5 h-5 hover:text-white" />
            </a>
          </div>
          
          <div>
            <p>Copyright © 2025 SGY</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
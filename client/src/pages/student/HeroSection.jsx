import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Sparkles, Award } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Define popular categories for quick access
const popularCategories = [
  "Python",
  "Javascript",
  "Web Development",
  "Data Science",
  "Machine Learning"
];

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const searchHandler = (e) => {
    e.preventDefault();
    if(searchQuery.trim() !== ""){
      navigate(`/course/search?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const searchByCategory = (category) => {
    navigate(`/course/search?query=${encodeURIComponent(category)}`);
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-gray-800 dark:to-gray-900 py-16 md:py-28 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl md:text-5xl font-bold mb-4 leading-tight">
          Discover Your Next <span className="text-yellow-300">Learning Adventure</span>
        </h1>
        <p className="text-blue-100 dark:text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of learners expanding their skills with our expert-led courses
        </p>

        <form onSubmit={searchHandler} className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden max-w-2xl mx-auto mb-8">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What do you want to learn today?"
            className="flex-grow border-none focus-visible:ring-0 px-6 py-6 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-lg"
          />
          <Button 
            type="submit" 
            className="bg-blue-600 dark:bg-blue-700 text-white px-8 py-6 rounded-r-full hover:bg-blue-700 dark:hover:bg-blue-800 text-base h-auto"
          >
            <Search size={20} className="mr-2" />
            Search
          </Button>
        </form>

        <div className="mt-6">
          <p className="text-white mb-3 text-sm">Popular Categories:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularCategories.map(category => (
              <Badge 
                key={category} 
                className="bg-white/20 hover:bg-white/30 text-white cursor-pointer text-sm px-4 py-2"
                onClick={() => searchByCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center">
          <BookOpen size={36} className="mb-4 text-yellow-300" />
          <h3 className="font-semibold text-lg mb-2">Comprehensive Courses</h3>
          <p className="text-blue-100 dark:text-gray-300 text-sm">Over 100 courses across 15 different categories</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center">
          <Sparkles size={36} className="mb-4 text-yellow-300" />
          <h3 className="font-semibold text-lg mb-2">Expert Instructors</h3>
          <p className="text-blue-100 dark:text-gray-300 text-sm">Learn from industry professionals with real-world experience</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center">
          <Award size={36} className="mb-4 text-yellow-300" />
          <h3 className="font-semibold text-lg mb-2">Certifications</h3>
          <p className="text-blue-100 dark:text-gray-300 text-sm">Earn certificates to showcase your newly acquired skills</p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import React, { useState } from "react";

const categories = [
  { id: "Next JS", label: "Next JS" },
  { id: "Data Science", label: "Data Science" },
  { id: "Frontend Development", label: "Frontend Development" },
  { id: "Fullstack Development", label: "Fullstack Development" },
  { id: "MERN Stack Development", label: "MERN Stack Development" },
  { id: "Javascript", label: "Javascript" },
  { id: "Python", label: "Python" },
  { id: "Docker", label: "Docker" },
  { id: "MongoDB", label: "MongoDB" },
  { id: "HTML", label: "HTML" },
  { id: "Web Development", label: "Web Development" },
  { id: "Mobile Development", label: "Mobile Development" },
  { id: "Machine Learning", label: "Machine Learning" },
  { id: "Web Design", label: "Web Design" },
  { id: "Programming Languages", label: "Programming Languages" },
];

const Filter = ({ handleFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prevCategories) => {
      const newCategories = prevCategories.includes(categoryId)
        ? prevCategories.filter((id) => id !== categoryId)
        : [...prevCategories, categoryId];

      handleFilterChange(newCategories, sortByPrice);
      return newCategories;
    });
  };

  const handlePriceChange = (value) => {
    setSortByPrice(value);
    handleFilterChange(selectedCategories, value);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSortByPrice("");
    handleFilterChange([], "");
  };

  return (
    <div className="md:w-64 xl:w-72 h-fit bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-700 sticky top-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-bold text-lg">Filter Courses</h1>
        {(selectedCategories.length > 0 || sortByPrice) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-8 px-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <X size={16} className="mr-1" /> Clear All
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="font-semibold mb-3">Categories</h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => handleCategoryChange(category.id)}
                />
                <Label
                  htmlFor={category.id}
                  className="text-sm cursor-pointer flex-1"
                >
                  {category.label}
                </Label>
                {selectedCategories.includes(category.id) && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                    ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="font-semibold mb-3">Sort By Price</h2>
          <Select value={sortByPrice} onValueChange={handlePriceChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Price</SelectLabel>
                <SelectItem value="low">Low to High</SelectItem>
                <SelectItem value="high">High to Low</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {(selectedCategories.length > 0 || sortByPrice) && (
          <>
            <Separator />
            
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Active Filters:</h3>
              {selectedCategories.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Categories:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCategories.map(cat => (
                      <span 
                        key={cat} 
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full flex items-center"
                      >
                        {cat}
                        <X 
                          size={12} 
                          className="ml-1 cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryChange(cat);
                          }} 
                        />
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {sortByPrice && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price:</p>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full flex items-center">
                    {sortByPrice === 'low' ? 'Low to High' : 'High to Low'}
                    <X 
                      size={12} 
                      className="ml-1 cursor-pointer" 
                      onClick={() => handlePriceChange("")} 
                    />
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Filter;

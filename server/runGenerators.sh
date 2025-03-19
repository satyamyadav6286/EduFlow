#!/bin/bash
# Shell script to run all generators in sequence

echo -e "\e[32mStarting data generation process...\e[0m"

# Run User Generator
echo -e "\e[36mGenerating users...\e[0m"
node generateSampleUsers.js

# Run Course Generator
echo -e "\e[36mGenerating courses...\e[0m"
node generateComprehensiveCourses.js

# Run Contact Form Generator
echo -e "\e[36mGenerating contact form submissions...\e[0m"
node generateSampleContacts.js

echo -e "\e[32mAll data generation complete!\e[0m" 
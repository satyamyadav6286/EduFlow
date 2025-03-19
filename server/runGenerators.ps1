# PowerShell script to run all generators in sequence
Write-Host "Starting data generation process..." -ForegroundColor Green

# Run User Generator
Write-Host "Generating users..." -ForegroundColor Cyan
node generateSampleUsers.js

# Run Course Generator
Write-Host "Generating courses..." -ForegroundColor Cyan
node generateComprehensiveCourses.js

# Run Contact Form Generator
Write-Host "Generating contact form submissions..." -ForegroundColor Cyan
node generateSampleContacts.js

Write-Host "All data generation complete!" -ForegroundColor Green 
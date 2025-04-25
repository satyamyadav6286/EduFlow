import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the certificateGenerator.js file
const filePath = path.join(__dirname, 'certificateGenerator.js');

async function fixCertificateGenerator() {
  try {
    console.log(`Reading certificate generator file: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check for the problematic dash line
    const problematicLine = /.dash\(5,\s*\{\s*space:\s*10\s*\}\)/g;
    
    if (problematicLine.test(content)) {
      console.log('Found problematic dash line, fixing it...');
      
      // Replace with the fixed version
      content = content.replace(
        /.dash\(5,\s*\{\s*space:\s*10\s*\}\)/g, 
        '.dash(5, 10)'
      );
      
      // Create backup of original file
      fs.writeFileSync(`${filePath}.bak`, fs.readFileSync(filePath));
      console.log(`Backup created: ${filePath}.bak`);
      
      // Write fixed content back to file
      fs.writeFileSync(filePath, content);
      console.log('Fix applied successfully');
      
      // Show the fixed line in context
      const lines = content.split('\n');
      const dashLineIndex = lines.findIndex(line => line.includes('.dash(5, 10)'));
      
      if (dashLineIndex >= 0) {
        console.log('Fixed line in context:');
        console.log(lines.slice(Math.max(0, dashLineIndex - 2), dashLineIndex + 3).join('\n'));
      }
      
    } else {
      console.log('Problematic dash line not found or already fixed');
      
      // Search for any dash usage
      const dashLines = content.split('\n').filter(line => line.includes('.dash('));
      
      if (dashLines.length > 0) {
        console.log('Current dash usage in file:');
        dashLines.forEach(line => console.log(line.trim()));
      }
    }
    
  } catch (error) {
    console.error('Error fixing certificate generator:', error);
  }
}

// Run the fix
console.log('Starting certificate generator fix');
fixCertificateGenerator()
  .then(() => console.log('Fix process complete'))
  .catch(error => console.error('Fix process failed:', error)); 
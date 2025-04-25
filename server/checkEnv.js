import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Checking required environment variables...');

const requiredVars = [
  'SECRET_KEY',
  'MONGODB_URI',
  'NODE_ENV'
];

let missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.error(`❌ ERROR: ${varName} is not set`);
  } else {
    // Show first few characters of sensitive vars
    if (varName === 'SECRET_KEY' || varName === 'MONGODB_URI') {
      const value = process.env[varName];
      const preview = value.substring(0, 8) + '...' + value.substring(value.length - 4);
      console.log(`✅ ${varName} is set: ${preview}`);
    } else {
      console.log(`✅ ${varName} is set: ${process.env[varName]}`);
    }
  }
});

if (missingVars.length > 0) {
  console.error('\n❌ ERROR: Missing required environment variables!');
  console.error('The following variables must be set:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\nUpdate your .env file or deployment environment settings.\n');
  process.exit(1); // Exit with error
} else {
  console.log('\n✅ All required environment variables are set correctly!\n');
} 
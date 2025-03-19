import axios from 'axios';

// Create the API instance with credentials
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true
});

// Debug cookies from response
const logCookies = (response) => {
  console.log('Response headers:');
  for (const [key, value] of Object.entries(response.headers)) {
    console.log(`${key}: ${value}`);
  }
  
  if (response.headers['set-cookie']) {
    console.log('\nCookies set by server:', response.headers['set-cookie']);
  } else {
    console.log('\nNo cookies set by server');
  }
};

// Simple test to check instructor access to contact forms
async function testContactAccess() {
  try {
    // 1. Login as instructor
    console.log('Logging in as instructor...');
    const loginResponse = await api.post('/user/login', {
      email: 'satyamyadav6286@gmail.com',
      password: 'satyam@6286'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }
    
    console.log('Login successful!');
    console.log('User:', loginResponse.data.user);
    logCookies(loginResponse);
    
    // 2. Try to access contact forms
    console.log('\nTrying to access contact forms...');
    const contactsResponse = await api.get('/contact');
    
    if (contactsResponse.data.success) {
      console.log('Successfully accessed contact forms!');
      console.log(`Found ${contactsResponse.data.contacts.length} contact form submissions`);
    } else {
      console.error('Failed to access contact forms:', contactsResponse.data.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testContactAccess(); 
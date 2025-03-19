import axios from 'axios';

// Simple test to check instructor access with manual cookie handling
async function testManualAuth() {
  try {
    // 1. Login as instructor
    console.log('Logging in as instructor...');
    const loginResponse = await axios.post('http://localhost:3000/api/v1/user/login', {
      email: 'satyamyadav6286@gmail.com',
      password: 'satyam@6286'
    }, {
      withCredentials: true
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }
    
    console.log('Login successful!');
    
    // Extract cookie from response headers
    const setCookieHeader = loginResponse.headers['set-cookie'];
    if (!setCookieHeader) {
      throw new Error('No cookies received from login');
    }
    
    console.log('Cookies received:', setCookieHeader);
    
    // Parse the token from set-cookie header
    const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('token='));
    if (!tokenCookie) {
      throw new Error('Token cookie not found');
    }
    
    const token = tokenCookie.split(';')[0].split('=')[1];
    console.log('Token extracted:', token);
    
    // 2. Try to access contact forms with cookie in header
    console.log('\nTrying to access contact forms with manual cookie...');
    const contactsResponse = await axios.get('http://localhost:3000/api/v1/contact', {
      headers: {
        Cookie: `token=${token}`
      }
    });
    
    console.log('Contact forms retrieved successfully!');
    console.log(`Found ${contactsResponse.data.contacts.length} contact form submissions`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testManualAuth(); 
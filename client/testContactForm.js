import axios from 'axios';

// Base URL for API requests
const baseURL = 'http://localhost:3000/api/v1';

// Helper to extract token from login response
const extractToken = (response) => {
  const setCookieHeader = response.headers['set-cookie'];
  if (!setCookieHeader) {
    throw new Error('No cookies received from login');
  }
  
  const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('token='));
  if (!tokenCookie) {
    throw new Error('Token cookie not found');
  }
  
  return tokenCookie.split(';')[0].split('=')[1];
};

// Test login and contact form submissions
async function testContactForms() {
  try {
    // 1. First try to get contacts without logging in (should fail)
    console.log('Trying to access contacts without authentication...');
    try {
      await axios.get(`${baseURL}/contact`);
      console.error('❌ Security issue: Able to access contacts without authentication!');
    } catch (error) {
      console.log('✅ Authentication required for contacts (expected behavior)');
    }
    
    // 2. Try to login as a regular student (should succeed but not be able to view contacts)
    console.log('\nLogging in as student...');
    const studentLoginResponse = await axios.post(`${baseURL}/user/login`, {
      email: 'mohit.pardeshi@example.com',
      password: 'Password123!'
    });
    
    if (studentLoginResponse.data.success) {
      console.log('Student login successful!');
      const studentToken = extractToken(studentLoginResponse);
      
      // Try to access contacts as student
      console.log('Trying to access contacts as student...');
      try {
        await axios.get(`${baseURL}/contact`, {
          headers: {
            Cookie: `token=${studentToken}`
          }
        });
        console.error('❌ Security issue: Students can access contacts!');
      } catch (error) {
        console.log('✅ Students cannot access contacts (expected behavior)');
      }
      
      // Logout
      await axios.get(`${baseURL}/user/logout`);
      console.log('Logged out student');
    } else {
      console.error('Student login failed:', studentLoginResponse.data.message);
    }
    
    // 3. Login as instructor - using the correct email from our database
    console.log('\nLogging in as instructor...');
    const loginResponse = await axios.post(`${baseURL}/user/login`, {
      email: 'satyamyadav6286@gmail.com', // Correct instructor email 
      password: 'satyam@6286' // Correct instructor password from createInstructor.js
    });
    
    if (loginResponse.data.success) {
      console.log('Instructor login successful!');
      const instructorToken = extractToken(loginResponse);
      
      // 4. Get contact form submissions using the token
      console.log('Fetching contact form submissions...');
      const contactsResponse = await axios.get(`${baseURL}/contact`, {
        headers: {
          Cookie: `token=${instructorToken}`
        }
      });
      
      if (contactsResponse.data.success) {
        const contacts = contactsResponse.data.contacts;
        console.log(`Found ${contacts.length} contact form submissions`);
        
        // 5. Display the contact form submissions
        console.log('\nContact Form Submissions:');
        console.log('------------------------');
        
        contacts.forEach((contact, index) => {
          console.log(`${index + 1}. From: ${contact.name} (${contact.email})`);
          console.log(`   Subject: ${contact.subject || 'No subject'}`);
          console.log(`   Message: ${contact.message.slice(0, 100)}${contact.message.length > 100 ? '...' : ''}`);
          console.log(`   Status: ${contact.isRead ? 'Read' : 'Unread'}`);
          console.log(`   Submitted: ${new Date(contact.createdAt).toLocaleString()}`);
          console.log('------------------------');
        });
        
        // 6. Check for our specific test users
        const testUsers = [
          'Mohit Pardeshi',
          'Sohel Solkar',
          'Munaf Lanjekar',
          'Muhammad Mitha',
          'Prashant Yadav'
        ];
        
        const foundUsers = testUsers.filter(name => 
          contacts.some(contact => contact.name === name)
        );
        
        console.log(`\nFound ${foundUsers.length} of ${testUsers.length} test users in contact submissions:`);
        console.log(foundUsers.join(', '));
        
        // 7. Report overall status
        if (foundUsers.length === testUsers.length) {
          console.log('\n✅ Success! All test user contact submissions were found.');
        } else {
          console.log('\n⚠️ Some test user contact submissions are missing.');
          console.log('Missing users:', testUsers.filter(user => !foundUsers.includes(user)).join(', '));
        }
      } else {
        console.error('Failed to fetch contact form submissions:', contactsResponse.data.message);
      }
    } else {
      console.error('Instructor login failed:', loginResponse.data.message);
      console.log('Note: You may need to update the instructor password in the test script');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response && error.response.data) {
      console.error('Response details:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.response && error.response.status) {
      console.error('HTTP Status:', error.response.status);
    }
  }
}

// Run the test
testContactForms(); 
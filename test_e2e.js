const axios = require('axios');

async function test() {
  try {
    console.log("Registering a new user...");
    const regRes = await axios.post('http://localhost/api/auth/register', {
      name: 'Test QA',
      email: 'qa@newsplatform.com',
      password: 'password123'
    });
    console.log("Register response:", regRes.data);

    console.log("Logging in...");
    const res = await axios.post('http://localhost/api/auth/login', {
      email: 'qa@newsplatform.com',
      password: 'password123'
    });
    const token = res.data.accessToken;
    console.log("Logged in! Token:", token.substring(0, 15) + "...");
    
    // Fetch categories
    console.log("Fetching categories...");
    const catRes = await axios.get('http://localhost/api/categories');
    console.log("Categories:", catRes.data.length);
    
    // Fetch news
    console.log("Fetching news feed...");
    const newsRes = await axios.get('http://localhost/api/news');
    console.log("News articles:", newsRes.data.content ? newsRes.data.content.length : newsRes.data.length);
    
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}

test();

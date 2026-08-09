const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost/api/auth/login', {
      email: 'admin@newsplatform.com',
      password: 'password123'
    });
    const token = res.data.accessToken;
    console.log("Logged in:", token.substring(0, 20) + "...");
    
    // Change user 1's role to ADMIN
    console.log("Changing role...");
    const putRes = await axios.put('http://localhost/api/admin/users/1/role?role=ROLE_ADMIN', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Response:", putRes.data);
    
    // Fetch users
    const getRes = await axios.get('http://localhost/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Users:", getRes.data);
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}

test();

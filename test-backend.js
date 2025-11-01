#!/usr/bin/env node

const { default: fetch } = require('node-fetch');

async function testBackend() {
  console.log('🔍 Testing Backend Server Connection...\n');

  const tests = [
    {
      name: 'Backend Health Check',
      url: 'http://localhost:8080/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Backend API Root',
      url: 'http://localhost:8080/',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Backend Jabatan Endpoint',
      url: 'http://localhost:8080/api/jabatans',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Backend Karyawan Endpoint',
      url: 'http://localhost:8080/api/karyawans',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Backend Kantor Endpoint',
      url: 'http://localhost:8080/api/kantors',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📡 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: test.headers,
        timeout: 5000
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success - Response length: ${Array.isArray(data) ? data.length : 'N/A'}`);
        
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   📄 Sample data:`, data[0]);
        } else if (Array.isArray(data)) {
          console.log(`   ⚠️  Empty array returned`);
        } else {
          console.log(`   📄 Response:`, data);
        }
      } else {
        console.log(`   ❌ Failed: ${response.status}`);
        const errorText = await response.text();
        if (errorText) {
          console.log(`   Error: ${errorText}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Connection Error: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log(`   💡 Backend server might not be running on port 8080`);
      }
    }
    console.log('');
  }

  console.log('🎯 Quick fixes:');
  console.log('   1. Start your backend server: java -jar your-backend.jar');
  console.log('   2. Check if backend is running on port 8080');
  console.log('   3. Verify database has initial data');
  console.log('   4. Check backend logs for authentication issues');
}

testBackend().catch(console.error);
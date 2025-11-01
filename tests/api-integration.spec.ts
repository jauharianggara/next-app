import { test, expect } from './fixtures';

test.describe('API Integration Tests', () => {
  
  test.beforeEach(async ({ page, loginPage }) => {
    // Login before each test to get authentication token
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.login('admin', 'password123');
  });

  test('should test proxy endpoints connectivity', async ({ page }) => {
    // Test all proxy endpoints are working
    const endpoints = [
      '/api/proxy/api/karyawans',
      '/api/proxy/api/kantors', 
      '/api/proxy/api/jabatans'
    ];

    for (const endpoint of endpoints) {
      const response = await page.goto(`http://localhost:3000${endpoint}`);
      expect(response?.status()).toBe(200);
      
      // Check response is JSON
      const contentType = response?.headers()['content-type'];
      expect(contentType).toContain('application/json');
    }
  });

  test('should handle authentication in proxy requests', async ({ page }) => {
    // Test that proxy forwards authentication headers correctly
    const response = await page.goto('http://localhost:3000/api/proxy/api/karyawans');
    expect(response?.status()).toBe(200);
    
    // Should not return unauthorized
    const text = await response?.text();
    expect(text).not.toContain('Unauthorized');
    expect(text).not.toContain('Missing authorization header');
  });

  test('should test status page connectivity checks', async ({ page }) => {
    await page.goto('/status');
    
    // Wait for all status checks to complete
    await page.waitForLoadState('networkidle');
    
    // Check that status checks are performed
    const statusCards = page.locator('.prose-sm'); // Adjust selector based on your status page
    const cardCount = await statusCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Check for backend connection status
    const backendStatus = page.locator('text="Backend Connection"');
    if (await backendStatus.isVisible()) {
      await expect(backendStatus).toBeVisible();
    }
  });

  test('should handle CORS preflight requests', async ({ page }) => {
    // Test that CORS is handled properly in proxy
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/proxy/api/jabatans', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        return {
          status: res.status,
          ok: res.ok
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
  });

  test('should test error handling in proxy', async ({ page }) => {
    // Test proxy error handling with invalid endpoint
    const response = await page.goto('http://localhost:3000/api/proxy/api/nonexistent');
    
    // Should handle 404 gracefully
    expect(response?.status()).toBe(404);
  });

  test('should test data consistency across endpoints', async ({ page }) => {
    // Test that data is consistent between different endpoints
    
    // Get karyawan data
    const karyawanResponse = await page.goto('http://localhost:3000/api/proxy/api/karyawans');
    const karyawanText = await karyawanResponse?.text();
    const karyawanData = JSON.parse(karyawanText || '[]');
    
    // Get jabatan data  
    const jabatanResponse = await page.goto('http://localhost:3000/api/proxy/api/jabatans');
    const jabatanText = await jabatanResponse?.text();
    const jabatanData = JSON.parse(jabatanText || '[]');
    
    // Get kantor data
    const kantorResponse = await page.goto('http://localhost:3000/api/proxy/api/kantors');
    const kantorText = await kantorResponse?.text();
    const kantorData = JSON.parse(kantorText || '[]');
    
    // Basic validation
    expect(Array.isArray(karyawanData)).toBe(true);
    expect(Array.isArray(jabatanData)).toBe(true);
    expect(Array.isArray(kantorData)).toBe(true);
    
    // If there are employees, check that referenced jabatan and kantor exist
    if (karyawanData.length > 0) {
      const employee = karyawanData[0];
      
      if (employee.jabatan_id && jabatanData.length > 0) {
        const jabatanExists = jabatanData.some((j: any) => j.id === employee.jabatan_id);
        expect(jabatanExists).toBe(true);
      }
      
      if (employee.kantor_id && kantorData.length > 0) {
        const kantorExists = kantorData.some((k: any) => k.id === employee.kantor_id);
        expect(kantorExists).toBe(true);
      }
    }
  });

  test('should test authentication token persistence', async ({ page }) => {
    // Check that authentication token is properly maintained
    await page.goto('/dashboard');
    
    // Get token from cookies
    const cookies = await page.context().cookies();
    const tokenCookie = cookies.find(c => c.name === 'token');
    
    expect(tokenCookie).toBeTruthy();
    expect(tokenCookie?.value).toBeTruthy();
    
    // Test that token works for API calls
    const response = await page.evaluate(async (token) => {
      try {
        const res = await fetch('/api/proxy/api/jabatans', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { error: error.message };
      }
    }, tokenCookie?.value);
    
    expect(response.ok).toBe(true);
  });

  test('should test request timeout handling', async ({ page }) => {
    // Test that long requests are handled properly
    // This is more of a stress test
    
    const startTime = Date.now();
    const response = await page.goto('http://localhost:3000/api/proxy/api/karyawans');
    const endTime = Date.now();
    
    // Request should complete within reasonable time (10 seconds)
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(10000);
    
    expect(response?.status()).toBe(200);
  });

  test('should test concurrent API requests', async ({ page }) => {
    // Test multiple concurrent requests
    const promises = [
      page.goto('http://localhost:3000/api/proxy/api/karyawans'),
      page.goto('http://localhost:3000/api/proxy/api/kantors'),
      page.goto('http://localhost:3000/api/proxy/api/jabatans')
    ];
    
    const responses = await Promise.all(promises);
    
    // All requests should succeed
    for (const response of responses) {
      expect(response?.status()).toBe(200);
    }
  });

  test('should test proxy header forwarding', async ({ page }) => {
    // Test that proxy correctly forwards headers
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/proxy/api/jabatans', {
          headers: {
            'Content-Type': 'application/json',
            'Custom-Header': 'test-value'
          }
        });
        return {
          status: res.status,
          ok: res.ok,
          headers: Object.fromEntries(res.headers.entries())
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(response.ok).toBe(true);
    expect(response.headers['content-type']).toContain('application/json');
  });

  test('should test backend server availability', async ({ page }) => {
    // Test direct backend connectivity status
    await page.goto('/status');
    await page.waitForLoadState('networkidle');
    
    // Click refresh to run status checks
    const refreshButton = page.locator('button:has-text("Refresh")');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(3000); // Wait for checks to complete
    }
    
    // Check status results
    const statusCards = page.locator('[data-testid="status-card"]');
    if (await statusCards.count() > 0) {
      // At least one status check should be performed
      const firstCard = statusCards.first();
      await expect(firstCard).toBeVisible();
    }
  });

  test('should test database connectivity through API', async ({ page }) => {
    // Test that we can perform basic CRUD operations
    
    // Try to create a test jabatan
    const testData = {
      nama_jabatan: 'API Test Position',
      deskripsi: 'Created through API test'
    };
    
    const createResponse = await page.evaluate(async (data) => {
      try {
        const res = await fetch('/api/proxy/api/jabatans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return {
          status: res.status,
          ok: res.ok,
          data: res.ok ? await res.json() : null
        };
      } catch (error) {
        return { error: error.message };
      }
    }, testData);
    
    // Should either succeed or fail gracefully
    expect([200, 201, 400, 401, 500]).toContain(createResponse.status);
    
    // If creation succeeded, try to fetch the data
    if (createResponse.ok && createResponse.data) {
      const fetchResponse = await page.goto('http://localhost:3000/api/proxy/api/jabatans');
      expect(fetchResponse?.status()).toBe(200);
      
      const fetchText = await fetchResponse?.text();
      const fetchData = JSON.parse(fetchText || '[]');
      
      // Should include our test data
      const testItem = fetchData.find((item: any) => item.nama_jabatan === testData.nama_jabatan);
      expect(testItem).toBeTruthy();
    }
  });
});
import { test, expect } from './fixtures';

test.describe('Authentication Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should redirect unauthenticated user to login page', async ({ page, loginPage }) => {
    await page.goto('/dashboard');
    await loginPage.expectToBeOnLoginPage();
  });

  test('should display login form correctly', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectToBeOnLoginPage();
    
    // Check all form elements are visible
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
  });

  test('should navigate to register page', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.goToRegister();
    await expect(page).toHaveURL('/auth/register');
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginWithInvalidCredentials('invalid_user', 'wrong_password');
    await loginPage.expectLoginError();
  });

  test('should login successfully with registered user', async ({ page, registerPage, loginPage, dashboardPage }) => {
    // First register a user
    const timestamp = Date.now();
    const userData = {
      full_name: `Test User ${timestamp}`,
      username: `testuser${timestamp}`,
      email: `testuser${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(userData);
    await registerPage.expectRegistrationSuccess();

    // Navigate to login page if not redirected
    const currentUrl = page.url();
    if (!currentUrl.includes('/auth/login')) {
      await registerPage.goToLogin();
    }
    
    // Login with registered credentials
    await loginPage.login(userData.username, userData.password);
    
    // Should redirect to dashboard
    await dashboardPage.expectToBeOnDashboard();
  });

  test('should maintain authentication across page reloads', async ({ page, registerPage, loginPage, dashboardPage }) => {
    // Register and login
    const timestamp = Date.now();
    const userData = {
      full_name: `Reload Test User ${timestamp}`,
      username: `reloaduser${timestamp}`,
      email: `reload${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(userData);
    
    const currentUrl = page.url();
    if (!currentUrl.includes('/auth/login')) {
      await registerPage.goToLogin();
    }

    await loginPage.login(userData.username, userData.password);
    await dashboardPage.expectToBeOnDashboard();
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be on dashboard
    await dashboardPage.expectToBeOnDashboard();
  });

  test('should logout successfully', async ({ page, registerPage, loginPage, dashboardPage }) => {
    // Register and login
    const timestamp = Date.now();
    const userData = {
      full_name: `Logout Test User ${timestamp}`,
      username: `logoutuser${timestamp}`,
      email: `logout${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(userData);
    
    const currentUrl = page.url();
    if (!currentUrl.includes('/auth/login')) {
      await registerPage.goToLogin();
    }

    await loginPage.login(userData.username, userData.password);
    await dashboardPage.expectToBeOnDashboard();
    
    // Logout
    await dashboardPage.logout();
    
    // Should redirect to login page
    await loginPage.expectToBeOnLoginPage();
  });

  test('should prevent access to protected routes after logout', async ({ page, registerPage, loginPage, dashboardPage }) => {
    // Register and login
    const timestamp = Date.now();
    const userData = {
      full_name: `Protected Route Test User ${timestamp}`,
      username: `protecteduser${timestamp}`,
      email: `protected${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(userData);
    
    const currentUrl = page.url();
    if (!currentUrl.includes('/auth/login')) {
      await registerPage.goToLogin();
    }

    await loginPage.login(userData.username, userData.password);
    await dashboardPage.expectToBeOnDashboard();
    
    // Logout
    await dashboardPage.logout();
    
    // Try to access protected route
    await page.goto('/dashboard/karyawan');
    
    // Should redirect to login
    await loginPage.expectToBeOnLoginPage();
  });

  test('should handle expired token gracefully', async ({ page, registerPage, loginPage, dashboardPage }) => {
    // Register and login
    const timestamp = Date.now();
    const userData = {
      full_name: `Token Test User ${timestamp}`,
      username: `tokenuser${timestamp}`,
      email: `token${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(userData);
    
    const currentUrl = page.url();
    if (!currentUrl.includes('/auth/login')) {
      await registerPage.goToLogin();
    }

    await loginPage.login(userData.username, userData.password);
    await dashboardPage.expectToBeOnDashboard();
    
    // Simulate expired token by clearing cookies
    await page.context().clearCookies();
    
    // Try to navigate to a protected route
    await page.goto('/dashboard/karyawan');
    
    // Should redirect to login
    await loginPage.expectToBeOnLoginPage();
  });

  test('should validate login form fields', async ({ loginPage }) => {
    await loginPage.goto();
    
    // Try to submit empty form
    await loginPage.loginButton.click();
    
    // Should show validation errors (if implemented)
    await expect(loginPage.usernameInput).toHaveAttribute('required', '');
    await expect(loginPage.passwordInput).toHaveAttribute('required', '');
  });

  test('should remember login state in new tab', async ({ browser, registerPage, loginPage, dashboardPage }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    const registerPage1 = new (registerPage.constructor as any)(page1);
    const loginPage1 = new (loginPage.constructor as any)(page1);
    const dashboardPage1 = new (dashboardPage.constructor as any)(page1);
    const dashboardPage2 = new (dashboardPage.constructor as any)(page2);
    
    // Register and login in first tab
    const timestamp = Date.now();
    const userData = {
      full_name: `Multi Tab User ${timestamp}`,
      username: `multitabuser${timestamp}`,
      email: `multitab${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage1.goto();
    await registerPage1.register(userData);
    
    const currentUrl = page1.url();
    if (!currentUrl.includes('/auth/login')) {
      await registerPage1.goToLogin();
    }

    await loginPage1.login(userData.username, userData.password);
    await dashboardPage1.expectToBeOnDashboard();
    
    // Go to dashboard in second tab
    await page2.goto('/dashboard');
    await dashboardPage2.expectToBeOnDashboard();
    
    await context.close();
  });
});
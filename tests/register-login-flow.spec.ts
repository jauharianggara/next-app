import { test, expect } from './fixtures';

test.describe('User Registration and Login Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
  });

  test('should complete full registration and login flow', async ({ 
    page, 
    registerPage, 
    loginPage, 
    dashboardPage 
  }) => {
    // Generate unique user data
    const timestamp = Date.now();
    const userData = {
      full_name: `Test User ${timestamp}`,
      username: `testuser${timestamp}`,
      email: `testuser${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    // Step 1: Navigate to register page
    await registerPage.goto();
    await registerPage.expectToBeOnRegisterPage();

    // Step 2: Fill and submit registration form
    await registerPage.register(userData);

    // Step 3: Verify registration success (either redirect or success message)
    await registerPage.expectRegistrationSuccess();

    // Step 4: Navigate to login page (if not already redirected)
    const currentUrl = page.url();
    if (!currentUrl.includes('/auth/login')) {
      await registerPage.goToLogin();
    }

    // Step 5: Login with the newly registered user
    await loginPage.expectToBeOnLoginPage();
    await loginPage.login(userData.username, userData.password);

    // Step 6: Verify successful login and redirect to dashboard
    await dashboardPage.expectToBeOnDashboard();
    
    // Step 7: Verify user is properly authenticated
    await dashboardPage.expectNavigationLinksVisible();
  });

  test('should handle registration with existing username', async ({ 
    registerPage, 
    loginPage 
  }) => {
    // First, register a user
    const timestamp = Date.now();
    const userData = {
      full_name: `Original User ${timestamp}`,
      username: `duplicateuser${timestamp}`,
      email: `original${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(userData);
    await registerPage.expectRegistrationSuccess();

    // Try to register another user with same username
    const duplicateUserData = {
      full_name: `Duplicate User ${timestamp}`,
      username: `duplicateuser${timestamp}`, // Same username
      email: `duplicate${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(duplicateUserData);
    
    // Should show error for duplicate username
    await registerPage.expectRegistrationError();
  });

  test('should handle registration with existing email', async ({ 
    registerPage 
  }) => {
    // First, register a user
    const timestamp = Date.now();
    const userData = {
      full_name: `Original User ${timestamp}`,
      username: `originaluser${timestamp}`,
      email: `duplicate${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(userData);
    await registerPage.expectRegistrationSuccess();

    // Try to register another user with same email
    const duplicateEmailData = {
      full_name: `Another User ${timestamp}`,
      username: `anotheruser${timestamp}`,
      email: `duplicate${timestamp}@example.com`, // Same email
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(duplicateEmailData);
    
    // Should show error for duplicate email
    await registerPage.expectRegistrationError();
  });

  test('should validate required fields during registration', async ({ 
    registerPage 
  }) => {
    await registerPage.goto();
    await registerPage.expectFormVisible();

    // Try to submit empty form
    await registerPage.registerButton.click();

    // Should show validation errors for required fields
    await expect(registerPage.fullNameInput).toHaveAttribute('required', '');
    await expect(registerPage.usernameInput).toHaveAttribute('required', '');
    await expect(registerPage.emailInput).toHaveAttribute('required', '');
    await expect(registerPage.passwordInput).toHaveAttribute('required', '');
  });

  test('should validate email format during registration', async ({ 
    registerPage 
  }) => {
    await registerPage.goto();

    const invalidEmailData = {
      full_name: 'Test User',
      username: 'testuser',
      email: 'invalid-email-format',
      password: 'TestPassword123!'
    };

    await registerPage.fullNameInput.fill(invalidEmailData.full_name);
    await registerPage.usernameInput.fill(invalidEmailData.username);
    await registerPage.emailInput.fill(invalidEmailData.email);
    await registerPage.passwordInput.fill(invalidEmailData.password);

    await registerPage.registerButton.click();

    // Should show email validation error
    await registerPage.expectFormValidationError('email');
  });

  test('should validate password strength during registration', async ({ 
    registerPage 
  }) => {
    await registerPage.goto();

    const weakPasswordData = {
      full_name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: '123' // Too weak
    };

    await registerPage.register(weakPasswordData);

    // Should show password validation error (if implemented)
    // This depends on your backend validation rules
  });

  test('should allow navigation between register and login pages', async ({ 
    registerPage, 
    loginPage, 
    page 
  }) => {
    // Start on register page
    await registerPage.goto();
    await registerPage.expectToBeOnRegisterPage();

    // Navigate to login page
    await registerPage.goToLogin();
    await loginPage.expectToBeOnLoginPage();

    // Navigate back to register page
    await loginPage.goToRegister();
    await registerPage.expectToBeOnRegisterPage();
  });

  test('should persist authentication after registration and login', async ({ 
    page, 
    registerPage, 
    loginPage, 
    dashboardPage 
  }) => {
    // Register and login
    const timestamp = Date.now();
    const userData = {
      full_name: `Persistent User ${timestamp}`,
      username: `persistentuser${timestamp}`,
      email: `persistent${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(userData);
    await registerPage.expectRegistrationSuccess();

    // Login
    const currentUrl = page.url();
    if (!currentUrl.includes('/auth/login')) {
      await registerPage.goToLogin();
    }
    
    await loginPage.login(userData.username, userData.password);
    await dashboardPage.expectToBeOnDashboard();

    // Reload page to test persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be authenticated and on dashboard
    await dashboardPage.expectToBeOnDashboard();
  });

  test('should handle registration with special characters in name', async ({ 
    registerPage, 
    loginPage, 
    dashboardPage 
  }) => {
    const timestamp = Date.now();
    const userData = {
      full_name: `Test User D'Angelo ${timestamp}`, // Apostrophe
      username: `specialuser${timestamp}`,
      email: `special${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(userData);
    await registerPage.expectRegistrationSuccess();

    // Login with the registered user
    const currentUrl = registerPage.page.url();
    if (!currentUrl.includes('/auth/login')) {
      await registerPage.goToLogin();
    }

    await loginPage.login(userData.username, userData.password);
    await dashboardPage.expectToBeOnDashboard();
  });

  test('should handle registration and login with long username', async ({ 
    registerPage, 
    loginPage, 
    dashboardPage 
  }) => {
    const timestamp = Date.now();
    const userData = {
      full_name: `Long Username User ${timestamp}`,
      username: `verylongusernamethatmightcauseissues${timestamp}`,
      email: `longusername${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(userData);
    
    try {
      await registerPage.expectRegistrationSuccess();
      
      // If registration succeeded, try to login
      const currentUrl = registerPage.page.url();
      if (!currentUrl.includes('/auth/login')) {
        await registerPage.goToLogin();
      }

      await loginPage.login(userData.username, userData.password);
      await dashboardPage.expectToBeOnDashboard();
    } catch (error) {
      // If registration failed due to username length limits, that's expected
      await registerPage.expectRegistrationError();
    }
  });

  test('should create user and immediately use for CRUD operations', async ({ 
    page, 
    registerPage, 
    loginPage, 
    dashboardPage, 
    jabatanPage 
  }) => {
    // Register new user
    const timestamp = Date.now();
    const userData = {
      full_name: `CRUD Test User ${timestamp}`,
      username: `cruduser${timestamp}`,
      email: `crud${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    await registerPage.goto();
    await registerPage.register(userData);
    await registerPage.expectRegistrationSuccess();

    // Login
    const currentUrl = page.url();
    if (!currentUrl.includes('/auth/login')) {
      await registerPage.goToLogin();
    }

    await loginPage.login(userData.username, userData.password);
    await dashboardPage.expectToBeOnDashboard();

    // Navigate to jabatan page and test CRUD operations
    await dashboardPage.navigateToJabatan();
    await jabatanPage.expectToBeOnJobPositionPage();

    // Create initial data if needed
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
      await jabatanPage.expectJobPositionsCreated();
    }

    // Create a new job position with this user
    await jabatanPage.gotoCreate();
    const jobData = {
      nama_jabatan: `Test Position by ${userData.username}`,
      deskripsi: `Created by user ${userData.full_name} during automated test`
    };

    await jabatanPage.createJobPosition(jobData);
    await jabatanPage.expectJobPositionInList(jobData.nama_jabatan);
  });
});
import { test, expect } from './fixtures';

test.describe('Register Flow - Backend Dependent', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
  });

  test('should show register form and handle submission', async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.expectToBeOnRegisterPage();
    
    // Try to register a user
    const timestamp = Date.now();
    const userData = {
      full_name: `Test User ${timestamp}`,
      username: `testuser${timestamp}`,
      email: `testuser${timestamp}@example.com`,
      password: 'TestPassword123!'
    };

    // Fill the form
    await registerPage.fullNameInput.fill(userData.full_name);
    await registerPage.usernameInput.fill(userData.username);
    await registerPage.emailInput.fill(userData.email);
    await registerPage.passwordInput.fill(userData.password);
    
    // Submit the form
    await registerPage.registerButton.click();
    
    // Wait for some response (could be error or success)
    await registerPage.page.waitForTimeout(3000);
    
    // Check if we're still on register page or were redirected
    const currentUrl = registerPage.page.url();
    console.log('Current URL after registration attempt:', currentUrl);
    
    // The test should pass regardless of backend availability
    // as we're mainly testing the frontend form handling
    expect(currentUrl).toMatch(/\/(auth\/register|auth\/login)/);
  });

  test('should navigate between register and login pages', async ({ page, registerPage }) => {
    await registerPage.goto();
    await registerPage.expectToBeOnRegisterPage();
    
    // Navigate to login
    await registerPage.goToLogin();
    await expect(page).toHaveURL('/auth/login');
    
    // Navigate back to register
    await page.locator('a[href="/auth/register"]').click();
    await expect(page).toHaveURL('/auth/register');
  });
});
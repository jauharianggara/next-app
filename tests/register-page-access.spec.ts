import { test, expect } from '@playwright/test';

test.describe('Register Page Access', () => {
  test('should be able to access register page directly', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    
    // Navigate directly to register page
    await page.goto('/auth/register');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the register page
    await expect(page).toHaveURL('/auth/register');
    
    // Check if register form is visible
    await expect(page.locator('#full_name')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
  
  test('should be able to access login page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/auth/login');
  });
});
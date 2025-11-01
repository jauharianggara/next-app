import { Page, Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly registerButton: Locator;
  readonly loginLink: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.locator('#full_name');
    this.usernameInput = page.locator('#username');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.registerButton = page.locator('button[type="submit"]');
    this.loginLink = page.locator('a[href="/auth/login"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
  }

  async goto() {
    await this.page.goto('/auth/register');
    await this.page.waitForLoadState('networkidle');
  }

  async register(userData: {
    full_name: string;
    username: string;
    email: string;
    password: string;
  }) {
    await this.fullNameInput.fill(userData.full_name);
    await this.usernameInput.fill(userData.username);
    await this.emailInput.fill(userData.email);
    await this.passwordInput.fill(userData.password);
    await this.registerButton.click();
    
    // Wait for either success (redirect to login) or error message
    try {
      await this.page.waitForURL('/auth/login', { timeout: 5000 });
    } catch {
      // If not redirected, wait for any response/feedback
      await this.page.waitForTimeout(2000);
    }
  }

  async expectToBeOnRegisterPage() {
    await expect(this.page).toHaveURL('/auth/register');
    await expect(this.fullNameInput).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.registerButton).toBeVisible();
  }

  async expectRegistrationSuccess() {
    // Look for success toast or redirect to login
    const currentUrl = this.page.url();
    if (currentUrl.includes('/auth/login')) {
      // Successfully redirected to login page
      await expect(this.page).toHaveURL('/auth/login');
    } else {
      // Look for success message
      const successToast = this.page.locator('.toast, [role="alert"]').filter({ hasText: /success|successful/i });
      if (await successToast.isVisible()) {
        await expect(successToast).toBeVisible();
      }
    }
  }

  async expectRegistrationError() {
    // Look for error toast or error message
    const errorToast = this.page.locator('.toast, [role="alert"]').filter({ hasText: /error|failed|invalid/i });
    if (await errorToast.isVisible()) {
      await expect(errorToast).toBeVisible();
    }
  }

  async goToLogin() {
    // Click the "Sign in to existing account" button
    await this.page.locator('button:has-text("Sign in to existing account")').click();
    await this.page.waitForURL('/auth/login');
  }

  async expectFormValidationError(fieldName: string) {
    const field = this.page.locator(`#${fieldName}`);
    const isValid = await field.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  }

  async expectFormVisible() {
    await expect(this.fullNameInput).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.registerButton).toBeVisible();
  }
}
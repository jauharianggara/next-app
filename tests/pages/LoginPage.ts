import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[name="username_or_email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.registerLink = page.locator('a[href="/auth/register"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  }

  async goto() {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    // Wait for navigation after login
    await this.page.waitForURL('/dashboard');
  }

  async loginWithInvalidCredentials(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    // Wait for error message
    await this.errorMessage.waitFor({ state: 'visible' });
  }

  async goToRegister() {
    await this.registerLink.click();
    await this.page.waitForURL('/auth/register');
  }

  async expectToBeOnLoginPage() {
    await expect(this.page).toHaveURL('/auth/login');
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible();
  }

  async expectLoginLoading() {
    await expect(this.loadingSpinner).toBeVisible();
  }
}
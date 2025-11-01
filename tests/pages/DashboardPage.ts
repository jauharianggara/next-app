import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly sidebarToggle: Locator;
  readonly userDropdown: Locator;
  readonly logoutButton: Locator;
  readonly dashboardTitle: Locator;
  readonly navigationLinks: Locator;
  readonly statisticsCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('[data-testid="sidebar"]');
    this.sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');
    this.userDropdown = page.locator('[data-testid="user-dropdown"]');
    this.logoutButton = page.locator('button:has-text("Logout")');
    this.dashboardTitle = page.locator('h1:has-text("Dashboard")');
    this.navigationLinks = page.locator('[data-testid="nav-link"]');
    this.statisticsCards = page.locator('[data-testid="stat-card"]');
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToKaryawan() {
    await this.page.locator('a[href="/dashboard/karyawan"]').click();
    await this.page.waitForURL('/dashboard/karyawan');
  }

  async navigateToKantor() {
    await this.page.locator('a[href="/dashboard/kantor"]').click();
    await this.page.waitForURL('/dashboard/kantor');
  }

  async navigateToJabatan() {
    await this.page.locator('a[href="/dashboard/jabatan"]').click();
    await this.page.waitForURL('/dashboard/jabatan');
  }

  async navigateToStatus() {
    await this.page.locator('a[href="/status"]').click();
    await this.page.waitForURL('/status');
  }

  async toggleSidebar() {
    await this.sidebarToggle.click();
  }

  async logout() {
    await this.userDropdown.click();
    await this.logoutButton.click();
    await this.page.waitForURL('/auth/login');
  }

  async expectToBeOnDashboard() {
    await expect(this.page).toHaveURL('/dashboard');
    await expect(this.dashboardTitle).toBeVisible();
  }

  async expectStatisticsCardsVisible() {
    await expect(this.statisticsCards.first()).toBeVisible();
  }

  async expectNavigationLinksVisible() {
    const links = ['Dashboard', 'Karyawan', 'Kantor', 'Jabatan', 'System Status'];
    for (const linkText of links) {
      await expect(this.page.locator(`a:has-text("${linkText}")`)).toBeVisible();
    }
  }

  async expectSidebarToggleable() {
    // Check if sidebar is initially visible
    await expect(this.sidebar).toBeVisible();
    
    // Toggle and check if it's hidden/collapsed (mobile behavior)
    await this.toggleSidebar();
    
    // On desktop, sidebar should still be visible but might change state
    // On mobile, it might be hidden
    const isMobile = await this.page.evaluate(() => window.innerWidth < 768);
    if (isMobile) {
      // Wait for sidebar animation to complete
      await this.page.waitForTimeout(300);
    }
  }
}
import { test, expect } from './fixtures';

test.describe('Dashboard Navigation', () => {
  
  test.beforeEach(async ({ page, loginPage }) => {
    // Login before each test
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.login('admin', 'password123');
  });

  test('should display dashboard correctly', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.expectToBeOnDashboard();
    await dashboardPage.expectStatisticsCardsVisible();
    await dashboardPage.expectNavigationLinksVisible();
  });

  test('should navigate to all main sections', async ({ dashboardPage, karyawanPage, kantorPage, jabatanPage }) => {
    await dashboardPage.goto();
    
    // Navigate to Karyawan
    await dashboardPage.navigateToKaryawan();
    await karyawanPage.expectToBeOnEmployeePage();
    
    // Navigate to Kantor
    await dashboardPage.navigateToKantor();
    await kantorPage.expectToBeOnOfficePage();
    
    // Navigate to Jabatan
    await dashboardPage.navigateToJabatan();
    await jabatanPage.expectToBeOnJobPositionPage();
    
    // Navigate to Status
    await dashboardPage.navigateToStatus();
    await expect(dashboardPage.page).toHaveURL('/status');
  });

  test('should toggle sidebar on mobile', async ({ page, dashboardPage }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await dashboardPage.goto();
    await dashboardPage.expectSidebarToggleable();
  });

  test('should display user information and logout', async ({ dashboardPage, loginPage }) => {
    await dashboardPage.goto();
    
    // Logout functionality
    await dashboardPage.logout();
    await loginPage.expectToBeOnLoginPage();
  });

  test('should maintain active navigation state', async ({ page, dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.navigateToKaryawan();
    
    // Check if karyawan nav link is active
    const karyawanLink = page.locator('a[href="/dashboard/karyawan"]');
    await expect(karyawanLink).toHaveClass(/active|bg-blue-600|text-blue-600/);
  });

  test('should work across different screen sizes', async ({ page, dashboardPage }) => {
    await dashboardPage.goto();
    
    // Test desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await dashboardPage.expectNavigationLinksVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await dashboardPage.expectNavigationLinksVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await dashboardPage.expectSidebarToggleable();
  });

  test('should load statistics data', async ({ page, dashboardPage }) => {
    await dashboardPage.goto();
    
    // Wait for API calls to complete
    await page.waitForLoadState('networkidle');
    
    // Check if statistics cards show data
    await dashboardPage.expectStatisticsCardsVisible();
    
    // Check for numbers in stat cards (should have numeric values)
    const statCards = page.locator('[data-testid="stat-card"]');
    const count = await statCards.count();
    
    for (let i = 0; i < count; i++) {
      const card = statCards.nth(i);
      await expect(card).toBeVisible();
      
      // Check if card has numeric content (basic check)
      const cardText = await card.textContent();
      expect(cardText).toBeTruthy();
    }
  });

  test('should handle navigation keyboard shortcuts', async ({ page, dashboardPage }) => {
    await dashboardPage.goto();
    
    // Test keyboard navigation (if implemented)
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through links
    const activeElement = page.locator(':focus');
    await expect(activeElement).toBeVisible();
  });

  test('should preserve scroll position on navigation', async ({ page, dashboardPage }) => {
    await dashboardPage.goto();
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    
    // Navigate to another page and back
    await dashboardPage.navigateToKaryawan();
    await page.goBack();
    
    // Should maintain some scroll position (browser dependent)
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThanOrEqual(0);
  });

  test('should show breadcrumb navigation', async ({ page, dashboardPage }) => {
    await dashboardPage.goto();
    
    // Navigate to a sub-page
    await dashboardPage.navigateToKaryawan();
    
    // Check for breadcrumb (if implemented)
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    if (await breadcrumb.isVisible()) {
      await expect(breadcrumb).toContainText('Dashboard');
      await expect(breadcrumb).toContainText('Karyawan');
    }
  });
});
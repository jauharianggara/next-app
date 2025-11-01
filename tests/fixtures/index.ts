import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { KaryawanPage } from '../pages/KaryawanPage';
import { KantorPage } from '../pages/KantorPage';
import { JabatanPage } from '../pages/JabatanPage';

// Test fixtures for page objects
type MyFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  dashboardPage: DashboardPage;
  karyawanPage: KaryawanPage;
  kantorPage: KantorPage;
  jabatanPage: JabatanPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  
  karyawanPage: async ({ page }, use) => {
    await use(new KaryawanPage(page));
  },
  
  kantorPage: async ({ page }, use) => {
    await use(new KantorPage(page));
  },
  
  jabatanPage: async ({ page }, use) => {
    await use(new JabatanPage(page));
  },
});

export { expect } from '@playwright/test';
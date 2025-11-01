import { Page, Locator, expect } from '@playwright/test';

export class KaryawanPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly employeeTable: Locator;
  readonly employeeRows: Locator;
  readonly noDataMessage: Locator;

  // Form elements
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly alamatInput: Locator;
  readonly kantorSelect: Locator;
  readonly jabatanSelect: Locator;
  readonly photoInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Employee Management")');
    this.createButton = page.locator('button:has-text("Add Employee")');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.employeeTable = page.locator('[data-testid="employee-table"]');
    this.employeeRows = page.locator('[data-testid="employee-row"]');
    this.noDataMessage = page.locator('text="No employees found"');

    // Form elements
    this.nameInput = page.locator('input[name="nama"]');
    this.emailInput = page.locator('input[name="email"]');
    this.phoneInput = page.locator('input[name="no_hp"]');
    this.alamatInput = page.locator('textarea[name="alamat"]');
    this.kantorSelect = page.locator('select[name="kantor_id"]');
    this.jabatanSelect = page.locator('select[name="jabatan_id"]');
    this.photoInput = page.locator('input[type="file"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("Cancel")');
  }

  async goto() {
    await this.page.goto('/dashboard/karyawan');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoCreate() {
    await this.page.goto('/dashboard/karyawan/create');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreateButton() {
    await this.createButton.click();
    await this.page.waitForURL('/dashboard/karyawan/create');
  }

  async searchEmployee(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500); // Wait for search debounce
  }

  async createEmployee(employeeData: {
    nama: string;
    email: string;
    no_hp: string;
    alamat: string;
    kantor_id?: string;
    jabatan_id?: string;
    photoPath?: string;
  }) {
    await this.nameInput.fill(employeeData.nama);
    await this.emailInput.fill(employeeData.email);
    await this.phoneInput.fill(employeeData.no_hp);
    await this.alamatInput.fill(employeeData.alamat);

    if (employeeData.kantor_id) {
      await this.kantorSelect.selectOption(employeeData.kantor_id);
    }

    if (employeeData.jabatan_id) {
      await this.jabatanSelect.selectOption(employeeData.jabatan_id);
    }

    if (employeeData.photoPath) {
      await this.photoInput.setInputFiles(employeeData.photoPath);
    }

    await this.submitButton.click();
    
    // Wait for success message or redirect
    await this.page.waitForURL('/dashboard/karyawan');
  }

  async editEmployee(employeeId: string, newData: Partial<{
    nama: string;
    email: string;
    no_hp: string;
    alamat: string;
  }>) {
    await this.page.goto(`/dashboard/karyawan/${employeeId}/edit`);
    await this.page.waitForLoadState('networkidle');

    if (newData.nama) {
      await this.nameInput.fill(newData.nama);
    }
    if (newData.email) {
      await this.emailInput.fill(newData.email);
    }
    if (newData.no_hp) {
      await this.phoneInput.fill(newData.no_hp);
    }
    if (newData.alamat) {
      await this.alamatInput.fill(newData.alamat);
    }

    await this.submitButton.click();
    await this.page.waitForURL('/dashboard/karyawan');
  }

  async deleteEmployee(employeeName: string) {
    const employeeRow = this.page.locator(`tr:has-text("${employeeName}")`);
    const deleteButton = employeeRow.locator('button:has-text("Delete")');
    
    await deleteButton.click();
    
    // Confirm deletion in modal
    await this.page.locator('button:has-text("Delete"):visible').click();
    
    // Wait for employee to be removed
    await expect(employeeRow).not.toBeVisible();
  }

  async viewEmployeeDetails(employeeName: string) {
    const employeeRow = this.page.locator(`tr:has-text("${employeeName}")`);
    const viewButton = employeeRow.locator('button:has-text("View")');
    
    await viewButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectToBeOnEmployeePage() {
    await expect(this.page).toHaveURL(/\/dashboard\/karyawan/);
    await expect(this.pageTitle).toBeVisible();
  }

  async expectEmployeeInList(employeeName: string) {
    await expect(this.page.locator(`tr:has-text("${employeeName}")`)).toBeVisible();
  }

  async expectEmployeeNotInList(employeeName: string) {
    await expect(this.page.locator(`tr:has-text("${employeeName}")`)).not.toBeVisible();
  }

  async expectFormValidationError(fieldName: string) {
    const errorLocator = this.page.locator(`[data-testid="${fieldName}-error"]`);
    await expect(errorLocator).toBeVisible();
  }

  async expectCreateFormVisible() {
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
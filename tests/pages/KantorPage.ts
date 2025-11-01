import { Page, Locator, expect } from '@playwright/test';

export class KantorPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly officeTable: Locator;
  readonly officeRows: Locator;
  readonly noDataMessage: Locator;

  // Form elements
  readonly nameInput: Locator;
  readonly alamatInput: Locator;
  readonly kodeKantorInput: Locator;
  readonly latitudeInput: Locator;
  readonly longitudeInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Office Management")');
    this.createButton = page.locator('button:has-text("Add Office")');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.officeTable = page.locator('[data-testid="office-table"]');
    this.officeRows = page.locator('[data-testid="office-row"]');
    this.noDataMessage = page.locator('text="No offices found"');

    // Form elements
    this.nameInput = page.locator('input[name="nama"]');
    this.alamatInput = page.locator('textarea[name="alamat"]');
    this.kodeKantorInput = page.locator('input[name="kode_kantor"]');
    this.latitudeInput = page.locator('input[name="latitude"]');
    this.longitudeInput = page.locator('input[name="longitude"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("Cancel")');
  }

  async goto() {
    await this.page.goto('/dashboard/kantor');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoCreate() {
    await this.page.goto('/dashboard/kantor/create');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreateButton() {
    await this.createButton.click();
    await this.page.waitForURL('/dashboard/kantor/create');
  }

  async searchOffice(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500); // Wait for search debounce
  }

  async createOffice(officeData: {
    nama: string;
    alamat: string;
    kode_kantor: string;
    latitude: string;
    longitude: string;
  }) {
    await this.nameInput.fill(officeData.nama);
    await this.alamatInput.fill(officeData.alamat);
    await this.kodeKantorInput.fill(officeData.kode_kantor);
    await this.latitudeInput.fill(officeData.latitude);
    await this.longitudeInput.fill(officeData.longitude);

    await this.submitButton.click();
    
    // Wait for success message or redirect
    await this.page.waitForURL('/dashboard/kantor');
  }

  async editOffice(officeId: string, newData: Partial<{
    nama: string;
    alamat: string;
    kode_kantor: string;
    latitude: string;
    longitude: string;
  }>) {
    await this.page.goto(`/dashboard/kantor/${officeId}/edit`);
    await this.page.waitForLoadState('networkidle');

    if (newData.nama) {
      await this.nameInput.fill(newData.nama);
    }
    if (newData.alamat) {
      await this.alamatInput.fill(newData.alamat);
    }
    if (newData.kode_kantor) {
      await this.kodeKantorInput.fill(newData.kode_kantor);
    }
    if (newData.latitude) {
      await this.latitudeInput.fill(newData.latitude);
    }
    if (newData.longitude) {
      await this.longitudeInput.fill(newData.longitude);
    }

    await this.submitButton.click();
    await this.page.waitForURL('/dashboard/kantor');
  }

  async deleteOffice(officeName: string) {
    const officeRow = this.page.locator(`tr:has-text("${officeName}")`);
    const deleteButton = officeRow.locator('button:has-text("Delete")');
    
    await deleteButton.click();
    
    // Confirm deletion in modal
    await this.page.locator('button:has-text("Delete"):visible').click();
    
    // Wait for office to be removed
    await expect(officeRow).not.toBeVisible();
  }

  async viewOfficeDetails(officeName: string) {
    const officeRow = this.page.locator(`tr:has-text("${officeName}")`);
    const viewButton = officeRow.locator('button:has-text("View")');
    
    await viewButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectToBeOnOfficePage() {
    await expect(this.page).toHaveURL(/\/dashboard\/kantor/);
    await expect(this.pageTitle).toBeVisible();
  }

  async expectOfficeInList(officeName: string) {
    await expect(this.page.locator(`tr:has-text("${officeName}")`)).toBeVisible();
  }

  async expectOfficeNotInList(officeName: string) {
    await expect(this.page.locator(`tr:has-text("${officeName}")`)).not.toBeVisible();
  }

  async expectFormValidationError(fieldName: string) {
    const errorLocator = this.page.locator(`[data-testid="${fieldName}-error"]`);
    await expect(errorLocator).toBeVisible();
  }

  async expectCreateFormVisible() {
    await expect(this.nameInput).toBeVisible();
    await expect(this.alamatInput).toBeVisible();
    await expect(this.kodeKantorInput).toBeVisible();
    await expect(this.latitudeInput).toBeVisible();
    await expect(this.longitudeInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectCoordinatesValid() {
    // Test that latitude is between -90 and 90
    const latValue = await this.latitudeInput.inputValue();
    const lat = parseFloat(latValue);
    expect(lat).toBeGreaterThanOrEqual(-90);
    expect(lat).toBeLessThanOrEqual(90);

    // Test that longitude is between -180 and 180
    const lngValue = await this.longitudeInput.inputValue();
    const lng = parseFloat(lngValue);
    expect(lng).toBeGreaterThanOrEqual(-180);
    expect(lng).toBeLessThanOrEqual(180);
  }
}
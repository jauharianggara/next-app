import { Page, Locator, expect } from '@playwright/test';

export class JabatanPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly createButton: Locator;
  readonly searchInput: Locator;
  readonly jobTable: Locator;
  readonly jobRows: Locator;
  readonly noDataMessage: Locator;
  readonly createInitialButton: Locator;
  readonly initialSetupCard: Locator;

  // Form elements
  readonly namaJabatanInput: Locator;
  readonly deskripsiInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("Job Position Management")');
    this.createButton = page.locator('button:has-text("Add Job Position")');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.jobTable = page.locator('[data-testid="job-table"]');
    this.jobRows = page.locator('[data-testid="job-row"]');
    this.noDataMessage = page.locator('text="No job positions found"');
    this.createInitialButton = page.locator('button:has-text("Create Initial Job Positions")');
    this.initialSetupCard = page.locator('text="No Job Positions Found"');

    // Form elements
    this.namaJabatanInput = page.locator('input[name="nama_jabatan"]');
    this.deskripsiInput = page.locator('textarea[name="deskripsi"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("Cancel")');
  }

  async goto() {
    await this.page.goto('/dashboard/jabatan');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoCreate() {
    await this.page.goto('/dashboard/jabatan/create');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreateButton() {
    await this.createButton.click();
    await this.page.waitForURL('/dashboard/jabatan/create');
  }

  async createInitialJobPositions() {
    await this.createInitialButton.click();
    
    // Wait for success toast or loading to complete
    await this.page.waitForTimeout(2000);
  }

  async searchJobPosition(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500); // Wait for search debounce
  }

  async createJobPosition(jobData: {
    nama_jabatan: string;
    deskripsi: string;
  }) {
    await this.namaJabatanInput.fill(jobData.nama_jabatan);
    await this.deskripsiInput.fill(jobData.deskripsi);

    await this.submitButton.click();
    
    // Wait for success message or redirect
    await this.page.waitForURL('/dashboard/jabatan');
  }

  async editJobPosition(jobId: string, newData: Partial<{
    nama_jabatan: string;
    deskripsi: string;
  }>) {
    await this.page.goto(`/dashboard/jabatan/${jobId}/edit`);
    await this.page.waitForLoadState('networkidle');

    if (newData.nama_jabatan) {
      await this.namaJabatanInput.fill(newData.nama_jabatan);
    }
    if (newData.deskripsi) {
      await this.deskripsiInput.fill(newData.deskripsi);
    }

    await this.submitButton.click();
    await this.page.waitForURL('/dashboard/jabatan');
  }

  async deleteJobPosition(jobName: string) {
    const jobRow = this.page.locator(`tr:has-text("${jobName}")`);
    const deleteButton = jobRow.locator('button:has-text("Delete")');
    
    await deleteButton.click();
    
    // Confirm deletion in modal
    await this.page.locator('button:has-text("Delete"):visible').click();
    
    // Wait for job position to be removed
    await expect(jobRow).not.toBeVisible();
  }

  async viewJobPositionDetails(jobName: string) {
    const jobRow = this.page.locator(`tr:has-text("${jobName}")`);
    const viewButton = jobRow.locator('button:has-text("View")');
    
    await viewButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectToBeOnJobPositionPage() {
    await expect(this.page).toHaveURL(/\/dashboard\/jabatan/);
    await expect(this.pageTitle).toBeVisible();
  }

  async expectJobPositionInList(jobName: string) {
    await expect(this.page.locator(`tr:has-text("${jobName}")`)).toBeVisible();
  }

  async expectJobPositionNotInList(jobName: string) {
    await expect(this.page.locator(`tr:has-text("${jobName}")`)).not.toBeVisible();
  }

  async expectInitialSetupVisible() {
    await expect(this.initialSetupCard).toBeVisible();
    await expect(this.createInitialButton).toBeVisible();
  }

  async expectInitialSetupHidden() {
    await expect(this.initialSetupCard).not.toBeVisible();
  }

  async expectFormValidationError(fieldName: string) {
    const errorLocator = this.page.locator(`[data-testid="${fieldName}-error"]`);
    await expect(errorLocator).toBeVisible();
  }

  async expectCreateFormVisible() {
    await expect(this.namaJabatanInput).toBeVisible();
    await expect(this.deskripsiInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectJobPositionsCreated() {
    // Check that initial job positions are created
    const expectedJobs = ['Manager', 'Developer', 'Designer', 'Analyst', 'Administrator'];
    
    for (const jobName of expectedJobs) {
      await this.expectJobPositionInList(jobName);
    }
  }
}
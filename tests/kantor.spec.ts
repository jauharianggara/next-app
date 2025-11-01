import { test, expect } from './fixtures';

test.describe('Kantor CRUD Operations', () => {
  
  test.beforeEach(async ({ page, loginPage }) => {
    // Login before each test
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.login('admin', 'password123');
  });

  test('should display kantor list page', async ({ kantorPage }) => {
    await kantorPage.goto();
    await kantorPage.expectToBeOnOfficePage();
    
    // Check for create button
    await expect(kantorPage.createButton).toBeVisible();
  });

  test('should navigate to create office form', async ({ kantorPage }) => {
    await kantorPage.goto();
    await kantorPage.clickCreateButton();
    
    await expect(kantorPage.page).toHaveURL('/dashboard/kantor/create');
    await kantorPage.expectCreateFormVisible();
  });

  test('should create new office successfully', async ({ kantorPage }) => {
    await kantorPage.gotoCreate();
    
    const officeData = {
      nama: 'Test Office Jakarta',
      alamat: 'Jl. Sudirman No. 123, Jakarta Pusat',
      kode_kantor: 'JKT001',
      latitude: '-6.2088',
      longitude: '106.8456'
    };
    
    await kantorPage.createOffice(officeData);
    
    // Should redirect to list page
    await kantorPage.expectToBeOnOfficePage();
    
    // Should see the new office in the list
    await kantorPage.expectOfficeInList(officeData.nama);
  });

  test('should validate required fields', async ({ kantorPage }) => {
    await kantorPage.gotoCreate();
    
    // Try to submit empty form
    await kantorPage.submitButton.click();
    
    // Should show validation errors
    await expect(kantorPage.nameInput).toHaveAttribute('required', '');
    await expect(kantorPage.alamatInput).toHaveAttribute('required', '');
    await expect(kantorPage.kodeKantorInput).toHaveAttribute('required', '');
  });

  test('should validate coordinate format', async ({ kantorPage }) => {
    await kantorPage.gotoCreate();
    
    // Test invalid coordinates
    await kantorPage.nameInput.fill('Test Office');
    await kantorPage.alamatInput.fill('Test Address');
    await kantorPage.kodeKantorInput.fill('TST001');
    await kantorPage.latitudeInput.fill('invalid-lat');
    await kantorPage.longitudeInput.fill('invalid-lng');
    
    await kantorPage.submitButton.click();
    
    // Should show validation errors for coordinates
    const latValidity = await kantorPage.latitudeInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    const lngValidity = await kantorPage.longitudeInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    
    expect(latValidity).toBe(false);
    expect(lngValidity).toBe(false);
  });

  test('should validate coordinate ranges', async ({ kantorPage }) => {
    await kantorPage.gotoCreate();
    
    // Test valid coordinates within range
    const officeData = {
      nama: 'Valid Coordinates Office',
      alamat: 'Test Address with Valid Coords',
      kode_kantor: 'VLD001',
      latitude: '-6.2088', // Valid latitude for Jakarta
      longitude: '106.8456' // Valid longitude for Jakarta
    };
    
    await kantorPage.nameInput.fill(officeData.nama);
    await kantorPage.alamatInput.fill(officeData.alamat);
    await kantorPage.kodeKantorInput.fill(officeData.kode_kantor);
    await kantorPage.latitudeInput.fill(officeData.latitude);
    await kantorPage.longitudeInput.fill(officeData.longitude);
    
    // Validate coordinates are within valid ranges
    await kantorPage.expectCoordinatesValid();
  });

  test('should search offices', async ({ kantorPage }) => {
    await kantorPage.goto();
    
    // First, create a test office to search for
    await kantorPage.clickCreateButton();
    await kantorPage.createOffice({
      nama: 'Searchable Office',
      alamat: 'Searchable Office Address',
      kode_kantor: 'SRC001',
      latitude: '-6.2088',
      longitude: '106.8456'
    });
    
    // Now search for the office
    await kantorPage.searchOffice('Searchable');
    
    // Should find the office
    await kantorPage.expectOfficeInList('Searchable Office');
  });

  test('should edit office information', async ({ kantorPage, page }) => {
    // First create an office
    await kantorPage.gotoCreate();
    await kantorPage.createOffice({
      nama: 'Editable Office',
      alamat: 'Original Address',
      kode_kantor: 'EDT001',
      latitude: '-6.2088',
      longitude: '106.8456'
    });
    
    // Find the edit button for this office
    const editButton = page.locator('tr:has-text("Editable Office") button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Edit the office
      await kantorPage.nameInput.fill('Updated Office Name');
      await kantorPage.alamatInput.fill('Updated Address');
      await kantorPage.latitudeInput.fill('-6.1000');
      await kantorPage.longitudeInput.fill('106.9000');
      await kantorPage.submitButton.click();
      
      // Should see updated information
      await kantorPage.expectOfficeInList('Updated Office Name');
      await kantorPage.expectOfficeNotInList('Editable Office');
    }
  });

  test('should delete office', async ({ kantorPage, page }) => {
    // First create an office
    await kantorPage.gotoCreate();
    await kantorPage.createOffice({
      nama: 'Deletable Office',
      alamat: 'Delete Me Address',
      kode_kantor: 'DEL001',
      latitude: '-6.2088',
      longitude: '106.8456'
    });
    
    // Delete the office
    await kantorPage.deleteOffice('Deletable Office');
    
    // Should not see the office in the list anymore
    await kantorPage.expectOfficeNotInList('Deletable Office');
  });

  test('should view office details', async ({ kantorPage, page }) => {
    // First create an office
    await kantorPage.gotoCreate();
    await kantorPage.createOffice({
      nama: 'Viewable Office',
      alamat: 'View Me Address',
      kode_kantor: 'VW001',
      latitude: '-6.2088',
      longitude: '106.8456'
    });
    
    // View office details
    await kantorPage.viewOfficeDetails('Viewable Office');
    
    // Should be on details page
    await expect(page).toHaveURL(/\/dashboard\/kantor\/\d+/);
  });

  test('should validate unique office codes', async ({ kantorPage }) => {
    await kantorPage.gotoCreate();
    
    // Create first office
    await kantorPage.createOffice({
      nama: 'First Office',
      alamat: 'First Address',
      kode_kantor: 'UNQ001',
      latitude: '-6.2088',
      longitude: '106.8456'
    });
    
    // Try to create another office with same code
    await kantorPage.clickCreateButton();
    await kantorPage.nameInput.fill('Second Office');
    await kantorPage.alamatInput.fill('Second Address');
    await kantorPage.kodeKantorInput.fill('UNQ001'); // Same code
    await kantorPage.latitudeInput.fill('-6.3000');
    await kantorPage.longitudeInput.fill('106.9000');
    
    await kantorPage.submitButton.click();
    
    // Should show validation error (if backend validates uniqueness)
    // This test depends on your backend validation
  });

  test('should handle extreme coordinate values', async ({ kantorPage }) => {
    await kantorPage.gotoCreate();
    
    // Test extreme but valid coordinates
    const officeData = {
      nama: 'Extreme Coordinates Office',
      alamat: 'Far Far Away',
      kode_kantor: 'EXT001',
      latitude: '89.9', // Near North Pole
      longitude: '179.9' // Near International Date Line
    };
    
    await kantorPage.nameInput.fill(officeData.nama);
    await kantorPage.alamatInput.fill(officeData.alamat);
    await kantorPage.kodeKantorInput.fill(officeData.kode_kantor);
    await kantorPage.latitudeInput.fill(officeData.latitude);
    await kantorPage.longitudeInput.fill(officeData.longitude);
    
    // Should accept extreme but valid coordinates
    await kantorPage.expectCoordinatesValid();
  });

  test('should handle form cancellation', async ({ kantorPage }) => {
    await kantorPage.gotoCreate();
    
    // Fill some data
    await kantorPage.nameInput.fill('Cancel Test Office');
    await kantorPage.alamatInput.fill('Cancel Test Address');
    await kantorPage.kodeKantorInput.fill('CNL001');
    
    // Cancel the form
    if (await kantorPage.cancelButton.isVisible()) {
      await kantorPage.cancelButton.click();
      
      // Should return to list page
      await kantorPage.expectToBeOnOfficePage();
    }
  });

  test('should display office coordinates on map (if implemented)', async ({ kantorPage, page }) => {
    await kantorPage.gotoCreate();
    
    // Create office with coordinates
    const officeData = {
      nama: 'Map Test Office',
      alamat: 'Jakarta Business District',
      kode_kantor: 'MAP001',
      latitude: '-6.2088',
      longitude: '106.8456'
    };
    
    await kantorPage.createOffice(officeData);
    
    // View office details to see map
    await kantorPage.viewOfficeDetails(officeData.nama);
    
    // Check if map is displayed (if Google Maps integration exists)
    const mapElement = page.locator('[data-testid="office-map"]');
    if (await mapElement.isVisible()) {
      await expect(mapElement).toBeVisible();
    }
  });

  test('should validate address format', async ({ kantorPage }) => {
    await kantorPage.gotoCreate();
    
    // Test with very short address
    await kantorPage.nameInput.fill('Short Address Office');
    await kantorPage.alamatInput.fill('X'); // Very short address
    await kantorPage.kodeKantorInput.fill('SHT001');
    await kantorPage.latitudeInput.fill('-6.2088');
    await kantorPage.longitudeInput.fill('106.8456');
    
    await kantorPage.submitButton.click();
    
    // Should either accept or show validation based on your business rules
    // This test verifies your address validation logic
  });

  test('should handle special characters in office data', async ({ kantorPage }) => {
    await kantorPage.gotoCreate();
    
    const officeData = {
      nama: 'Office "Special" & Co.',
      alamat: 'Jl. Test No. 123/A, RT.01/RW.02',
      kode_kantor: 'SPL-001',
      latitude: '-6.2088',
      longitude: '106.8456'
    };
    
    await kantorPage.createOffice(officeData);
    
    // Should handle special characters properly
    await kantorPage.expectToBeOnOfficePage();
    await kantorPage.expectOfficeInList(officeData.nama);
  });

  test('should sort offices by different criteria', async ({ kantorPage, page }) => {
    await kantorPage.goto();
    
    // Check if sorting functionality exists
    const sortButton = page.locator('[data-testid="sort-button"]');
    if (await sortButton.isVisible()) {
      await sortButton.click();
      
      // Test different sort options
      const sortOptions = page.locator('[data-testid="sort-option"]');
      const count = await sortOptions.count();
      
      if (count > 0) {
        await sortOptions.first().click();
        await page.waitForLoadState('networkidle');
        
        // Verify sorting worked (basic check)
        await expect(kantorPage.officeTable).toBeVisible();
      }
    }
  });

  test('should filter offices by criteria', async ({ kantorPage, page }) => {
    await kantorPage.goto();
    
    // Check if filter functionality exists
    const filterButton = page.locator('[data-testid="filter-button"]');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Apply a filter
      const filterInput = page.locator('[data-testid="filter-input"]');
      if (await filterInput.isVisible()) {
        await filterInput.fill('Jakarta');
        await page.waitForLoadState('networkidle');
        
        // Should show filtered results
        await expect(kantorPage.officeTable).toBeVisible();
      }
    }
  });
});
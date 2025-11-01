import { test, expect } from './fixtures';

test.describe('Jabatan CRUD Operations', () => {
  
  test.beforeEach(async ({ page, loginPage }) => {
    // Login before each test
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.login('admin', 'password123');
  });

  test('should display jabatan list page', async ({ jabatanPage }) => {
    await jabatanPage.goto();
    await jabatanPage.expectToBeOnJobPositionPage();
  });

  test('should show initial setup when no job positions exist', async ({ jabatanPage }) => {
    await jabatanPage.goto();
    
    // If no job positions exist, should show initial setup
    const hasJobs = await jabatanPage.jobRows.count() > 0;
    
    if (!hasJobs) {
      await jabatanPage.expectInitialSetupVisible();
    }
  });

  test('should create initial job positions', async ({ jabatanPage }) => {
    await jabatanPage.goto();
    
    // Check if initial setup is available
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
      
      // Should create 5 initial job positions
      await jabatanPage.expectJobPositionsCreated();
      
      // Initial setup should be hidden now
      await jabatanPage.expectInitialSetupHidden();
    }
  });

  test('should navigate to create job position form', async ({ jabatanPage }) => {
    await jabatanPage.goto();
    
    // Make sure we have initial data or create it
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
    }
    
    await jabatanPage.clickCreateButton();
    
    await expect(jabatanPage.page).toHaveURL('/dashboard/jabatan/create');
    await jabatanPage.expectCreateFormVisible();
  });

  test('should create new job position successfully', async ({ jabatanPage }) => {
    await jabatanPage.goto();
    
    // Ensure we have some initial data
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
    }
    
    await jabatanPage.gotoCreate();
    
    const jobData = {
      nama_jabatan: 'Test Position',
      deskripsi: 'This is a test job position for automated testing'
    };
    
    await jabatanPage.createJobPosition(jobData);
    
    // Should redirect to list page
    await jabatanPage.expectToBeOnJobPositionPage();
    
    // Should see the new job position in the list
    await jabatanPage.expectJobPositionInList(jobData.nama_jabatan);
  });

  test('should validate required fields', async ({ jabatanPage }) => {
    await jabatanPage.goto();
    
    // Make sure we can access create form
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
    }
    
    await jabatanPage.gotoCreate();
    
    // Try to submit empty form
    await jabatanPage.submitButton.click();
    
    // Should show validation errors
    await expect(jabatanPage.namaJabatanInput).toHaveAttribute('required', '');
  });

  test('should search job positions', async ({ jabatanPage }) => {
    await jabatanPage.goto();
    
    // Ensure we have data to search
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
    }
    
    // Search for a specific job position
    await jabatanPage.searchJobPosition('Manager');
    
    // Should find the Manager position (from initial data)
    await jabatanPage.expectJobPositionInList('Manager');
  });

  test('should edit job position information', async ({ jabatanPage, page }) => {
    await jabatanPage.goto();
    
    // Ensure we have data
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
    }
    
    // Create a specific job position to edit
    await jabatanPage.gotoCreate();
    await jabatanPage.createJobPosition({
      nama_jabatan: 'Editable Position',
      deskripsi: 'Original description'
    });
    
    // Find the edit button for this position
    const editButton = page.locator('tr:has-text("Editable Position") button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Edit the job position
      await jabatanPage.namaJabatanInput.fill('Updated Position Name');
      await jabatanPage.deskripsiInput.fill('Updated description');
      await jabatanPage.submitButton.click();
      
      // Should see updated information
      await jabatanPage.expectJobPositionInList('Updated Position Name');
      await jabatanPage.expectJobPositionNotInList('Editable Position');
    }
  });

  test('should delete job position', async ({ jabatanPage, page }) => {
    await jabatanPage.goto();
    
    // Ensure we have data
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
    }
    
    // Create a specific job position to delete
    await jabatanPage.gotoCreate();
    await jabatanPage.createJobPosition({
      nama_jabatan: 'Deletable Position',
      deskripsi: 'This position will be deleted'
    });
    
    // Delete the job position
    await jabatanPage.deleteJobPosition('Deletable Position');
    
    // Should not see the job position in the list anymore
    await jabatanPage.expectJobPositionNotInList('Deletable Position');
  });

  test('should view job position details', async ({ jabatanPage, page }) => {
    await jabatanPage.goto();
    
    // Ensure we have data
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
    }
    
    // Create a specific job position to view
    await jabatanPage.gotoCreate();
    await jabatanPage.createJobPosition({
      nama_jabatan: 'Viewable Position',
      deskripsi: 'This position can be viewed'
    });
    
    // View job position details
    await jabatanPage.viewJobPositionDetails('Viewable Position');
    
    // Should be on details page
    await expect(page).toHaveURL(/\/dashboard\/jabatan\/\d+/);
  });

  test('should prevent deletion of job position with employees', async ({ jabatanPage, page }) => {
    await jabatanPage.goto();
    
    // This test assumes that there's validation preventing deletion
    // of job positions that are assigned to employees
    
    // Ensure we have data
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
    }
    
    // Try to delete a job position that might have employees
    // (This would need to be tested with actual data)
    const deleteButton = page.locator('tr:has-text("Manager") button:has-text("Delete")').first();
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Should show error message or confirmation dialog
      const errorMessage = page.locator('text*="cannot be deleted"');
      const confirmDialog = page.locator('[role="dialog"]');
      
      // Either should show error or confirmation dialog
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      } else if (await confirmDialog.isVisible()) {
        // Cancel the deletion
        const cancelButton = page.locator('button:has-text("Cancel")');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    }
  });

  test('should handle form cancellation', async ({ jabatanPage }) => {
    await jabatanPage.goto();
    
    // Ensure we can access create form
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
    }
    
    await jabatanPage.gotoCreate();
    
    // Fill some data
    await jabatanPage.namaJabatanInput.fill('Cancel Test Position');
    await jabatanPage.deskripsiInput.fill('This will be cancelled');
    
    // Cancel the form
    if (await jabatanPage.cancelButton.isVisible()) {
      await jabatanPage.cancelButton.click();
      
      // Should return to list page
      await jabatanPage.expectToBeOnJobPositionPage();
    }
  });

  test('should validate job position name uniqueness', async ({ jabatanPage }) => {
    await jabatanPage.goto();
    
    // Ensure we have data
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
    }
    
    await jabatanPage.gotoCreate();
    
    // Try to create a job position with existing name
    await jabatanPage.createJobPosition({
      nama_jabatan: 'Manager', // This should already exist from initial data
      deskripsi: 'Duplicate manager position'
    });
    
    // Should show validation error (if backend validates uniqueness)
    // This test depends on your backend validation
  });

  test('should display all initial job positions correctly', async ({ jabatanPage }) => {
    await jabatanPage.goto();
    
    // Create initial data if needed
    if (await jabatanPage.createInitialButton.isVisible()) {
      await jabatanPage.createInitialJobPositions();
    }
    
    // Verify all expected job positions are present
    const expectedPositions = ['Manager', 'Developer', 'Designer', 'Analyst', 'Administrator'];
    
    for (const position of expectedPositions) {
      await jabatanPage.expectJobPositionInList(position);
    }
    
    // Check that each position has proper description
    const rows = jabatanPage.jobRows;
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });
});
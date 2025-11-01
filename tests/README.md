# Playwright Testing Suite

This directory contains comprehensive end-to-end tests for the Employee & Office Management application using Playwright.

## Test Structure

### Test Files
- `auth.spec.ts` - Authentication flow tests (login, logout, JWT handling)
- `dashboard.spec.ts` - Dashboard navigation and layout tests  
- `karyawan.spec.ts` - Employee CRUD operation tests
- `jabatan.spec.ts` - Job position management tests
- `api-integration.spec.ts` - API proxy and backend connectivity tests

### Page Objects
- `pages/LoginPage.ts` - Login page interactions
- `pages/DashboardPage.ts` - Dashboard navigation helpers
- `pages/KaryawanPage.ts` - Employee management page objects
- `pages/KantorPage.ts` - Office management page objects
- `pages/JabatanPage.ts` - Job position page objects

### Test Fixtures
- `fixtures/index.ts` - Custom test fixtures with page objects
- `fixtures/test-image.jpg` - Test image for photo upload tests
- `global-setup.ts` - Global test setup and application readiness check
- `global-teardown.ts` - Global cleanup after all tests

## Running Tests

### All Tests
```bash
npm run test
```

### Specific Test Suites
```bash
npm run test:auth      # Authentication tests only
npm run test:dashboard # Dashboard tests only  
npm run test:karyawan  # Employee CRUD tests only
npm run test:jabatan   # Job position tests only
npm run test:api       # API integration tests only
```

### Browser-Specific Tests
```bash
npm run test:chromium  # Chrome/Chromium only
npm run test:firefox   # Firefox only
npm run test:webkit    # Safari/WebKit only
npm run test:mobile    # Mobile Chrome simulation
```

### Debug & Development
```bash
npm run test:headed    # Run with browser GUI visible
npm run test:ui        # Run with Playwright UI mode
npm run test:debug     # Run in debug mode with breakpoints
npm run test:report    # Show HTML test report
```

## Test Features

### Authentication Tests
- ✅ Login/logout functionality
- ✅ JWT token handling and persistence
- ✅ Protected route access control
- ✅ Session management across tabs
- ✅ Token expiration handling

### Dashboard Tests  
- ✅ Navigation between sections
- ✅ Sidebar toggle functionality
- ✅ Responsive design testing
- ✅ Statistics card loading
- ✅ Cross-device compatibility

### Employee (Karyawan) Tests
- ✅ Create new employees with validation
- ✅ Photo upload functionality
- ✅ Edit employee information
- ✅ Delete employees
- ✅ Search and filter employees
- ✅ Form validation and error handling

### Job Position (Jabatan) Tests
- ✅ Initial data setup functionality
- ✅ Create/edit/delete job positions
- ✅ Search job positions
- ✅ Dependency validation (prevent deletion if in use)
- ✅ Initial setup when database is empty

### API Integration Tests
- ✅ Proxy endpoint functionality
- ✅ CORS handling
- ✅ Authentication header forwarding
- ✅ Error handling and timeouts
- ✅ Backend connectivity status
- ✅ Data consistency validation

## Test Configuration

### Browsers Tested
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5 simulation)
- Mobile Safari (iPhone 12 simulation)

### Test Environment
- Base URL: `http://localhost:3000`
- Backend proxy: `/api/proxy/*`
- Authentication: JWT cookies
- Screenshots: On failure only
- Videos: On failure only
- Traces: On retry only

## Prerequisites

### Application Setup
1. Backend server running on `localhost:8080`
2. Frontend development server running on `localhost:3000`
3. Valid test user credentials (admin/password123)
4. Database with initial test data

### Test Dependencies
```bash
npm install @playwright/test
npx playwright install
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Playwright Tests
  run: npm run test
  env:
    CI: true
```

### Test Parallelization
- Tests run in parallel by default
- Can be configured in `playwright.config.ts`
- CI mode uses single worker for stability

## Best Practices

### Page Objects
- All page interactions are abstracted into Page Object classes
- Locators are defined as class properties
- Complex actions are wrapped in methods
- Assertions are included in page objects for reusability

### Test Data
- Use realistic but identifiable test data
- Clean up test data after each test when possible
- Use unique identifiers to avoid conflicts

### Error Handling
- Tests handle missing elements gracefully
- Backend connectivity issues are expected and handled
- Form validation is thoroughly tested

### Performance
- Tests wait for network idle state
- Timeouts are configured appropriately
- Concurrent requests are tested

## Troubleshooting

### Common Issues

1. **Backend Not Running**
   - Ensure backend server is on port 8080
   - Check API proxy configuration
   - Verify CORS settings

2. **Authentication Failures**
   - Verify test credentials are correct
   - Check JWT token handling
   - Ensure cookies are properly set

3. **Element Not Found**
   - Check if page objects match actual selectors
   - Verify page load states
   - Update selectors if UI changed

4. **Test Timeouts**
   - Increase timeout in playwright.config.ts
   - Check for slow network/backend responses
   - Verify test data dependencies

### Debug Mode
```bash
npm run test:debug -- --grep "specific test name"
```

This will open the browser with developer tools and pause execution for inspection.

## Contributing

When adding new tests:
1. Follow the existing page object pattern
2. Add appropriate test data cleanup
3. Include both positive and negative test cases
4. Test responsive behavior where applicable
5. Update this README with new test coverage
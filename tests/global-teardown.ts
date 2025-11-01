import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting Playwright Global Teardown');
  
  // Add any cleanup tasks here
  // For example: cleanup test data, close external services, etc.
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;
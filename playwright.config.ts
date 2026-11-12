import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/browser',
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: process.env.VSAFE_WEB_URL || 'http://localhost:5173',
    headless: true,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  reporter: [['list'], ['html', { open: 'never' }]],
});

import { defineConfig } from '@playwright/test';

// End-to-end tests drive the real kiosk (and the command center) against the local server, which uses the
// Neon database from .env. Locally they use the installed Chrome; in CI set CI=1 and install Chromium.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 180_000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' } },
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{arg}{ext}',
  reporter: [['list']],
  workers: 1,
  use: {
    baseURL: 'http://localhost:3001',
    viewport: { width: 1664, height: 936 },
    channel: process.env.CI ? undefined : 'chrome',
  },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3001/api/progress-tabs',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

import { defineConfig, devices } from '@playwright/test'

// Local dev machines behind an HTTP proxy (http_proxy env) must not route
// localhost through it — it breaks the webServer availability check.
process.env.no_proxy = [process.env.no_proxy, 'localhost,127.0.0.1'].filter(Boolean).join(',')

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  maxFailures: process.env.CI ? 10 : undefined,
  // The html report is never uploaded as a CI artifact; line is cheaper there.
  reporter: process.env.CI ? 'line' : 'html',
  use: {
    baseURL: 'http://localhost:5397',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    // Dedicated e2e port + strictPort: other projects' dev servers squatting
    // on vite's default 5173 must neither be reused nor silently shifted past.
    // Preview the built playground: ~7s once vs dev-mode per-page transform
    // cost on every one of ~74 page loads.
    command: 'npx vite build && npx vite preview --port 5397 --strictPort',
    url: 'http://localhost:5397',
    reuseExistingServer: !process.env.CI,
    cwd: './playground/vite',
  },
})

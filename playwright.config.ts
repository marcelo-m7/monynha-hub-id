import { defineConfig } from '@playwright/test'

export default defineConfig({
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'ignore',
  },
  testDir: 'e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
})

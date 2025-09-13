import { test, expect } from '@playwright/test'

test('unauthenticated users are redirected to sign-in', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/auth\/sign-in/)
})

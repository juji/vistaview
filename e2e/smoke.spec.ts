import { test, expect } from '@playwright/test'

const APPS: { name: string; port: number; skipRoutes?: string[] }[] = [
  { name: 'vanilla', port: 3001, skipRoutes: ['/hook'] },
  { name: 'next', port: 3002 },
  { name: 'nuxt', port: 3003 },
  { name: 'svelte', port: 3004 },
  { name: 'solid', port: 3005 },
]

const ROUTES = ['/', '/hook', '/extension'] as const

for (const app of APPS) {
  for (const route of ROUTES) {
    if (app.skipRoutes?.includes(route)) continue

    test(`${app.name} ${route} — loads and lightbox opens`, async ({ page }) => {
      await page.goto(`http://localhost:${app.port}${route}`, { waitUntil: 'networkidle' })
      await page.waitForSelector('#vvw-root', { state: 'detached', timeout: 1000 }).catch(() => {})

      const link = page.locator('a img').first().locator('xpath=..')
      await expect(link).toBeVisible({ timeout: 15000 })
      await link.click()
      await expect(page.locator('#vvw-root.vvw--active')).toBeVisible({ timeout: 5000 })

      await page.keyboard.press('Escape')
      await expect(page.locator('#vvw-root.vvw--closing')).toBeVisible({ timeout: 3000 })
    })
  }
}

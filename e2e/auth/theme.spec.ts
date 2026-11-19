import { test, expect, type Page } from '@playwright/test'

async function openThemeFixture(page: Page, preference: string | null = null) {
  await page.addInitScript(value => {
    if (!sessionStorage.getItem('asca-theme-fixture')) {
      if (value === null) localStorage.removeItem('theme')
      else localStorage.setItem('theme', value)
      sessionStorage.setItem('asca-theme-fixture', '1')
    }
    localStorage.setItem('asca-language', 'ko')
  }, preference)
  await page.context().route('**/*', async route => {
    const local = ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname)
    if (
      !local &&
      ['script', 'document', 'xhr', 'fetch', 'media'].includes(route.request().resourceType())
    )
      await route.abort()
    else await route.continue()
  })
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  await page.goto('/sign-in', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: '다크 모드', exact: true })).toBeEnabled()
}

for (const width of [390, 1440]) {
  test(`${width}px: OS가 다크여도 첫 화면은 라이트, 클릭·키보드·선택 유지`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await openThemeFixture(page)
    const root = page.locator('html')
    const button = page.getByRole('button', { name: '다크 모드', exact: true })
    await expect(root).toHaveClass(/\blight\b/)
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    const size = await button.boundingBox()
    expect(size!.width).toBeGreaterThanOrEqual(48)
    expect(size!.height).toBeGreaterThanOrEqual(48)
    const lightBackground = await page
      .locator('body')
      .evaluate(body => getComputedStyle(body).backgroundColor)
    await button.click()
    await expect(root).toHaveClass(/\bdark\b/)
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expect
      .poll(() => page.locator('body').evaluate(body => getComputedStyle(body).backgroundColor))
      .not.toBe(lightBackground)
    await page.screenshot({ path: test.info().outputPath(`theme-dark-${width}.png`) })
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(root).toHaveClass(/\bdark\b/)
    await page.goto('/faq', { waitUntil: 'domcontentloaded' })
    await expect(button).toBeEnabled()
    await expect(root).toHaveClass(/\bdark\b/)
    await button.focus()
    await page.keyboard.press('Enter')
    await expect(root).toHaveClass(/\blight\b/)
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(root).toHaveClass(/\blight\b/)
    for (let count = 0; count < 4; count++) {
      await button.click()
      await expect(root).toHaveClass(count % 2 === 0 ? /\bdark\b/ : /\blight\b/)
    }
    await page.screenshot({ path: test.info().outputPath(`theme-light-${width}.png`) })
  })
}

test('이전 자동 설정은 라이트로 전환하고, 직접 고른 다크는 복원한다', async ({ browser }) => {
  for (const [saved, expected] of [
    ['system', 'light'],
    ['dark', 'dark'],
  ]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
    try {
      const page = await context.newPage()
      const themeHydrationErrors: string[] = []
      page.on('console', message => {
        if (message.type() === 'error' && message.text().includes('<ThemeToggle>'))
          themeHydrationErrors.push(message.text())
      })
      await openThemeFixture(page, saved)
      await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${expected}\\b`))
      await expect(page.getByRole('button', { name: '다크 모드', exact: true })).toHaveAttribute(
        'title',
        expected === 'dark' ? '라이트 모드로 바꾸기' : '다크 모드로 바꾸기'
      )
      expect(themeHydrationErrors).toEqual([])
      await page.reload({ waitUntil: 'domcontentloaded' })
      await expect(page.getByRole('button', { name: '다크 모드', exact: true })).toBeEnabled()
      await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${expected}\\b`))
      expect(themeHydrationErrors).toEqual([])
    } finally {
      await context.close()
    }
  }
})

import { test, expect, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { RECOVERY_EMAIL_SUBJECT } from '../../lib/auth/recovery-email'

const officePhone = 'tel:+8250255508700'
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('asca-language', 'ko'))
})
function localUrl(value: string | undefined) {
  const url = new URL(value || '')
  if (url.hostname !== '127.0.0.1') throw Error('Local service required')
  return url
}
function admin() {
  return createClient(
    localUrl(process.env.AUTH_E2E_API_URL).toString(),
    process.env.AUTH_E2E_SERVICE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
async function recoveryLink(email: string) {
  const mailbox = localUrl(process.env.AUTH_E2E_MAIL_URL)
  for (let i = 0; i < 60; i++) {
    const response = await fetch(new URL('/api/v1/messages', mailbox))
    const data = await response.json()
    const item = data.messages?.find(
      (m: { Subject: string; To: { Address: string }[] }) =>
        m.Subject === RECOVERY_EMAIL_SUBJECT && m.To.some(to => to.Address === email)
    )
    if (item) {
      const detail = await fetch(new URL(`/api/v1/message/${item.ID}`, mailbox)).then(r => r.json())
      const html = (detail.HTML || detail.Text).replaceAll('&amp;', '&')
      const link = html.match(/https?:\/\/[^\s"<>]+\/auth\/v1\/verify\?[^\s"<>]+/)?.[0]
      if (!link) throw Error('Local recovery link missing')
      localUrl(link)
      return link as string
    }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw Error('Local recovery mail did not arrive')
}
async function tabTo(page: Page, locator: ReturnType<Page['getByRole']>) {
  for (let i = 0; i < 50; i++) {
    await page.keyboard.press('Tab')
    if (await locator.evaluate(el => el === document.activeElement)) return
  }
  throw Error('Keyboard could not reach the requested control')
}

test('기존 회원: 로그인 실패 → 메일 → 새 비밀번호 → 로그인 상태로 내 공간', async ({ page }) => {
  const email = `recovery-${randomUUID()}@example.test`
  const password = `Existing-${randomUUID()}!`
  const client = admin()
  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  expect(error).toBeNull()
  try {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/sign-in')
    await expect(
      page.getByText('예전 홈페이지에서 쓰시던 비밀번호는 옮겨지지 않았습니다.')
    ).toBeVisible()
    await tabTo(page, page.getByLabel('이메일', { exact: true }))
    await page.keyboard.type(email)
    await page.keyboard.press('Tab')
    await page.keyboard.type('old-webflow-password')
    await tabTo(page, page.getByRole('button', { name: '로그인', exact: true }))
    await page.keyboard.press('Enter')
    await expect(page.locator('.asca-auth [role="alert"]')).toContainText('맞지 않습니다')
    const resetLink = page
      .getByRole('link', { name: '비밀번호 새로 만들기 →', exact: true })
      .first()
    await tabTo(page, resetLink)
    await page.keyboard.press('Enter')
    await expect(page.getByLabel('이메일', { exact: true })).toHaveValue(email)
    await tabTo(
      page,
      page.getByRole('button', { name: '비밀번호 재설정 메일 보내기', exact: true })
    )
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: '안내 메일을 확인해 주세요' })).toBeFocused()
    await expect(page.getByText(email, { exact: true })).toBeVisible()
    await expect(page.getByText(RECOVERY_EMAIL_SUBJECT, { exact: true })).toBeVisible()
    const link = await recoveryLink(email)
    // The user's mailbox is outside the app. Follow the real local mail in the same browser for PKCE.
    await page.goto(link)
    await expect(page).toHaveURL(/\/reset-password$/)
    const nextPassword = `New-password-${randomUUID()}!`
    await tabTo(page, page.getByLabel('비밀번호', { exact: true }))
    await page.keyboard.type(nextPassword)
    await tabTo(page, page.getByLabel('비밀번호 확인', { exact: true }))
    await page.keyboard.type(nextPassword)
    await tabTo(page, page.getByRole('button', { name: '새 비밀번호 저장', exact: true }))
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/profile\?password=updated$/)
    await expect(page.getByRole('status')).toContainText('로그인된 상태')
    const session = await page.request.get('/api/auth/session')
    expect(session.ok()).toBeTruthy()
    expect((await session.json()).account.id).toBe(data.user!.id)
  } finally {
    await client.auth.admin.deleteUser(data.user!.id)
  }
})

test('만료된 재설정 링크는 새 링크 요청과 사무국 도움말로 안내', async ({ page }) => {
  await page.goto('/auth/callback?code=expired-fixture&next=/reset-password')
  await expect(page).toHaveURL(/\/forgot-password\?error=callback$/)
  await expect(page.locator('.asca-auth [role="alert"]')).toContainText('새 링크')
  await expect(page.locator(`a[href="${officePhone}"]`)).toBeVisible()
})

for (const width of [360, 390, 768, 1440]) {
  for (const color of ['light', 'dark'] as const) {
    test(`로그인·재설정 ${width}px ${color}: 200% 글자, 키보드, axe`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.addInitScript(theme => localStorage.setItem('theme', theme), color)
      for (const path of ['/sign-in', '/forgot-password', '/reset-password', '/sign-up']) {
        await page.goto(path)
        await expect(page.locator('.asca-auth')).toBeVisible()
        await expect(page.locator('.asca-auth input').first()).toBeVisible()
        await page.evaluate(() => {
          document.documentElement.style.fontSize = '200%'
        })
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1
        )
        expect(overflow).toBeFalsy()
        const input = page.locator('.asca-auth input:not([type="checkbox"])').first()
        expect(
          await input.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
        ).toBeGreaterThanOrEqual(34)
        const button = page.locator('.asca-auth button').first()
        expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(48)
        await tabTo(page, input)
        await expect(input).toBeFocused()
        // addScriptTag also listens to unrelated iframe CSP errors. Inject this
        // test tool in the main frame without changing the application's CSP.
        await page.evaluate(axeSource)
        const violations = await page.evaluate(
          async () =>
            (
              await (window as any).axe.run(document.querySelector('.asca-auth__form'), {
                runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'],
              })
            ).violations
        )
        expect(
          violations.map((v: { id: string; impact: string }) => `${v.id}:${v.impact}`)
        ).toEqual([])
        await page.screenshot({
          path: testInfo.outputPath(`${width}-${color}-${path.slice(1)}.png`),
          fullPage: true,
        })
      }
    })
  }
}

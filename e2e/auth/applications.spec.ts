import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
test('로그인한 미연결 회원이 내 신청을 눌러도 로그인으로 되돌아가지 않는다', async ({ page }) => {
  const api = process.env.AUTH_E2E_API_URL!
  expect(new URL(api).hostname).toBe('127.0.0.1')
  const service = createClient(api, process.env.AUTH_E2E_SERVICE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const email = `applications-${randomUUID()}@example.test`,
    password = `Fixture-${randomUUID()}!`
  const created = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Fixture User' },
  })
  expect(created.error).toBeNull()
  try {
    await page.addInitScript(() => localStorage.setItem('asca-language', 'ko'))
    await page.goto('/sign-in')
    await page.getByLabel('이메일', { exact: true }).fill(email)
    await page.getByLabel('비밀번호', { exact: true }).fill(password)
    await page.getByRole('button', { name: '로그인', exact: true }).click()
    await expect(page).toHaveURL(/\/profile$/)
    await page.getByRole('button', { name: 'F', exact: true }).click()
    await page.getByRole('menuitem', { name: '내 신청', exact: true }).click()
    await expect(page).toHaveURL(/\/profile\/applications$/)
    await expect(
      page.getByText('연결된 작가 정보가 없습니다. 사무국에 작가 계정 연결을 요청해 주세요.', {
        exact: true,
      })
    ).toBeVisible()
    await expect(page.getByRole('link', { name: '작가 페이지 연결', exact: true })).toHaveAttribute(
      'href',
      '/profile'
    )
    await page.reload()
    await expect(page).toHaveURL(/\/profile\/applications$/)
    await expect(page.getByLabel('비밀번호', { exact: true })).toHaveCount(0)
  } finally {
    await service.auth.admin.deleteUser(created.data.user!.id)
  }
})

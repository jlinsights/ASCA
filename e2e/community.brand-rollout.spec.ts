/**
 * ASCA Community Page Rollout — E2E (D8)
 *
 * Plan: docs/01-plan/features/asca-community-page-rollout.plan.md
 * Design: docs/02-design/features/asca-community-page-rollout.design.md §7
 * Parent: e2e/home.brand-rollout.spec.ts (LanguageContext 'asca-language' 패턴)
 *
 * 4언어 × 5영역 visible + SealMark 인주색 + OQ#2 placeholder 안전동작 + 정회원 분기 면적 < 15%.
 * 시각 회귀 baseline은 분리 사이클 `asca-homepage-brand-visual-regression-baseline`.
 */

import { test, expect, Page } from '@playwright/test'

const LANGUAGES = ['ko', 'en', 'ja', 'zh'] as const
type Language = (typeof LANGUAGES)[number]

const SECTION_HEADINGS: ReadonlyArray<{
  id: string
  name: string
}> = [
  { id: 'community-hero-heading', name: 'hero' },
  { id: 'community-dao-heading', name: 'dao' },
  { id: 'community-imseo-heading', name: 'imseo' },
  { id: 'community-cafe-heading', name: 'cafe' },
  { id: 'community-membership-heading', name: 'membership' },
]

async function gotoCommunityWithLanguage(page: Page, language: Language) {
  await page.addInitScript(lang => {
    window.localStorage.setItem('asca-language', lang)
  }, language)
  await page.goto('/community')
}

test.describe('community / brand-rollout — 4언어 × 5영역 회귀', () => {
  for (const lang of LANGUAGES) {
    test.describe(`language=${lang}`, () => {
      test('SealMark 인장 모티프가 보이고 同道 텍스트를 포함한다', async ({ page }) => {
        await gotoCommunityWithLanguage(page, lang)
        const seal = page.getByRole('img', { name: '협회 인장 동도' })
        await expect(seal).toBeVisible()
        await expect(seal).toContainText('同道')
      })

      test('5영역 헤딩이 모두 보인다', async ({ page }) => {
        await gotoCommunityWithLanguage(page, lang)
        for (const section of SECTION_HEADINGS) {
          await expect(page.locator(`#${section.id}`)).toBeVisible()
        }
      })

      test('DaoArchitecture 3 카드가 모두 보인다', async ({ page }) => {
        await gotoCommunityWithLanguage(page, lang)
        const cards = page.locator('section[aria-labelledby="community-dao-heading"] article')
        await expect(cards).toHaveCount(3)
      })

      test('CafeEntry 2 채널 버튼이 보이고 라우트가 걸려 있다', async ({ page }) => {
        await gotoCommunityWithLanguage(page, lang)
        const cafeNav = page.getByRole('navigation', {
          name: 'Cafe and open chat entries',
        })
        await expect(cafeNav).toBeVisible()
        const links = cafeNav.locator('a')
        await expect(links).toHaveCount(2)
      })

      test('OQ#2 placeholder 안전동작 — URL # 일 때 버튼이 disabled', async ({ page }) => {
        await gotoCommunityWithLanguage(page, lang)
        const cafeNav = page.getByRole('navigation', {
          name: 'Cafe and open chat entries',
        })
        const links = cafeNav.locator('a')
        for (let i = 0; i < 2; i++) {
          const link = links.nth(i)
          const href = await link.getAttribute('href')
          if (href === '#') {
            await expect(link).toHaveAttribute('aria-disabled', 'true')
            await expect(link.locator('button')).toBeDisabled()
          }
        }
      })

      test('MembershipBranch /membership 라우트', async ({ page }) => {
        await gotoCommunityWithLanguage(page, lang)
        const membership = page.locator('section[aria-labelledby="community-membership-heading"] a')
        await expect(membership.first()).toHaveAttribute('href', '/membership')
      })

      test('ImseoCard 사무국 메일 mailto: 링크', async ({ page }) => {
        await gotoCommunityWithLanguage(page, lang)
        const mail = page.locator('a[href="mailto:info@orientalcalligraphy.org"]')
        await expect(mail.first()).toBeVisible()
      })
    })
  }
})

test.describe('community / brand-rollout — 정회원 분기 면적 < 15% (OQ#4 정신)', () => {
  test('MembershipBranch height < 페이지 height × 15%', async ({ page }) => {
    await gotoCommunityWithLanguage(page, 'ko')
    const membership = page.locator('section[aria-labelledby="community-membership-heading"]')
    const main = page.locator('main')
    const membershipBox = await membership.boundingBox()
    const mainBox = await main.boundingBox()
    expect(membershipBox).not.toBeNull()
    expect(mainBox).not.toBeNull()
    if (membershipBox && mainBox) {
      const ratio = membershipBox.height / mainBox.height
      expect(ratio).toBeLessThan(0.15)
    }
  })
})

test.describe('community / brand-rollout — 시각 통일성', () => {
  test('SealMark는 모든 언어에서 동일 X 좌표 (±2px)', async ({ page }) => {
    const positions: Record<Language, { x: number } | null> = {
      ko: null,
      en: null,
      ja: null,
      zh: null,
    }

    for (const lang of LANGUAGES) {
      await gotoCommunityWithLanguage(page, lang)
      const seal = page.getByRole('img', { name: '협회 인장 동도' })
      await expect(seal).toBeVisible()
      const box = await seal.boundingBox()
      expect(box).not.toBeNull()
      positions[lang] = box ? { x: box.x } : null
    }

    const xs = LANGUAGES.map(l => positions[l]?.x ?? -1)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    expect(maxX - minX).toBeLessThanOrEqual(2)
  })
})

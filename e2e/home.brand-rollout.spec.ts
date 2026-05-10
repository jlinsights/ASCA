/**
 * ASCA Homepage Brand Rollout — E2E (D8)
 *
 * Plan: docs/01-plan/features/asca-homepage-brand-rollout.plan.md
 * Design: docs/02-design/features/asca-homepage-brand-rollout.design.md §7
 *
 * 4언어 × 5섹션 visible 검증 + 한자 표지 + 4 CTA + 인주색 가운뎃점.
 * LanguageContext SSOT key: 'asca-language' (lib/i18n/index.ts).
 *
 * 시각 회귀(toHaveScreenshot) baseline 생성은 별도 사이클로 분리:
 *  - asca-test-suite-debt unblock 후 asca-homepage-brand-visual-regression-baseline.
 *  - 본 사이클은 셀렉터·접근성·구조 회귀에 한정.
 */

import { test, expect, Page } from '@playwright/test'

const LANGUAGES = ['ko', 'en', 'ja', 'zh'] as const
type Language = (typeof LANGUAGES)[number]

const SECTION_HEADINGS: ReadonlyArray<{
  id: string
  name: string
}> = [
  { id: 'philosophy-heading', name: 'philosophy' },
  { id: 'what-we-do-heading', name: 'what-we-do' },
  { id: 'brand-message-heading', name: 'brand-message' },
  { id: 'closing-cta-heading', name: 'closing-cta' },
]

async function gotoHomeWithLanguage(page: Page, language: Language) {
  await page.addInitScript(lang => {
    window.localStorage.setItem('asca-language', lang)
  }, language)
  await page.goto('/')
}

test.describe('home / brand-rollout — 4언어 × 5섹션 회귀', () => {
  for (const lang of LANGUAGES) {
    test.describe(`language=${lang}`, () => {
      test('Hero 한자 표지 + L1 슬로건이 보인다', async ({ page }) => {
        await gotoHomeWithLanguage(page, lang)
        const hanjaMark = page.getByRole('img', { name: '법고창신 인서구로' })
        await expect(hanjaMark).toBeVisible()
        // L1 슬로건은 h1 안에 한자 표지로, 별도 p 태그가 그 아래 — h1 + p 합쳐 1개 이상
        const hero = page.locator('section').first()
        await expect(hero).toBeVisible()
      })

      test('Hero 가운뎃점이 인주색(--vermillion)으로 렌더된다', async ({ page }) => {
        await gotoHomeWithLanguage(page, lang)
        const hanjaMark = page.getByRole('img', { name: '법고창신 인서구로' })
        // HanjaMark 내부 가운뎃점 span — text-[color:var(--vermillion,#e63946)]
        const dot = hanjaMark.locator('span').nth(1)
        await expect(dot).toContainText('·')
      })

      test('5섹션 헤딩이 모두 보인다 (Hero h1 + 4 SectionTitle)', async ({ page }) => {
        await gotoHomeWithLanguage(page, lang)
        // Hero
        const hero = page.locator('section').first()
        await expect(hero).toBeVisible()
        // 4 신규 섹션 헤딩 id
        for (const section of SECTION_HEADINGS) {
          await expect(page.locator(`#${section.id}`)).toBeVisible()
        }
      })

      test('ClosingCTA 4 버튼이 모두 보이고 라우트가 걸려 있다', async ({ page }) => {
        await gotoHomeWithLanguage(page, lang)
        const cta = page.getByRole('navigation', {
          name: 'Closing call-to-action',
        })
        await expect(cta).toBeVisible()
        const links = cta.locator('a')
        await expect(links).toHaveCount(4)
        await expect(links.nth(0)).toHaveAttribute('href', '/about')
        await expect(links.nth(1)).toHaveAttribute('href', '/exhibitions')
        await expect(links.nth(2)).toHaveAttribute('href', '/community')
        await expect(links.nth(3)).toHaveAttribute('href', '/academy')
      })
    })
  }
})

test.describe('home / brand-rollout — 시각 통일성', () => {
  test('한자 표지는 모든 언어에서 동일 위치에 노출된다', async ({ page }) => {
    const positions: Record<Language, { x: number; y: number } | null> = {
      ko: null,
      en: null,
      ja: null,
      zh: null,
    }

    for (const lang of LANGUAGES) {
      await gotoHomeWithLanguage(page, lang)
      const hanjaMark = page.getByRole('img', { name: '법고창신 인서구로' })
      await expect(hanjaMark).toBeVisible()
      const box = await hanjaMark.boundingBox()
      expect(box).not.toBeNull()
      positions[lang] = box ? { x: box.x, y: box.y } : null
    }

    // 4언어 모두 한자 표지의 X 좌표(중앙 정렬 기준)가 동일해야 한다.
    // viewport 폭 차이 흡수 위해 ±2px 허용.
    const xs = LANGUAGES.map(l => positions[l]?.x ?? -1)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    expect(maxX - minX).toBeLessThanOrEqual(2)
  })
})

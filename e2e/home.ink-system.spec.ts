/**
 * ASCA Homepage — Ink System Editorial (Claude Design 'ASCA Design System' 시안)
 *
 * 이전: home.brand-rollout.spec.ts (Philosophy·WhatWeDo·BrandMessage·ClosingCTA 섹션 —
 * 홈에서 제거됨). 4언어 × 구조·링크 회귀만 본다. 시각 회귀 baseline 은 별도 과제.
 * LanguageContext SSOT key: 'asca-language' (lib/i18n/index.ts).
 */

import { test, expect, Page } from '@playwright/test'

const LANGUAGES = ['ko', 'en', 'ja', 'zh'] as const
type Language = (typeof LANGUAGES)[number]

async function gotoHomeWithLanguage(page: Page, language: Language) {
  await page.addInitScript(lang => {
    window.localStorage.setItem('asca-language', lang)
  }, language)
  await page.goto('/')
}

test.describe('home / ink-system — 4언어 구조 회귀', () => {
  for (const lang of LANGUAGES) {
    test.describe(`language=${lang}`, () => {
      test('Hero: h1·슬로건·실적 장부가 보인다', async ({ page }) => {
        await gotoHomeWithLanguage(page, lang)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        await expect(page.getByText('法古創新 · 人書俱老')).toBeVisible()
        // 장부 수치는 연혁 데이터에서 계산 — 최소 창립 연도·교류국은 항상 있다
        const stats = page.locator('.asca-hero__stat')
        expect(await stats.count()).toBeGreaterThanOrEqual(3)
        await expect(stats.first().locator('dd')).toHaveText('1997')
      })

      test('Hero CTA 가 연혁·소개로 연결된다', async ({ page }) => {
        await gotoHomeWithLanguage(page, lang)
        const hero = page.locator('.asca-hero')
        await expect(hero.locator('a[href="/history"]')).toBeVisible()
        await expect(hero.locator('a[href="/introductions"]')).toBeVisible()
      })

      test('전시·학술·입회 섹션이 모두 보인다', async ({ page }) => {
        await gotoHomeWithLanguage(page, lang)
        for (const id of ['asca-ex-title', 'asca-journal-title', 'asca-join-title']) {
          await expect(page.locator(`#${id}`)).toBeVisible()
        }
        expect(await page.locator('.asca-ex').count()).toBeGreaterThan(0)
      })

      test('학술 글 링크는 이 사이트의 /blog/<slug> 를 같은 창에서 연다', async ({ page }) => {
        await gotoHomeWithLanguage(page, lang)
        const links = page.locator('.asca-news__title a')
        expect(await links.count()).toBeGreaterThan(0)
        await expect(links.first()).toHaveAttribute('href', /^\/blog\/[a-z0-9-]+$/)
        await expect(links.first()).not.toHaveAttribute('target', '_blank')
      })

      test('입회 섹션이 입회 안내·문의로 연결된다', async ({ page }) => {
        await gotoHomeWithLanguage(page, lang)
        const join = page.locator('#join')
        await expect(join.locator('a[href="/membership"]')).toBeVisible()
        await expect(join.locator('a[href="/contact"]')).toBeVisible()
      })
    })
  }
})

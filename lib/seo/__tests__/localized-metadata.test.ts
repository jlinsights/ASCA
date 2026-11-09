import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { localizedPaths, PREFIXED_LANGUAGES } from '@/lib/i18n/locale-routing'
import { SIMPLIFIED_ONLY_CHARS } from '@/lib/i18n/simplified-only'
import { REGULATIONS, regulationHref } from '@/lib/regulations/catalog'
import { languageAlternates, localizeMetadata } from '../localized-metadata'
import { LOCALIZED_PAGE_COPY } from '../localized-page-copy'
import { regulationPageCopy } from '../regulation-page-copy'

const HANGUL = /[가-힣ㄱ-ㆎ]/
const REGULATION_PATHS = new Set(REGULATIONS.map(entry => regulationHref(entry.slug)))
/** 고정 페이지(규정 상세는 규정 이름표로 따로 만든다) */
const PAGE_PATHS = localizedPaths().filter(p => !REGULATION_PATHS.has(p))
const APP = path.join(__dirname, '..', '..', '..', 'app')

const BASE: Metadata = {
  title: '연혁 | 동양서예협회',
  description: '사단법인 동양서예협회의 연혁을 소개합니다.',
  alternates: { canonical: '/history' },
  openGraph: { title: '연혁 | 동양서예협회', images: ['/og.jpg'] },
}

describe('언어 주소 메타데이터 번역표', () => {
  it('번역된 고정 페이지마다 세 언어 제목·설명이 있고, 목록에 없는 주소는 없다', () => {
    expect(Object.keys(LOCALIZED_PAGE_COPY).sort()).toEqual([...PAGE_PATHS].sort())
  })

  const entries = Object.entries(LOCALIZED_PAGE_COPY).flatMap(([route, copy]) =>
    PREFIXED_LANGUAGES.map(lang => [route, lang, copy[lang]] as const)
  )

  it.each(entries)('%s (%s) — 비어 있지 않고 한글이 없다', (_route, _lang, copy) => {
    expect(copy.title.trim()).not.toBe('')
    expect(copy.description.trim().length).toBeGreaterThanOrEqual(30)
    expect(HANGUL.test(copy.title + copy.description)).toBe(false)
  })

  it('중국어는 번체다 — 간체 전용 글자가 없다', () => {
    const zh = Object.values(LOCALIZED_PAGE_COPY)
      .map(copy => copy.zh.title + copy.zh.description)
      .join('')
    expect(SIMPLIFIED_ONLY_CHARS.filter(char => zh.includes(char))).toEqual([])
  })

  it('언어마다 제목이 서로 겹치지 않는다', () => {
    for (const lang of PREFIXED_LANGUAGES) {
      const titles = Object.values(LOCALIZED_PAGE_COPY).map(copy => copy[lang].title)
      expect(new Set(titles).size).toBe(titles.length)
    }
  })

  it.each(PAGE_PATHS)('%s 페이지가 generateMetadata 로 번역표를 연결한다', route => {
    const file = path.join(APP, route === '/' ? '' : route, 'page.tsx')
    // Prettier 가 긴 줄을 접으므로 공백을 무시하고 본다
    const source = fs.readFileSync(file, 'utf8').replace(/\s+/g, '')
    expect(source).toContain(`localizedPageMetadata('${route}',metadata)`)
  })

  it.each(REGULATIONS.map(entry => entry.nameKey))('규정 %s 는 세 언어 이름이 있다', nameKey => {
    for (const lang of PREFIXED_LANGUAGES) {
      const copy = regulationPageCopy(nameKey, lang)
      expect(copy?.title).toBeTruthy()
      expect(HANGUL.test(`${copy?.title}${copy?.description}`)).toBe(false)
    }
  })
})

describe('localizeMetadata', () => {
  it('영어 주소는 영어 제목·자기 canonical·네 언어 hreflang 을 단다', () => {
    const meta = localizeMetadata(BASE, '/history', 'en')
    expect(meta.title).toBe('History | ASCA')
    expect(meta.description).toBe(LOCALIZED_PAGE_COPY['/history'].en.description)
    expect(meta.alternates?.canonical).toBe('/en/history')
    expect(meta.alternates?.languages).toEqual({
      ko: '/history',
      en: '/en/history',
      ja: '/ja/history',
      'zh-Hant': '/zh/history',
      'x-default': '/history',
    })
    expect(meta.openGraph).toMatchObject({
      title: 'History | ASCA',
      url: '/en/history',
      locale: 'en_US',
      images: ['/og.jpg'],
    })
  })

  it('공유 이미지·큰 카드를 잃지 않는다 — 페이지가 openGraph·twitter 를 안 달아도', () => {
    const meta = localizeMetadata(
      { title: '연혁 | 동양서예협회', alternates: { canonical: '/history' } },
      '/history',
      'en'
    )
    expect(meta.openGraph).toMatchObject({ images: [{ url: '/images/og-default.jpg' }] })
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      images: ['/images/og-default.jpg'],
      title: 'History | ASCA',
    })
  })

  it('중국어·일본어는 협회 이름을 그 언어로 붙인다', () => {
    expect(localizeMetadata(BASE, '/history', 'zh').title).toBe('沿革 | 東洋書藝協會')
    expect(localizeMetadata(BASE, '/history', 'ja').title).toBe('沿革 | 東洋書道協会')
    expect(localizeMetadata(BASE, '/history', 'zh').openGraph).toMatchObject({ locale: 'zh_TW' })
  })

  it('한국어는 제목·설명을 그대로 두고 hreflang 만 더한다', () => {
    const meta = localizeMetadata(BASE, '/history', 'ko')
    expect(meta.title).toBe(BASE.title)
    expect(meta.description).toBe(BASE.description)
    expect(meta.alternates?.canonical).toBe('/history')
    expect(meta.alternates?.languages).toMatchObject({ en: '/en/history', 'x-default': '/history' })
  })

  it('홈은 협회 이름을 두 번 달지 않고, 언어 주소는 /en 이다', () => {
    const meta = localizeMetadata(BASE, '/', 'en')
    expect(meta.title).toBe(LOCALIZED_PAGE_COPY['/'].en.title)
    expect(meta.alternates?.canonical).toBe('/en')
    expect(meta.alternates?.languages).toMatchObject({ ko: '/', en: '/en', 'zh-Hant': '/zh' })
  })

  it('번역 안 된 페이지는 hreflang 을 달지 않는다', () => {
    expect(languageAlternates('/privacy-policy')).toBeUndefined()
    const meta = localizeMetadata(
      { ...BASE, alternates: { canonical: '/privacy-policy' } },
      '/privacy-policy',
      'ko'
    )
    expect(meta.alternates?.languages).toBeUndefined()
    expect(meta.alternates?.canonical).toBe('/privacy-policy')
  })
})

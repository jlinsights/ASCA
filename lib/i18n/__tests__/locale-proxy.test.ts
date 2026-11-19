/** @jest-environment node */
import { NextRequest, NextResponse } from 'next/server'
import { decideLocale, rememberLocale } from '../locale-proxy'

const BASE = 'https://orientalcalligraphy.org'
const CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const req = (
  path: string,
  init: { method?: string; cookie?: string; headers?: Record<string, string> } = {}
) =>
  new NextRequest(BASE + path, {
    method: init.method ?? 'GET',
    headers: { ...(init.cookie ? { cookie: init.cookie } : {}), ...init.headers },
  })
const visitor = (extra: Record<string, string>) => ({ 'user-agent': CHROME, ...extra })

describe('decideLocale', () => {
  it('번역된 페이지의 언어 주소는 접두사를 뗀 주소로 rewrite 하고 언어를 넘긴다', () => {
    const d = decideLocale(req('/en/history?tab=1'))
    expect(d.kind).toBe('rewrite')
    if (d.kind !== 'rewrite') return
    expect(d.rewrite.pathname).toBe('/history')
    expect(d.rewrite.search).toBe('?tab=1')
    expect(d.language).toBe('en')
  })

  it('/ja 는 홈을 일본어로 그린다', () => {
    const d = decideLocale(req('/ja'))
    expect(d).toMatchObject({ kind: 'rewrite', language: 'ja', path: '/' })
  })

  it('번역 안 된 페이지의 언어 주소는 한국어 주소로 307', () => {
    const d = decideLocale(req('/en/privacy-policy'))
    expect(d.kind).toBe('redirect')
    if (d.kind === 'redirect') expect(d.location.pathname).toBe('/privacy-policy')
  })

  it('보호 경로에 접두사를 붙여도 한국어 주소로 보내 로그인 검사를 거치게 한다', () => {
    const d = decideLocale(req('/en/profile'))
    expect(d.kind).toBe('redirect')
    if (d.kind === 'redirect') expect(d.location.pathname).toBe('/profile')
  })

  it('언어 선택 쿠키가 있으면 한국어 주소에서 그 언어 주소로 보낸다', () => {
    const d = decideLocale(req('/contact?x=1', { cookie: 'asca-lang=zh' }))
    expect(d.kind).toBe('redirect')
    if (d.kind === 'redirect')
      expect(d.location.pathname + d.location.search).toBe('/zh/contact?x=1')
  })

  it('쿠키가 있어도 번역 안 된 페이지는 한국어 주소에 둔다', () => {
    expect(decideLocale(req('/blog/gyeomjae-jeongseon', { cookie: 'asca-lang=en' }))).toEqual({
      kind: 'pass',
      path: '/blog/gyeomjae-jeongseon',
    })
  })

  it('쿠키가 ko·모르는 값이면 그대로', () => {
    expect(decideLocale(req('/history', { cookie: 'asca-lang=ko' })).kind).toBe('pass')
    expect(decideLocale(req('/history', { cookie: 'asca-lang=fr' })).kind).toBe('pass')
  })

  it('쿠키 없는 한국어 주소(검색 로봇 포함)는 그대로', () => {
    expect(decideLocale(req('/history'))).toEqual({ kind: 'pass', path: '/history' })
  })

  it('POST 는 주소를 바꾸지 않는다', () => {
    expect(decideLocale(req('/contact', { method: 'POST', cookie: 'asca-lang=en' })).kind).toBe(
      'pass'
    )
    expect(decideLocale(req('/en/api/x', { method: 'POST' })).kind).toBe('pass')
  })

  describe('첫 방문 홈', () => {
    it('일본 브라우저는 /ja 로 307 — 쿼리는 그대로', () => {
      const d = decideLocale(
        req('/?utm=x', { headers: visitor({ 'accept-language': 'ja-JP,ja' }) })
      )
      expect(d.kind).toBe('redirect')
      if (d.kind === 'redirect') {
        expect(d.location.pathname + d.location.search).toBe('/ja?utm=x')
        expect(d.firstVisit).toBe(true)
      }
    })

    it('브라우저 언어가 지원 밖이면 접속 국가로 — 대만은 /zh', () => {
      const d = decideLocale(
        req('/', { headers: visitor({ 'accept-language': 'fr', 'x-vercel-ip-country': 'TW' }) })
      )
      expect(d).toMatchObject({ kind: 'redirect' })
      if (d.kind === 'redirect') expect(d.location.pathname).toBe('/zh')
    })

    it('한국어 브라우저는 그대로 한국어 홈', () => {
      const d = decideLocale(req('/', { headers: visitor({ 'accept-language': 'ko-KR' }) }))
      expect(d).toEqual({ kind: 'pass', path: '/' })
    })

    it('언어를 고른 적이 있으면(한국어 포함) 판단하지 않는다', () => {
      const headers = visitor({ 'accept-language': 'en-US', 'x-vercel-ip-country': 'US' })
      expect(decideLocale(req('/', { cookie: 'asca-lang=ko', headers }))).toEqual({
        kind: 'pass',
        path: '/',
      })
    })

    it('검색 로봇은 미국에서 와도 한국어 홈을 받는다', () => {
      const d = decideLocale(
        req('/', {
          headers: {
            'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
            'accept-language': 'en-US',
            'x-vercel-ip-country': 'US',
          },
        })
      )
      expect(d).toEqual({ kind: 'pass', path: '/' })
    })

    it('홈이 아닌 주소는 첫 방문이라도 보내지 않는다', () => {
      const d = decideLocale(req('/history', { headers: visitor({ 'accept-language': 'ja' }) }))
      expect(d).toEqual({ kind: 'pass', path: '/history' })
    })

    it('POST 는 보내지 않는다', () => {
      const d = decideLocale(
        req('/', { method: 'POST', headers: visitor({ 'accept-language': 'ja' }) })
      )
      expect(d.kind).toBe('pass')
    })
  })
})

describe('rememberLocale', () => {
  const saved = (response: NextResponse) => response.cookies.get('asca-lang')?.value

  it('언어 주소를 직접 연 방문자의 언어를 쿠키로 남긴다', () => {
    const response = rememberLocale(
      req('/zh/faq', { cookie: 'asca-lang=ko' }),
      NextResponse.next(),
      'zh'
    )
    expect(saved(response)).toBe('zh')
  })

  it('이미 같은 언어면 쿠키를 다시 쓰지 않는다', () => {
    const response = rememberLocale(
      req('/zh/faq', { cookie: 'asca-lang=zh' }),
      NextResponse.next(),
      'zh'
    )
    expect(saved(response)).toBeUndefined()
  })

  // 2026-11-18: /zh 화면이 미리 받아 두던 /zh/… 요청이 한국어로 바꾼 직후에 도착해 선택을 zh 로 되돌렸다.
  // Next 는 proxy 에 넘기기 전에 rsc·next-router-prefetch 헤더를 지운다(next/dist/server/web/adapter.js
  // FLIGHT_HEADERS) — 그래서 proxy 가 실제로 보는 헤더(sec-fetch-*)로 시험한다
  it('주소창 이동(페이지 로드)은 언어를 쿠키로 남긴다', () => {
    const request = req('/zh/faq', {
      cookie: 'asca-lang=ko',
      headers: { 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document' },
    })
    expect(saved(rememberLocale(request, NextResponse.next(), 'zh'))).toBe('zh')
  })

  it.each([
    ['미리 받기', { 'sec-fetch-mode': 'cors', 'sec-fetch-dest': 'empty' }],
    ['화면 안 fetch', { 'sec-fetch-mode': 'same-origin', 'sec-fetch-dest': 'empty' }],
  ])('페이지 로드가 아닌 요청(%s)은 방문자가 고른 언어를 덮어쓰지 않는다', (_label, headers) => {
    const request = req('/zh/exhibitions/online', { cookie: 'asca-lang=ko', headers })
    expect(saved(rememberLocale(request, NextResponse.next(), 'zh'))).toBeUndefined()
  })
})

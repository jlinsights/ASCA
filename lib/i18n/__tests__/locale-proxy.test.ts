/** @jest-environment node */
import { NextRequest } from 'next/server'
import { decideLocale } from '../locale-proxy'

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
      if (d.kind === 'redirect') expect(d.location.pathname + d.location.search).toBe('/ja?utm=x')
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

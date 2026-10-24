/**
 * @jest-environment node
 *
 * 옛 Webflow 주소가 도메인 이전 후에도 이 앱의 실제 페이지에 닿는지, 그리고 redirects() 가
 * 이 앱의 실제 페이지를 가로채지 않는지 확인한다. Next 와 같은 path-to-regexp 로 판정한다.
 */
import fs from 'fs'
import path from 'path'
import { match, compile } from 'next/dist/compiled/path-to-regexp'

type Redirect = { source: string; destination: string; permanent: boolean }

const { webflowRedirects } = require('../webflow-redirects') as { webflowRedirects: Redirect[] }
const nextConfig = require('../../../next.config.js') as { redirects: () => Promise<Redirect[]> }

const APP_DIR = path.join(__dirname, '../../../app')

// 인증 전환 브랜치(feat/supabase-auth)가 새로 만드는 페이지. 병합 전에도 redirect 로 가로채면 안 된다
const UPCOMING_ROUTES = ['/auth/mfa', '/forgot-password', '/profile', '/reset-password']

// 도메인 이전 전에 대응을 정하지 못해 일부러 남겨 둔 404 (이유를 같이 적는다)
const DEFERRED = new Map([['/reset-password', '인증 전환 브랜치가 페이지로 만든다']])

// 2026-10-24 Webflow sitemap 의 한국어 고정 페이지 전부 + 컬렉션·언어별 표본.
// 작가·회원 slug 는 실제 이름이라 지어낸 표본을 쓴다(공개 저장소).
const WEBFLOW_PATHS = [
  '/',
  '/academy',
  '/access-denied',
  '/application',
  '/application-for-recommended-invited-calligrapher',
  '/articles-of-incorporation-and-bylaws',
  '/blog',
  '/board-members',
  '/brand',
  '/business-plan',
  '/checkout',
  '/commissioning-application-for-the-board-of-jurors-and-organizing-committee',
  '/contact',
  '/copyright-policy',
  '/email-refuse',
  '/fairness-transparency-hub',
  '/forms',
  '/fundrasing',
  '/greetings',
  '/history',
  '/introductions',
  '/log-in',
  '/membership',
  '/memberstack-override',
  '/mission',
  '/notifications',
  '/old-home',
  '/order-confirmation',
  '/partners',
  '/paypal-checkout',
  '/privacy-policy',
  '/reset-password',
  '/search',
  '/shop',
  '/sign-up',
  '/signup',
  '/terms-and-conditions-for-the-management-and-use-of-donations',
  '/terms-of-service',
  '/update-password',
  '/user-account',
  '/calligrapher/sample-artist',
  '/work/sample-work',
  '/event/19exhibition2022',
  '/exhibition/19-oriental-calligraphy-exhibition-2022',
  '/award/grand-prize',
  '/post/curriculum-guiance-for-traditional-calligraphy',
  '/post/yeonghoneul-ulrineun-saegcaeyi-yeongeumsul-ceongyeongja-hwagayi-saengaewa-jagpumsegyee-gwanhan-simceung-yeongu',
  '/members/advisor',
  '/category/advisor',
  '/taxonomies/advisor',
  '/type/hangeul',
  '/blog-category/exhibitions',
  '/partners/eim-design',
  '/partner/heelang',
  '/countries/china',
  '/home-pages/home-v1',
  '/product/director',
  '/utility-pages/style-guide',
  '/en',
  '/ja',
  '/zh',
  '/en/history',
  '/ja/greetings',
  '/zh/calligrapher/sample-artist',
  '/en/post/checklist-for-successful-exhibition',
]

/** app/**\/page.tsx → Next 경로 패턴 (/artists/:id, /sign-in/:rest* …) */
function collectRoutes(dir: string, prefix = ''): string[] {
  const routes: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name === 'page.tsx') routes.push(prefix || '/')
    if (!entry.isDirectory() || entry.name.startsWith('_') || entry.name === 'api') continue
    const name = entry.name
    // path-to-regexp 매개변수 이름은 \w 만 허용 — [[...sign-in]] 같은 이름을 바꾼다
    const param = (raw: string) => raw.replace(/\W/g, '_')
    let segment: string
    if (/^\(.*\)$/.test(name)) segment = ''
    else if (/^\[\[\.\.\.(.+)\]\]$/.test(name)) segment = `/:${param(name.slice(5, -2))}*`
    else if (/^\[\.\.\.(.+)\]$/.test(name)) segment = `/:${param(name.slice(4, -1))}+`
    else if (/^\[(.+)\]$/.test(name)) segment = `/:${param(name.slice(1, -1))}`
    else segment = `/${name}`
    routes.push(...collectRoutes(path.join(dir, name), prefix + segment))
  }
  return routes
}

const ROUTES = [...collectRoutes(APP_DIR), ...UPCOMING_ROUTES]
const routeMatchers = ROUTES.map(route => match(route, { decode: decodeURIComponent }))
const isPage = (p: string) => routeMatchers.some(m => m(p) !== false)

/** 실제 페이지 패턴을 구체 주소로 — 동적 구간은 아무 값으로 채운다 */
const sampleOf = (route: string) =>
  route.replace(/\/:[^/]+\*$/, '').replace(/:([^/]+?)[+]?(?=\/|$)/g, 'sample-id') || '/'

async function allRedirects(): Promise<Redirect[]> {
  return nextConfig.redirects()
}

function applyRedirect(redirects: Redirect[], pathname: string): string | null {
  for (const r of redirects) {
    const m = match(r.source, { decode: decodeURIComponent })(pathname)
    if (m === false) continue
    const target = r.destination.split('#')[0]
    return compile(target, { encode: encodeURIComponent })(m.params as object) || '/'
  }
  return null
}

describe('Webflow 주소 이관', () => {
  test('next.config 의 redirects() 가 이 표를 싣는다', async () => {
    const redirects = await allRedirects()
    for (const r of webflowRedirects) expect(redirects).toContainEqual(r)
  })

  test('redirect 가 이 앱의 실제 페이지(인증 전환 예정 페이지 포함)를 가로채지 않는다', async () => {
    const redirects = await allRedirects()
    const shadowed = ROUTES.map(sampleOf)
      .filter(sample => applyRedirect(redirects, sample) !== null)
      .filter(sample => !/^\/artists\/country\//.test(sample)) // 자체 redirect 하는 페이지
    expect(shadowed).toEqual([])
  })

  test.each(WEBFLOW_PATHS)('%s → 실제 페이지에 2번 이내로 닿는다', async start => {
    const redirects = await allRedirects()
    let current = start
    let hops = 0
    while (!isPage(current) && hops < 3) {
      const next = applyRedirect(redirects, current)
      if (next === null) break
      current = next
      hops++
    }
    if (DEFERRED.has(start)) {
      // 예정 페이지가 맡을 주소 — redirect 로 가로채지 않았는지만 본다
      expect(applyRedirect(redirects, start)).toBeNull()
      return
    }
    expect({ start, landed: current, isPage: isPage(current) }).toEqual({
      start,
      landed: current,
      isPage: true,
    })
    expect(hops).toBeLessThanOrEqual(2)
  })

  test('작가 slug 를 표에 적지 않는다 (비공개 등급 이름 노출 방지)', () => {
    const sources = webflowRedirects.map(r => r.source).join('\n')
    expect(sources).not.toMatch(/\/calligrapher\/[a-z]/)
  })
})

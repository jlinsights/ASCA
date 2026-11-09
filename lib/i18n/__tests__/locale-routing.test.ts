import {
  isLocalizedPath,
  languageFromHeader,
  localizePath,
  localizedPaths,
  splitLocale,
} from '../locale-routing'

describe('splitLocale', () => {
  it.each([
    ['/en/history', 'en', '/history', true],
    ['/ja', 'ja', '/', true],
    ['/zh/regulations/articles', 'zh', '/regulations/articles', true],
    ['/history', 'ko', '/history', false],
    ['/', 'ko', '/', false],
    // 두 글자로 시작하지만 언어 접두사가 아닌 경로
    ['/faq', 'ko', '/faq', false],
    ['/english', 'ko', '/english', false],
    ['/ko/history', 'ko', '/ko/history', false],
  ])('%s → %s %s', (input, language, path, prefixed) => {
    expect(splitLocale(input)).toEqual({ language, path, prefixed })
  })
})

describe('localizePath', () => {
  it('번역된 페이지에 접두사를 단다', () => {
    expect(localizePath('/history', 'en')).toBe('/en/history')
    expect(localizePath('/', 'ja')).toBe('/ja')
    expect(localizePath('/regulations/articles', 'zh')).toBe('/zh/regulations/articles')
  })

  it('쿼리·해시를 지킨다', () => {
    expect(localizePath('/faq?q=회비#top', 'en')).toBe('/en/faq?q=회비#top')
  })

  it('한국어는 접두사를 뗀다', () => {
    expect(localizePath('/en/history', 'ko')).toBe('/history')
    expect(localizePath('/history', 'ko')).toBe('/history')
  })

  it('다른 언어 주소에서 언어만 바꾼다', () => {
    expect(localizePath('/ja/history', 'en')).toBe('/en/history')
  })

  it('번역되지 않은 페이지는 한국어 주소로 둔다', () => {
    for (const path of [
      '/privacy-policy',
      '/blog/gyeomjae-jeongseon',
      '/artists/anam',
      '/partners',
    ])
      expect(localizePath(path, 'en')).toBe(path)
  })

  it('외부·특수 주소는 건드리지 않는다', () => {
    for (const href of ['https://pf.kakao.com/x', 'mailto:info@x.org', 'tel:0', '#main', '//cdn.x'])
      expect(localizePath(href, 'en')).toBe(href)
  })
})

describe('번역 페이지 목록', () => {
  it('보호·인증·관리 경로는 넣지 않는다 — proxy 의 로그인 검사를 접두사로 우회하지 못하게', () => {
    for (const path of ['/profile', '/admin', '/members', '/sign-in', '/api/x', '/auth/callback'])
      expect(isLocalizedPath(path)).toBe(false)
  })

  it('정관·규정 상세를 모두 넣는다', () => {
    expect(
      localizedPaths().filter(p => p.startsWith('/regulations/')).length
    ).toBeGreaterThanOrEqual(9)
  })
})

describe('languageFromHeader', () => {
  it('모르는 값은 한국어', () => {
    expect(languageFromHeader('en')).toBe('en')
    expect(languageFromHeader('ko')).toBe('ko')
    expect(languageFromHeader('fr')).toBe('ko')
    expect(languageFromHeader(null)).toBe('ko')
  })
})

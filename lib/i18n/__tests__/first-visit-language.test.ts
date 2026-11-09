import {
  firstVisitLanguage,
  isNonHumanAgent,
  languageFromAcceptLanguage,
  languageFromCountry,
} from '../first-visit-language'

const CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

describe('languageFromAcceptLanguage', () => {
  it.each([
    ['ja-JP,ja;q=0.9,en;q=0.8', 'ja'],
    ['ko-KR,ko;q=0.9', 'ko'],
    ['zh-CN,zh;q=0.9', 'zh'],
    ['zh-TW', 'zh'],
    ['fr-FR,fr;q=0.9,en;q=0.5', 'en'],
    ['en;q=0.3,ja;q=0.8', 'ja'],
  ])('%s → %s', (header, expected) => {
    expect(languageFromAcceptLanguage(header)).toBe(expected)
  })

  it('지원하지 않는 언어뿐이거나 q=0 이면 null', () => {
    expect(languageFromAcceptLanguage('fr-FR,de;q=0.5')).toBeNull()
    expect(languageFromAcceptLanguage('ja;q=0')).toBeNull()
    expect(languageFromAcceptLanguage(null)).toBeNull()
  })
})

describe('languageFromCountry', () => {
  it.each([
    ['KR', 'ko'],
    ['JP', 'ja'],
    ['TW', 'zh'],
    ['CN', 'zh'],
    ['HK', 'zh'],
    ['US', 'en'],
    ['FR', 'en'],
  ])('%s → %s', (country, expected) => {
    expect(languageFromCountry(country)).toBe(expected)
  })
  it('국가를 모르면 null', () => expect(languageFromCountry(null)).toBeNull())
})

describe('isNonHumanAgent', () => {
  it.each([
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; Yeti/1.1; +http://naver.me/spd)',
    'Mozilla/5.0 (compatible; Daum/4.1; +http://cs.daum.net/faq/15/4118.html)',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 (compatible; Baiduspider/2.0)',
    'Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)',
    'Mozilla/5.0 (compatible; GoogleOther)',
    'AdsBot-Google (+http://www.google.com/adsbot.html)',
    'facebookexternalhit/1.1',
    'kakaotalk-scrap/1.0',
    'Slackbot-LinkExpanding 1.0',
    'Twitterbot/1.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0.0.0',
    '',
  ])('%s 는 사람이 아니다', ua => {
    expect(isNonHumanAgent(ua)).toBe(true)
  })
  it.each([
    CHROME,
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  ])('일반 브라우저는 사람이다 — %s', ua => expect(isNonHumanAgent(ua)).toBe(false))
})

describe('firstVisitLanguage', () => {
  it('브라우저 언어가 국가보다 앞선다 — 한국에서 일본어 브라우저면 일본어', () => {
    expect(firstVisitLanguage({ userAgent: CHROME, acceptLanguage: 'ja-JP', country: 'KR' })).toBe(
      'ja'
    )
  })

  it('지원하지 않는 브라우저 언어면 국가로 — 대만이면 중국어', () => {
    expect(firstVisitLanguage({ userAgent: CHROME, acceptLanguage: 'fr-FR', country: 'TW' })).toBe(
      'zh'
    )
  })

  it('브라우저 언어도 국가도 지원 밖이면 영어', () => {
    expect(firstVisitLanguage({ userAgent: CHROME, acceptLanguage: 'fr-FR', country: null })).toBe(
      'en'
    )
  })

  it('신호가 없으면(로컬 개발) 정하지 않는다', () => {
    expect(
      firstVisitLanguage({ userAgent: CHROME, acceptLanguage: null, country: null })
    ).toBeNull()
  })

  it('검색 로봇은 국가·언어와 상관없이 정하지 않는다', () => {
    expect(
      firstVisitLanguage({
        userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)',
        acceptLanguage: 'en-US',
        country: 'US',
      })
    ).toBeNull()
  })
})

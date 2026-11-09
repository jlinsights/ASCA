import { act, render, screen } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '../language-context'
import { setTestLanguage } from '@/lib/i18n/testing'
import { navigateTo } from '@/lib/i18n/navigate'
import en from '@/lib/i18n/locales/en'

jest.mock('@/lib/i18n/navigate', () => ({ navigateTo: jest.fn() }))

function Probe({ k }: { k: string }) {
  const { t } = useLanguage()
  return <span data-testid='out'>{t(k)}</span>
}

let setLanguageRef: ((l: 'ko' | 'en' | 'ja' | 'zh') => Promise<void> | void) | null = null
function Switcher() {
  const { setLanguage, language } = useLanguage()
  setLanguageRef = setLanguage
  return <span data-testid='lang'>{language}</span>
}

const cookieLanguage = () => /(?:^|;\s*)asca-lang=([^;]*)/.exec(document.cookie)?.[1]

beforeEach(() => jest.mocked(navigateTo).mockClear())

describe('LanguageProvider t() — 기본 언어(ko)', () => {
  // 회귀: ko 는 기본 언어라 setLanguage 가 조기 반환해 프리로드가 끝나도 다시 그리지 않는다.
  // lib/i18n/translations.ts 에만 있는 키가 첫 렌더(=SSR HTML)에 키 이름으로 새어 나갔다.
  it('translations.ts 에만 있는 키를 첫 렌더에서 바로 번역한다', () => {
    render(
      <LanguageProvider>
        <Probe k='homeHeroTitle' />
      </LanguageProvider>
    )
    expect(screen.getByTestId('out')).toHaveTextContent('동양서예')
  })

  it('기존 컨텍스트 내장 표의 키도 그대로 번역한다', () => {
    render(
      <LanguageProvider>
        <Probe k='exhibition' />
      </LanguageProvider>
    )
    expect(screen.getByTestId('out')).toHaveTextContent('전시')
  })

  it('어디에도 없는 키는 키 이름을 돌려준다', () => {
    render(
      <LanguageProvider>
        <Probe k='__no_such_key__' />
      </LanguageProvider>
    )
    expect(screen.getByTestId('out')).toHaveTextContent('__no_such_key__')
  })
})

describe('LanguageProvider — 주소가 정하는 언어', () => {
  // /en 주소는 서버가 영어로 그린다. 브라우저 첫 렌더도 영어여야 hydration 이 맞는다
  it('서버가 넘긴 언어·표로 첫 렌더부터 그 언어다 (기다리지 않는다)', () => {
    setTestLanguage('en')
    render(
      <LanguageProvider initialLanguage='en' initialTable={en}>
        <Probe k='artGalleryExhibition' />
      </LanguageProvider>
    )
    expect(screen.getByTestId('out')).toHaveTextContent('The Asian Society of Calligraphic Arts')
  })

  // 클라이언트 이동으로 /en 주소에 온 경우 — 표를 받은 뒤 바뀌고, 그 사이에도 키 이름은 보이지 않는다
  it('주소가 /en 이면 표를 받은 뒤 영어로 바뀐다', async () => {
    setTestLanguage('en')
    render(
      <LanguageProvider>
        <Probe k='artGalleryExhibition' />
      </LanguageProvider>
    )
    expect(screen.getByTestId('out')).toHaveTextContent('동양서예협회')
    expect(await screen.findByText('The Asian Society of Calligraphic Arts')).toBeInTheDocument()
  })

  it('예전 localStorage 값은 화면 언어를 바꾸지 않고 쿠키로 옮긴 뒤 그 언어 주소로 보낸다', () => {
    window.history.replaceState(null, '', '/history?tab=1')
    window.localStorage.setItem('asca-language', 'ja')
    render(
      <LanguageProvider>
        <Switcher />
      </LanguageProvider>
    )
    expect(screen.getByTestId('lang')).toHaveTextContent('ko')
    expect(cookieLanguage()).toBe('ja')
    expect(window.localStorage.getItem('asca-language')).toBeNull()
    expect(navigateTo).toHaveBeenCalledWith('/ja/history?tab=1', { replace: true })
  })

  // 첫 방문 자동 판단(영어 브라우저 → /en)이 단 쿠키가 옛 선택(일본어)을 지우면 안 된다
  it('자동 판단으로 다른 언어 홈에 왔어도 옛 선택이 앞선다 — 쿠키를 고치고 그 언어 홈으로', () => {
    setTestLanguage('en')
    document.cookie = 'asca-lang=en; path=/'
    window.localStorage.setItem('asca-language', 'ja')
    render(
      <LanguageProvider initialLanguage='en'>
        <Switcher />
      </LanguageProvider>
    )
    expect(cookieLanguage()).toBe('ja')
    expect(window.localStorage.getItem('asca-language')).toBeNull()
    expect(navigateTo).toHaveBeenCalledWith('/ja', { replace: true })
  })

  it('옛 한국어 선택도 옮긴다 — 자동 판단으로 /en 에 왔으면 한국어 홈으로', () => {
    setTestLanguage('en')
    document.cookie = 'asca-lang=en; path=/'
    window.localStorage.setItem('asca-language', 'ko')
    render(
      <LanguageProvider initialLanguage='en'>
        <Switcher />
      </LanguageProvider>
    )
    expect(cookieLanguage()).toBe('ko')
    expect(navigateTo).toHaveBeenCalledWith('/', { replace: true })
  })

  it('한국어 주소에서 옛 한국어 선택이면 이동하지 않는다', () => {
    window.history.replaceState(null, '', '/history')
    window.localStorage.setItem('asca-language', 'ko')
    render(
      <LanguageProvider>
        <Switcher />
      </LanguageProvider>
    )
    expect(cookieLanguage()).toBe('ko')
    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('언어 주소의 본문 페이지는 그대로 두고 쿠키만 옛 선택으로 고친다', () => {
    window.history.replaceState(null, '', '/en/history')
    document.cookie = 'asca-lang=en; path=/'
    window.localStorage.setItem('asca-language', 'ja')
    render(
      <LanguageProvider initialLanguage='en'>
        <Switcher />
      </LanguageProvider>
    )
    expect(cookieLanguage()).toBe('ja')
    expect(navigateTo).not.toHaveBeenCalled()
  })
})

describe('LanguageProvider — 언어 선택', () => {
  it('번역된 페이지에서 고르면 쿠키에 저장하고 그 언어 주소로 이동한다', async () => {
    window.history.replaceState(null, '', '/history?tab=1#top')
    render(
      <LanguageProvider>
        <Switcher />
      </LanguageProvider>
    )
    await act(async () => {
      await setLanguageRef!('zh')
    })
    expect(cookieLanguage()).toBe('zh')
    expect(navigateTo).toHaveBeenCalledWith('/zh/history?tab=1#top')
  })

  // 첫 방문 홈 자동 판단은 쿠키가 없을 때만 돈다 — 지금 언어를 다시 고른 것도 선택으로 남겨야 한다
  it('지금 보는 언어를 다시 골라도 쿠키에 저장하고 이동하지 않는다', async () => {
    window.history.replaceState(null, '', '/history')
    render(
      <LanguageProvider>
        <Switcher />
      </LanguageProvider>
    )
    expect(cookieLanguage()).toBeUndefined()
    await act(async () => {
      await setLanguageRef!('ko')
    })
    expect(cookieLanguage()).toBe('ko')
    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('/en 주소에서 한국어를 고르면 접두사 없는 주소로 간다', async () => {
    setTestLanguage('en')
    render(
      <LanguageProvider initialLanguage='en' initialTable={en}>
        <Switcher />
      </LanguageProvider>
    )
    await act(async () => {
      await setLanguageRef!('ko')
    })
    expect(cookieLanguage()).toBe('ko')
    expect(navigateTo).toHaveBeenCalledWith('/')
  })

  it('번역 안 된 페이지는 이동하지 않고 머리말·꼬리말 언어만 바꾼다', async () => {
    window.history.replaceState(null, '', '/privacy-policy')
    render(
      <LanguageProvider>
        <Switcher />
      </LanguageProvider>
    )
    await act(async () => {
      await setLanguageRef!('en')
    })
    expect(navigateTo).not.toHaveBeenCalled()
    expect(cookieLanguage()).toBe('en')
    expect(screen.getByTestId('lang')).toHaveTextContent('en')
  })
})

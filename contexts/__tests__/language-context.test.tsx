import { render, screen } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '../language-context'

function Probe({ k }: { k: string }) {
  const { t } = useLanguage()
  return <span data-testid='out'>{t(k)}</span>
}

describe('LanguageProvider t() — 기본 언어(ko)', () => {
  beforeEach(() => {
    window.localStorage.setItem('asca-language', 'ko')
  })

  afterEach(() => {
    window.localStorage.clear()
  })

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

describe('LanguageProvider — 저장된 다른 언어', () => {
  afterEach(() => {
    window.localStorage.clear()
  })

  // 다른 언어 표는 처음 번들에 없고 고를 때 받는다. 받는 동안에는 한국어를 보이다가
  // 받은 뒤 한 번에 바뀌어야 한다 — 키 이름이 보이면 안 된다.
  it('표를 받은 뒤 영어로 바뀌고 그 사이에도 키 이름을 보이지 않는다', async () => {
    window.localStorage.setItem('asca-language', 'en')
    render(
      <LanguageProvider>
        <Probe k='artGalleryExhibition' />
      </LanguageProvider>
    )
    expect(screen.getByTestId('out')).toHaveTextContent('동양서예협회')
    expect(await screen.findByText('The Asian Society of Calligraphic Arts')).toBeInTheDocument()
  })
})

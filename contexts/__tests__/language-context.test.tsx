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

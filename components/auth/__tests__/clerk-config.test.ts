import { enUS, jaJP, koKR, zhTW } from '@clerk/localizations'
import { getClerkAuthAppearance } from '../clerk-appearance'
import { CLERK_LOCALIZATIONS } from '../localized-clerk-provider'

jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: unknown }) => children,
}))

describe('Clerk 언어 매핑', () => {
  it('사이트 4개 언어가 각자의 Clerk 로케일로 간다', () => {
    expect(CLERK_LOCALIZATIONS).toEqual({ ko: koKR, en: enUS, ja: jaJP, zh: zhTW })
  })
})

describe('Clerk 외관', () => {
  // 회귀: 다크 모드에서 동의 문구·자리표시자가 남색 위 남색으로 묻혔다.
  it('다크 모드에서는 글자가 밝고 배경이 어둡다', () => {
    const { variables } = getClerkAuthAppearance(true)
    expect(variables.colorText).toBe('#fbf8ef')
    expect(variables.colorInputText).toBe('#fbf8ef')
    expect(variables.colorBackground).toBe('#070d1a')
  })

  it('라이트 모드는 먹색 글자에 화선지 바탕이다', () => {
    const { variables } = getClerkAuthAppearance(false)
    expect(variables.colorText).toBe('#0b1733')
    expect(variables.colorBackground).toBe('#fbf8ef')
  })

  it('Clerk 자체 제목과 하단 전환 링크는 숨긴다(AuthShell 이 그린다)', () => {
    const { elements } = getClerkAuthAppearance(false)
    expect(elements.header).toBe('hidden')
    expect(elements.footer).toBe('hidden')
  })
})

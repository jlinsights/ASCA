import { existsSync } from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { LayoutFooter } from '../layout-footer'
import { footerLinks } from '../footer-data'
import { translations } from '@/lib/i18n/translations'

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}))

function renderFooter(lang: string) {
  window.localStorage.setItem('asca-language', lang)
  return render(
    <LanguageProvider>
      <LayoutFooter />
    </LanguageProvider>
  )
}

afterEach(() => {
  window.localStorage.clear()
})

describe('LayoutFooter — 번역', () => {
  it('ko: 기존 한국어 문구가 그대로다', async () => {
    renderFooter('ko')
    expect(await screen.findByRole('link', { name: '이용약관' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '전시' })).toBeInTheDocument()
  })

  // 회귀: 번역 키 'subscribeNewsletter' 가 어느 표에도 없어 키 이름이 그대로 노출됐다.
  it.each([
    ['ko', '뉴스레터 구독'],
    ['en', 'Subscribe to Newsletter'],
  ])('%s: 뉴스레터 링크가 키 이름이 아닌 문구로 보인다', async (lang, label) => {
    renderFooter(lang)
    expect(await screen.findByRole('link', { name: label })).toBeInTheDocument()
    expect(screen.queryByText('subscribeNewsletter')).not.toBeInTheDocument()
  })

  it('ja: 섹션 제목·법적 고지·후원 기관이 일본어로 바뀐다', async () => {
    renderFooter('ja')
    expect(await screen.findByRole('link', { name: '利用規約' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '展示' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ソウル芸術の殿堂' })).toBeInTheDocument()
  })

  it('en: 연락처 라벨이 영어로 바뀐다', async () => {
    renderFooter('en')
    expect(await screen.findByText(/Registration No\./)).toBeInTheDocument()
    expect(screen.getByText(/Bomun-ro/)).toBeInTheDocument()
  })
})

// 회귀: /about·/about/history·/organization·/news 는 페이지가 없어 프로덕션에서 404 였다.
describe('footer-data — 내부 링크는 실제 페이지로 간다', () => {
  const internal = Object.values(footerLinks)
    .flat()
    .filter(item => !item.external)
    .map(item => (item.href.split('?')[0] ?? '').replace(/\/$/, ''))

  it.each(internal)('%s', route => {
    const dir = path.join(process.cwd(), 'app', route)
    expect(existsSync(path.join(dir, 'page.tsx')) || existsSync(path.join(dir, 'page.ts'))).toBe(
      true
    )
  })
})

describe('footer-data — 모든 링크 라벨 키가 4개 언어에 있다', () => {
  const keys = Object.values(footerLinks).flatMap(items => items.map(item => item.labelKey))

  it('모든 링크가 라벨 키를 가진다', () => {
    expect(keys.length).toBeGreaterThan(30)
    expect(keys.every(key => typeof key === 'string' && key.length > 0)).toBe(true)
  })

  it.each(['ko', 'en', 'ja', 'zh'] as const)('%s', lang => {
    const missing = keys.filter(key => !translations[lang]?.[key])
    expect(missing).toStrictEqual([])
  })
})

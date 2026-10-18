import { existsSync } from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { LayoutFooter } from '../layout-footer'
import { footerLinks, footerSections } from '../footer-data'
import { footerCopy } from '../footer-copy'
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
  it('첨부된 본부·사무국 정보와 로고·카카오 QR을 제공한다', async () => {
    renderFooter('ko')
    expect(await screen.findByText(/서울시 성북구 보문로 57-1/)).toBeInTheDocument()
    expect(screen.getByText(/경기 고양시 덕양구 호국로 860/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '사단법인 동양서예협회' })).toHaveAttribute(
      'src',
      '/logo/asca-hanja-white.avif'
    )
    expect(screen.getByRole('img', { name: '동양서예 카카오채널 QR 코드' })).toHaveAttribute(
      'src',
      '/logo/kakao-channel-qr.png'
    )
    expect(screen.getByRole('link', { name: /전화 0502/ })).toHaveAttribute(
      'href',
      'tel:050255508700'
    )
    expect(screen.getByRole('link', { name: 'info@orientalcalligraphy.org' })).toHaveAttribute(
      'href',
      'mailto:info@orientalcalligraphy.org'
    )
    expect(screen.queryByText(/02-123-4567|보문로 105/)).not.toBeInTheDocument()
  })

  it('간략형에서도 동일한 공식 연락처와 QR을 사용한다', async () => {
    window.localStorage.setItem('asca-language', 'ko')
    render(
      <LanguageProvider>
        <LayoutFooter variant='simple' />
      </LanguageProvider>
    )
    expect(await screen.findByRole('link', { name: /전화 0502/ })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '동양서예 카카오채널 QR 코드' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: '푸터 메뉴' })).not.toBeInTheDocument()
  })
  it('ko: 기존 한국어 문구가 그대로다', async () => {
    renderFooter('ko')
    expect(await screen.findByRole('link', { name: '이용약관' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '회원' })).toBeInTheDocument()
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
    expect(screen.getByRole('heading', { name: '会員' })).toBeInTheDocument()
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
  const internal = [
    ...Object.values(footerLinks).flat(),
    ...footerSections.flatMap(section => section.items),
  ]
    .filter(item => !item.external)
    .map(item => (item.href.split('?')[0] ?? '').replace(/\/$/, ''))

  it.each(internal)('%s', route => {
    const dir = path.join(
      process.cwd(),
      'app',
      route.replace(/\/artists\/country\/[^/]+$/, '/artists/country/[country]')
    )
    expect(existsSync(path.join(dir, 'page.tsx')) || existsSync(path.join(dir, 'page.ts'))).toBe(
      true
    )
  })
})

describe('footer-data — 모든 링크 라벨 키가 4개 언어에 있다', () => {
  const keys = [
    ...Object.values(footerLinks).flat(),
    ...footerSections.flatMap(section => section.items),
  ].map(item => item.labelKey)

  it('모든 링크가 라벨 키를 가진다', () => {
    expect(keys.length).toBeGreaterThan(30)
    expect(keys.every(key => typeof key === 'string' && key.length > 0)).toBe(true)
  })

  it.each(['ko', 'en', 'ja', 'zh'] as const)('%s', lang => {
    const missing = keys.filter(key => !translations[lang]?.[key] && !(key in footerCopy[lang]))
    expect(missing).toStrictEqual([])
  })
})

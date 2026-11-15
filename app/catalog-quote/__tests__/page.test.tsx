import { readFileSync } from 'fs'
import path from 'path'
import { render, screen } from '@testing-library/react'
import CatalogQuotePage, { metadata } from '../page'

jest.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

afterEach(() => {
  delete process.env.CATALOG_QUOTE_PREVIEW
})

describe('/catalog-quote 미리보기', () => {
  it('기본 비활성: notFound', () => {
    expect(() => CatalogQuotePage()).toThrow('NEXT_NOT_FOUND')
  })

  it('검색에 노출하지 않는다', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('켜면 가견적 안내와 9개 부수 선택지만 보인다', () => {
    process.env.CATALOG_QUOTE_PREVIEW = 'on'
    render(CatalogQuotePage())
    expect(screen.getByRole('heading', { level: 1, name: '종이 도록 가견적' })).toBeInTheDocument()
    expect(
      screen.getByText(/가견적이며, 신청·결제·견적 문의로 이어지지 않습니다/)
    ).toBeInTheDocument()
    const select = screen.getByLabelText('추가 유료 도록 부수')
    const options = Array.from(select.querySelectorAll('option')).map(o => o.textContent)
    expect(options).toEqual([
      '100부',
      '150부',
      '200부',
      '250부',
      '300부',
      '350부',
      '400부',
      '450부',
      '500부',
    ])
  })

  it('클라이언트 코드는 내부 원가 모듈을 불러오지 않는다', () => {
    const source = readFileSync(
      path.join(__dirname, '..', '_components', 'catalog-quote-calculator.tsx'),
      'utf8'
    )
    expect(source).not.toMatch(/internal-cost/)
  })
})

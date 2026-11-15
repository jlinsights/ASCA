import { fireEvent, render, screen } from '@testing-library/react'
import { computeQuote } from '@/lib/catalog-quote/calculate'
import { CatalogQuoteCalculator } from '../catalog-quote-calculator'

// 서버 응답을 같은 순수 산식으로 흉내 낸다 — 화면은 서버가 돌려준 값만 그린다
const fetchMock = jest.fn(async (_url: string, init: RequestInit) => {
  const result = computeQuote(JSON.parse(String(init.body)))
  const status = result.ok || result.status === 'separateQuote' ? 200 : 422
  return { status, json: async () => result } as Response
})

beforeEach(() => {
  fetchMock.mockClear()
  global.fetch = fetchMock as unknown as typeof fetch
})

function renderCalculator() {
  render(
    <CatalogQuoteCalculator
      paidOptions={[100, 150, 200, 250, 300, 350, 400, 450, 500]}
      policyVersion='test-policy'
      approved={false}
    />
  )
}

describe('CatalogQuoteCalculator', () => {
  it('서버에 입력만 보내고 가견적을 검토안으로 표시한다', async () => {
    renderCalculator()
    fireEvent.click(screen.getByRole('button', { name: '가견적 계산' }))
    expect(await screen.findByRole('heading', { name: '가견적' })).toBeInTheDocument()
    const sent = JSON.parse(String(fetchMock.mock.calls[0]![1].body))
    expect(Object.keys(sent).sort()).toEqual([
      'applicationType',
      'approvedWorks',
      'membership',
      'multipleEditions',
      'paidCopies',
      'splitDelivery',
    ])
    expect(screen.getByText('1,938,400원')).toBeInTheDocument()
    expect(screen.getByText(/검토안 · 확정 금액 아님/)).toBeInTheDocument()
    expect(screen.getByText(/회원 자격 미확인/)).toBeInTheDocument()
    expect(screen.getByText(/포함되지 않은 항목/)).toBeInTheDocument()
  })

  it('10점 미만은 금액 대신 검증 오류를 보여 준다', async () => {
    renderCalculator()
    fireEvent.change(screen.getByLabelText('승인 출품 수 (점)'), { target: { value: '9' } })
    fireEvent.click(screen.getByRole('button', { name: '가견적 계산' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('10점 이상')
    expect(screen.queryByRole('heading', { name: '가견적' })).not.toBeInTheDocument()
  })

  it('추가 주문 안 함이면 0부로 보내고 평균 단가를 표시하지 않는다', async () => {
    renderCalculator()
    fireEvent.click(screen.getByLabelText('추가 유료 도록 주문 안 함'))
    expect(screen.getByLabelText('추가 유료 도록 부수')).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '가견적 계산' }))
    await screen.findByRole('heading', { name: '가견적' })
    expect(JSON.parse(String(fetchMock.mock.calls[0]![1].body)).paidCopies).toBe(0)
    expect(screen.queryByText('유료 평균 단가')).not.toBeInTheDocument()
  })

  it('혼합 회원 단체는 별도 견적 안내', async () => {
    renderCalculator()
    fireEvent.click(screen.getByLabelText('서예단체 부스전'))
    fireEvent.change(screen.getByLabelText('회원 구분'), { target: { value: 'mixed' } })
    fireEvent.click(screen.getByRole('button', { name: '가견적 계산' }))
    expect(await screen.findByRole('heading', { name: '별도 견적 대상' })).toBeInTheDocument()
  })

  it('계산 후 입력을 바꾸면 이전 견적을 지운다', async () => {
    renderCalculator()
    fireEvent.click(screen.getByRole('button', { name: '가견적 계산' }))
    await screen.findByRole('heading', { name: '가견적' })
    fireEvent.change(screen.getByLabelText('승인 출품 수 (점)'), { target: { value: '30' } })
    expect(screen.queryByRole('heading', { name: '가견적' })).not.toBeInTheDocument()
  })

  it('혼합 회원을 고른 뒤 개인전으로 바꾸면 정회원으로 되돌려 화면과 같은 값을 보낸다', async () => {
    renderCalculator()
    fireEvent.click(screen.getByLabelText('서예단체 부스전'))
    fireEvent.change(screen.getByLabelText('회원 구분'), { target: { value: 'mixed' } })
    fireEvent.click(screen.getByLabelText('개인전'))
    expect(screen.getByLabelText('회원 구분')).toHaveValue('member')
    fireEvent.click(screen.getByRole('button', { name: '가견적 계산' }))
    await screen.findByRole('heading', { name: '가견적' })
    const sent = JSON.parse(String(fetchMock.mock.calls[0]![1].body))
    expect(sent).toMatchObject({ applicationType: 'solo', membership: 'member' })
  })

  it('늦게 온 이전 응답은 바뀐 입력의 결과로 그리지 않는다', async () => {
    let release: (value: Response) => void = () => undefined
    fetchMock.mockImplementationOnce(() => new Promise<Response>(resolve => (release = resolve)))
    renderCalculator()
    fireEvent.click(screen.getByRole('button', { name: '가견적 계산' }))
    fireEvent.change(screen.getByLabelText('승인 출품 수 (점)'), { target: { value: '30' } })
    release({
      status: 200,
      json: async () =>
        computeQuote({
          applicationType: 'solo',
          membership: 'member',
          approvedWorks: 20,
          paidCopies: 100,
        }),
    } as Response)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(screen.queryByRole('heading', { name: '가견적' })).not.toBeInTheDocument()
  })
})

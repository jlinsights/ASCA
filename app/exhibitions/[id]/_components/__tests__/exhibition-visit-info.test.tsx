import { render, screen } from '@testing-library/react'
import { ExhibitionVisitInfo } from '../exhibition-visit-info'

describe('ExhibitionVisitInfo', () => {
  it('renders nothing when location is missing', () => {
    const { container } = render(<ExhibitionVisitInfo location='' />)
    expect(container.firstChild).toBeNull()
  })
  it('renders location and venue', () => {
    render(<ExhibitionVisitInfo location='예술의전당' venue='서울서예박물관' />)
    // location은 dl 본문과 핀 라벨 두 군데에 등장 — 의도된 디자인
    expect(screen.getAllByText(/예술의전당/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/서울서예박물관/)).toBeInTheDocument()
  })
  it('shows free entry when ticketPrice is 0', () => {
    render(<ExhibitionVisitInfo location='x' ticketPrice={0} />)
    expect(screen.getByText('무료 입장')).toBeInTheDocument()
  })
})

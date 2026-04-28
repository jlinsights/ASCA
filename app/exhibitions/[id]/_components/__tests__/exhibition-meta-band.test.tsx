import { render, screen } from '@testing-library/react'
import { ExhibitionMetaBand } from '../exhibition-meta-band'

const baseProps = {
  startDate: '2026-04-15T00:00:00.000Z',
  endDate: '2026-04-28T00:00:00.000Z',
  status: 'upcoming' as const,
}

describe('ExhibitionMetaBand', () => {
  it('renders period labels', () => {
    render(<ExhibitionMetaBand {...baseProps} />)
    expect(screen.getByText('기간')).toBeInTheDocument()
  })
  it('shows "—" when location is null', () => {
    render(<ExhibitionMetaBand {...baseProps} location={null} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })
  it('shows "무료 입장" when ticketPrice is 0', () => {
    render(<ExhibitionMetaBand {...baseProps} ticketPrice={0} />)
    expect(screen.getByText('무료 입장')).toBeInTheDocument()
  })
  it('shows formatted price when ticketPrice > 0', () => {
    render(<ExhibitionMetaBand {...baseProps} ticketPrice={5000} />)
    expect(screen.getByText(/5,000/)).toBeInTheDocument()
  })
})

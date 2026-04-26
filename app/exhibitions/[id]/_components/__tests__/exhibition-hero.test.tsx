import { render, screen } from '@testing-library/react'
import { ExhibitionHero } from '../exhibition-hero'

const baseProps = {
  title: '서경(書境) 새로운 지평',
  startDate: '2026-04-15T00:00:00.000Z',
  endDate: '2026-04-28T00:00:00.000Z',
  status: 'upcoming' as const,
  isFeatured: true,
}

describe('ExhibitionHero', () => {
  it('renders title', () => {
    render(<ExhibitionHero {...baseProps} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/서경/)
  })
  it('renders subtitle when provided', () => {
    render(<ExhibitionHero {...baseProps} subtitle="New Horizons" />)
    expect(screen.getByText(/New Horizons/)).toBeInTheDocument()
  })
  it('renders <Image> in poster mode when featuredImageUrl present', () => {
    render(<ExhibitionHero {...baseProps} featuredImageUrl="/p.jpg" />)
    const img = screen.getByAltText(baseProps.title)
    expect(img).toBeInTheDocument()
  })
  it('renders watermark with extracted Hanja in watermark mode', () => {
    const { container } = render(<ExhibitionHero {...baseProps} />)
    expect(container.querySelector('[data-watermark]')?.textContent).toBe('書境')
  })
  it('renders ownerActions when provided', () => {
    render(<ExhibitionHero {...baseProps} ownerActions={<button>Edit</button>} />)
    expect(screen.getByRole('button', { name: /Edit/ })).toBeInTheDocument()
  })
  it('omits ownerActions slot when null', () => {
    render(<ExhibitionHero {...baseProps} ownerActions={null} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

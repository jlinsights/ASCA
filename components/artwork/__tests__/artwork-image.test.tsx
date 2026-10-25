import { render } from '@testing-library/react'
import { ArtworkImage } from '../artwork-image'
import { HeroScrolls } from '@/components/layout/page-hero'

jest.unmock('next/image')

describe('publication-checked artwork images', () => {
  it('uses the origin URL without creating an optimizer copy', () => {
    const src = 'https://example.supabase.co/functions/v1/public-artwork-image?id=fake'
    const { container } = render(<ArtworkImage src={src} alt='Fake work' width={20} height={20} />)
    expect(container.querySelector('img')).toHaveAttribute('src', src)
    expect(container.innerHTML).not.toContain('/_next/image')
  })

  it('keeps static assets optimized', () => {
    const { container } = render(
      <ArtworkImage src='/images/fake.jpg' alt='Fake work' width={20} height={20} />
    )
    expect(container.innerHTML).toContain('/_next/image')
  })

  it('keeps hero artwork scrolls on the publication-checked origin', () => {
    const src = 'https://example.supabase.co/functions/v1/public-artwork-image?id=fake'
    const { container } = render(<HeroScrolls images={[{ src, alt: 'Fake work' }]} />)
    expect(container.querySelector('img')).toHaveAttribute('src', src)
    expect(container.innerHTML).not.toContain('/_next/image')
  })
})

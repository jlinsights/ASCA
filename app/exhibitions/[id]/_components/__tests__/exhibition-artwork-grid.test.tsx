import { render, screen } from '@testing-library/react'
import { ExhibitionArtworkGrid } from '../exhibition-artwork-grid'
import type { ExhibitionFull } from '@/lib/types/exhibition-legacy'

const oneArtwork: ExhibitionFull['artworks'][0] = {
  relationId: 'r1', id: 'a1',
  title: '逍遙游', titleHanja: '逍遙游', titleEn: 'Wandering',
  images: [], imageUrl: null,
  artistId: 'art1', artistName: '徐景 김재호',
  displayOrder: 0, isFeatured: true,
  style: 'zhuan', medium: '화선지', dimensions: '136×70', year: 2025,
}

describe('ExhibitionArtworkGrid', () => {
  it('returns null when artworks empty', () => {
    const { container } = render(<ExhibitionArtworkGrid artworks={[]} />)
    expect(container.firstChild).toBeNull()
  })
  it('renders artwork title', () => {
    render(<ExhibitionArtworkGrid artworks={[oneArtwork]} />)
    expect(screen.getByText('逍遙游')).toBeInTheDocument()
  })
  it('shows artist name', () => {
    render(<ExhibitionArtworkGrid artworks={[oneArtwork]} />)
    expect(screen.getByText(/徐景 김재호/)).toBeInTheDocument()
  })
  it('renders featured badge for isFeatured artwork', () => {
    render(<ExhibitionArtworkGrid artworks={[oneArtwork]} />)
    expect(screen.getByText(/대표/)).toBeInTheDocument()
  })
  it('shows calligraphy placeholder when imageUrl is null', () => {
    const { container } = render(<ExhibitionArtworkGrid artworks={[oneArtwork]} />)
    expect(container.querySelector('[data-calligraphy-placeholder]')).toBeInTheDocument()
  })
  it('wraps card in Link to /artworks/[id]', () => {
    render(<ExhibitionArtworkGrid artworks={[oneArtwork]} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/artworks/a1')
  })
})

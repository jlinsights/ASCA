import { render, screen } from '@testing-library/react'
import { ExhibitionDescription } from '../exhibition-description'

describe('ExhibitionDescription', () => {
  it('returns null when description is empty', () => {
    const { container } = render(<ExhibitionDescription description='' />)
    expect(container.firstChild).toBeNull()
  })
  it('renders description text', () => {
    render(<ExhibitionDescription description='전시 소개 내용입니다.' />)
    expect(screen.getByText(/전시 소개 내용입니다/)).toBeInTheDocument()
  })
  it('renders default section number', () => {
    render(<ExhibitionDescription description='x' />)
    expect(screen.getByText('§ 01 — 기획 의도')).toBeInTheDocument()
  })
  it('honors custom section number', () => {
    render(<ExhibitionDescription description='x' sectionNumber='§ 02' />)
    expect(screen.getByText(/§ 02/)).toBeInTheDocument()
  })
})

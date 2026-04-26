import { render, screen } from '@testing-library/react'
import { ExhibitionLoading } from '../exhibition-loading'

describe('ExhibitionLoading', () => {
  it('renders with role="status"', () => {
    render(<ExhibitionLoading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
  it('renders Korean loading text', () => {
    render(<ExhibitionLoading />)
    expect(screen.getByText(/전시를 불러오는 중/)).toBeInTheDocument()
  })
})

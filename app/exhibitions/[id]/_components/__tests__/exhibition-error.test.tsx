import { render, screen } from '@testing-library/react'
import { ExhibitionError } from '../exhibition-error'

describe('ExhibitionError', () => {
  it('renders not-found heading by default', () => {
    render(<ExhibitionError message="boom" />)
    expect(screen.getByText('전시를 찾을 수 없습니다')).toBeInTheDocument()
  })
  it('renders network heading when kind=network', () => {
    render(<ExhibitionError kind="network" message="boom" />)
    expect(screen.getByText(/문제가 발생/)).toBeInTheDocument()
  })
  it('shows back link', () => {
    render(<ExhibitionError message="boom" />)
    expect(screen.getByRole('link', { name: /목록으로 돌아가기/ })).toHaveAttribute('href', '/exhibitions')
  })
  it('honors custom backHref', () => {
    render(<ExhibitionError message="boom" backHref="/" />)
    expect(screen.getByRole('link', { name: /목록으로 돌아가기/ })).toHaveAttribute('href', '/')
  })
})

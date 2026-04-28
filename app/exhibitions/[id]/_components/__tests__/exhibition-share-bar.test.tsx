import { render, screen, fireEvent } from '@testing-library/react'
import { ExhibitionShareBar } from '../exhibition-share-bar'

const originalOpen = window.open
const originalClipboard = navigator.clipboard

beforeEach(() => {
  window.open = jest.fn() as any
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
    configurable: true,
  })
})
afterEach(() => {
  window.open = originalOpen
  Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true })
})

describe('ExhibitionShareBar', () => {
  it('opens Facebook share URL on click', () => {
    render(<ExhibitionShareBar title='Test' url='https://example.com/x' />)
    fireEvent.click(screen.getByRole('button', { name: /facebook/i }))
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer'),
      '_blank'
    )
  })
  it('opens Twitter intent URL', () => {
    render(<ExhibitionShareBar title='Test' url='https://example.com/x' />)
    fireEvent.click(screen.getByRole('button', { name: /twitter/i }))
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank'
    )
  })
  it('copies URL to clipboard on copy', async () => {
    render(<ExhibitionShareBar title='Test' url='https://example.com/x' />)
    fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/x')
  })
})

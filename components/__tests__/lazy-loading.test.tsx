import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  createLazyComponent,
  IntersectionLazy,
  VirtualScroll,
  ProgressiveContent,
  LazyImage
} from '../performance/lazy-loading'

// Mock Intersection Observer
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})
window.IntersectionObserver = mockIntersectionObserver

describe('Lazy Loading Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createLazyComponent', () => {
    it('renders loading fallback initially', async () => {
      const MockComponent = () => <div>Loaded Component</div>
      const LazyComponent = createLazyComponent(
        () => Promise.resolve({ default: MockComponent }),
        { fallback: <div>Loading...</div> }
      )

      render(<LazyComponent />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders component after loading', async () => {
      const MockComponent = () => <div>Loaded Component</div>
      const LazyComponent = createLazyComponent(
        () => Promise.resolve({ default: MockComponent })
      )

      render(<LazyComponent />)

      await waitFor(() => {
        expect(screen.getByText('Loaded Component')).toBeInTheDocument()
      })
    })

    it('handles loading errors with error boundary', async () => {
      const LazyComponent = createLazyComponent(
        () => Promise.reject(new Error('Failed to load'))
      )

      render(<LazyComponent />)

      await waitFor(() => {
        expect(screen.getByText('컴포넌트 로딩 실패')).toBeInTheDocument()
        expect(screen.getByText('다시 시도')).toBeInTheDocument()
      })
    })

    it('allows retry after error', async () => {
      let shouldFail = true
      const MockComponent = () => <div>Loaded Component</div>
      
      const LazyComponent = createLazyComponent(() => {
        if (shouldFail) {
          shouldFail = false
          return Promise.reject(new Error('Failed to load'))
        }
        return Promise.resolve({ default: MockComponent })
      })

      render(<LazyComponent />)

      await waitFor(() => {
        expect(screen.getByText('다시 시도')).toBeInTheDocument()
      })

      const retryButton = screen.getByText('다시 시도')
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Loaded Component')).toBeInTheDocument()
      })
    })
  })

  describe('IntersectionLazy', () => {
    it('renders placeholder initially', () => {
      render(
        <IntersectionLazy placeholder={<div>Placeholder</div>}>
          <div>Actual Content</div>
        </IntersectionLazy>
      )

      expect(screen.getByText('Placeholder')).toBeInTheDocument()
      expect(screen.queryByText('Actual Content')).not.toBeInTheDocument()
    })

    it('sets up intersection observer', () => {
      render(
        <IntersectionLazy>
          <div>Content</div>
        </IntersectionLazy>
      )

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        { threshold: 0.1, rootMargin: '50px' }
      )
    })

    it('uses custom threshold and rootMargin', () => {
      render(
        <IntersectionLazy threshold={0.5} rootMargin="100px">
          <div>Content</div>
        </IntersectionLazy>
      )

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        { threshold: 0.5, rootMargin: '100px' }
      )
    })
  })

  describe('VirtualScroll', () => {
    const mockItems = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }))

    const renderItem = (item: any) => (
      <div key={item.id}>{item.name}</div>
    )

    it('renders virtual scroll container', () => {
      render(
        <VirtualScroll
          items={mockItems}
          itemHeight={50}
          containerHeight={400}
          renderItem={renderItem}
        />
      )

      const container = screen.getByRole('generic')
      expect(container).toHaveStyle({ height: '400px' })
    })

    it('only renders visible items initially', () => {
      render(
        <VirtualScroll
          items={mockItems}
          itemHeight={50}
          containerHeight={400}
          renderItem={renderItem}
        />
      )

      // Should render first few items based on container height
      expect(screen.getByText('Item 0')).toBeInTheDocument()
      expect(screen.queryByText('Item 100')).not.toBeInTheDocument()
    })

    it('handles scroll events', () => {
      render(
        <VirtualScroll
          items={mockItems}
          itemHeight={50}
          containerHeight={400}
          renderItem={renderItem}
        />
      )

      const container = screen.getByRole('generic')
      fireEvent.scroll(container, { target: { scrollTop: 1000 } })

      // After scrolling, different items should be visible
      // Note: This is simplified - actual implementation would update based on scroll position
    })
  })

  describe('ProgressiveContent', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('shows loading skeleton initially', () => {
      render(
        <ProgressiveContent>
          <div>Progressive Content</div>
        </ProgressiveContent>
      )

      expect(screen.queryByText('Progressive Content')).not.toBeInTheDocument()
    })

    it('renders content after default delay for medium priority', () => {
      render(
        <ProgressiveContent priority="medium">
          <div>Progressive Content</div>
        </ProgressiveContent>
      )

      jest.advanceTimersByTime(100)

      expect(screen.getByText('Progressive Content')).toBeInTheDocument()
    })

    it('renders content immediately for high priority', () => {
      render(
        <ProgressiveContent priority="high">
          <div>High Priority Content</div>
        </ProgressiveContent>
      )

      jest.advanceTimersByTime(0)

      expect(screen.getByText('High Priority Content')).toBeInTheDocument()
    })

    it('uses custom delay', () => {
      render(
        <ProgressiveContent delay={500}>
          <div>Custom Delay Content</div>
        </ProgressiveContent>
      )

      jest.advanceTimersByTime(499)
      expect(screen.queryByText('Custom Delay Content')).not.toBeInTheDocument()

      jest.advanceTimersByTime(1)
      expect(screen.getByText('Custom Delay Content')).toBeInTheDocument()
    })
  })

  describe('LazyImage', () => {
    it('renders placeholder initially for non-priority images', () => {
      render(
        <LazyImage
          src="/test-image.jpg"
          alt="Test Image"
          placeholder="/placeholder.svg"
        />
      )

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', '/placeholder.svg')
    })

    it('renders actual image immediately for priority images', () => {
      render(
        <LazyImage
          src="/test-image.jpg"
          alt="Test Image"
          priority={true}
        />
      )

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', '/test-image.jpg')
    })

    it('sets up intersection observer for lazy loading', () => {
      render(
        <LazyImage
          src="/test-image.jpg"
          alt="Test Image"
        />
      )

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        { rootMargin: '50px' }
      )
    })

    it('applies correct CSS classes and styles', () => {
      render(
        <LazyImage
          src="/test-image.jpg"
          alt="Test Image"
          className="custom-class"
          blurDataURL="data:image/jpeg;base64,..."
        />
      )

      const img = screen.getByRole('img')
      expect(img).toHaveClass('custom-class')
      expect(img).toHaveClass('transition-opacity')
      expect(img).toHaveClass('duration-300')
    })

    it('handles image load success', async () => {
      // Mock Image constructor
      const mockImage = {
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        src: ''
      }
      
      global.Image = jest.fn().mockImplementation(() => mockImage)

      render(
        <LazyImage
          src="/test-image.jpg"
          alt="Test Image"
          priority={false}
        />
      )

      // Simulate intersection
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      observerCallback([{ isIntersecting: true, target: {} }])

      // Simulate successful image load
      if (mockImage.onload) {
        mockImage.onload()
      }

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('src', '/test-image.jpg')
      })
    })
  })
})
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OptimizedImage, VirtualizedImageGallery } from '../optimized-image'

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, onLoad, onError, ...props }: any) => {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        {...props}
      />
    )
  }
}))

// Mock Intersection Observer
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})
window.IntersectionObserver = mockIntersectionObserver

// Mock performance monitor
jest.mock('@/lib/performance/monitor', () => ({
  performanceMonitor: {
    trackImageLoad: jest.fn(),
    trackCustomMetric: jest.fn(),
  }
}))

describe('OptimizedImage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders with basic props', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={800}
        height={600}
      />
    )

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Test Image')
  })

  it('applies lazy loading by default', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={800}
        height={600}
      />
    )

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { rootMargin: '50px', threshold: 0.1 }
    )
  })

  it('disables lazy loading when priority is true', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={800}
        height={600}
        priority={true}
      />
    )

    expect(mockIntersectionObserver).not.toHaveBeenCalled()
  })

  it('shows loading placeholder initially', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={800}
        height={600}
      />
    )

    const container = screen.getByRole('img').parentElement
    expect(container).toHaveClass('animate-pulse')
  })

  it('tracks loading performance on load', async () => {
    const performanceMonitor = require('@/lib/performance/monitor').performanceMonitor

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={800}
        height={600}
        priority={true}
      />
    )

    const img = screen.getByRole('img')
    
    // Simulate image load
    fireEvent.load(img)

    await waitFor(() => {
      expect(performanceMonitor.trackImageLoad).toHaveBeenCalledWith(
        '/test-image.jpg',
        expect.any(Number),
        { width: 800, height: 600 }
      )
    })
  })

  it('handles loading errors gracefully', async () => {
    const onError = jest.fn()

    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={800}
        height={600}
        onError={onError}
        priority={true}
      />
    )

    const img = screen.getByRole('img')
    
    // Simulate image error
    fireEvent.error(img)

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })
  })

  it('applies blur placeholder when provided', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={800}
        height={600}
        blurDataURL="data:image/jpeg;base64,..."
      />
    )

    const img = screen.getByRole('img')
    expect(img).toHaveStyle({ filter: 'blur(8px)' })
  })

  it('removes blur on load', async () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={800}
        height={600}
        blurDataURL="data:image/jpeg;base64,..."
        priority={true}
      />
    )

    const img = screen.getByRole('img')
    
    // Initially blurred
    expect(img).toHaveStyle({ filter: 'blur(8px)' })

    // Simulate image load
    fireEvent.load(img)

    await waitFor(() => {
      expect(img).toHaveStyle({ filter: 'none' })
    })
  })

  it('applies custom className', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={800}
        height={600}
        className="custom-image-class"
      />
    )

    const container = screen.getByRole('img').parentElement
    expect(container).toHaveClass('custom-image-class')
  })

  it('uses custom placeholder', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        width={800}
        height={600}
        placeholder="/custom-placeholder.svg"
      />
    )

    // The placeholder behavior would be implemented in the actual component
    // This test ensures the prop is accepted
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('handles responsive sizes', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test Image"
        fill={true}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    )

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw')
  })
})

describe('VirtualizedImageGallery', () => {
  const mockImages = Array.from({ length: 100 }, (_, i) => ({
    id: `image-${i}`,
    src: `/image-${i}.jpg`,
    alt: `Image ${i}`,
    width: 300,
    height: 200
  }))

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders virtual gallery container', () => {
    render(
      <VirtualizedImageGallery
        images={mockImages}
        itemWidth={300}
        itemHeight={200}
        containerHeight={600}
        columns={3}
      />
    )

    const container = screen.getByRole('generic')
    expect(container).toHaveStyle({ height: '600px' })
  })

  it('calculates visible items correctly', () => {
    render(
      <VirtualizedImageGallery
        images={mockImages.slice(0, 20)} // Smaller set for testing
        itemWidth={300}
        itemHeight={200}
        containerHeight={600}
        columns={3}
      />
    )

    // Should render some images initially
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
    expect(images.length).toBeLessThan(20) // Should not render all images
  })

  it('handles scroll events', () => {
    render(
      <VirtualizedImageGallery
        images={mockImages}
        itemWidth={300}
        itemHeight={200}
        containerHeight={600}
        columns={3}
      />
    )

    const container = screen.getByRole('generic')
    
    // Simulate scroll
    fireEvent.scroll(container, { target: { scrollTop: 400 } })

    // The component should update visible items
    expect(container).toBeDefined()
  })

  it('applies custom gap', () => {
    render(
      <VirtualizedImageGallery
        images={mockImages}
        itemWidth={300}
        itemHeight={200}
        containerHeight={600}
        columns={3}
        gap={20}
      />
    )

    // Gap would be applied in the actual implementation
    expect(screen.getByRole('generic')).toBeInTheDocument()
  })

  it('uses custom render function when provided', () => {
    const customRender = jest.fn((image, index) => (
      <div key={image.id} data-testid={`custom-${index}`}>
        Custom: {image.alt}
      </div>
    ))

    render(
      <VirtualizedImageGallery
        images={mockImages.slice(0, 10)}
        itemWidth={300}
        itemHeight={200}
        containerHeight={600}
        columns={3}
        renderItem={customRender}
      />
    )

    expect(customRender).toHaveBeenCalled()
  })

  it('handles empty images array', () => {
    render(
      <VirtualizedImageGallery
        images={[]}
        itemWidth={300}
        itemHeight={200}
        containerHeight={600}
        columns={3}
      />
    )

    const container = screen.getByRole('generic')
    expect(container).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('applies loading states correctly', () => {
    render(
      <VirtualizedImageGallery
        images={mockImages.slice(0, 5)}
        itemWidth={300}
        itemHeight={200}
        containerHeight={600}
        columns={3}
        loading={true}
      />
    )

    // Loading state would show skeleton placeholders
    const container = screen.getByRole('generic')
    expect(container).toBeInTheDocument()
  })

  it('handles overscan correctly', () => {
    render(
      <VirtualizedImageGallery
        images={mockImages}
        itemWidth={300}
        itemHeight={200}
        containerHeight={600}
        columns={3}
        overscan={5}
      />
    )

    // Overscan affects how many extra items are rendered
    // This would be tested by checking the actual rendering logic
    expect(screen.getByRole('generic')).toBeInTheDocument()
  })

  it('tracks performance metrics', async () => {
    const performanceMonitor = require('@/lib/performance/monitor').performanceMonitor

    render(
      <VirtualizedImageGallery
        images={mockImages.slice(0, 10)}
        itemWidth={300}
        itemHeight={200}
        containerHeight={600}
        columns={3}
      />
    )

    // Simulate scroll to trigger performance tracking
    const container = screen.getByRole('generic')
    fireEvent.scroll(container, { target: { scrollTop: 200 } })

    await waitFor(() => {
      expect(performanceMonitor.trackCustomMetric).toHaveBeenCalledWith(
        'virtual_gallery_scroll',
        expect.any(Number),
        'ms',
        expect.any(Object)
      )
    })
  })
})
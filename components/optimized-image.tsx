'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  loading?: 'lazy' | 'eager'
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  className?: string
  style?: React.CSSProperties
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  fallback?: string
  lazy?: boolean
  webpFallback?: boolean
  progressive?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  loading = 'lazy',
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  className,
  style,
  sizes,
  onLoad,
  onError,
  fallback = '/placeholder.svg',
  lazy = true,
  webpFallback = true,
  progressive = true,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [imageError, setImageError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(!lazy || priority)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )

    const currentRef = imgRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [lazy, priority, isInView])

  // Error handling
  const handleError = () => {
    if (!imageError) {
      setImageError(true)
      setImageSrc(fallback)
      onError?.()
    }
  }

  // Load handling
  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  // Generate blur placeholder
  const generateBlurDataURL = (w: number = 10, h: number = 10) => {
    if (blurDataURL) return blurDataURL
    
    // Simple base64 encoded 1x1 pixel
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
      </svg>`
    ).toString('base64')}`
  }

  // Optimize sizes attribute
  const optimizedSizes = sizes || (
    fill ? '100vw' : 
    width && width > 768 ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' :
    '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
  )

  // Image component props
  const imageProps = {
    src: imageSrc,
    alt,
    quality,
    placeholder: placeholder === 'blur' ? 'blur' as const : 'empty' as const,
    blurDataURL: placeholder === 'blur' ? generateBlurDataURL(width, height) : undefined,
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      'transition-opacity duration-300',
      isLoaded ? 'opacity-100' : 'opacity-0',
      className
    ),
    style,
    priority,
    loading,
    sizes: optimizedSizes,
    ...props
  }

  // Render skeleton/placeholder while not in view
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-muted animate-pulse',
          fill ? 'absolute inset-0' : '',
          className
        )}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style
        }}
      />
    )
  }

  // Render image based on fill prop
  if (fill) {
    return (
      <div ref={imgRef} className="relative overflow-hidden">
        <Image
          {...imageProps}
          fill
        />
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>
    )
  }

  return (
    <div ref={imgRef} className="relative">
      <Image
        {...imageProps}
        width={width}
        height={height}
      />
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  )
}

// Advanced image gallery component with virtualization
interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    width?: number
    height?: number
    caption?: string
  }>
  columns?: number
  gap?: number
  className?: string
  onImageClick?: (image: any, index: number) => void
  virtualizeThreshold?: number
}

export function OptimizedImageGallery({
  images,
  columns = 3,
  gap = 16,
  className,
  onImageClick,
  virtualizeThreshold = 20
}: ImageGalleryProps) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: virtualizeThreshold })
  const containerRef = useRef<HTMLDivElement>(null)

  // Virtualization for large galleries
  useEffect(() => {
    if (images.length <= virtualizeThreshold) return

    const handleScroll = () => {
      if (!containerRef.current) return

      const { scrollTop, clientHeight } = containerRef.current
      const itemHeight = 300 // Approximate item height
      const buffer = 5

      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
      const end = Math.min(
        images.length,
        Math.ceil((scrollTop + clientHeight) / itemHeight) + buffer
      )

      setVisibleRange({ start, end })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [images.length, virtualizeThreshold])

  const visibleImages = images.length > virtualizeThreshold 
    ? images.slice(visibleRange.start, visibleRange.end)
    : images

  return (
    <div
      ref={containerRef}
      className={cn(
        'grid auto-rows-max overflow-auto',
        `grid-cols-${columns}`,
        className
      )}
      style={{ gap }}
    >
      {images.length > virtualizeThreshold && (
        // Spacer for virtualized content
        <div style={{ height: visibleRange.start * 300 }} />
      )}
      
      {visibleImages.map((image, index) => {
        const actualIndex = images.length > virtualizeThreshold 
          ? visibleRange.start + index 
          : index

        return (
          <div
            key={actualIndex}
            className="relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => onImageClick?.(image, actualIndex)}
          >
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              width={image.width || 400}
              height={image.height || 300}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {image.caption}
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        )
      })}
      
      {images.length > virtualizeThreshold && (
        // Spacer for remaining content
        <div style={{ height: (images.length - visibleRange.end) * 300 }} />
      )}
    </div>
  )
}

// Progressive image loader with WebP support
export function ProgressiveImage({
  src,
  alt,
  lowQualitySrc,
  className,
  width,
  height,
  ...props
}: OptimizedImageProps & { lowQualitySrc?: string }) {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src)
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false)

  useEffect(() => {
    if (!lowQualitySrc) return

    const img = new window.Image()
    img.onload = () => {
      setCurrentSrc(src)
      setIsHighQualityLoaded(true)
    }
    img.src = src
  }, [src, lowQualitySrc])

  return (
    <OptimizedImage
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn(
        'transition-all duration-500',
        !isHighQualityLoaded && lowQualitySrc ? 'filter blur-sm' : '',
        className
      )}
      quality={isHighQualityLoaded ? 90 : 20}
      {...props}
    />
  )
}
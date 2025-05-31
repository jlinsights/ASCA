'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye } from 'lucide-react'

interface AdaptiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
  onLoad?: () => void
  onError?: () => void
  showPlaceholder?: boolean
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto' | 'calligraphy'
  blur?: boolean
}

export function AdaptiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  sizes,
  fill = false,
  onLoad,
  onError,
  showPlaceholder = true,
  aspectRatio = 'auto',
  blur = true
}: AdaptiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')
  const imgRef = useRef<HTMLDivElement>(null)

  // 썸네일 생성 (저품질 이미지)
  const generateThumbnail = (originalSrc: string) => {
    if (originalSrc.includes('placeholder.svg')) return originalSrc
    
    // 실제 환경에서는 이미지 처리 서비스나 Next.js Image Optimization을 사용
    const thumbnailSrc = originalSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '_thumb.$1')
    return thumbnailSrc
  }

  // 반응형 sizes 자동 생성
  const getResponsiveSizes = () => {
    if (sizes) return sizes
    
    switch (aspectRatio) {
      case 'square':
        return '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
      case 'portrait':
        return '(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 40vw'
      case 'landscape':
        return '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw'
      case 'calligraphy':
        return '(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 20vw'
      default:
        return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    }
  }

  // Intersection Observer로 지연 로딩
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px'
      }
    )

    if (imgRef.current && !priority) {
      observer.observe(imgRef.current)
    } else {
      setIsVisible(true)
    }

    return () => observer.disconnect()
  }, [priority])

  // 이미지 로딩 전략
  useEffect(() => {
    if (!isVisible) return

    const loadImage = async () => {
      try {
        // 먼저 썸네일 로드
        if (blur && showPlaceholder) {
          setCurrentSrc(generateThumbnail(src))
        }
        
        // 원본 이미지 프리로드
        const img = new window.Image()
        img.onload = () => {
          setCurrentSrc(src)
          setIsLoading(false)
          onLoad?.()
        }
        img.onerror = () => {
          setIsError(true)
          setIsLoading(false)
          onError?.()
        }
        img.src = src
      } catch (error) {
        setIsError(true)
        setIsLoading(false)
        onError?.()
      }
    }

    loadImage()
  }, [isVisible, src, blur, showPlaceholder, onLoad, onError])

  // 에러 처리
  if (isError) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          aspectRatio === 'square' && 'aspect-square',
          aspectRatio === 'portrait' && 'aspect-[3/4]',
          aspectRatio === 'landscape' && 'aspect-[4/3]',
          className
        )}
      >
        <div className="text-center p-4">
          <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">이미지를 불러올 수 없습니다</p>
        </div>
      </div>
    )
  }

  // 로딩 중일 때 스켈레톤 표시
  if (!isVisible || isLoading) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          "relative overflow-hidden",
          aspectRatio === 'square' && 'aspect-square',
          aspectRatio === 'portrait' && 'aspect-[3/4]',
          aspectRatio === 'landscape' && 'aspect-[4/3]',
          aspectRatio === 'calligraphy' && 'aspect-[1/4]',
          className
        )}
      >
        {showPlaceholder ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <div className="w-full h-full bg-muted animate-pulse" />
        )}
        
        {/* 블러 처리된 썸네일 */}
        {currentSrc && currentSrc !== src && (
          <Image
            src={currentSrc}
            alt={alt}
            fill={fill}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            className={cn(
              "transition-opacity duration-300",
              blur && "blur-sm",
              className
            )}
            quality={30}
            priority={priority}
          />
        )}
      </div>
    )
  }

  // 메인 이미지 렌더링
  return (
    <div 
      ref={imgRef}
      className={cn(
        "relative overflow-hidden",
        aspectRatio === 'square' && 'aspect-square',
        aspectRatio === 'portrait' && 'aspect-[3/4]',
        aspectRatio === 'landscape' && 'aspect-[4/3]',
        aspectRatio === 'calligraphy' && 'aspect-[1/4]',
        className
      )}
    >
      <Image
        src={currentSrc}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn(
          "transition-all duration-500 ease-out",
          "hover:scale-105",
          className
        )}
        quality={quality}
        sizes={getResponsiveSizes()}
        priority={priority}
        placeholder={blur ? "blur" : undefined}
        blurDataURL={blur ? generateThumbnail(src) : undefined}
      />
    </div>
  )
}

// 작품 전용 이미지 컴포넌트
interface ArtworkImageProps extends Omit<AdaptiveImageProps, 'aspectRatio'> {
  variant?: 'thumbnail' | 'card' | 'hero' | 'detail' | 'calligraphy'
}

export function ArtworkImage({ 
  variant = 'card',
  quality,
  ...props 
}: ArtworkImageProps) {
  const getConfig = () => {
    switch (variant) {
      case 'thumbnail':
        return {
          aspectRatio: 'square' as const,
          quality: 60,
          sizes: '(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 15vw'
        }
      case 'card':
        return {
          aspectRatio: 'portrait' as const,
          quality: 75,
          sizes: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
        }
      case 'hero':
        return {
          aspectRatio: 'landscape' as const,
          quality: 90,
          sizes: '100vw',
          priority: true
        }
      case 'detail':
        return {
          aspectRatio: 'auto' as const,
          quality: 100,
          sizes: '(max-width: 640px) 100vw, 80vw'
        }
      case 'calligraphy':
        return {
          aspectRatio: 'calligraphy' as const,
          quality: 85,
          sizes: '(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 20vw'
        }
      default:
        return {
          aspectRatio: 'auto' as const,
          quality: 75
        }
    }
  }

  const config = getConfig()

  return (
    <AdaptiveImage
      {...props}
      aspectRatio={config.aspectRatio}
      quality={quality || config.quality}
      sizes={props.sizes || config.sizes}
      priority={props.priority || config.priority}
    />
  )
}

// 작가 프로필 이미지 컴포넌트
interface ArtistImageProps extends Omit<AdaptiveImageProps, 'aspectRatio'> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ArtistImage({ 
  size = 'md',
  className,
  ...props 
}: ArtistImageProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8'
      case 'md':
        return 'w-12 h-12'
      case 'lg':
        return 'w-16 h-16'
      case 'xl':
        return 'w-24 h-24'
      default:
        return 'w-12 h-12'
    }
  }

  return (
    <div className={cn(
      "relative rounded-full overflow-hidden bg-muted",
      getSizeClass(),
      className
    )}>
      <AdaptiveImage
        {...props}
        aspectRatio="square"
        quality={80}
        fill={true}
        className="object-cover"
        sizes="96px"
      />
    </div>
  )
} 
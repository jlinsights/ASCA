'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Info
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ImageViewerProps {
  images: string[]
  currentIndex?: number
  title: string
  artist: string
  description?: string
  allowDownload?: boolean
  children: React.ReactNode
}

export function ImageViewer({ 
  images, 
  currentIndex = 0, 
  title, 
  artist, 
  description,
  allowDownload = true,
  children 
}: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPinchDistance, setLastPinchDistance] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const imageRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // 확대/축소 함수
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.5, 0.5))
    if (zoom <= 1) {
      setPosition({ x: 0, y: 0 })
    }
  }, [zoom])

  // 이미지 회전
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // 리셋
  const handleReset = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  }, [])

  // 이전/다음 이미지
  const handlePrevious = useCallback(() => {
    setActiveIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))
    handleReset()
  }, [images.length, handleReset])

  const handleNext = useCallback(() => {
    setActiveIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))
    handleReset()
  }, [images.length, handleReset])

  // 고해상도 이미지 다운로드
  const handleDownload = async () => {
    if (!allowDownload) {
      toast({
        title: "다운로드 제한",
        description: "이 이미지는 저작권으로 인해 다운로드할 수 없습니다.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      const imageUrl = images[activeIndex]
      
      if (!imageUrl) {
        setIsLoading(false)
        return
      }
      
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title}_${artist}_${activeIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "다운로드 완료",
        description: "고해상도 이미지가 다운로드되었습니다."
      })
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: "이미지 다운로드에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 마우스 휠 줌
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)))
  }

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
    }
  }

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }))
    }
  }

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 터치 제스처 처리
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      if (touch1 && touch2) {
        const distance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        )
        setLastPinchDistance(distance)
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      if (touch1 && touch2) {
        const distance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        )
        
        if (lastPinchDistance > 0) {
          const delta = distance / lastPinchDistance
          setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)))
        }
        setLastPinchDistance(distance)
      }
    }
  }

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          setIsOpen(false)
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case '0':
          handleReset()
          break
        case 'r':
          handleRotate()
          break
        case 'i':
          setShowInfo(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleNext, handlePrevious, handleZoomOut, handleReset])

  // 다이얼로그 열림/닫힘 시 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(currentIndex)
      handleReset()
    }
  }, [isOpen, currentIndex, handleReset])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 bg-black/95">
        <div className="relative w-full h-full flex flex-col">
          {/* 상단 툴바 */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <h3 className="font-medium">{title}</h3>
                <Badge variant="outline" className="text-white border-white/30">
                  {activeIndex + 1} / {images.length}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                
                <span className="text-sm min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-white hover:bg-white/20"
                >
                  <Info className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isLoading || !allowDownload}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 이미지 영역 */}
          <div 
            ref={imageRef}
            className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease'
              }}
              className="relative"
            >
              <Image
                src={images[activeIndex] || '/placeholder.jpg'}
                alt={`${title} by ${artist}`}
                width={1200}
                height={800}
                className="max-w-none object-contain"
                priority
                quality={100}
                draggable={false}
              />
            </div>
          </div>

          {/* 네비게이션 버튼 */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-40"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-40"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* 이미지 정보 패널 */}
          {showInfo && description && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-6 text-white z-40">
              <h4 className="font-medium mb-2">{title}</h4>
              <p className="text-sm text-gray-300 mb-1">작가: {artist}</p>
              <p className="text-sm text-gray-300">{description}</p>
            </div>
          )}

          {/* 썸네일 네비게이션 */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveIndex(index)
                    handleReset()
                  }}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 
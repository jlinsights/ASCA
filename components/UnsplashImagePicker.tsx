'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Download, Heart, User, X } from 'lucide-react'
import { searchUnsplashImages, triggerUnsplashDownload, downloadImageAsBlob, type UnsplashImage } from '@/lib/unsplash'
import { useLanguage } from '@/contexts/language-context'
import Image from 'next/image'
import { log } from '@/lib/utils/logger'

interface UnsplashImagePickerProps {
  onImageSelect: (file: File, imageData: UnsplashImage) => void
  trigger?: React.ReactNode
}

export default function UnsplashImagePicker({ onImageSelect, trigger }: UnsplashImagePickerProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  // 기본 검색어로 서예 관련 이미지 로드
  useEffect(() => {
    if (isOpen && images.length === 0) {
      handleSearch('calligraphy art')
    }
  }, [isOpen, images.length, handleSearch])

  const handleSearch = useCallback(async (query?: string) => {
    const searchTerm = query || searchQuery
    if (!searchTerm.trim()) return

    setLoading(true)
    try {
      const result = await searchUnsplashImages(searchTerm, 1, 20)
      setImages(result.images)
      setTotalPages(result.totalPages)
      setPage(1)
    } catch (error) {
      log.error('Error searching images', error as Error)
      setLoading(false)
    }
  }, [searchQuery])

  const loadMoreImages = async () => {
    if (page >= totalPages || loading) return

    setLoading(true)
    try {
      const result = await searchUnsplashImages(searchQuery, page + 1, 20)
      setImages(prev => [...prev, ...result.images])
      setPage(prev => prev + 1)
    } catch (error) {
      log.error('Error loading more images', error as Error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = async (image: UnsplashImage) => {
    setSelectedImage(image)
    setDownloading(true)

    try {
      // Unsplash API 요구사항: 다운로드 트리거
      if (image.links?.download_location) {
        await triggerUnsplashDownload(image.links.download_location)
      }

      // 이미지를 Blob으로 다운로드
      const blob = await downloadImageAsBlob(image.urls.regular)
      if (!blob) {
        throw new Error('Failed to download image')
      }

      // Blob을 File 객체로 변환
      const fileName = `unsplash-${image.id}.jpg`
      const file = new File([blob], fileName, { type: 'image/jpeg' })

      // 부모 컴포넌트에 파일과 이미지 데이터 전달
      onImageSelect(file, image)
      setIsOpen(false)
      setSelectedImage(null)
    } catch (error) {
      log.error('Error selecting image', error as Error)
      alert('이미지 선택 중 오류가 발생했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Search className="w-4 h-4 mr-2" />
            Unsplash에서 이미지 선택
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Unsplash 이미지 선택
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 검색 입력 */}
          <div className="flex gap-2">
            <Input
              placeholder="이미지 검색... (예: calligraphy, art, traditional)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={() => handleSearch()} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              검색
            </Button>
          </div>

          {/* 빠른 검색 태그 */}
          <div className="flex flex-wrap gap-2">
            {['calligraphy', 'traditional art', 'brush painting', 'asian art', 'ink art', 'zen'].map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  setSearchQuery(tag)
                  handleSearch(tag)
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* 이미지 그리드 */}
          <div className="max-h-[60vh] overflow-y-auto">
            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage?.id === image.id 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-transparent hover:border-primary/50'
                    }`}
                    onClick={() => handleImageSelect(image)}
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={image.urls.small}
                        alt={image.alt_description || 'Unsplash image'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      
                      {/* 오버레이 정보 */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200">
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                          <div className="flex items-center gap-1 text-xs">
                            <User className="w-3 h-3" />
                            <span className="truncate">{image.user.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              <span>{image.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              <span>{image.downloads || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 선택 중 로딩 */}
                      {downloading && selectedImage?.id === image.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>이미지를 검색하는 중...</span>
                  </div>
                ) : (
                  <div>
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>검색어를 입력하여 이미지를 찾아보세요</p>
                  </div>
                )}
              </div>
            )}

            {/* 더 보기 버튼 */}
            {images.length > 0 && page < totalPages && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={loadMoreImages}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      로딩 중...
                    </>
                  ) : (
                    '더 많은 이미지 보기'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Unsplash 크레딧 */}
          <div className="text-xs text-muted-foreground text-center border-t pt-2">
            이미지 제공: <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
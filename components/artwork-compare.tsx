'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, ZoomIn, ArrowLeftRight, Grid2X2 } from 'lucide-react'
import dynamic from 'next/dynamic'

// ImageViewer를 동적으로 로드하여 서버 컴포넌트 충돌 방지
const ImageViewer = dynamic(
  () => import('./image-viewer').then(mod => ({ default: mod.ImageViewer })),
  {
    ssr: false,
    loading: () => <div className='w-full h-full bg-muted animate-pulse' />,
  }
)

interface Artwork {
  id: string
  title: string
  artist: string
  imageUrl: string
  images: string[]
  year: number
  medium: string
  dimensions: string
  description: string
}

// 비교 기능을 위한 컨텍스트
interface CompareContextType {
  addArtwork: (artwork: Artwork) => void
  removeArtwork: (artworkId: string) => void
  selectedArtworks: Artwork[]
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  maxArtworks: number
}

const CompareContext = createContext<CompareContextType | null>(null)

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider')
  }
  return context
}

// 전역 CompareProvider 컴포넌트
interface CompareProviderProps {
  children: React.ReactNode
}

export function CompareProvider({ children }: CompareProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([])
  const maxArtworks = 4

  // 작품 추가
  const addArtwork = useCallback(
    (artwork: Artwork) => {
      if (
        selectedArtworks.length < maxArtworks &&
        !selectedArtworks.find(a => a.id === artwork.id)
      ) {
        setSelectedArtworks(prev => [...prev, artwork])
      }
    },
    [selectedArtworks, maxArtworks]
  )

  // 작품 제거
  const removeArtwork = useCallback((artworkId: string) => {
    setSelectedArtworks(prev => prev.filter(a => a.id !== artworkId))
  }, [])

  // 다이얼로그 닫힐 때 초기화 (선택사항)
  useEffect(() => {
    if (!isOpen) {
      // 필요에 따라 선택된 작품들을 유지하거나 초기화
      // setSelectedArtworks([])
    }
  }, [isOpen])

  const value = {
    addArtwork,
    removeArtwork,
    selectedArtworks,
    isOpen,
    setIsOpen,
    maxArtworks,
  }

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

// 비교 다이얼로그 컴포넌트
interface ArtworkCompareDialogProps {
  children: React.ReactNode
}

export function ArtworkCompareDialog({ children }: ArtworkCompareDialogProps) {
  const { selectedArtworks, removeArtwork, isOpen, setIsOpen, maxArtworks } = useCompare()
  const [viewMode, setViewMode] = useState<'grid' | 'side-by-side'>('side-by-side')

  // 전체 초기화
  const clearAll = useCallback(() => {
    selectedArtworks.forEach(artwork => removeArtwork(artwork.id))
  }, [selectedArtworks, removeArtwork])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-w-full max-h-full w-screen h-screen p-0'>
        <div className='relative w-full h-full flex flex-col bg-background'>
          {/* 상단 툴바 */}
          <div className='flex items-center justify-between p-4 border-b bg-background'>
            <div className='flex items-center gap-4'>
              <h2 className='text-lg font-semibold'>작품 비교</h2>
              <Badge variant='outline'>
                {selectedArtworks.length} / {maxArtworks}
              </Badge>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setViewMode(viewMode === 'grid' ? 'side-by-side' : 'grid')}
                className='gap-2'
              >
                {viewMode === 'grid' ? (
                  <ArrowLeftRight className='w-4 h-4' />
                ) : (
                  <Grid2X2 className='w-4 h-4' />
                )}
                {viewMode === 'grid' ? '나란히' : '격자'}
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={clearAll}
                disabled={selectedArtworks.length === 0}
              >
                전체 초기화
              </Button>

              <Button variant='ghost' size='sm' onClick={() => setIsOpen(false)}>
                <X className='w-4 h-4' />
              </Button>
            </div>
          </div>

          {/* 작품 선택 영역 */}
          {selectedArtworks.length === 0 && (
            <div className='flex-1 flex items-center justify-center'>
              <div className='text-center space-y-4'>
                <div className='w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center'>
                  <Grid2X2 className='w-8 h-8 text-muted-foreground' />
                </div>
                <div>
                  <h3 className='text-lg font-medium mb-2'>작품을 선택해주세요</h3>
                  <p className='text-sm text-muted-foreground'>
                    작품 페이지에서 "비교하기" 버튼을 클릭하여
                    <br />
                    최대 {maxArtworks}개의 작품을 동시에 비교할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 비교 영역 */}
          {selectedArtworks.length > 0 && (
            <div className='flex-1 p-4 overflow-auto'>
              <div
                className={`h-full ${
                  viewMode === 'grid'
                    ? selectedArtworks.length === 1
                      ? 'grid grid-cols-1'
                      : selectedArtworks.length === 2
                        ? 'grid grid-cols-2'
                        : 'grid grid-cols-2 lg:grid-cols-3'
                    : 'flex gap-4 overflow-x-auto'
                } gap-4`}
              >
                {selectedArtworks.map((artwork, index) => (
                  <Card key={artwork.id} className='relative group flex-shrink-0 h-full'>
                    {/* 제거 버튼 */}
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => removeArtwork(artwork.id)}
                      className='absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X className='w-3 h-3' />
                    </Button>

                    <CardContent className='p-0 h-full flex flex-col'>
                      {/* 이미지 영역 */}
                      <div className='relative flex-1 min-h-[300px] bg-muted rounded-t-lg overflow-hidden'>
                        <ImageViewer
                          images={artwork.images}
                          title={artwork.title}
                          artist={artwork.artist}
                          description={artwork.description}
                        >
                          <Image
                            src={artwork.imageUrl}
                            alt={`${artwork.title} by ${artwork.artist}`}
                            fill
                            className='object-contain cursor-pointer hover:scale-105 transition-transform'
                          />
                        </ImageViewer>

                        {/* 확대 아이콘 */}
                        <div className='absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <Badge variant='secondary' className='gap-1'>
                            <ZoomIn className='w-3 h-3' />
                            확대
                          </Badge>
                        </div>
                      </div>

                      {/* 작품 정보 */}
                      <div className='p-4 space-y-2'>
                        <div>
                          <h3 className='font-medium text-sm line-clamp-2'>{artwork.title}</h3>
                          <p className='text-xs text-muted-foreground'>{artwork.artist}</p>
                        </div>

                        <div className='text-xs text-muted-foreground space-y-1'>
                          <p>{artwork.year}</p>
                          <p>{artwork.medium}</p>
                          <p>{artwork.dimensions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 하단 안내 */}
          {selectedArtworks.length > 0 && (
            <div className='border-t bg-muted/50 p-3'>
              <div className='text-xs text-muted-foreground text-center'>
                💡 작품을 클릭하면 고해상도로 확대하여 자세히 관찰할 수 있습니다.
                {selectedArtworks.length < maxArtworks &&
                  ` | ${maxArtworks - selectedArtworks.length}개 더 추가할 수 있습니다.`}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// 작품 카드에서 사용할 비교 버튼 컴포넌트
interface CompareButtonProps {
  artwork: Artwork
  className?: string
}

export function CompareButton({ artwork, className }: CompareButtonProps) {
  const { addArtwork, selectedArtworks, setIsOpen, maxArtworks } = useCompare()

  const isSelected = selectedArtworks.find(a => a.id === artwork.id)
  const isFull = selectedArtworks.length >= maxArtworks

  const handleClick = useCallback(() => {
    if (!isSelected && !isFull) {
      addArtwork(artwork)
      setIsOpen(true)
    } else if (isSelected) {
      setIsOpen(true)
    }
  }, [isSelected, isFull, addArtwork, artwork, setIsOpen])

  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      size='sm'
      onClick={handleClick}
      disabled={!isSelected && isFull}
      className={className}
    >
      {isSelected ? '비교 중' : isFull ? '비교 불가' : '비교하기'}
    </Button>
  )
}

// 호환성을 위한 기존 컴포넌트 (deprecated)
export function ArtworkCompare({ children }: { children: React.ReactNode }) {
  return <ArtworkCompareDialog>{children}</ArtworkCompareDialog>
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { getExhibitions } from '@/lib/supabase/cms'
import type { Exhibition, SearchFilters, PaginationParams } from '@/types/cms'
import { EmptyState } from '@/components/ui/empty-state'
import { ExhibitionCard } from './_components/exhibition-card'
import { ExhibitionDetailDialog } from './_components/exhibition-detail-dialog'

export default function ExhibitionsPage() {
  const { t } = useLanguage()
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null)
  const [likedExhibitions, setLikedExhibitions] = useState<Set<string>>(new Set())

  const fetchExhibitions = useCallback(async () => {
    try {
      setLoading(true)
      const filters: SearchFilters = {}

      if (searchQuery) filters.query = searchQuery
      if (selectedStatus !== 'all') filters.status = selectedStatus

      const pagination: PaginationParams = {
        page: currentPage,
        limit: 12,
        sortBy: 'start_date',
        sortOrder: 'desc',
      }

      const response = await getExhibitions(filters, pagination)
      setExhibitions(response.data)
      setTotalPages(response.totalPages)
    } catch (err) {
      setError('전시회 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedStatus, currentPage])

  useEffect(() => {
    fetchExhibitions()
  }, [fetchExhibitions])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchExhibitions()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleLike = (exhibitionId: string) => {
    setLikedExhibitions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(exhibitionId)) {
        newSet.delete(exhibitionId)
      } else {
        newSet.add(exhibitionId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <main className='min-h-screen bg-transparent'>
        <section className='container mx-auto px-4 py-16'>
          <div className='max-w-6xl mx-auto text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto'></div>
            <p className='mt-4 text-muted-foreground font-medium'>전시회 정보를 불러오는 중...</p>
          </div>
        </section>
        <LayoutFooter />
      </main>
    )
  }

  if (error) {
    return (
      <main className='min-h-screen bg-transparent'>
        <section className='container mx-auto px-4 py-16'>
          <div className='max-w-6xl mx-auto text-center'>
            <div className='bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6'>
              <p className='text-red-700 dark:text-red-300 font-medium'>{error}</p>
              <Button onClick={fetchExhibitions} className='mt-4' variant='outline'>
                다시 시도
              </Button>
            </div>
          </div>
        </section>
        <LayoutFooter />
      </main>
    )
  }

  const featuredExhibitions = exhibitions.filter(exhibition => exhibition.is_featured)
  const regularExhibitions = exhibitions.filter(exhibition => !exhibition.is_featured)

  return (
    <main className='min-h-screen bg-transparent'>
      <section className='container mx-auto px-4 py-16'>
        <div className='max-w-6xl mx-auto'>
          {/* 헤더 */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold mb-4 text-foreground tracking-tight'>
              {t('exhibition')}
            </h1>
            <p className='text-lg text-muted-foreground font-medium'>
              동양서예협회의 다양한 전시회를 만나보세요
            </p>
          </div>

          {/* 검색 및 필터 */}
          <Card className='mb-8 border-border/50 shadow-sm'>
            <CardContent className='p-6'>
              <div className='flex flex-col md:flex-row gap-4 mb-4'>
                <div className='flex-1 relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='전시회 검색...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    className='pl-10 border-border/50 focus:border-primary'
                  />
                </div>
                <Button onClick={handleSearch} className='md:w-auto font-medium'>
                  검색
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setShowFilters(!showFilters)}
                  className='md:w-auto border-border/50'
                >
                  <Filter className='h-4 w-4 mr-2' />
                  필터
                </Button>
              </div>

              {showFilters && (
                <div className='border-t border-border/30 pt-4'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='text-sm font-medium mb-2 block text-foreground'>상태</label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className='border-border/50'>
                          <SelectValue placeholder='상태 선택' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>전체</SelectItem>
                          <SelectItem value='current'>진행중</SelectItem>
                          <SelectItem value='upcoming'>예정</SelectItem>
                          <SelectItem value='past'>종료</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 주요 전시회 */}
          {featuredExhibitions.length > 0 && (
            <div className='mb-12'>
              <div className='flex items-center gap-2 mb-6'>
                <Star className='h-5 w-5 text-amber-500' />
                <h2 className='text-2xl font-bold text-foreground'>주요 전시회</h2>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {featuredExhibitions.map(exhibition => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} featured={true} />
                ))}
              </div>
            </div>
          )}

          {/* 일반 전시회 */}
          {regularExhibitions.length > 0 && (
            <div>
              <h2 className='text-2xl font-bold mb-6 text-foreground'>전시회 목록</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {regularExhibitions.map(exhibition => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            </div>
          )}

          {/* 전시회가 없는 경우 */}
          {exhibitions.length === 0 && (
            <EmptyState
              icon={<Star className='w-6 h-6 text-muted-foreground' />}
              title='전시회가 없습니다'
              description='검색 조건을 변경하거나 나중에 다시 확인해주세요.'
            />
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className='mt-12 flex justify-center'>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='border-border/50'
                >
                  <ChevronLeft className='h-4 w-4' />
                  이전
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                  if (page > totalPages) return null
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => handlePageChange(page)}
                      className={currentPage === page ? '' : 'border-border/50'}
                    >
                      {page}
                    </Button>
                  )
                })}

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className='border-border/50'
                >
                  다음
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 전시회 상세 모달 */}
      <ExhibitionDetailDialog
        exhibition={selectedExhibition}
        onClose={() => setSelectedExhibition(null)}
        isLiked={selectedExhibition ? likedExhibitions.has(selectedExhibition.id) : false}
        onToggleLike={toggleLike}
      />

      <LayoutFooter />
    </main>
  )
}

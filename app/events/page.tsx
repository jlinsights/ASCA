'use client'

import { useState, useEffect, useCallback } from 'react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { Card, CardContent } from '@/components/ui/card'
import { PageHero } from '@/components/layout/page-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar,
  Search,
  Filter,
  Star,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { getEvents } from '@/lib/supabase/cms'
import { Event } from '@/types/cms'
import { useLanguage } from '@/contexts/language-context'
import { EventCard } from './_components/event-card'
import { getCategories, getStatusOptions } from './_components/events-meta'

const ITEMS_PER_PAGE = 9

export default function EventsPage() {
  const { language, t } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const categories = getCategories(language)
  const statusOptions = getStatusOptions(language)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = {
        query: searchQuery,
        type: selectedCategory === 'all' ? undefined : selectedCategory,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
      }

      const result = await getEvents(filters, {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      })

      setEvents(result.data || [])
      setTotalPages(Math.ceil((result.total || 0) / ITEMS_PER_PAGE))
    } catch (err) {
      setError(
        language === 'ko' ? '행사를 불러오는 중 오류가 발생했습니다.' : 'Error loading events.'
      )
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedStatus, currentPage, language])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchEvents()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='min-h-screen bg-transparent'>
      <main className='container mx-auto px-4 py-8'>
        <PageHero
          title={language === 'ko' ? '행사 안내' : 'Events'}
          subtitle={
            language === 'ko'
              ? '동양서예협회에서 주최하는 다양한 행사와 프로그램을 확인하세요.'
              : 'Discover various events and programs hosted by the Oriental Calligraphy Association.'
          }
        />

        {/* 검색 및 필터 섹션 */}
        <Card className='mb-8 border-border/50 shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex flex-col md:flex-row gap-4 mb-4'>
              {/* 검색 */}
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  placeholder={language === 'ko' ? '행사 검색...' : 'Search events...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  className='pl-10 border-border/50 focus:border-primary'
                />
              </div>
              <Button onClick={handleSearch} className='md:w-auto font-medium'>
                {language === 'ko' ? '검색' : 'Search'}
              </Button>
              <Button
                variant='outline'
                onClick={() => setShowFilters(!showFilters)}
                className='md:w-auto border-border/50'
              >
                <Filter className='h-4 w-4 mr-2' />
                {language === 'ko' ? '필터' : 'Filter'}
              </Button>
            </div>

            {showFilters && (
              <div className='border-t border-border/30 pt-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* 카테고리 필터 */}
                  <div>
                    <label className='text-sm font-medium mb-2 block text-foreground'>
                      {language === 'ko' ? '카테고리' : 'Category'}
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className='border-border/50'>
                        <SelectValue
                          placeholder={language === 'ko' ? '카테고리 선택' : 'Select category'}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 상태 필터 */}
                  <div>
                    <label className='text-sm font-medium mb-2 block text-foreground'>
                      {language === 'ko' ? '상태' : 'Status'}
                    </label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className='border-border/50'>
                        <SelectValue
                          placeholder={language === 'ko' ? '상태 선택' : 'Select status'}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 로딩 상태 */}
        {loading && (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto'></div>
            <p className='mt-4 text-muted-foreground font-medium'>
              {language === 'ko' ? '행사를 불러오는 중...' : 'Loading events...'}
            </p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className='text-center py-12'>
            <div className='bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto'>
              <AlertCircle className='h-8 w-8 text-red-500 mx-auto mb-4' />
              <p className='text-red-700 dark:text-red-300 font-medium'>{error}</p>
              <Button onClick={fetchEvents} variant='outline' className='mt-4'>
                {language === 'ko' ? '다시 시도' : 'Try Again'}
              </Button>
            </div>
          </div>
        )}

        {/* 행사 목록 */}
        {!loading && !error && (
          <>
            {events.length === 0 ? (
              <div className='text-center py-12'>
                <div className='bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-lg p-8 max-w-md mx-auto'>
                  <Calendar className='h-16 w-16 text-slate-300 mx-auto mb-4' />
                  <h3 className='text-lg font-bold text-foreground mb-2'>
                    {language === 'ko' ? '행사가 없습니다' : 'No events found'}
                  </h3>
                  <p className='text-muted-foreground'>
                    {language === 'ko'
                      ? '검색 조건을 변경하거나 나중에 다시 확인해주세요.'
                      : 'Try changing your search criteria or check back later.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* 주요 행사 섹션 */}
                {events.some(event => event.is_featured) && (
                  <div className='mb-12'>
                    <h2 className='text-2xl font-bold text-foreground mb-6 flex items-center gap-2'>
                      <Star className='h-6 w-6 text-amber-500' />
                      {language === 'ko' ? '주요 행사' : 'Featured Events'}
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                      {events
                        .filter(event => event.is_featured)
                        .map(event => (
                          <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                  </div>
                )}

                {/* 일반 행사 섹션 */}
                {events.some(event => !event.is_featured) && (
                  <div>
                    <h2 className='text-2xl font-bold text-foreground mb-6'>
                      {language === 'ko' ? '모든 행사' : 'All Events'}
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                      {events
                        .filter(event => !event.is_featured)
                        .map(event => (
                          <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                  </div>
                )}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className='flex justify-center mt-12'>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className='border-border/50'
                      >
                        <ChevronLeft className='h-4 w-4' />
                        {language === 'ko' ? '이전' : 'Previous'}
                      </Button>

                      <div className='flex items-center gap-1'>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                          if (page > totalPages) return null
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size='sm'
                              onClick={() => handlePageChange(page)}
                              className={currentPage === page ? 'w-10' : 'w-10 border-border/50'}
                            >
                              {page}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant='outline'
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className='border-border/50'
                      >
                        {language === 'ko' ? '다음' : 'Next'}
                        <ChevronRight className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <LayoutFooter />
    </div>
  )
}

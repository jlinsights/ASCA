'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Search, Filter, X, Loader2 } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
// import { searchWithAirtable } from '@/lib/supabase/search'

interface SearchFilters {
  category?: string
  artistType?: string
  year?: [number, number]
  tags?: string[]
  price?: [number, number]
  availability?: string
}

interface SearchResult {
  id: string
  type: 'artist' | 'artwork' | 'exhibition' | 'event' | 'notice'
  title: string
  subtitle?: string
  description: string
  image?: string
  url: string
  metadata?: Record<string, any>
}

interface SimpleSearchProps {
  placeholder?: string
  onResults?: (results: SearchResult[]) => void
  className?: string
}

interface AdvancedSearchProps {
  filters?: SearchFilters
  onFiltersChange?: (filters: SearchFilters) => void
  onResults?: (results: SearchResult[]) => void
  className?: string
}

interface SearchResultsProps {
  results: SearchResult[]
  isLoading?: boolean
  className?: string
}

export function SimpleSearch({ placeholder = "검색어를 입력하세요...", onResults, className }: SimpleSearchProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      onResults?.([])
      return
    }

    setIsLoading(true)
    try {
      // const searchResults = await searchWithAirtable(searchQuery)
      const searchResults: SearchResult[] = []
      setResults(searchResults)
      onResults?.(searchResults)
    } catch (error) {

      setResults([])
      onResults?.([])
    } finally {
      setIsLoading(false)
    }
  }, [onResults])

  const handleInputChange = (value: string) => {
    setQuery(value)
    
    // 디바운스 검색
    const timeoutId = setTimeout(() => {
      handleSearch(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    onResults?.([])
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {(query || isLoading) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-auto p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 검색 결과 미리보기 */}
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <SearchResults results={results.slice(0, 5)} />
          {results.length > 5 && (
            <div className="p-3 border-t border-border">
              <Button variant="ghost" className="w-full text-sm">
                {results.length - 5}개 더 보기
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function AdvancedSearch({ filters = {}, onFiltersChange, onResults, className }: AdvancedSearchProps) {
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(filters)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const categories = [
    { value: '한글서예', label: '한글서예' },
    { value: '한자서예', label: '한자서예' },
    { value: '문인화', label: '문인화' },
    { value: '수묵화', label: '수묵화' },
    { value: '민화', label: '민화' },
    { value: '현대서예', label: '현대서예' },
    { value: '캘리그라피', label: '캘리그라피' },
    { value: '전각', label: '전각' },
    { value: '서각', label: '서각' }
  ]

  const artistTypes = [
    { value: '공모작가', label: '공모작가' },
    { value: '청년작가', label: '청년작가' },
    { value: '추천작가', label: '추천작가' },
    { value: '초대작가', label: '초대작가' }
  ]

  const availabilityOptions = [
    { value: 'available', label: '구매 가능' },
    { value: 'sold', label: '판매 완료' },
    { value: 'reserved', label: '예약됨' }
  ]

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...currentFilters, [key]: value }
    setCurrentFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      // 고급 검색 로직 구현
      const query = Object.entries(currentFilters)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}:${value}`)
        .join(' ')
      
      if (query) {
        // const results = await searchWithAirtable(query)
        const results: SearchResult[] = []
        onResults?.(results)
      }
    } catch (error) {

    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setCurrentFilters({})
    onFiltersChange?.({})
  }

  const getActiveFiltersCount = () => {
    return Object.values(currentFilters).filter(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length
  }

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            고급 검색
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>고급 검색</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* 카테고리 선택 */}
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select
                value={currentFilters.category || ''}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 작가 유형 */}
            <div className="space-y-2">
              <Label>작가 유형</Label>
              <Select
                value={currentFilters.artistType || ''}
                onValueChange={(value) => handleFilterChange('artistType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="작가 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {artistTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 제작 연도 */}
            <div className="space-y-2">
              <Label>제작 연도</Label>
              <div className="px-3">
                <Slider
                  defaultValue={currentFilters.year || [1900, 2024]}
                  max={2024}
                  min={1900}
                  step={1}
                  onValueChange={(value) => handleFilterChange('year', value as [number, number])}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{currentFilters.year?.[0] || 1900}</span>
                  <span>{currentFilters.year?.[1] || 2024}</span>
                </div>
              </div>
            </div>

            {/* 가격 범위 */}
            <div className="space-y-2">
              <Label>가격 범위 (만원)</Label>
              <div className="px-3">
                <Slider
                  defaultValue={currentFilters.price || [0, 1000]}
                  max={1000}
                  min={0}
                  step={10}
                  onValueChange={(value) => handleFilterChange('price', value as [number, number])}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{currentFilters.price?.[0] || 0}만원</span>
                  <span>{currentFilters.price?.[1] || 1000}만원</span>
                </div>
              </div>
            </div>

            {/* 구매 가능 여부 */}
            <div className="space-y-2">
              <Label>구매 가능 여부</Label>
              <Select
                value={currentFilters.availability || ''}
                onValueChange={(value) => handleFilterChange('availability', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="구매 가능 여부 선택" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={clearFilters}>
              필터 초기화
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    검색 중...
                  </>
                ) : (
                  '검색'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function SearchResults({ results, isLoading = false, className }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">검색 중...</span>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className={`text-center p-8 text-muted-foreground ${className}`}>
        검색 결과가 없습니다.
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {results.map((result) => (
        <Card key={result.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              {result.image && (
                <div className="flex-shrink-0">
                  <Image
                    src={result.image}
                    alt={result.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-lg"
                    sizes="64px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-foreground truncate">
                    {result.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {result.type === 'artist' && '작가'}
                    {result.type === 'artwork' && '작품'}
                    {result.type === 'exhibition' && '전시'}
                    {result.type === 'event' && '행사'}
                    {result.type === 'notice' && '공지'}
                  </Badge>
                </div>
                {result.subtitle && (
                  <p className="text-sm text-muted-foreground mb-1">
                    {result.subtitle}
                  </p>
                )}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {result.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// 기본 export
export default SimpleSearch
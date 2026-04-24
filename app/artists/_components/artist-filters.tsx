'use client'

import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ArtistFiltersProps {
  searchQuery: string
  membershipFilter: string
  artistTypeFilter: string
  specialtyFilter: string
  titleFilter: string
  onSearchChange: (value: string) => void
  onMembershipChange: (value: string) => void
  onArtistTypeChange: (value: string) => void
  onSpecialtyChange: (value: string) => void
  onTitleChange: (value: string) => void
  onReset: () => void
}

const MEMBERSHIP_OPTIONS = ['준회원', '정회원', '특별회원', '명예회원']
const ARTIST_TYPE_OPTIONS = ['공모작가', '청년작가', '일반작가', '추천작가', '초대작가']
const SPECIALTY_OPTIONS = [
  '전통서예',
  '현대서예',
  '캘리그라피',
  '한문서예',
  '한글서예',
  '문인화',
  '수묵화',
  '민화',
  '동양화',
  '전각',
  '서각',
]
const TITLE_OPTIONS = [
  '회장',
  '부회장',
  '명예이사장',
  '이사장',
  '심사위원장',
  '운영위원장',
  '상임고문',
  '고문',
  '상임이사',
  '이사',
  '감사',
  '자문위원',
  '심사위원',
  '운영위원',
]

export function ArtistFilters(props: ArtistFiltersProps) {
  const {
    searchQuery,
    membershipFilter,
    artistTypeFilter,
    specialtyFilter,
    titleFilter,
    onSearchChange,
    onMembershipChange,
    onArtistTypeChange,
    onSpecialtyChange,
    onTitleChange,
    onReset,
  } = props

  return (
    <section className='border-b border-border bg-card dark:bg-card'>
      <div className='container mx-auto px-4 py-6'>
        {/* PC Layout */}
        <div className='hidden lg:flex items-center justify-between gap-4'>
          <div className='flex-1 max-w-md'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                type='text'
                placeholder='작가명 또는 전문분야로 검색...'
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          <div className='flex gap-3'>
            <Select value={membershipFilter} onValueChange={onMembershipChange}>
              <SelectTrigger className='w-36'>
                <SelectValue placeholder='회원 구분' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                {MEMBERSHIP_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={artistTypeFilter} onValueChange={onArtistTypeChange}>
              <SelectTrigger className='w-36'>
                <SelectValue placeholder='작가 유형' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                {ARTIST_TYPE_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={specialtyFilter} onValueChange={onSpecialtyChange}>
              <SelectTrigger className='w-36'>
                <SelectValue placeholder='전문분야' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                {SPECIALTY_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={titleFilter} onValueChange={onTitleChange}>
              <SelectTrigger className='w-36'>
                <SelectValue placeholder='직위' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                {TITLE_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant='outline' onClick={onReset} className='flex items-center gap-2'>
              <Filter className='h-4 w-4' />
              초기화
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className='lg:hidden space-y-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              type='text'
              placeholder='작가명 또는 전문분야로 검색...'
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className='pl-10 h-12 text-base'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <Select value={membershipFilter} onValueChange={onMembershipChange}>
              <SelectTrigger className='h-12'>
                <SelectValue placeholder='회원 구분' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                {MEMBERSHIP_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={artistTypeFilter} onValueChange={onArtistTypeChange}>
              <SelectTrigger className='h-12'>
                <SelectValue placeholder='작가 유형' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                {ARTIST_TYPE_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={specialtyFilter} onValueChange={onSpecialtyChange}>
            <SelectTrigger className='h-12'>
              <SelectValue placeholder='전문분야' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>전체 분야</SelectItem>
              {SPECIALTY_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={titleFilter} onValueChange={onTitleChange}>
            <SelectTrigger className='h-12'>
              <SelectValue placeholder='직위' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>전체 직위</SelectItem>
              {TITLE_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant='outline'
            onClick={onReset}
            className='w-full h-12 flex items-center gap-2'
          >
            <Filter className='h-4 w-4' />
            필터 초기화
          </Button>
        </div>
      </div>
    </section>
  )
}

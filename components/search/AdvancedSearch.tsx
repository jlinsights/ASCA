'use client';

import React, { useState } from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// SearchFilters 타입 정의
export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  author?: string;
}

// 카테고리 상수들
export const NOTICE_CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'general', label: '일반공지' },
  { value: 'exhibition', label: '전시' },
  { value: 'education', label: '교육' },
  { value: 'competition', label: '공모전' },
  { value: 'meeting', label: '회의' },
  { value: 'exchange', label: '교류' }
];

export const EVENT_CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'exhibition', label: '전시회' },
  { value: 'workshop', label: '워크샵' },
  { value: 'seminar', label: '세미나' },
  { value: 'competition', label: '공모전' },
  { value: 'exchange', label: '교류행사' }
];

export const STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'published', label: '게시됨' },
  { value: 'draft', label: '임시저장' }
];

export const EXHIBITION_STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'upcoming', label: '예정' },
  { value: 'ongoing', label: '진행중' },
  { value: 'ended', label: '종료' }
];

export const EVENT_STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'upcoming', label: '예정' },
  { value: 'ongoing', label: '진행중' },
  { value: 'ended', label: '종료' }
];

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  contentType: 'notice' | 'exhibition' | 'event' | 'all';
  className?: string;
}

// @deprecated Use AdvancedSearch from @/components/search/search-components instead
export default function AdvancedSearch({ 
  onSearch, 
  contentType, 
  className = '' 
}: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({});
    onSearch({});
  };

  const getCategoryOptions = () => {
    switch (contentType) {
      case 'notice':
        return NOTICE_CATEGORIES;
      case 'event':
        return EVENT_CATEGORIES;
      default:
        return [
          { value: 'all', label: '전체' },
          { value: 'notice', label: '공지사항' },
          { value: 'exhibition', label: '전시' },
          { value: 'event', label: '행사' }
        ];
    }
  };

  const getStatusOptions = () => {
    switch (contentType) {
      case 'exhibition':
        return EXHIBITION_STATUS_OPTIONS;
      case 'event':
        return EVENT_STATUS_OPTIONS;
      default:
        return STATUS_OPTIONS;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            고급 검색
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">고급 검색</h4>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 검색어 */}
            <div className="space-y-2">
              <Label>검색어</Label>
              <Input
                placeholder="제목, 내용에서 검색..."
                value={filters.query || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              />
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getCategoryOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 상태 */}
            <div className="space-y-2">
              <Label>상태</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getStatusOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 날짜 범위 */}
            <div className="space-y-2">
              <Label>날짜 범위</Label>
              <div className="flex gap-2">
                <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, 'yyyy-MM-dd', { locale: ko }) : '시작일'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => {
                        setFilters(prev => ({ ...prev, dateFrom: date }));
                        setDateFromOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, 'yyyy-MM-dd', { locale: ko }) : '종료일'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => {
                        setFilters(prev => ({ ...prev, dateTo: date }));
                        setDateToOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 작성자 */}
            <div className="space-y-2">
              <Label>작성자</Label>
              <Input
                placeholder="작성자 이름..."
                value={filters.author || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                검색
              </Button>
              <Button variant="outline" onClick={handleReset}>
                초기화
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
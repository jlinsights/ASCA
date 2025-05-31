// 검색 관련 상수 정의

export const NOTICE_CATEGORIES = [
  { value: 'general', label: '일반' },
  { value: 'event', label: '행사' },
  { value: 'exhibition', label: '전시' },
  { value: 'education', label: '교육' },
  { value: 'announcement', label: '공지' },
];

export const EVENT_CATEGORIES = [
  { value: 'workshop', label: '워크샵' },
  { value: 'seminar', label: '세미나' },
  { value: 'competition', label: '공모전' },
  { value: 'exhibition', label: '전시회' },
  { value: 'cultural', label: '문화행사' },
];

export const STATUS_OPTIONS = [
  { value: 'published', label: '게시됨' },
  { value: 'draft', label: '임시저장' },
  { value: 'archived', label: '보관됨' },
];

export const EXHIBITION_STATUS_OPTIONS = [
  { value: 'upcoming', label: '예정' },
  { value: 'ongoing', label: '진행중' },
  { value: 'completed', label: '종료' },
  { value: 'cancelled', label: '취소' },
];

export const EVENT_STATUS_OPTIONS = [
  { value: 'upcoming', label: '예정' },
  { value: 'ongoing', label: '진행중' },
  { value: 'completed', label: '종료' },
  { value: 'cancelled', label: '취소' },
];

export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
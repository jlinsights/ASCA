// Events 페이지 공용 상수 및 i18n helpers
// warning-cleanup-cycle-2 Stage 5a-1: events/page.tsx 분리 대상

export const statusColors = {
  upcoming:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  ongoing:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  completed:
    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-300 dark:border-slate-800',
  cancelled:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800',
} as const

export const categoryColors = {
  workshop:
    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800',
  lecture:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  competition:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800',
  exhibition:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  ceremony:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
  meeting:
    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-300 dark:border-slate-800',
  other:
    'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-800',
} as const

export interface EventOption {
  value: string
  label: string
}

export function getCategories(language: string): EventOption[] {
  return [
    { value: 'all', label: language === 'ko' ? '전체' : 'All' },
    { value: 'workshop', label: language === 'ko' ? '워크숍' : 'Workshop' },
    { value: 'lecture', label: language === 'ko' ? '강연' : 'Lecture' },
    { value: 'competition', label: language === 'ko' ? '공모전' : 'Competition' },
    { value: 'exhibition', label: language === 'ko' ? '전시' : 'Exhibition' },
    { value: 'ceremony', label: language === 'ko' ? '시상식' : 'Ceremony' },
    { value: 'meeting', label: language === 'ko' ? '총회' : 'Meeting' },
    { value: 'other', label: language === 'ko' ? '기타' : 'Other' },
  ]
}

export function getStatusOptions(language: string): EventOption[] {
  return [
    { value: 'all', label: language === 'ko' ? '전체' : 'All' },
    { value: 'upcoming', label: language === 'ko' ? '예정' : 'Upcoming' },
    { value: 'ongoing', label: language === 'ko' ? '진행중' : 'Ongoing' },
    { value: 'completed', label: language === 'ko' ? '완료' : 'Completed' },
    { value: 'cancelled', label: language === 'ko' ? '취소' : 'Cancelled' },
  ]
}

export function formatEventDate(dateString: string, language: string): string {
  const date = new Date(dateString)
  return language === 'ko'
    ? date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

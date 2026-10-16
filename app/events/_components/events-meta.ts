// Events 페이지 공용 상수 및 i18n helpers
// warning-cleanup-cycle-2 Stage 5a-1: events/page.tsx 분리 대상

export const statusColors = {
  upcoming: 'bg-info/5 text-muted-foreground border-info/30',
  ongoing: 'bg-success/5 text-muted-foreground border-success/30',
  completed: 'bg-muted text-foreground border-border',
  cancelled: 'bg-seal/5 text-muted-foreground border-seal/30',
} as const

export const categoryColors = {
  workshop: 'bg-highlight/5 text-muted-foreground border-highlight/30',
  lecture: 'bg-info/5 text-muted-foreground border-info/30',
  competition: 'bg-seal/5 text-muted-foreground border-seal/30',
  exhibition: 'bg-success/5 text-muted-foreground border-success/30',
  ceremony: 'bg-warning/5 text-muted-foreground border-warning/30',
  meeting: 'bg-muted text-foreground border-border',
  other: 'bg-highlight/5 text-muted-foreground border-highlight/30',
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

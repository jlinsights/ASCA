// exhibitions 페이지 공용 상수/헬퍼
// warning-cleanup-cycle-2 Stage 5a-1/3: exhibitions/page.tsx 분리 대상

export const statusColors = {
  upcoming:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  current:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  past: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-300 dark:border-slate-800',
} as const

export const statusLabels = {
  upcoming: '예정',
  current: '진행중',
  past: '종료',
} as const

export function formatExhibitionDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatPrice(price: number, currency: string): string {
  if (currency === 'KRW') {
    return `₩${price.toLocaleString()}`
  }
  return `$${price.toLocaleString()}`
}

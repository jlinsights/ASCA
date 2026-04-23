// exhibitions/[id] 상세 페이지 전용 상수/헬퍼
// warning-cleanup-cycle-2 Stage 5a-1/4: exhibitions/[id]/page.tsx 분리 대상

export const statusColors = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  current: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  past: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
} as const

export function formatExhibitionDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getRemainingDays(endDate: string): string | null {
  const today = new Date()
  const end = new Date(endDate)
  const diffTime = end.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return null
  if (diffDays === 0) return '오늘 종료'
  return `${diffDays}일 남음`
}

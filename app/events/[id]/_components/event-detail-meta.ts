// events/[id] 상세 페이지 전용 상수/헬퍼
// warning-cleanup-cycle-2 Stage 5a-1/2: events/[id]/page.tsx 분리 대상

export const statusColors = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  ongoing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
} as const

export const statusLabels = {
  upcoming: '예정',
  ongoing: '진행중',
  completed: '완료',
  cancelled: '취소',
} as const

export const eventTypeLabels = {
  workshop: '워크숍',
  lecture: '강연',
  competition: '공모전',
  exhibition: '전시',
  ceremony: '시상식',
  meeting: '총회',
  other: '기타',
} as const

export function formatEventDateTime(dateString: string): string {
  const eventDate = new Date(dateString)
  return eventDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  })
}

export function formatDeadline(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

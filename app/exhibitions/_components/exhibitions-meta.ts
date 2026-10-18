// exhibitions 페이지 공용 상수/헬퍼
// warning-cleanup-cycle-2 Stage 5a-1/3: exhibitions/page.tsx 분리 대상

export const statusColors = {
  upcoming: 'bg-info/5 text-muted-foreground border-info/30',
  current: 'bg-success/5 text-muted-foreground border-success/30',
  past: 'bg-muted text-foreground border-border',
} as const

/** lib/i18n/translations/exhibitions.ts 의 번역 키 */
export const statusLabelKeys = {
  upcoming: 'exStatusUpcoming',
  current: 'exStatusCurrent',
  past: 'exStatusPast',
} as const

/** locale 은 사이트 언어의 로케일(ko-KR·en-US·ja-JP·zh-TW) */
export function formatExhibitionDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

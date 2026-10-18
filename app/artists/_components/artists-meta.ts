export const specialtyFilters = [
  { value: 'all', label: { ko: '전체', en: 'All' } },
  { value: '해서', label: { ko: '해서', en: 'Regular Script' } },
  { value: '행서', label: { ko: '행서', en: 'Semi-cursive Script' } },
  { value: '초서', label: { ko: '초서', en: 'Cursive Script' } },
  { value: '예서', label: { ko: '예서', en: 'Clerical Script' } },
  { value: '전서', label: { ko: '전서', en: 'Seal Script' } },
  { value: '현대서예', label: { ko: '현대서예', en: 'Modern Calligraphy' } },
  { value: '캘리그래피', label: { ko: '캘리그래피', en: 'Calligraphy' } },
  { value: '디지털서예', label: { ko: '디지털서예', en: 'Digital Calligraphy' } },
] as const

// 작가 유형은 등급만 색으로 구분한다 (Ink System — DESIGN.md §2.1).
// 초대작가 = 남색 면(최상위), 추천작가 = 금색 틴트(수상·프리미엄 색), 나머지는 중립.
const NEUTRAL_BADGE = 'bg-muted text-foreground border-border'

const ARTIST_TYPE_COLORS: Record<string, string> = {
  초대작가: 'bg-primary text-primary-foreground border-primary',
  추천작가: 'bg-highlight/15 text-foreground border-highlight/50',
}

export function getArtistTypeBadgeColor(type: string): string {
  return ARTIST_TYPE_COLORS[type] || NEUTRAL_BADGE
}

// 전문 분야는 라벨 글자가 의미를 전하므로 색으로 나누지 않는다 — 11가지 색상은 의미 없이 화면만 어지럽혔다.
export function getSpecialtyBadgeStyle(_specialty: string): string {
  return NEUTRAL_BADGE
}

const SPECIALTY_PRIORITY: Record<string, number> = {
  전통서예: 1,
  현대서예: 2,
  캘리그라피: 3,
  한문서예: 4,
  한글서예: 5,
  문인화: 6,
  수묵화: 7,
  민화: 8,
  동양화: 9,
  전각: 10,
  서각: 11,
}

export function sortSpecialties(specialties: string[] | null): string[] {
  if (!specialties) return []
  return [...specialties].sort((a, b) => {
    const priorityA = SPECIALTY_PRIORITY[a] ?? 99
    const priorityB = SPECIALTY_PRIORITY[b] ?? 99
    return priorityA - priorityB
  })
}

export function formatPrice(price: number): string {
  return `₩${price.toLocaleString()}`
}

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

const ARTIST_TYPE_COLORS: Record<string, string> = {
  공모작가:
    'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  청년작가:
    'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  일반작가:
    'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600',
  추천작가:
    'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  초대작가:
    'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
  전문작가:
    'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
}

export function getArtistTypeBadgeColor(type: string): string {
  return (
    ARTIST_TYPE_COLORS[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
  )
}

const SPECIALTY_STYLES: Record<string, string> = {
  전통서예:
    'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  현대서예:
    'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
  캘리그라피:
    'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
  한문서예:
    'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  한글서예:
    'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700',
  문인화:
    'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  수묵화:
    'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600',
  민화: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
  동양화:
    'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
  전각: 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-600',
  서각: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
}

export function getSpecialtyBadgeStyle(specialty: string): string {
  return SPECIALTY_STYLES[specialty] || 'bg-muted/60 text-muted-foreground border-muted'
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

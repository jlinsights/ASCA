// 정적 Tailwind 클래스 맵 — 동적 `bg-${token}` 조합 금지(DESIGN.md §10) 대응.
// 모든 값은 완성된 리터럴 클래스 문자열이어야 Tailwind JIT가 생성한다.

// 모든 클래스 맵은 `default` 키를 fallback으로 보장한다.
// Record 인덱스 접근은 noUncheckedIndexedAccess 하에 `T | undefined` 지만,
// 명시 `default` 프로퍼티는 항상 정의돼 `map[key] ?? map.default` 결과가 `T` 로 좁혀진다.
type ClassMap<T> = Record<string, T> & { default: T }

export type EventTypeClassSet = {
  bg: string
  text: string
  border: string
  hoverBorder: string
  hoverBg: string
  bgSoft: string
}

// CulturalCalendar.getEventTypeColor 용 — exhibition/workshop/ceremony/festival/lecture/performance
export const EVENT_TYPE_CLASSES: ClassMap<EventTypeClassSet> = {
  exhibition: {
    bg: 'bg-temple-gold',
    text: 'text-temple-gold',
    border: 'border-temple-gold',
    hoverBorder: 'hover:border-temple-gold/40',
    hoverBg: 'hover:bg-temple-gold/80',
    bgSoft: 'bg-temple-gold/20',
  },
  workshop: {
    bg: 'bg-summer-jade',
    text: 'text-summer-jade',
    border: 'border-summer-jade',
    hoverBorder: 'hover:border-summer-jade/40',
    hoverBg: 'hover:bg-summer-jade/80',
    bgSoft: 'bg-summer-jade/20',
  },
  ceremony: {
    bg: 'bg-vermillion',
    text: 'text-vermillion',
    border: 'border-vermillion',
    hoverBorder: 'hover:border-vermillion/40',
    hoverBg: 'hover:bg-vermillion/80',
    bgSoft: 'bg-vermillion/20',
  },
  festival: {
    bg: 'bg-spring-blossom',
    text: 'text-spring-blossom',
    border: 'border-spring-blossom',
    hoverBorder: 'hover:border-spring-blossom/40',
    hoverBg: 'hover:bg-spring-blossom/80',
    bgSoft: 'bg-spring-blossom/20',
  },
  lecture: {
    bg: 'bg-celadon-green',
    text: 'text-celadon-green',
    border: 'border-celadon-green',
    hoverBorder: 'hover:border-celadon-green/40',
    hoverBg: 'hover:bg-celadon-green/80',
    bgSoft: 'bg-celadon-green/20',
  },
  performance: {
    bg: 'bg-plum-purple',
    text: 'text-plum-purple',
    border: 'border-plum-purple',
    hoverBorder: 'hover:border-plum-purple/40',
    hoverBg: 'hover:bg-plum-purple/80',
    bgSoft: 'bg-plum-purple/20',
  },
  default: {
    bg: 'bg-ink-black',
    text: 'text-ink-black',
    border: 'border-ink-black',
    hoverBorder: 'hover:border-ink-black/40',
    hoverBg: 'hover:bg-ink-black/80',
    bgSoft: 'bg-ink-black/20',
  },
}

export type SeasonalAccentClassSet = {
  bg: string
  bgSoft10: string
  hoverBg: string
  border: string
  text: string
}

// CalligraphyHero.getSeasonalAccent 용 — spring/summer/autumn/winter
export const SEASONAL_ACCENT_CLASSES: ClassMap<SeasonalAccentClassSet> = {
  spring: {
    bg: 'bg-spring-blossom',
    bgSoft10: 'bg-spring-blossom/10',
    hoverBg: 'hover:bg-spring-blossom/80',
    border: 'border-spring-blossom',
    text: 'text-spring-blossom',
  },
  summer: {
    bg: 'bg-summer-jade',
    bgSoft10: 'bg-summer-jade/10',
    hoverBg: 'hover:bg-summer-jade/80',
    border: 'border-summer-jade',
    text: 'text-summer-jade',
  },
  autumn: {
    bg: 'bg-autumn-gold',
    bgSoft10: 'bg-autumn-gold/10',
    hoverBg: 'hover:bg-autumn-gold/80',
    border: 'border-autumn-gold',
    text: 'text-autumn-gold',
  },
  winter: {
    bg: 'bg-winter-snow',
    bgSoft10: 'bg-winter-snow/10',
    hoverBg: 'hover:bg-winter-snow/80',
    border: 'border-winter-snow',
    text: 'text-winter-snow',
  },
  default: {
    bg: 'bg-celadon-green',
    bgSoft10: 'bg-celadon-green/10',
    hoverBg: 'hover:bg-celadon-green/80',
    border: 'border-celadon-green',
    text: 'text-celadon-green',
  },
}

export type StatusClassSet = { bg: string; border: string }

// ArtistPortfolioGrid.getStatusColor 용 — featured/active/historical
export const STATUS_CLASSES: ClassMap<StatusClassSet> = {
  featured: { bg: 'bg-temple-gold', border: 'border-temple-gold' },
  active: { bg: 'bg-summer-jade', border: 'border-summer-jade' },
  historical: { bg: 'bg-autumn-gold', border: 'border-autumn-gold' },
  default: { bg: 'bg-celadon-green', border: 'border-celadon-green' },
}

// CulturalCalendar.getSeasonalColor 용 — bg 클래스만 필요
export const SEASONAL_BG: ClassMap<string> = {
  spring: 'bg-spring-blossom',
  summer: 'bg-summer-jade',
  autumn: 'bg-autumn-gold',
  winter: 'bg-winter-snow',
  default: 'bg-celadon-green',
}

// VirtualExhibition.getWallColor 용 — galleryLayout.style 키
export const WALL_BG: ClassMap<string> = {
  traditional: 'bg-rice-paper',
  modern: 'bg-west-metal',
  minimalist: 'bg-winter-snow',
  default: 'bg-rice-paper',
}

// LearningHub.getDifficultyColor 용 — beginner/intermediate/advanced/master
export const DIFFICULTY_BG: ClassMap<string> = {
  beginner: 'bg-summer-jade',
  intermediate: 'bg-autumn-gold',
  advanced: 'bg-vermillion',
  master: 'bg-temple-gold',
  default: 'bg-celadon-green',
}

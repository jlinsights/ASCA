import type { GalleryItem } from '@/lib/types/gallery/gallery-legacy'

const CATEGORY_META: Record<string, { icon: string; name: string }> = {
  committee: { icon: '👥', name: '심사위원회' },
  contest: { icon: '🏆', name: '휘호대회' },
  exhibition: { icon: '🖼️', name: '전시회' },
  group: { icon: '👨‍👩‍👧‍👦', name: '단체사진' },
  award: { icon: '🏅', name: '시상기념' },
  ceremony: { icon: '🎉', name: '개막식 및 시상식' },
  event: { icon: '📸', name: '행사 이모저모' },
  people: { icon: '👤', name: '인물/참석자' },
  sac: { icon: '🏛️', name: '전시장 풍경' },
}

export function catIcon(c: string): string {
  return CATEGORY_META[c]?.icon ?? '📷'
}

export function catName(c: string): string {
  return CATEGORY_META[c]?.name ?? c
}

/** 사진 설명 — 자동으로 붙은 제목('2026년 전시장 풍경 02969')보다 분류·날짜가 읽기 쉽다 */
export function photoCaption(item: GalleryItem): string {
  return [catName(item.category), item.eventDate].filter(Boolean).join(' · ')
}

/** 행사 설명. 2026년 자료는 날짜가 연도 자리에 들어가 '2026-04-19년 개막식…'으로 만들어져 있어 연도로 되돌린다 */
export function photoDescription(item: GalleryItem): string {
  return item.description.replace(/\b(\d{4})-\d{2}-\d{2}년/g, '$1년')
}

/** 실제 비율로 그린다(예전엔 순번으로 정사각·세로·가로를 돌려 써서 사진이 잘렸다). 너무 길쭉하면 잘라 맞춘다 */
export function cardRatio(item: GalleryItem): string {
  const width = item.dimensions?.width
  const height = item.dimensions?.height
  if (!width || !height) return '4 / 3'
  const ratio = Math.min(Math.max(width / height, 0.6), 1.8)
  return `${ratio}`
}

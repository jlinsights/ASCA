import { artworkImageUrl } from '@/lib/api/artwork-image'

/** 작가 상세가 그리는 작품 한 점. 서버에서 만들어 클라이언트 화면으로 넘긴다 */
export interface ArtistWork {
  id: string
  title: string
  titleEn: string | null
  year: number | null
  style: string | null
  /** 入選·特選·○○賞 같은 수상 표시 — tags 에서 고른다 */
  award: string | null
  imageUrl: string | null
  /** 원본 비율. 업로드 때 images.main 에 적힌 값이 없으면 null(족자 비율 3:4 로 그린다) */
  width: number | null
  height: number | null
}

export interface ArtworkRow {
  id: string
  title: string
  title_en?: string | null
  year_created?: number | null
  style?: string | null
  tags?: string[] | null
  images?: unknown
}

const AWARD = /(選|賞|대상|최우수상|우수상|특선|입선)$/

function positive(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

function mainSize(images: unknown): { width: number | null; height: number | null } {
  const main =
    images && typeof images === 'object' ? (images as { main?: unknown }).main : undefined
  if (!main || typeof main !== 'object') return { width: null, height: null }
  const { width, height } = main as { width?: unknown; height?: unknown }
  const w = positive(width)
  const h = positive(height)
  return w && h ? { width: w, height: h } : { width: null, height: null }
}

export function toArtistWork(row: ArtworkRow): ArtistWork {
  return {
    id: row.id,
    title: row.title,
    titleEn: row.title_en ?? null,
    year: row.year_created ?? null,
    style: row.style?.trim() || null,
    award: (row.tags ?? []).find(tag => AWARD.test(tag.trim()))?.trim() ?? null,
    imageUrl: artworkImageUrl(row.images),
    ...mainSize(row.images),
  }
}

/** 최근 작품부터. 연도가 같으면 이미지가 있는 작품을 앞에 — 첫 화면이 빈 칸으로 열리지 않게 */
export function orderWorks(works: ArtistWork[]): ArtistWork[] {
  return [...works].sort(
    (a, b) =>
      (b.year ?? 0) - (a.year ?? 0) || Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl))
  )
}

/** '2023–2025' · '2024' · null */
export function workYearSpan(works: ArtistWork[]): string | null {
  const years = works.map(work => work.year).filter((year): year is number => year !== null)
  if (years.length === 0) return null
  const first = Math.min(...years)
  const last = Math.max(...years)
  return first === last ? String(first) : `${first}–${last}`
}

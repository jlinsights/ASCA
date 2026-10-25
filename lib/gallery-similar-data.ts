import similarData from '@/lib/data/gallery-similar.json'
import type { GalleryItem } from '@/lib/types/gallery/gallery-legacy'
import { groupSimilar, type SimilarEntry } from './gallery-similar'

/**
 * 갤러리 목록에서 비슷한 사진을 대표 한 장으로 접는다.
 * 해시는 scripts/gallery-similar-hashes.mjs 가 만든 lib/data/gallery-similar.json — 해시가 없는 사진(새로 올린 사진)은 묶지 않고 그대로 보인다.
 */

interface SimilarFile {
  items: Record<string, { hash: string; color: number[] }>
}

/** 폴더 이름 앞부분이 분류다 — /images/gallery/2025/award_2025/… → award */
function categoryOfKey(key: string): string {
  const folder = key.split('/').at(-2) ?? ''
  return folder.split('_')[0] ?? ''
}

export function buildCoverMap(file: SimilarFile): Map<string, string> {
  const entries: SimilarEntry[] = Object.entries(file.items).map(([key, value]) => ({
    key,
    category: categoryOfKey(key),
    hash: value.hash,
    color: value.color,
  }))
  return groupSimilar(entries)
}

let cachedCoverMap: Map<string, string> | null = null

function coverMap(): Map<string, string> {
  cachedCoverMap ??= buildCoverMap(similarData as SimilarFile)
  return cachedCoverMap
}

export interface CollapsedGallery {
  /** 대표 사진 — 묶음이 있으면 similar 에 묶인 사진 전부(대표 포함) */
  items: GalleryItem[]
  /** 접기 전 사진 수 */
  photoCount: number
}

/**
 * 거른 뒤의 목록을 접는다. 순서는 각 묶음이 처음 나온 자리.
 * 대표는 묶음의 첫 장이지만, 검색 등으로 첫 장이 빠졌으면 남은 사진 중 첫 장을 대표로 쓴다.
 */
export function collapseSimilar(
  items: readonly GalleryItem[],
  covers: ReadonlyMap<string, string> = coverMap()
): CollapsedGallery {
  const groups = new Map<string, GalleryItem[]>()
  for (const item of items) {
    const key = item.mediaKey
    const groupKey = key ? (covers.get(key) ?? key) : `id:${item.id}`
    groups.set(groupKey, [...(groups.get(groupKey) ?? []), item])
  }
  const collapsed = [...groups.entries()].map(([groupKey, members]) => {
    const representative = members.find(member => member.mediaKey === groupKey) ?? members[0]!
    if (members.length === 1) return representative
    const ordered = [...members].sort((a, b) =>
      (a.mediaKey ?? '').localeCompare(b.mediaKey ?? '', 'en', { numeric: true })
    )
    return {
      ...representative,
      similar: ordered.map(member => ({
        id: member.id,
        src: member.src,
        thumbnail: member.thumbnail,
        width: member.dimensions?.width ?? null,
        height: member.dimensions?.height ?? null,
      })),
    }
  })
  return { items: collapsed, photoCount: items.length }
}

/** 분류별 대표 사진 수 — 칩의 숫자가 목록에 보이는 장수와 같도록 */
export function countRepresentatives(items: readonly GalleryItem[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const item of collapseSimilar(items).items) {
    counts[item.category] = (counts[item.category] ?? 0) + 1
  }
  return counts
}

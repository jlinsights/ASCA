/**
 * 비슷한 사진 묶기 — 행사 사진은 같은 장면을 연속으로 여러 장 찍어(JTL02967·02968·02969…) 목록에 같은 사진이 줄줄이 보였다.
 * scripts/gallery-similar-hashes.mjs 가 만든 지각 해시(16×16 dHash)로, 같은 행사 폴더의 가까운 번호끼리만 묶는다.
 *
 * 기준은 실제 사진을 대조해 정했다(2026-10-25, 582장):
 * - 같은 사람·같은 장면의 재촬영은 거리 0~68, 다른 사람은 57(시상)·64(개막식)부터 나타났다
 * - 그래서 사람이 바뀌는 시상 사진은 아주 엄격하게, 공간 사진은 넉넉하게, 나머지는 다른 장면이 나온 거리보다 낮게 잡았다
 * - 전시 작품 사진은 다른 작품이 d=55 에서 나와 기본값(48)을 쓴다
 * - 잘못 묶어 누군가의 사진을 숨기는 것이, 비슷한 사진이 하나 더 보이는 것보다 나쁘다
 */

export interface SimilarEntry {
  /** galleryMediaKey — 연도별 JSON 에서도 같은 값 */
  key: string
  category: string
  /** 256비트 dHash, 16진수 64자 */
  hash: string
  /** 평균 색 [r,g,b] */
  color: readonly [number, number, number] | readonly number[]
}

const THRESHOLDS: Readonly<Record<string, number>> = {
  // 사람이 바뀌는 사진 — 다른 사람이 d=57(시상)·64(개막식)부터 나왔다
  award: 16,
  people: 16,
  group: 32,
  ceremony: 32,
  // 공간·스케치 사진 — 같은 장면이 d=65 까지, 다른 순간은 d=70 부터
  sac: 64,
  event: 64,
}
const DEFAULT_THRESHOLD = 48
/** 평균 색 거리(RGB) 상한 — 같은 구도라도 조명·배경이 다르면 다른 사진 */
const MAX_COLOR_DISTANCE = 30
/** 대표와 사진 번호 차이 상한 — 연속 촬영만 묶는다 */
const MAX_FRAME_GAP = 6
const MAX_GROUP_SIZE = 8

const POPCOUNT = Array.from({ length: 16 }, (_, n) => n.toString(2).replace(/0/g, '').length)

export function hamming(a: string, b: string): number {
  let distance = 0
  for (let i = 0; i < a.length; i++) {
    distance += POPCOUNT[parseInt(a[i]!, 16) ^ parseInt(b[i]!, 16)]!
  }
  return distance
}

function colorDistance(a: SimilarEntry['color'], b: SimilarEntry['color']): number {
  return Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!)
}

function folderOf(key: string): string {
  return key.slice(0, key.lastIndexOf('/'))
}

/** 파일 이름의 촬영 번호(JTL02969-1 → 2969). 번호가 없으면 null */
function frameOf(key: string): number | null {
  const match = /(\d{3,})/.exec(key.slice(key.lastIndexOf('/') + 1))
  return match ? Number(match[1]) : null
}

/**
 * key → 대표(cover) key. 대표는 묶음의 첫 장(촬영 번호가 가장 앞선 사진)이고 자기 자신을 가리킨다.
 * 결과에 없는 key(해시가 없는 새 사진)는 묶지 않은 것으로 다룬다.
 */
export function groupSimilar(entries: readonly SimilarEntry[]): Map<string, string> {
  const coverOf = new Map<string, string>()
  const sorted = [...entries].sort((a, b) => a.key.localeCompare(b.key, 'en', { numeric: true }))
  let cover: SimilarEntry | null = null
  let size = 0

  for (const entry of sorted) {
    const threshold = THRESHOLDS[entry.category] ?? DEFAULT_THRESHOLD
    const frame = frameOf(entry.key)
    const coverFrame = cover ? frameOf(cover.key) : null
    const joins =
      cover !== null &&
      size < MAX_GROUP_SIZE &&
      folderOf(cover.key) === folderOf(entry.key) &&
      cover.category === entry.category &&
      frame !== null &&
      coverFrame !== null &&
      Math.abs(frame - coverFrame) <= MAX_FRAME_GAP &&
      hamming(cover.hash, entry.hash) <= threshold &&
      colorDistance(cover.color, entry.color) <= MAX_COLOR_DISTANCE

    if (joins && cover) {
      coverOf.set(entry.key, cover.key)
      size += 1
    } else {
      cover = entry
      size = 1
      coverOf.set(entry.key, entry.key)
    }
  }
  return coverOf
}

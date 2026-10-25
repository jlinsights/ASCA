// Airtable 에서 사라진 출품 기록 찾기 — 사본에는 있는데 이번 동기화에서 받지 못한 레코드.
// 지우지 않고 알리기만 한다. 사무국이 목록을 보고 판단한다.

/** 사본에서 읽는 칸 — 이름·이메일은 읽지 않는다(화면에 찍지 않으므로) */
export interface MirroredEntry {
  airtable_record_id: string
  source_key: string
  contest_year: number
  title: string | null
  artist_id: string | null
}

export interface StaleReport {
  sourceKey: string
  /** 이번에 Airtable 에서 받은 레코드 수 */
  fetched: number
  /** 사본에 있으나 Airtable 에 없는 행 */
  stale: MirroredEntry[]
  /** Airtable 이 0건을 돌려줬는데 사본에는 행이 있다 — 표가 비었거나 잘못 읽었을 수 있다 */
  suspicious: boolean
}

/**
 * 원본별로 사본과 이번에 받은 레코드 ID 를 비교한다.
 * fetchedBySource 에는 끝까지 읽기에 성공한 원본만 넣는다 — 일부만 읽은 원본을 넣으면
 * 멀쩡한 행이 사라진 것으로 보인다.
 */
export function findStaleEntries(
  mirrored: readonly MirroredEntry[],
  fetchedBySource: ReadonlyMap<string, ReadonlySet<string>>
): StaleReport[] {
  return [...fetchedBySource].map(([sourceKey, fetchedIds]) => {
    const rows = mirrored.filter(row => row.source_key === sourceKey)
    const stale = rows
      .filter(row => !fetchedIds.has(row.airtable_record_id))
      .sort((a, b) => a.airtable_record_id.localeCompare(b.airtable_record_id))
    return {
      sourceKey,
      fetched: fetchedIds.size,
      stale,
      suspicious: fetchedIds.size === 0 && rows.length > 0,
    }
  })
}

/** 보고 한 줄 — 레코드 ID·연도·작품 명제, 작가와 연결됐는지. 이름·이메일은 넣지 않는다 */
export function staleLine(entry: MirroredEntry): string {
  const linked = entry.artist_id ? ' · 작가 연결됨' : ''
  return `${entry.airtable_record_id} · ${entry.contest_year} · ${entry.title ?? '(명제 없음)'}${linked}`
}

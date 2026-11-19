import { NextRequest, NextResponse } from 'next/server'
import { archiveIdentity, archiveWriter } from '@/lib/archive/writer'
import {
  ADMIN_ENTRIES_LIMIT,
  ADMIN_ENTRY_COLUMNS,
  ENTRY_ARTIST_COLUMNS,
  adminEntryQuerySchema,
  candidatesFor,
  lookupNames,
  type AdminEntry,
  type AdminEntryRow,
  type EntryArtist,
} from '@/lib/contests/admin-entries'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })

// 출품 작가 연결 목록 — 관리자(MFA 완료)만. 연결 대기는 이름·한자가 같은 작가를 후보로 붙인다.
export async function GET(request: NextRequest) {
  const identity = await archiveIdentity()
  if (!identity) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)
  if (!identity.admin) return json({ error: 'Admin only', code: 'FORBIDDEN' }, 403)
  const query = adminEntryQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  )
  if (!query.success) return json({ error: 'Invalid query', code: 'INVALID_QUERY' }, 400)
  const { status, year } = query.data

  try {
    const db = archiveWriter()
    let entries = db.from('contest_entries').select(ADMIN_ENTRY_COLUMNS)
    entries =
      status === 'unmatched' ? entries.is('artist_id', null) : entries.not('artist_id', 'is', null)
    if (year) entries = entries.eq('contest_year', year)
    const { data, error } = await entries
      .order('contest_year', { ascending: false })
      .order('submitted_at', { ascending: false, nullsFirst: false })
      .limit(ADMIN_ENTRIES_LIMIT)
    if (error) throw error
    const rows = (data ?? []) as unknown as AdminEntryRow[]

    // 이름·한자는 .in() 값으로만 넘긴다 — 필터 문자열에 끼워 넣지 않는다
    const artists = new Map<string, EntryArtist>()
    const fetchArtists = async (column: 'id' | 'name' | 'name_zh', values: string[]) => {
      if (values.length === 0) return
      const { data: found, error: artistError } = await db
        .from('artists')
        .select(ENTRY_ARTIST_COLUMNS)
        .in(column, values)
      if (artistError) throw artistError
      for (const artist of (found ?? []) as unknown as EntryArtist[]) artists.set(artist.id, artist)
    }

    if (status === 'matched') {
      await fetchArtists('id', [
        ...new Set(rows.map(row => row.artist_id).filter(Boolean)),
      ] as string[])
    } else {
      await Promise.all([
        fetchArtists('name', lookupNames(rows.map(row => row.entrant_name))),
        fetchArtists('name_zh', lookupNames(rows.map(row => row.entrant_name_hanja))),
      ])
    }
    const pool = [...artists.values()]
    const result: AdminEntry[] = rows.map(row => ({
      ...row,
      artist: row.artist_id ? (artists.get(row.artist_id) ?? null) : null,
      candidates: status === 'unmatched' ? candidatesFor(row, pool) : [],
    }))
    return json({ data: result, limit: ADMIN_ENTRIES_LIMIT })
  } catch (error) {
    log.error('admin contest entries list failed', error)
    return json({ error: 'Entry list unavailable', code: 'ENTRY_UNAVAILABLE' }, 500)
  }
}

import 'server-only'
import { archiveReader, artistDetail, recordFields, type RecordEntry } from './queries'

// All exports use anon + RLS. A claimed/admin session must not expand the public CV.
export async function publicCv(id: string) {
  const artist = await artistDetail(id)
  if (!artist) return null
  const records: RecordEntry[] = []
  const db = archiveReader()
  const batchSize = 500
  const maximum = 10000
  let total = 0
  for (let start = 0; start < maximum; start += batchSize) {
    const { data, count, error } = await db
      .from('artist_records')
      .select(recordFields, { count: 'exact' })
      .eq('artist_id', id)
      .order('year', { ascending: false, nullsFirst: false })
      .order('id')
      .range(start, start + batchSize - 1)
    if (error) throw error
    total = count || 0
    records.push(...(data || []))
    if ((data || []).length < batchSize || start + batchSize >= total) break
  }
  // Never offer a silently incomplete PDF when the export safety bound is reached.
  return { artist, records, complete: records.length >= total }
}

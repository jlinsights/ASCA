import type { RecordEntry } from './queries'

export const recordTypes = ['award', 'exhibition', 'submission', 'certification'] as const
export function groupCareer(records: RecordEntry[], type: string, verifiedOnly: boolean) {
  const groups = new Map<number | null, RecordEntry[]>()
  for (const record of records) {
    if (type !== 'all' && record.record_type !== type) continue
    if (verifiedOnly && !record.is_asca_verified) continue
    const year = record.year
    const entries = groups.get(year) || []
    entries.push(record)
    groups.set(year, entries)
  }
  return [...groups.entries()].sort(([a], [b]) => (b || 0) - (a || 0))
}

export const recordTypeKey = (type: string) =>
  ({
    award: 'axAward',
    exhibition: 'axExhibition',
    submission: 'axSubmission',
    certification: 'axCertification',
  })[type] || 'arRecords'
export const sourceKey = (source: string) =>
  ({
    asca_archive: 'axSourceArchive',
    self_reported: 'axSourceSelf',
    admin: 'axSourceAdmin',
  })[source] || 'axSourceUnknown'

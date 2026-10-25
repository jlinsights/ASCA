import { CONTEST_BASE_ID, requestedFieldIds, type ContestSource } from './sources'
import type { AirtableRecord } from './entry-mapper'

const API = 'https://api.airtable.com/v0'
const PAGE_SIZE = 100
const MAX_PAGES = 50

/** 요청 주소 — 허용된 칸 ID 만 fields[] 로 붙이고, 응답 키도 칸 ID 로 받는다. */
export function recordsUrl(source: ContestSource, offset?: string): string {
  const url = new URL(`${API}/${CONTEST_BASE_ID}/${source.tableId}`)
  for (const id of requestedFieldIds(source)) url.searchParams.append('fields[]', id)
  url.searchParams.set('returnFieldsByFieldId', 'true')
  url.searchParams.set('pageSize', String(PAGE_SIZE))
  if (offset) url.searchParams.set('offset', offset)
  return url.toString()
}

type Fetch = (input: string, init?: RequestInit) => Promise<Response>

/** 원본 한 테이블의 레코드를 끝까지 읽는다. 토큰은 인자로만 받고 어디에도 남기지 않는다. */
export async function fetchContestRecords(
  source: ContestSource,
  token: string,
  fetchImpl: Fetch = fetch
): Promise<AirtableRecord[]> {
  const records: AirtableRecord[] = []
  let offset: string | undefined
  for (let page = 0; page < MAX_PAGES; page++) {
    const response = await fetchImpl(recordsUrl(source, offset), {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`Airtable ${source.key}: HTTP ${response.status}`)
    const body = (await response.json()) as { records?: AirtableRecord[]; offset?: string }
    records.push(...(body.records ?? []))
    if (!body.offset) return records
    offset = body.offset
  }
  throw new Error(`Airtable ${source.key}: more than ${MAX_PAGES} pages`)
}

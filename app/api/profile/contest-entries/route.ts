import { NextResponse } from 'next/server'
import { getAccount } from '@/lib/auth/server'
import { AccountAuthError } from '@/lib/auth/supabase/errors'
import { archiveWriter } from '@/lib/archive/writer'
import {
  MEMBER_ENTRY_COLUMNS,
  memberEmail,
  mergeMemberEntries,
  type MemberEntry,
} from '@/lib/contests/member-entries'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers })
const LIMIT = 100

/**
 * 내 출품 — 두 경로로 찾아 합친다.
 * 1) 출품 이메일 = 확인된 로그인 이메일(getAccount 가 확인되지 않은 이메일은 null 로 돌려준다)
 * 2) 사무국이 이 계정의 작가 페이지에 이어 준 출품(artist_id)
 * 사본 표는 회원 역할이 읽지 못하므로 service_role 로 읽되, 조건은 항상 본인 것으로 묶는다.
 * 이메일은 .or() 문자열에 넣지 않고 따로 조회한다.
 */
export async function GET() {
  try {
    const account = await getAccount()
    if (!account) return json({ error: 'Authentication required', code: 'UNAUTHORIZED' }, 401)

    const email = memberEmail(account.email)
    const [byEmail, byArtist] = await Promise.all([
      email
        ? rows(
            entries()
              .eq('entrant_email', email)
              .order(...NEWEST)
              .limit(LIMIT)
          )
        : [],
      account.artistIds.length
        ? rows(
            entries()
              .in('artist_id', account.artistIds)
              .order(...NEWEST)
              .limit(LIMIT)
          )
        : [],
    ])
    return json({ data: mergeMemberEntries(byEmail, byArtist) })
  } catch (error) {
    if (error instanceof AccountAuthError)
      return json({ error: error.code, code: error.code }, error.status)
    return json({ error: 'Entries unavailable', code: 'ENTRIES_UNAVAILABLE' }, 500)
  }
}

const NEWEST = ['contest_year', { ascending: false }] as const
const entries = () => archiveWriter().from('contest_entries').select(MEMBER_ENTRY_COLUMNS)

async function rows(query: PromiseLike<{ data: unknown; error: unknown }>): Promise<MemberEntry[]> {
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as MemberEntry[]
}

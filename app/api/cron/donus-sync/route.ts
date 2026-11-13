import { timingSafeEqual } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { createDonusClient } from '@/lib/donus/client'
import { parseCodeList } from '@/lib/donus/member-links'
import { createSupabaseLinkStore } from '@/lib/donus/store'
import { DEFAULT_SINCE, kstToday, runDonusSync } from '@/lib/donus/sync'
import { error as logError, info as logInfo } from '@/lib/logging'

/**
 * 도너스 → 홈페이지 회원 연결 동기화 (하루 한 번, vercel.json crons).
 * Vercel Cron 은 Authorization: Bearer $CRON_SECRET 을 붙여 부른다.
 * 응답·로그에는 개수만 싣는다.
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 300
/** 상태 갱신은 이 시간까지만 — 나머지는 다음 날 이어서(maxDuration 안에서 저장할 여유) */
const STATUS_BUDGET_MS = 240_000
/** 구성원 전체 조회는 이 시간까지 — 넘으면 쓰지 않고 실패(DONUS_SYNC_SINCE 를 늦춘다) */
const MEMBER_READ_BUDGET_MS = 180_000

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  // 비밀값이 없으면 "Bearer undefined" 가 통과하지 않도록 늘 거절한다
  if (!secret) return false
  const given = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.DONUS_API_KEY?.trim()
  // 키를 받기 전에는 아무것도 하지 않는다(배포돼 있어도 안전)
  if (!apiKey) return NextResponse.json({ skipped: 'donus_not_configured' })

  const started = Date.now()
  const since = process.env.DONUS_SYNC_SINCE?.trim() || DEFAULT_SINCE
  try {
    const report = await runDonusSync({
      client: createDonusClient({ apiKey, deadline: started + STATUS_BUDGET_MS }),
      store: createSupabaseLinkStore(),
      since,
      today: kstToday(),
      duesCodes: parseCodeList(process.env.DONUS_DUES_CODES),
      deadline: started + STATUS_BUDGET_MS,
      readDeadline: started + MEMBER_READ_BUDGET_MS,
    })
    logInfo('[donus-sync] done', { ...report })
    return NextResponse.json({ ok: true, report })
  } catch (err) {
    logError('[donus-sync] failed', err instanceof Error ? err : undefined)
    return NextResponse.json({ error: 'Donus sync failed' }, { status: 502 })
  }
}

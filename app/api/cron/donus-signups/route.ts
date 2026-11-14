import { NextResponse, type NextRequest } from 'next/server'
import { isCronAuthorized } from '@/lib/donus/cron-auth'
import { createDonusFormsClient } from '@/lib/donus/forms-client'
import { createSupabaseSignupStore } from '@/lib/donus/signup-store'
import { runDonusSignups } from '@/lib/donus/signups'
import { error as logError, info as logInfo } from '@/lib/logging'

/**
 * 홈페이지 신규 가입 → 도너스 구성원 등록 (하루 한 번, 단방향 동기화보다 먼저 — vercel.json crons).
 * DONUS_FORM_KEY 와 DONUS_SIGNUP_SINCE 가 둘 다 있어야 보낸다(없으면 아무것도 하지 않는다).
 * 응답·로그에는 개수만 싣는다.
 */
export const dynamic = 'force-dynamic'
export const maxDuration = 300
/** 이 시간까지만 새로 보낸다 — 나머지는 다음 날(maxDuration 안에서 기록할 여유) */
const SUBMIT_BUDGET_MS = 240_000

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request.headers.get('authorization')))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formKey = process.env.DONUS_FORM_KEY?.trim()
  const since = process.env.DONUS_SIGNUP_SINCE?.trim()
  // 폼 키와 시작일을 정하기 전에는 보내지 않는다(배포돼 있어도 안전, 기존 계정을 한꺼번에 보내지 않음)
  if (!formKey || !since) return NextResponse.json({ skipped: 'donus_signups_not_configured' })

  const deadline = Date.now() + SUBMIT_BUDGET_MS
  try {
    const report = await runDonusSignups({
      client: createDonusFormsClient({ formKey, deadline }),
      store: createSupabaseSignupStore(),
      since,
      deadline,
    })
    logInfo('[donus-signups] done', { ...report })
    return NextResponse.json({ ok: true, report })
  } catch (err) {
    logError('[donus-signups] failed', err instanceof Error ? err : undefined)
    return NextResponse.json({ error: 'Donus signups failed' }, { status: 502 })
  }
}

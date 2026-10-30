import { NextRequest, NextResponse } from 'next/server'
import { archiveWriter } from '@/lib/archive/writer'
import {
  mapTallyApplication,
  tallyPayloadSchema,
  verifyTallySignature,
} from '@/lib/applications/tally'
import { auditTrail } from '@/lib/audit/audit-trail'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 256 * 1024
/** 받는 신청서 — 추천·초대작가 신청(tally.so/r/w59jeo). 다른 폼 웹훅이 잘못 이어져도 쌓이지 않게 */
const DEFAULT_FORM_ID = 'w59jeo'
/** 감사 기록의 행위자 — 사람 계정이 아니라 Tally 웹훅 */
const TALLY_ACTOR = 'system:tally-webhook'

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

/**
 * Tally 신청서 웹훅. 서명이 맞는 요청만 허용 칸을 골라 artist_applications 에 넣는다.
 * 같은 응답을 다시 보내면(Tally 재시도) 중복으로 넘긴다. DB 오류만 5xx 로 돌려 Tally 가 다시 보내게 한다.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.TALLY_SIGNING_SECRET
  if (!secret) return json({ error: 'Webhook not configured', code: 'NOT_CONFIGURED' }, 503)

  const rawBody = await request.text()
  if (Buffer.byteLength(rawBody) > MAX_BODY_BYTES) {
    return json({ error: 'Payload too large', code: 'TOO_LARGE' }, 413)
  }
  if (!verifyTallySignature(rawBody, request.headers.get('tally-signature'), secret)) {
    return json({ error: 'Invalid signature', code: 'INVALID_SIGNATURE' }, 401)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return json({ error: 'Invalid JSON', code: 'INVALID_JSON' }, 400)
  }
  const payload = tallyPayloadSchema.safeParse(parsed)
  if (!payload.success) return json({ error: 'Invalid payload', code: 'INVALID_PAYLOAD' }, 400)

  const formId = process.env.TALLY_APPLICATION_FORM_ID || DEFAULT_FORM_ID
  if (payload.data.eventType !== 'FORM_RESPONSE' || payload.data.data.formId !== formId) {
    return json({ ok: true, result: 'ignored', reason: 'OTHER_EVENT_OR_FORM' })
  }

  const mapped = mapTallyApplication(payload.data)
  if (!mapped.ok) {
    // 동의 칸을 못 찾으면 신청서 질문이 바뀐 것이다 — 모든 신청이 버려지므로 운영 로그에 남긴다
    if (mapped.reason === 'CONSENT_FIELD_MISSING') {
      log.error('Tally application consent field missing', {
        responseId: payload.data.data.responseId,
      })
    }
    return json({ ok: true, result: 'ignored', reason: mapped.reason })
  }

  let createdId: string | undefined
  try {
    const { data, error } = await archiveWriter()
      .from('artist_applications')
      .upsert(mapped.row, { onConflict: 'tally_response_id', ignoreDuplicates: true })
      .select('id')
    if (error) throw error
    createdId = data?.[0]?.id
  } catch (error) {
    log.error('Tally application insert failed', {
      responseId: payload.data.data.responseId,
      error: error instanceof Error ? error.message : String(error),
    })
    return json({ error: 'Storage failed', code: 'STORAGE_FAILED' }, 500)
  }
  if (!createdId) return json({ ok: true, result: 'duplicate' })

  // 새로 만든 행만 감사 기록에 남긴다(재전송은 남기지 않음). 개인정보 값은 싣지 않는다.
  // 감사 기록이 실패해도 저장은 끝났으므로 200 — 5xx 를 주면 Tally 가 같은 응답을 다시 보낼 뿐이다.
  try {
    await auditTrail.trackDataChange(
      TALLY_ACTOR,
      'create',
      'artist_application',
      createdId,
      null,
      {
        requested_grade: mapped.row.requested_grade,
        route: mapped.row.route,
        track: mapped.row.track,
      },
      { source: 'tally_webhook' }
    )
  } catch (error) {
    log.error('Tally application audit failed', {
      applicationId: createdId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
  return json({ ok: true, result: 'stored' })
}

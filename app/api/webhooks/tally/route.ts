import { NextRequest, NextResponse } from 'next/server'
import { archiveWriter } from '@/lib/archive/writer'
import {
  mapTallyApplication,
  tallyPayloadSchema,
  verifyTallySignature,
} from '@/lib/applications/tally'
import { log } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 256 * 1024
/** 받는 신청서 — 추천·초대작가 신청(tally.so/r/w59jeo). 다른 폼 웹훅이 잘못 이어져도 쌓이지 않게 */
const DEFAULT_FORM_ID = 'w59jeo'

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

  try {
    const { data, error } = await archiveWriter()
      .from('artist_applications')
      .upsert(mapped.row, { onConflict: 'tally_response_id', ignoreDuplicates: true })
      .select('id')
    if (error) throw error
    return json({ ok: true, result: data && data.length > 0 ? 'stored' : 'duplicate' })
  } catch (error) {
    log.error('Tally application insert failed', {
      responseId: payload.data.data.responseId,
      error: error instanceof Error ? error.message : String(error),
    })
    return json({ error: 'Storage failed', code: 'STORAGE_FAILED' }, 500)
  }
}

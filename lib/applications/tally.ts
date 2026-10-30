import { createHmac, timingSafeEqual } from 'crypto'
import { z } from 'zod'

/**
 * Tally 추천·초대작가 신청서 → artist_applications 행.
 *
 * - 서명: Tally 는 본문 JSON 을 서명 비밀로 HMAC-SHA256 한 base64 를 Tally-Signature 헤더에 싣는다.
 * - 칸 찾기: Tally 칸 키(question_xxx)는 질문을 새로 만들면 바뀌어 라벨로 찾는다. 라벨은 공백을 지우고
 *   비교한다. 신청서 질문 제목을 바꾸면 아래 matcher 도 같이 고친다(테스트가 현재 제목을 박아 둔다).
 * - 허용 목록 밖의 칸(전화·생년월일·주소·납부정보·첨부파일·개인정보 동의 등)은 옮기지 않는다.
 */

const MAX_TEXT = 200
const MAX_LONG_TEXT = 4000

const optionSchema = z.object({ id: z.string(), text: z.string() })
const fieldSchema = z.object({
  key: z.string(),
  label: z.string().nullable().optional(),
  type: z.string(),
  value: z.unknown(),
  options: z.array(optionSchema).optional(),
})

export const tallyPayloadSchema = z.object({
  eventId: z.string(),
  eventType: z.string(),
  data: z.object({
    responseId: z.string().regex(/^[A-Za-z0-9]{3,32}$/),
    formId: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    fields: z.array(fieldSchema),
  }),
})

export type TallyPayload = z.infer<typeof tallyPayloadSchema>
type TallyField = z.infer<typeof fieldSchema>

export type RequestedGrade = 'recommended' | 'invited' | 'unknown'
export type Track = 'traditional' | 'contemporary' | 'unknown'
export type ApplicationRoute = 'regular' | 'special' | 'unknown'

export interface ApplicationInsert {
  tally_response_id: string
  tally_form_id: string
  submitted_at: string
  applicant_name: string | null
  applicant_name_hanja: string | null
  applicant_name_en: string | null
  pen_name: string | null
  applicant_email: string | null
  requested_grade: RequestedGrade
  requested_grade_raw: string | null
  track: Track
  track_raw: string | null
  genres: string[]
  route: ApplicationRoute
  route_raw: string | null
  membership_raw: string | null
  special_basis_raw: string | null
  awards_text: string | null
}

export type MapResult =
  | { ok: true; row: ApplicationInsert }
  | { ok: false; reason: 'NO_CONSENT' | 'CONSENT_FIELD_MISSING' }

/** Tally-Signature 확인. 원문 그대로와, 파싱 후 다시 직렬화한 본문(Tally 예제 방식) 둘 다 받는다 */
export function verifyTallySignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false
  const candidates = [rawBody]
  try {
    candidates.push(JSON.stringify(JSON.parse(rawBody)))
  } catch {
    return false
  }
  const received = Buffer.from(signature)
  return candidates.some(body => {
    const expected = Buffer.from(createHmac('sha256', secret).update(body).digest('base64'))
    return expected.length === received.length && timingSafeEqual(expected, received)
  })
}

const squash = (label: string | null | undefined) => (label ?? '').replace(/\s+/g, '')

function clip(value: string | null, max: number): string | null {
  if (value === null) return null
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

function textOf(field: TallyField | undefined, max = MAX_TEXT): string | null {
  if (!field || typeof field.value !== 'string') return null
  return clip(field.value, max)
}

/** 선택형 칸에서 고른 보기 글자들. 체크박스의 보기별 true/false 칸은 배열이 아니라 건너뛴다 */
function choicesOf(field: TallyField | undefined): string[] {
  if (!field || !Array.isArray(field.value) || !field.options) return []
  const byId = new Map(field.options.map(option => [option.id, option.text.trim()]))
  return field.value.flatMap(id => {
    const text = typeof id === 'string' ? byId.get(id) : undefined
    return text ? [text.slice(0, MAX_TEXT)] : []
  })
}

const CHOICE_TYPES = new Set(['DROPDOWN', 'MULTIPLE_CHOICE', 'MULTI_SELECT', 'CHECKBOXES'])
const isChoice = (field: TallyField) => CHOICE_TYPES.has(field.type) && Array.isArray(field.value)

/** 허용 목록 — 라벨(공백 제거)로 칸을 찾는다 */
const MATCHERS = {
  grade: (f: TallyField) => isChoice(f) && squash(f.label).includes('작가자격'),
  genres: (f: TallyField) => isChoice(f) && ['세부분야', '부문'].includes(squash(f.label)),
  track: (f: TallyField) => isChoice(f) && /신청부문|부문구분|전통.*현대/.test(squash(f.label)),
  route: (f: TallyField) => /신청유형|선임경로/.test(squash(f.label)),
  specialBasis: (f: TallyField) => /^특별선임(신청)?(사유|근거)/.test(squash(f.label)),
  membership: (f: TallyField) => isChoice(f) && squash(f.label).includes('회원현황'),
  name: (f: TallyField) => f.type === 'INPUT_TEXT' && squash(f.label) === '한글이름',
  nameHanja: (f: TallyField) => f.type === 'INPUT_TEXT' && squash(f.label) === '한자이름',
  nameEn: (f: TallyField) => f.type === 'INPUT_TEXT' && squash(f.label) === '영문이름',
  penName: (f: TallyField) => f.type === 'INPUT_TEXT' && squash(f.label) === '아호',
  email: (f: TallyField) => f.type === 'INPUT_EMAIL',
  awards: (f: TallyField) => f.type === 'TEXTAREA' && squash(f.label).startsWith('수상'),
  consent: (f: TallyField) => isChoice(f) && choicesOf(f).some(text => text.includes('동의')),
} as const

function gradeOf(raw: string | null): RequestedGrade {
  if (!raw) return 'unknown'
  if (raw.includes('추천')) return 'recommended'
  // 예전 신청서 보기의 '초청작가' 오기로 들어온 응답도 받는다
  if (raw.includes('초대') || raw.includes('초청')) return 'invited'
  return 'unknown'
}

function trackOf(raw: string | null): Track {
  if (!raw) return 'unknown'
  if (raw.includes('전통')) return 'traditional'
  if (raw.includes('현대')) return 'contemporary'
  return 'unknown'
}

function routeOf(raw: string | null): ApplicationRoute {
  if (!raw) return 'unknown'
  if (raw.includes('특별')) return 'special'
  if (/일반|정기|승급|점수/.test(raw)) return 'regular'
  return 'unknown'
}

/** 선택형이면 고른 글자를 ' / ' 로 잇고, 글 칸이면 글 그대로 */
function answerOf(field: TallyField | undefined, max = MAX_TEXT): string | null {
  if (!field) return null
  if (isChoice(field)) return clip(choicesOf(field).join(' / '), max)
  return textOf(field, max)
}

/**
 * 이름 칸들은 신청서에서 제목 없이 자리표시자만 달고 「신청인 기본정보」 제목 아래 한 줄로 묶여 있다.
 * Tally 가 라벨로 자리표시자를 주면 라벨로 찾고, 묶음 제목을 주면 그 아래 글 칸 순서
 * (한글 이름 · 한자 이름 · 영문 이름 · 아호, 그 뒤 주소 두 칸은 버림)로 찾는다.
 */
const NAME_ORDER = ['name', 'nameHanja', 'nameEn', 'penName'] as const
const NAME_GROUP_LABEL = '신청인기본정보'

function nameFields(fields: readonly TallyField[]) {
  const grouped = fields.filter(
    f => f.type === 'INPUT_TEXT' && squash(f.label) === NAME_GROUP_LABEL
  )
  return Object.fromEntries(
    NAME_ORDER.map((slot, index) => [slot, fields.find(MATCHERS[slot]) ?? grouped[index]])
  ) as Record<(typeof NAME_ORDER)[number], TallyField | undefined>
}

export function mapTallyApplication(payload: TallyPayload): MapResult {
  const { fields } = payload.data
  const find = (match: (f: TallyField) => boolean) => fields.find(match)
  const names = nameFields(fields)

  const consent = find(MATCHERS.consent)
  if (!consent) return { ok: false, reason: 'CONSENT_FIELD_MISSING' }
  const consentText = choicesOf(consent).join(' ')
  if (!/예|동의합니다/.test(consentText) || /않습니다|아니오/.test(consentText)) {
    return { ok: false, reason: 'NO_CONSENT' }
  }

  const gradeRaw = answerOf(find(MATCHERS.grade))
  const trackRaw = answerOf(find(MATCHERS.track))
  const routeRaw = answerOf(find(MATCHERS.route))
  const email = textOf(find(MATCHERS.email))

  return {
    ok: true,
    row: {
      tally_response_id: payload.data.responseId,
      tally_form_id: payload.data.formId,
      submitted_at: payload.data.createdAt,
      applicant_name: textOf(names.name),
      applicant_name_hanja: textOf(names.nameHanja),
      applicant_name_en: textOf(names.nameEn),
      pen_name: textOf(names.penName),
      applicant_email: email ? email.toLowerCase() : null,
      requested_grade: gradeOf(gradeRaw),
      requested_grade_raw: gradeRaw,
      track: trackOf(trackRaw),
      track_raw: trackRaw,
      genres: choicesOf(find(MATCHERS.genres)),
      route: routeOf(routeRaw),
      route_raw: routeRaw,
      membership_raw: answerOf(find(MATCHERS.membership)),
      special_basis_raw: answerOf(find(MATCHERS.specialBasis), MAX_LONG_TEXT),
      awards_text: textOf(find(MATCHERS.awards), MAX_LONG_TEXT),
    },
  }
}

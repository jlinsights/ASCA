// 관리자 "작가 신청 심사" — Tally 로 들어온 추천·초대작가 신청을 사무국이 접수·심사 상태로 옮긴다.
// 상태를 바꾸는 것은 기록일 뿐 선임이 아니다. 작가 행(artists)은 이사회 의결·납부 뒤 따로 만든다.
import { z } from 'zod'

/** 관리자 화면이 보는 칸 — Tally 응답·폼 ID 는 빼 둔다 */
export const ADMIN_APPLICATION_COLUMNS =
  'id,submitted_at,applicant_name,applicant_name_hanja,applicant_name_en,pen_name,applicant_email,requested_grade,requested_grade_raw,track,track_raw,genres,route,route_raw,membership_raw,special_basis_raw,awards_text,status,review_note,reviewed_at'

/** 한 쪽에 보일 신청 수 — 넘치면 page 로 넘긴다 */
export const ADMIN_APPLICATIONS_LIMIT = 50
export const REVIEW_NOTE_MAX = 2000

export const APPLICATION_STATUSES = [
  'received',
  'reviewing',
  'approved',
  'rejected',
  'withdrawn',
] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

/** 목록 탭 — open 은 아직 끝나지 않은 신청(접수·심사 중) */
export const APPLICATION_VIEWS = ['open', 'approved', 'rejected', 'withdrawn'] as const
export type ApplicationView = (typeof APPLICATION_VIEWS)[number]

export const VIEW_STATUSES: Record<ApplicationView, readonly ApplicationStatus[]> = {
  open: ['received', 'reviewing'],
  approved: ['approved'],
  rejected: ['rejected'],
  withdrawn: ['withdrawn'],
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  received: '접수',
  reviewing: '심사 중',
  approved: '승인',
  rejected: '반려',
  withdrawn: '철회',
}

export const GRADE_LABELS: Record<string, string> = {
  recommended: '추천작가',
  invited: '초대작가',
}
export const TRACK_LABELS: Record<string, string> = {
  traditional: '전통부문',
  contemporary: '현대부문',
}
export const ROUTE_LABELS: Record<string, string> = {
  regular: '일반선임',
  special: '특별선임',
}

export interface AdminApplication {
  id: string
  submitted_at: string
  applicant_name: string | null
  applicant_name_hanja: string | null
  applicant_name_en: string | null
  pen_name: string | null
  applicant_email: string | null
  requested_grade: string
  requested_grade_raw: string | null
  track: string
  track_raw: string | null
  genres: string[]
  route: string
  route_raw: string | null
  membership_raw: string | null
  special_basis_raw: string | null
  awards_text: string | null
  status: ApplicationStatus
  review_note: string | null
  reviewed_at: string | null
}

export const adminApplicationQuerySchema = z.object({
  view: z.enum(APPLICATION_VIEWS).default('open'),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
})

/**
 * 상태·메모 바꾸기 — from·seen 은 관리자가 화면에서 본 상태와 마지막 처리 시각(reviewed_at)이다.
 * 모든 쓰기가 reviewed_at 을 새로 찍으므로 이것이 행 버전 노릇을 한다. DB 가 본 그대로일 때만 바뀌어,
 * 두 관리자가 동시에 상태나 메모를 고쳐도 뒤에 온 쪽은 409 를 받고 앞선 메모를 덮지 않는다.
 * note 를 보내면 심사 메모를 바꾸고(빈 문자열은 지움), 빼면 그대로 둔다.
 */
export const applicationDecisionSchema = z
  .object({
    from: z.enum(APPLICATION_STATUSES),
    seen: z.string().datetime({ offset: true }).nullable(),
    to: z.enum(APPLICATION_STATUSES),
    note: z.string().max(REVIEW_NOTE_MAX).optional(),
  })
  .strict()
  .refine(decision => decision.from !== decision.to || decision.note !== undefined, {
    message: 'Nothing to change',
  })

export type ApplicationDecision = z.infer<typeof applicationDecisionSchema>

/** 신청서 원문 표기가 있으면 그대로, 없으면 정규화한 값의 이름 */
export function labelOf(
  value: string,
  raw: string | null,
  labels: Record<string, string>
): string | null {
  return labels[value] ?? (raw?.trim() || null)
}

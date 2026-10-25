import { z } from 'zod'
import type { Database } from '@/lib/types/database.generated'

// 작가 페이지 연결 요청 — 회원 라우트와 관리자 라우트가 같은 계약을 쓴다.
// 상태 전이와 연결 쓰기는 DB 함수(approve/reject/revoke_artist_claim)가 맡고, 여기는 입력·응답만 다룬다.

export const CLAIM_STATUSES = ['pending', 'approved', 'rejected', 'withdrawn', 'revoked'] as const
export type ClaimStatus = (typeof CLAIM_STATUSES)[number]

// 회원에게는 검토자 계정 ID 를 돌려주지 않는다
export const MEMBER_CLAIM_COLUMNS =
  'id,artist_id,claimed_name,claimed_name_hanja,claimed_art_name,note,status,decision_note,created_at,reviewed_at'

export const ADMIN_CLAIM_COLUMNS = `${MEMBER_CLAIM_COLUMNS},account_id,reviewed_by,revoked_at,artist:artists(id,name,name_zh,visibility,membership_type)`

const optionalName = z
  .string()
  .trim()
  .max(100)
  .transform(value => value || null)
  .nullable()
  .optional()

export const claimCreateSchema = z
  .object({
    // 없으면 "목록에 내 페이지가 없음" — 협회가 작가 행을 찾아 승인한다
    artistId: z.string().uuid().nullable().optional(),
    claimedName: z.string().trim().min(1).max(100),
    claimedNameHanja: optionalName,
    claimedArtName: optionalName,
    note: z.string().trim().max(1000).optional(),
  })
  .strict()

export const claimDecisionSchema = z.discriminatedUnion('action', [
  z
    .object({
      action: z.literal('approve'),
      artistId: z.string().uuid().optional(),
      note: z.string().trim().max(1000).optional(),
    })
    .strict(),
  z.object({ action: z.literal('reject'), note: z.string().trim().max(1000).optional() }).strict(),
  z.object({ action: z.literal('revoke'), note: z.string().trim().max(1000).optional() }).strict(),
])

export const adminClaimQuerySchema = z.object({
  status: z.enum(CLAIM_STATUSES).default('pending'),
})

type ClaimInsert = Database['public']['Tables']['artist_claim_requests']['Insert']

export function claimInsert(accountId: string, input: z.infer<typeof claimCreateSchema>) {
  const row: ClaimInsert = {
    account_id: accountId,
    artist_id: input.artistId ?? null,
    claimed_name: input.claimedName,
    claimed_name_hanja: input.claimedNameHanja ?? null,
    claimed_art_name: input.claimedArtName ?? null,
    note: input.note ?? '',
  }
  return row
}

export interface ClaimFailure {
  status: number
  code: string
}

/** DB 함수가 올린 SQLSTATE 를 HTTP 응답으로 옮긴다. 모르는 오류는 null — 호출자가 500 으로 처리한다. */
export function claimDbFailure(error: { code?: string } | null | undefined): ClaimFailure | null {
  switch (error?.code) {
    // 검토자가 활성 관리자가 아니거나, 요청한 계정이 비활성
    case '42501':
      return { status: 403, code: 'CLAIM_NOT_ALLOWED' }
    case 'P0002':
      return { status: 404, code: 'CLAIM_NOT_FOUND' }
    case '55000':
      return { status: 409, code: 'CLAIM_NOT_PENDING' }
    case '23505':
      return { status: 409, code: 'ARTIST_ALREADY_LINKED' }
    case '22023':
      return { status: 400, code: 'ARTIST_REQUIRED' }
    default:
      return null
  }
}

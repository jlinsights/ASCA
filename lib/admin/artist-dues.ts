import { z } from 'zod'

// 회원 및 회비 규정 제5조의 미납 단계. DB 의 artists.dues_status check 제약과 같은 값이다.
export const DUES_STATUSES = ['정상', '권한 제한', '자격 정지'] as const
export type DuesStatus = (typeof DUES_STATUSES)[number]

export const DUES_STATUS_NOTES: Record<DuesStatus, string> = {
  정상: '연회비 납부 완료 — 공개',
  '권한 제한': '당해 연도 미납 — 공개 유지, 일부 권한 제한',
  '자격 정지': '연속 2년 미납 — 웹사이트 비공개, 완납하면 복원',
}

export const ADMIN_ARTISTS_PAGE_SIZE = 30

/** 관리 화면이 고르는 컬럼. 회비 상태와 공개 여부는 관리자에게만 보인다. */
export const ADMIN_ARTIST_COLUMNS =
  'id,name,name_zh,membership_type,title,dues_status,visibility,updated_at'

export interface AdminArtistRow {
  id: string
  name: string
  name_zh: string | null
  membership_type: string | null
  title: string | null
  dues_status: DuesStatus
  visibility: string
  updated_at: string | null
}

const optionalText = z
  .string()
  .trim()
  .max(50)
  .transform(value => value.replace(/[,().%*\\:"']/g, ' ').trim())
  .optional()

export const adminArtistsQuerySchema = z.object({
  q: optionalText,
  grade: optionalText,
  dues: z.enum(DUES_STATUSES).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
})

export type AdminArtistsQuery = z.infer<typeof adminArtistsQuerySchema>

export const duesUpdateSchema = z.object({ dues_status: z.enum(DUES_STATUSES) }).strict()

/** URLSearchParams → 검증된 조회 조건. 빈 문자열은 조건 없음으로 본다. */
export function parseAdminArtistsQuery(params: URLSearchParams) {
  const raw = Object.fromEntries(
    ['q', 'grade', 'dues', 'page']
      .map(key => [key, params.get(key)] as const)
      .filter((entry): entry is readonly [string, string] => !!entry[1]?.trim())
  )
  return adminArtistsQuerySchema.safeParse(raw)
}

import { z } from 'zod'

// 작가 프로필 수정 이력 — 관리자 목록·되돌리기 라우트와 화면이 같은 계약을 쓴다.

export const REVISION_COLUMNS =
  'id,artist_id,account_id,changes,revert_of,reverted_at,reverted_by,created_at,artist:artists(id,name,name_zh,visibility)'

export const REVISIONS_PAGE_SIZE = 50

export const revisionQuerySchema = z.object({
  artistId: z.string().uuid().optional(),
})

/** 화면에 보일 칸 이름 — DB 함수가 허용하는 칸과 같다 */
export const PROFILE_FIELD_LABELS: Record<string, string> = {
  name_en: '영문 이름',
  bio: '소개',
  bio_en: '영문 소개',
  birth_year: '출생 연도',
  specialties: '분야',
}

export interface RevisionFailure {
  status: number
  code: string
}

/** 되돌리기 함수가 올린 SQLSTATE → HTTP. 모르는 오류는 null(호출자가 500). */
export function revisionDbFailure(
  error: { code?: string } | null | undefined
): RevisionFailure | null {
  switch (error?.code) {
    case '40001':
      return { status: 409, code: 'CHANGED_SINCE' }
    case '55000':
      return { status: 409, code: 'NOT_REVERTIBLE' }
    case '42501':
      return { status: 403, code: 'REVIEWER_NOT_ALLOWED' }
    case 'P0002':
      return { status: 404, code: 'REVISION_NOT_FOUND' }
    default:
      return null
  }
}

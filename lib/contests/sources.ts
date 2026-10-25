// Airtable 공모전 출품 테이블(연도별) → contest_entries 사본의 칸 대응표.
// 새 공모전 테이블이 생기면 여기에 한 줄을 더한다. 칸 ID 만 읽고, 목록에 없는 칸은 요청하지도 않는다.

export const CONTEST_BASE_ID = 'app98CHubRtFuE68t'

export type EntryColumn =
  | 'title'
  | 'division'
  | 'scriptStyle'
  | 'fee'
  | 'result'
  | 'entrantName'
  | 'entrantNameHanja'
  | 'entrantEmail'
  | 'contestName'
  | 'submittedAt'

export interface ContestSource {
  /** contest_entries.source_key — 연도·종류를 사람이 읽을 수 있게 */
  key: string
  year: number
  tableId: string
  /** 칸이 없거나(contestName 미대응) 비었을 때 쓸 공모전 이름 */
  contestName: string
  /** 사본 칸 ← Airtable 칸 ID. 여기 적힌 칸만 요청한다 */
  fields: Partial<Record<EntryColumn, string>>
}

export const CONTEST_SOURCES: readonly ContestSource[] = [
  {
    key: '2025-entries',
    year: 2025,
    tableId: 'tblRVRhpOcAAN4nrX', // 25년 출품원서
    contestName: '대한민국 동양서예대전 공모전',
    fields: {
      title: 'fldM6CI7ajsKecuP9', // 작품 명제
      division: 'fldCu9trq7uULZOJN', // 부문
      scriptStyle: 'fld1Kjg4TiUxKBg4y', // 서체
      fee: 'fldYLfWLQvNwOKijW', // 출품비 납부
      result: 'fldiPNYg6Qn59JTYi', // 수상 내역
      entrantName: 'fldAoPlcR9Pn1x80M', // 한글 이름
      entrantNameHanja: 'fld1u8FEM4HOkcFFI', // 작가 이름(한자)
      entrantEmail: 'fldR8ASE6pGm7hTaM', // 이메일
      contestName: 'fldqLzvNxtRbdr5at', // 전시회
      submittedAt: 'fldjjLehP3CWJkqo5', // Created
    },
  },
  {
    key: '2024-awards',
    year: 2024,
    tableId: 'tblzBif584bAFBzZx', // 24년 공모전 (수상작)
    contestName: '대한민국 동양서예대전 공모전',
    fields: {
      title: 'fldoZRAw8LbJLIvLq', // 작품 명제
      division: 'fldvHig1zVfgCUDM8', // 부문
      scriptStyle: 'fldJqKeKdavxC8sC8', // 서체
      fee: 'fldwZuB8W4mVYgVjP', // 표구 및 도록비 납부
      result: 'fld7CKxhG47ims85B', // 수상작
      entrantName: 'fldi4gjSb1qnT4kym', // 한글 이름
      entrantNameHanja: 'fldJazDk6WiOcJRdi', // 한문 이름
    },
  },
]

/**
 * 어떤 경우에도 요청하면 안 되는 칸 — 주소·전화·생년월일·사진·심사 점수.
 * 대응표에 실수로 들어가면 테스트와 실행 시 검사가 막는다.
 */
export const FORBIDDEN_FIELD_IDS: ReadonlySet<string> = new Set([
  // 25년 출품원서
  'fldszVSiPdElxMVt7', // 자택주소
  'fldDrWC5s7KGTc0wj', // 전화번호
  'fldnpiInI8BopTF7D', // 생년월일
  'fldF4AgPPojFECpnh', // 프로필 사진
  'fldz7kV11yltlt2gw', // 작품사진
  'fldBoNLMQcbGAnAjh', // 1차 평균점수
  'fldws1hkJq8E545sK', // 수상경력(자기소개 원문)
  // 24년 공모전
  'fldAe21C6L594OkS9', // 작품 사진
  // 書境 (2026)
  'fldU8X4Gt6VG5IoUU', // 자택주소
  'fldVPOYB6gAQXXd85', // 프로필 사진
  'fld50YOt6011r8tX6', // 전화번호
  'fldPYkULm1SJXP8yq', // 생년월일
])

/** 이 원본에서 요청할 칸 ID 목록. 금지 칸이 섞이면 던진다. */
export function requestedFieldIds(source: ContestSource): string[] {
  const ids = [...new Set(Object.values(source.fields).filter((id): id is string => !!id))]
  const forbidden = ids.filter(id => FORBIDDEN_FIELD_IDS.has(id))
  if (forbidden.length) throw new Error(`Forbidden Airtable fields in ${source.key}: ${forbidden}`)
  return ids
}

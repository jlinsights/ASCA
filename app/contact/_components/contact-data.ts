import { reg, type LedgerRow, type RegSource } from '@/components/apply/apply-parts'
import {
  BOOKING_URL,
  CHAT_URL,
  EMAIL,
  FAX,
  KAKAO_CHAT_URL,
  OFFICE_HOURS,
  PHONE,
  mailto,
} from '@/lib/content/contact-info'

/**
 * /contact — 용건별 안내와 연락 창구, 이의제기 절차.
 * 이의제기 숫자·항목의 원문은 regulations/07-objections.md. __tests__/contact-parity.test.ts 가 대조한다.
 */

export interface Topic {
  title: string
  body: string
  href: string
  cta: string
}

/** 무엇을 도와드릴까요 — 문의 대부분은 이미 답이 있는 페이지로 가면 끝난다 */
export const TOPICS: readonly Topic[] = [
  {
    title: '공모전 출품',
    body: '출품원서 작성, 공모 부문과 작품 규격, 출품비, 심사와 시상',
    href: '/application',
    cta: '출품원서',
  },
  {
    title: '회원 가입',
    body: '회원 등급과 자격, 정회원 혜택',
    href: '/membership',
    cta: '회원 안내',
  },
  {
    title: '회비 납부',
    body: '연회비·등록비·발전기금, 납부 방법과 기한',
    href: '/fundraising',
    cta: '회비·후원',
  },
  {
    title: '추천·초대작가 승급',
    body: '승급 요건과 지원서 제출',
    href: '/application-for-recommended-invited-calligrapher',
    cta: '추천·초대작가 지원',
  },
  {
    title: '심사·운영위원 지원',
    body: '위원 자격, 수당, 위촉 지원서',
    href: '/commissioning-application',
    cta: '위원 위촉 지원',
  },
  {
    title: '서예 강좌',
    body: '협회가 연결하는 교육기관과 과정, 수강료',
    href: '/academy',
    cta: '강좌 안내',
  },
  {
    title: '서식 내려받기',
    body: '각종 신청서와 양식',
    href: '/forms',
    cta: '서식',
  },
  {
    title: '결과에 대한 이의제기',
    body: '공모·전시 결과 공지일로부터 7일 이내, 서면으로',
    href: '#objection',
    cta: '이의제기 절차',
  },
]

export interface Channel {
  title: string
  value: string
  bestFor: string
  href?: string
  external?: boolean
  recommended?: boolean
}

/** 연락 창구 — 창구마다 "이럴 때"를 붙여 한 곳으로 몰리지 않게 한다 */
export const CHANNELS: readonly Channel[] = [
  {
    title: '실시간 온라인 상담',
    value: '1년 365일',
    bestFor: '가장 빠릅니다. 대부분의 질문은 여기서 바로 답을 받습니다.',
    href: CHAT_URL,
    external: true,
    recommended: true,
  },
  {
    title: '카카오톡 채팅',
    value: '동양서예 카카오채널',
    bestFor: '카카오톡이 익숙하신 분',
    href: KAKAO_CHAT_URL,
    external: true,
  },
  {
    title: '상담 예약',
    value: OFFICE_HOURS,
    bestFor: '출품·승급처럼 길게 상의할 일',
    href: BOOKING_URL,
    external: true,
  },
  {
    title: '전화',
    value: PHONE.display,
    bestFor: OFFICE_HOURS,
    href: PHONE.href,
  },
  {
    title: '이메일',
    value: EMAIL,
    bestFor: '서류 제출, 공식 문의, 이의제기',
    href: mailto('동양서예협회 문의'),
  },
  {
    title: '팩스',
    value: FAX,
    bestFor: '서면 서류 송부',
  },
]

/** 이의제기 처리 규정 제4조 — 서면에 반드시 넣을 네 가지 */
export const OBJECTION_FIELDS: readonly { term: string; detail: string }[] = [
  { term: '인적 사항', detail: '성명, 연락처, 접수번호 (또는 출품 부문)' },
  { term: '대상 사안', detail: '이의를 제기하는 특정 항목 또는 절차' },
  { term: '사유 및 근거', detail: '객관적 사실에 기반한 구체적 사유 (증거 자료 첨부 권장)' },
  { term: '요구 사항', detail: '정정, 사실 확인, 재검토 등 구체적인 요청 내용' },
]

/** 제5조 — 처리 기한 */
export const OBJECTION_DEADLINES: readonly LedgerRow[] = [
  { cells: ['접수 확인', '영업일 기준 24시간 이내', '접수 완료 알림 발송'] },
  { cells: ['1차 회신', '접수일로부터 영업일 3일 이내', '검토 진행 상황 공유'] },
  { cells: ['최종 회신', '접수일로부터 영업일 14일 이내', '최종 결정 사항 공식 통보'], lead: true },
]

/** 제6조 — 유형별 처리 기준 */
export const OBJECTION_TYPES: readonly { title: string; body: string }[] = [
  { title: '절차적 오류', body: '접수, 누락, 공지 과정의 행정적 실수는 즉시 확인 후 정정합니다.' },
  { title: '사실관계 오류', body: '출품자 정보와 작품 정보의 오기는 증빙 확인 후 수정합니다.' },
  {
    title: '검증 요청',
    body: '현장 휘호 결과나 원작 대조 요청은 심사위원회 또는 운영위원회의 의결에 따라 재검증할 수 있습니다.',
  },
]

/** 제7조 — 받아들이지 않을 수 있는 경우 */
export const OBJECTION_DISMISSALS: readonly string[] = [
  '정해진 접수 기간을 넘긴 경우',
  '필수 정보가 빠져 검토할 수 없는 경우',
  '심사위원 개인의 주관적 평가(점수)에 대한 단순 불만인 경우',
  '근거 없는 비방, 인신공격 또는 업무 방해 목적이 뚜렷한 경우',
]

export const OBJECTION_SOURCES: readonly RegSource[] = [
  reg('objections', '2', '이의제기 처리 규정 제2조'),
  reg('objections', '3', '제3조'),
  reg('objections', '4', '제4조'),
  reg('objections', '5', '제5조'),
  reg('objections', '6', '제6조'),
  reg('objections', '7', '제7조'),
]

/** 제4조의 네 항목을 미리 적어 둔 이메일 — 빠뜨리면 제7조로 각하될 수 있다 */
export const OBJECTION_MAILTO = mailto(
  '[이의제기] 공모·전시명',
  [
    '1. 인적 사항',
    '- 성명:',
    '- 연락처:',
    '- 접수번호(또는 출품 부문):',
    '',
    '2. 대상 사안 (이의를 제기하는 항목 또는 절차):',
    '',
    '3. 사유 및 근거 (객관적 사실, 증거 자료 첨부 권장):',
    '',
    '4. 요구 사항 (정정 / 사실 확인 / 재검토 등):',
  ].join('\n')
)

export const OFFICE_SOURCES: readonly RegSource[] = [reg('articles', '38', '정관 제38조')]

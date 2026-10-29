import { BOOKING_URL, CHAT_URL, PHONE } from '@/lib/content/contact-info'

/**
 * 회원 안내 페이지의 사실 데이터.
 * 기준은 /regulations 가 공개하는 regulations/*.md 원문이다(정관·회원 및 회비 규정·추천·초대작가 선임 규정·
 * 작가·회원·임원 자격 및 요건). 항목마다 근거 조문(source)을 달아 둔다 — 규정이 바뀌면 여기를 같이 고친다.
 */

export interface RegSource {
  label: string
  href: string
}

const reg = (slug: string, article?: number, label?: string): RegSource => ({
  label: label ?? '',
  href: `/regulations/${slug}${article ? `#a${article}` : ''}`,
})

export const SRC = {
  articles5: reg('articles', 5, '정관 제5조'),
  articles8: reg('articles', 8, '정관 제8조'),
  articles11: reg('articles', 11, '정관 제11조'),
  dues2: reg('membership-dues', 2, '회원 및 회비 규정 제2조'),
  dues3: reg('membership-dues', 3, '회원 및 회비 규정 제3조'),
  dues4: reg('membership-dues', 4, '회원 및 회비 규정 제4조'),
  dues5: reg('membership-dues', 5, '회원 및 회비 규정 제5조'),
  dues10: reg('membership-dues', 10, '회원 및 회비 규정 제10조'),
  dues11: reg('membership-dues', 11, '회원 및 회비 규정 제11조'),
  dues12: reg('membership-dues', 12, '회원 및 회비 규정 제12조'),
  dues13: reg('membership-dues', 13, '회원 및 회비 규정 제13조'),
  select2: reg('artist-selection', 2, '추천·초대작가 선임 규정 제2조'),
  select3: reg('artist-selection', 3, '추천·초대작가 선임 규정 제3조'),
  select4: reg('artist-selection', 4, '추천·초대작가 선임 규정 제4조'),
  select5: reg('artist-selection', 5, '추천·초대작가 선임 규정 제5조'),
  select6: reg('artist-selection', 6, '추천·초대작가 선임 규정 제6조'),
  select8: reg('artist-selection', 8, '추천·초대작가 선임 규정 제8조'),
  select9: reg('artist-selection', 9, '추천·초대작가 선임 규정 제9조'),
  select11: reg('artist-selection', 11, '추천·초대작가 선임 규정 제11조'),
  select12: reg('artist-selection', 12, '추천·초대작가 선임 규정 제12조'),
  qualifications: reg('qualifications', undefined, '작가·회원·임원 자격 및 요건'),
} as const satisfies Record<string, RegSource>

/* ---------- 회원 자격 ---------- */

export const MEMBER_FIELDS =
  '전통 한글 및 한문 서예, 현대서예, 캘리그라피, 서각, 전각 및 문인화, 수묵화(梅, 蘭, 菊, 竹), 민화 등의 작품활동, 교육 및 연구를 하고 있거나, 본인의 재능을 지역이나 개인에게 나누는 봉사활동에 관심이 많은 분'

export const FULL_MEMBER_DEFINITION =
  '정회원은 연회비 또는 평생회비를 납부한 청년작가·일반작가·추천작가·초대작가 및 임원입니다. 자격이 정지된 회원과 정관 제6조의 준회원·특별회원·명예회원은 정회원에 포함하지 않습니다.'

/* ---------- 회원 등급 ---------- */

export type TierStage = 'entry' | 'promotion'

export interface MemberTier {
  id: string
  title: string
  titleEn: string
  stage: TierStage
  annualFee: string
  registrationFee: string
  requirement: string
  source: RegSource
}

export const MEMBER_TIERS: readonly MemberTier[] = [
  {
    id: 'youth',
    title: '청년작가',
    titleEn: 'Youth Artist',
    stage: 'entry',
    annualFee: '30,000원',
    registrationFee: '등록비 10,000원 (최초 가입 시)',
    requirement: '해당 연도 1월 1일 기준 만 40세 이하 작가로서 협회의 이념과 목적에 동의하는 자',
    source: SRC.dues2,
  },
  {
    id: 'general',
    title: '일반작가',
    titleEn: 'General Artist',
    stage: 'entry',
    annualFee: '50,000원',
    registrationFee: '등록비 20,000원 (최초 가입 시)',
    requirement: '해당 연도 1월 1일 기준 만 41세 이상 작가로서 협회의 이념과 목적에 동의하는 자',
    source: SRC.dues2,
  },
  {
    id: 'recommended',
    title: '추천작가',
    titleEn: 'Recommended Artist',
    stage: 'promotion',
    annualFee: '80,000원',
    registrationFee: '등록비 30,000원 (청년·일반작가에서 승급 시)',
    requirement: '정회원으로 3년 이상 활동하고 입상 점수 10점 이상을 취득한 자 중에서 선임',
    source: SRC.select9,
  },
  {
    id: 'invited',
    title: '초대작가',
    titleEn: 'Invited Artist',
    stage: 'promotion',
    annualFee: '100,000원',
    registrationFee: '등록비 50,000원 (추천작가에서 승급 시)',
    requirement: '추천작가로 5년 이상 활동하고 입상 점수 15점 이상을 취득한 자 중에서 선임',
    source: SRC.select9,
  },
  {
    id: 'executive',
    title: '임원',
    titleEn: 'Executive',
    stage: 'promotion',
    annualFee: '200,000원',
    registrationFee: '발전기금 2,000,000원 (임원 취임 시)',
    requirement:
      '초대작가 중 임원으로서 요구되는 별도의 활동 기준을 충족하고 이사회의 추천을 받아 정관 제11조에 따라 총회에서 선출된 자',
    source: SRC.dues2,
  },
]

export const TIER_STAGE_LABEL: Record<TierStage, string> = {
  entry: '입회',
  promotion: '승급',
}

/* ---------- 승급 기준 ---------- */

export interface ScoreRow {
  award: string
  points: number
}

export const SCORING_TABLE: readonly ScoreRow[] = [
  { award: '입선', points: 1 },
  { award: '특선', points: 3 },
  { award: '삼체상', points: 5 },
  { award: '오체상', points: 7 },
  { award: '우수상', points: 7 },
  { award: '최우수상', points: 8 },
  { award: '대상', points: 9 },
]

/** 제4조 ②~⑤ — 배점표 아래에 붙는 규칙 */
export const SCORING_RULES: readonly string[] = [
  '본회 주최 국제서예전람회 수상실적은 같은 배점을 적용합니다.',
  '입상작품이 화첩에 수록된 경우 0.5점을 추가 가산합니다.',
  '대상 수상작품이 국립박물관 또는 미술관에 소장된 경우 1점을 추가 가산합니다.',
  '같은 해 입상점수는 최고점수 하나만 인정합니다.',
]

export interface ScoreBand {
  range: string
  level: string
  /** 눈금 위 폭 비율 — 1~9 / 10~14 / 15 이상 */
  span: number
  emphasis: boolean
}

export const SCORE_BANDS: readonly ScoreBand[] = [
  { range: '9점 이하', level: '승급 점수 미달', span: 9, emphasis: false },
  { range: '10점 이상', level: '추천작가 선정 대상', span: 5, emphasis: true },
  { range: '15점 이상', level: '초대작가 선정 대상', span: 4, emphasis: true },
]

export const SCORE_NOTE =
  '점수만으로 승급되지는 않습니다. 아래 필수 요건을 모두 갖추고 자격심사위원회의 심사를 통과해야 합니다.'

/** 선임 규정 제3조 ① — 점수와 별개로 모두 갖춰야 하는 요건 */
export const REQUIRED_CONDITIONS: readonly string[] = [
  '신청일 기준 최근 3년 이내 본회 전시에 연속 출품한 실적',
  '자격심사위원회가 실시하는 최근 대표작 포트폴리오 심사 통과',
  '본회 주관 행사 운영, 봉사 등 협회 기여 활동 3회 이상',
  '최근 5년 이내 본회 징계 처분을 받은 사실이 없을 것',
]

/** 선임 규정 제8조 — 심사 절차 */
export const REVIEW_STEPS: readonly string[] = [
  '심사는 연 2회, 서류심사와 작품심사로 나누어 실시합니다.',
  '작품심사는 최근 3년 이내 제작된 대표작품 3점을 대상으로 합니다.',
  '심사위원 전원의 3분의 2 이상 찬성으로 자격을 부여하고, 이사장이 최종 선임합니다.',
]

export interface BonusGroup {
  title: string
  items: readonly string[]
  source: RegSource
}

/** 선임 규정 제5조·제6조 — 가산점 요약 */
export const BONUS_POINTS: readonly BonusGroup[] = [
  {
    title: '지부·지회 전람회',
    items: [
      '광역시·도 규모 수상 2점, 시·군·구 규모 수상 1점',
      '3년 연속 수상실적 보유 시 1점 추가',
    ],
    source: SRC.select5,
  },
  {
    title: '학력·경력',
    items: [
      '서예관련학과 학사 2점, 석사 추가 1점, 박사 추가 2점',
      '서예관련 자격증 1점',
      '본회 초대작가 이상 서예가에게 3년 이상 사사한 전통서예 전수자 2점',
    ],
    source: SRC.select6,
  },
  {
    title: '협회 기여 (최대 3점)',
    items: [
      '협회 주관 행사 운영·실행위원 또는 자원봉사 3회 이상 1점',
      '지부·지회 활성화 기획 활동 증빙 1점',
      '서예 재능 기부 등 사회공헌 활동 연 20시간 이상 1점',
      '청년작가로서 온라인 홍보단 활동 1년 이상 1점',
    ],
    source: SRC.select6,
  },
]

/* ---------- 특별선임 ---------- */

export const SPECIAL_LEDE =
  '입상 점수 대신 공헌·경력으로 추천·초대작가가 되는 길입니다. 본회 정회원이 아니어도 신청할 수 있고, 자격심사위원회 심사를 통과한 뒤 이사회의 3분의 2 이상 찬성으로 선임합니다.'

/** 선임 규정 제11조 ① — 신청할 수 있는 자 */
export const SPECIAL_ELIGIBLE: readonly string[] = [
  '서예문화 발전에 특별한 공헌이 있는 자',
  '국내외 서예교육에 20년 이상 종사한 자',
  '문화체육관광부에 등록된 타 서예단체 초대작가',
]

/** 선임 규정 제11조 ②③ — 신청부터 선임까지 */
export const SPECIAL_STEPS: readonly string[] = [
  '본인이 신청합니다. 이사회가 추천한 경우에도 본인의 동의를 받아 신청한 것으로 봅니다. 신청서에 자격(추천작가·초대작가)과 부문(전통·현대)을 적습니다.',
  '정기 심사 때 자격심사위원회의 서류심사와 작품심사를 받습니다. 입상 점수, 정회원·추천작가 활동 기간, 연속 출품·협회 기여 요건은 적용하지 않고, 대표작 포트폴리오 심사와 최근 5년 이내 징계 없음은 적용합니다.',
  '심사를 통과한 분에 대해 이사회가 3분의 2 이상 찬성으로 의결하고 이사장이 선임합니다. 이사회는 신청한 자격보다 낮은 자격으로 의결할 수 있습니다.',
]

/** 회원 및 회비 규정 제3조 ④ — [구분, 심사료, 등록비, 첫해 연회비, 합계] */
export const SPECIAL_FEES: readonly { cells: readonly string[] }[] = [
  { cells: ['추천작가', '5만원', '5만원', '8만원', '18만원'] },
  { cells: ['초대작가', '5만원', '10만원', '10만원', '25만원'] },
]

export const SPECIAL_FEE_COLUMNS = [
  '구분',
  '심사료 (신청 시)',
  '등록비 (의결 후)',
  '첫해 연회비 (의결 후)',
  '합계',
] as const

/** 선임 규정 제11조 ④~⑧ — 신청자의 회원 상태별 비용과 효력 */
export const SPECIAL_CASES: readonly { label: string; body: string }[] = [
  {
    label: '비회원',
    body: '신청서가 입회원서를 겸하고, 이사회 의결이 입회 승인을 겸합니다. 심사료는 신청할 때 내며 선임 여부와 관계없이 돌려드리지 않습니다. 등록비와 첫해 연회비는 의결된 자격을 기준으로 의결 후 함께 내고, 모두 낸 날 선임의 효력이 생기며 그날 해당 등급 정회원이 됩니다. 다음 해부터 해당 등급의 연회비를 냅니다.',
  },
  {
    label: '정회원',
    body: '현재 등급에서 의결된 등급까지 각 단계의 승급 등록비를 더해 의결 후 냅니다(예: 일반작가 → 초대작가는 3만원 + 5만원 = 8만원). 낸 날 효력이 생기고, 이미 낸 연회비와 평생회원의 연회비 면제는 그대로 유지됩니다.',
  },
  {
    label: '연회비 미납 회원',
    body: '권한이 제한되거나 자격이 정지된 회원은 미납 연회비를 완납해 자격을 복원한 뒤 정회원으로 신청합니다.',
  },
  {
    label: '감면',
    body: '서예문화 발전에 특별한 공헌이 있는 분은 이사회가 선임을 의결할 때 등록비·첫해 연회비 또는 승급 등록비의 전부나 일부를 감면할 수 있습니다. 심사료는 감면하지 않으며, 낼 금액이 없으면 이사회 의결일에 효력이 생깁니다.',
  },
  {
    label: '선임 후',
    body: '선임의 효력이 생긴 날부터 추천·초대작가의 자격유지 의무(2년마다 갱신 작품 제출, 연 1회 이상 협회 전시 참가, 신진작가 지도, 연회비 납부)를 집니다.',
  },
]

/* ---------- 회원 혜택 ---------- */

export interface BenefitGroup {
  title: string
  items: readonly string[]
  sources: readonly RegSource[]
}

export const MEMBER_BENEFITS: readonly BenefitGroup[] = [
  {
    title: '정회원 공통',
    items: [
      '전시회 참가 시 도록 1권 무료 제공',
      '출품비, 표구비, 도록비 회원가 적용',
      '작가 개인 홈페이지를 구축하면 연회비 면제',
      '본회 자료 및 출판물 무상 제공',
      '경력과 작품을 관리·전시하는 사이버공간을 협회 홈페이지에 제공',
      '임원 선거권과 피선거권, 회의 참석과 의결 참여',
    ],
    sources: [SRC.dues12, SRC.qualifications],
  },
  {
    title: '추천작가 이상',
    items: [
      '초대작가 후보 등록 기회',
      '특별 전시회 및 해외 교류전 참가 우선권',
      '요건 충족 시 작가 개인 홈페이지 초기 구축비 선별 지원',
    ],
    sources: [SRC.dues12],
  },
  {
    title: '초대작가 이상',
    items: ['임원 후보 추천 자격 (정관 제11조에 따라 총회에서 선출)', '운영위원 및 심사위원 자격'],
    sources: [SRC.dues12],
  },
  {
    title: '임원',
    items: [
      '운영위원 및 심사위원 위촉 우선권',
      '작가 개인 홈페이지 초기 구축비와 연간 유지보수비 1년 면제',
      '초대작가전 출품비 5% 할인',
    ],
    sources: [SRC.dues12],
  },
]

/* ---------- 회비 납부와 자격 관리 ---------- */

export interface DuesStep {
  when: string
  what: string
}

/** 회비 규정 제5조 ② — 연회비 미납 단계 */
export const ARREARS_STEPS: readonly DuesStep[] = [
  { when: '당해 연도 미납', what: '미납 통보 후 웹페이지 접속, 행사 참여 등 회원 권한 제한' },
  { when: '2년 연속 미납', what: '회원 자격 정지, 모든 회원 혜택과 권한 중단' },
  { when: '3년 연속 미납', what: '정관 제9조에 따라 이사회 의결을 거쳐 제명될 수 있음' },
]

export const DUES_FACTS: readonly { label: string; body: string }[] = [
  { label: '납부 기한', body: '연회비는 매년 1월 31일까지 납부합니다.' },
  {
    label: '자격 복원',
    body: '권한이 제한되거나 자격이 정지된 회원은 미납 연회비를 완납하면 기존 자격이 복원됩니다. 제명된 회원은 다시 입회해야 합니다.',
  },
  {
    label: '유예·분할',
    body: '특별한 사유가 있으면 이사회 승인으로 납부를 유예하거나 나누어 낼 수 있습니다.',
  },
  { label: '탈퇴', body: '이사장에게 탈퇴서를 제출하면 자유롭게 탈퇴할 수 있습니다.' },
]

export const PAYMENT_LINKS = {
  pay: 'https://secure.donus.org/orientalcalligraphy/pay',
  mypage: 'https://secure.donus.org/orientalcalligraphy/mypage',
} as const

/* ---------- 평생회원과 연회비 면제 ---------- */

export interface LifetimeFact {
  figure: string
  label: string
  body: string
}

export const LIFETIME_FACTS: readonly LifetimeFact[] = [
  {
    figure: '연회비 × 10',
    label: '평생회비',
    body: '초대작가 이상의 정회원은 누구나 연회비의 10배에 해당하는 평생회비를 납부하고 평생회원 자격을 신청할 수 있습니다. 초대작가는 1백만원입니다.',
  },
  {
    figure: '2백만원',
    label: '임원 발전기금',
    body: '발전기금 2백만원을 완납한 임원은 평생회원 자격을 자동으로 취득하며, 이후 연회비 납부 의무를 영구히 면제받습니다. 이미 평생회원인 회원이 임원이 되면 낸 평생회비를 뺀 차액만 납부합니다.',
  },
  {
    figure: '20개월',
    label: 'CMS 분할 납부',
    body: '발전기금은 최대 20개월까지 CMS를 통해 분할 납부할 수 있습니다.',
  },
]

export interface Exemption {
  title: string
  body: string
  source: RegSource
}

export const DUES_EXEMPTIONS: readonly Exemption[] = [
  {
    title: '작가 홈페이지',
    body: '홈페이지 제작·유지보수 계약을 맺고 연간 유지보수비를 납부한 정회원은 해당 연도 연회비가 면제됩니다. 전시에 30점 이상 출품한 해에도 면제됩니다.',
    source: SRC.dues10,
  },
  {
    title: '고령 회원',
    body: '만 70세 이상, 가입 기간 10년 이상이며 협회 발전에 기여한 공로가 현저한 회원은 이사회 심의를 거쳐 연회비를 면제받을 수 있습니다.',
    source: SRC.dues13,
  },
  {
    title: '명예작가',
    body: '30년 이상 초대작가 자격을 유지했거나, 만 70세 이상으로 협회 발전에 현저한 공헌이 있는 작가는 명예작가로 추대되어 회비와 출품 의무를 면제받습니다.',
    source: SRC.select12,
  },
]

/* ---------- 가입 방법 ---------- */

export interface JoinStep {
  title: string
  body: string
  source?: RegSource
}

export const JOIN_STEPS: readonly JoinStep[] = [
  {
    title: '입회원서 제출',
    body: '협회 설립취지에 동의하는 작가는 입회원서를 작성해 사무국에 제출합니다.',
    source: SRC.articles5,
  },
  {
    title: '이사회 승인',
    body: '이사회의 승인을 얻으면 회원이 됩니다.',
    source: SRC.articles5,
  },
  {
    title: '등록비·연회비 납부',
    body: '온라인 모금함에서 등록비와 연회비를 납부하고, 마이페이지에서 납부내역을 확인합니다.',
    source: SRC.qualifications,
  },
]

export interface JoinChannel {
  title: string
  detail: string
  href: string
  external: boolean
}

export const JOIN_CHANNELS: readonly JoinChannel[] = [
  {
    title: '입회원서 다운로드',
    detail: 'PDF / 한컴독스 양식',
    href: '/forms#oc-registration-form',
    external: false,
  },
  {
    title: '등록비·연회비 납부',
    detail: '온라인 모금함',
    href: PAYMENT_LINKS.pay,
    external: true,
  },
  { title: '전화 상담', detail: PHONE.display, href: PHONE.href, external: false },
  {
    title: '실시간 온라인 상담',
    detail: '1년 365일 언제든 문의 가능',
    href: CHAT_URL,
    external: true,
  },
]

export const CONSULT_LINKS = {
  chat: CHAT_URL,
  booking: BOOKING_URL,
} as const

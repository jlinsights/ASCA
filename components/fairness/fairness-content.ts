/**
 * 공정·투명성 허브 본문 — 문구는 #114 에서 규정과 맞춘 그대로다. 고칠 때는 /regulations 원문과 대조할 것.
 */

export interface LabeledText {
  label: string
  text: string
}

export interface JudgingStep {
  id: string
  title: string
  titleEn: string
  items: string[]
}

export interface FairnessSection {
  id: string
  num: string
  label: string
}

export const EFFECTIVE = { date: '2026. 1. 1.', version: 'v1.0' } as const

/**
 * 이의제기 처리 규정(regulations/07-objections.md) 제3조·제5조의 기한 — 본문과 머리 요약이 같은 값을 쓴다.
 * 규정이 바뀌면 테스트(__tests__/fairness-content.test.ts)가 먼저 깨진다.
 */
export const OBJECTION_DEADLINES = {
  filingDays: 7,
  receiptBusinessHours: 24,
  firstReplyBusinessDays: 3,
  finalReplyBusinessDays: 14,
} as const

export const SECTIONS: FairnessSection[] = [
  { id: 'principles', num: '01', label: '운영원칙' },
  { id: 'judging', num: '02', label: '심사단계' },
  { id: 'objection', num: '03', label: '이의제기' },
  { id: 'coi', num: '04', label: '이해상충' },
]

export const CORE_PRINCIPLES: LabeledText[] = [
  {
    label: '기준의 공개',
    text: '심사 기준, 진행 단계, 주요 일정은 가능한 범위에서 사전에 안내합니다.',
  },
  {
    label: '이해상충의 회피',
    text: '심사위원은 이해상충 여부를 사전에 확인하고, 해당 건 심사에서 회피합니다.',
  },
  { label: '동일 기준의 적용', text: '동일 조건에는 동일 절차를 적용하며, 예외는 최소화합니다.' },
  {
    label: '검증을 통한 신뢰 확보',
    text: '필요 시 현장휘호·원작확인 등 검증 절차를 운영합니다.',
  },
  {
    label: '절차적 권리 보장',
    text: '출품자의 이의제기 권리를 보장하고, 정해진 절차에 따라 처리합니다.',
  },
  {
    label: '기록과 책임성',
    text: '심사·검증·결정의 핵심 기록을 내부 기준에 따라 보관하고 책임선을 명확히 합니다.',
  },
  {
    label: '개인정보·저작권 보호',
    text: '출품작과 개인정보는 목적 범위 내에서만 처리하며 무단 공개·2차 활용을 제한합니다.',
  },
]

export const SUBMITTER_RIGHTS = [
  '동일 기준으로 평가받을 권리',
  '심사 절차 및 일정 안내를 받을 권리',
  '개인정보 및 출품작 정보 보호를 받을 권리',
  '이의제기를 신청하고 답변을 받을 권리',
  '결과 발표 이후 필요한 전시/반입·반출/안내를 받을 권리',
]

export const JUDGING_STEPS: JudgingStep[] = [
  {
    id: 'step-submission',
    title: '접수',
    titleEn: 'Submission',
    items: [
      '출품작 및 서류의 규격·기재사항 확인',
      '접수번호 부여 및 접수 완료 안내',
      '결격/누락 발생 시 보완 요청 또는 접수 불가 안내',
    ],
  },
  {
    id: 'step-prescreening',
    title: '예심',
    titleEn: 'Pre-screening',
    items: [
      '부문별 기준에 따른 1차 평가',
      '규정 준수 여부 및 최소 기준 충족 여부 확인',
      '본심 대상 작품 확정(내부 기록)',
    ],
  },
  {
    id: 'step-main-review',
    title: '본심',
    titleEn: 'Main Review',
    items: [
      '작품성·완성도·부문 적합성 중심의 본 평가',
      '점수/등급 또는 선정 기준 적용(회차별 요강 기준)',
      '결과(검증 대상 포함) 잠정 산정',
    ],
  },
  {
    id: 'step-verification',
    title: '검증',
    titleEn: 'Verification',
    items: [
      '필요 시 현장휘호 요청 및 진행(회차별 공지)',
      '원작 확인 또는 원본 제출 요청(필요 시)',
      '표절·대작 의심 등 이슈 발생 시 사실 확인 절차 진행',
    ],
  },
  {
    id: 'step-final',
    title: '최종확정',
    titleEn: 'Final Decision',
    items: ['검증 결과 반영 및 최종 결과 확정', '전시/도록/시상 운영을 위한 확정 리스트 생성'],
  },
  {
    id: 'step-announcement',
    title: '결과공지',
    titleEn: 'Announcement',
    items: [
      '홈페이지 공지 및 필요 시 개별 안내',
      '전시 일정·반입/반출·도록/시상 안내를 함께 공지',
      '이의제기 접수 기간 및 방법을 동시에 안내',
    ],
  },
  {
    id: 'step-objection',
    title: '이의제기',
    titleEn: 'Objection',
    items: [
      '정해진 기간·채널·필수 기재사항에 따라 접수',
      '사실관계 중심으로 검토 및 회신',
      '근거 없는 비방/인신공격/기한 경과 등은 처리 대상에서 제외될 수 있음',
    ],
  },
]

export const OBJECTION_TYPES: LabeledText[] = [
  { label: '절차 관련', text: '접수/검증/결과 공지 과정의 절차적 문제 제기' },
  { label: '사실관계 관련', text: '본인 정보·출품 정보의 오류 정정 요청' },
  { label: '검증 관련', text: '현장휘호·원작확인 요청 및 결과 관련 사실 확인 요청' },
]

export const OBJECTION_REQUIRED_FIELDS = [
  '성명, 연락처, 접수번호(또는 출품 정보)',
  '이의제기 대상(부문/항목/사안)',
  '이의제기 사유 및 근거(사실관계 중심)',
  '요청사항(정정 요청, 사실 확인 요청 등)',
]

// 이의제기 처리 규정 제7조 그대로 — 예전 목록은 '주관적 평가(점수) 불만'을 빠뜨리고 규정에 없는 항목을 넣었다
export const DISMISSAL_REASONS = [
  '정해진 접수 기간을 넘긴 경우',
  '필수 정보(성명·연락처·접수번호 등)가 빠져 검토할 수 없는 경우',
  '심사위원 개인의 주관적 평가(점수)에 대한 단순 불만인 경우',
  '근거 없는 비방, 인신공격 또는 업무 방해 목적이 뚜렷한 경우',
]

export const COI_COMMITMENTS: LabeledText[] = [
  { label: '사전 점검', text: '심사위원은 사전 이해상충 점검을 완료합니다.' },
  { label: '회피(배제)', text: '해당 시 회피(배제) 원칙을 적용합니다.' },
  { label: '비밀유지', text: '심사 정보는 비밀유지 원칙을 준수합니다.' },
]

export const COI_ITEMS = [
  '최근 3년 내 본인이 직접 지도/사사한 출품자가 포함되어 있다.',
  '본인 또는 가족/동거인이 출품자와 경제적 이해관계(고용, 계약, 공동사업 등)가 있다.',
  '본인이 출품자와 공동 전시/공동 프로젝트 등 이해관계가 있는 활동을 최근 3년 내 수행했다.',
  '본인이 출품자 또는 특정 기관/지회/단체와 심사 공정성에 영향을 줄 수 있는 관계가 있다.',
  '심사 과정에서 다룰 정보(점수/결과/검증 등)를 외부로 공유 요청받았거나 공유한 사실이 있다.',
]

export const COI_PLEDGE =
  '심사위원은 심사 과정에서 취득한 모든 정보를 외부에 공개하지 않으며, 공정한 기준에 따라 심사에 임합니다. 또한 이해상충이 확인되는 경우 협회 요청에 따라 해당 심사에서 회피합니다.'

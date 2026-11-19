import {
  ARREARS_STEPS,
  BONUS_POINTS,
  DUES_EXEMPTIONS,
  DUES_FACTS,
  FULL_MEMBER_DEFINITION,
  JOIN_CHANNELS,
  JOIN_STEPS,
  LIFETIME_FACTS,
  MEMBER_BENEFITS,
  MEMBER_FIELDS,
  MEMBER_TIERS,
  REQUIRED_CONDITIONS,
  REVIEW_STEPS,
  SCORE_BANDS,
  SCORE_NOTE,
  SCORING_RULES,
  SCORING_TABLE,
  SPECIAL_CASES,
  SPECIAL_ELIGIBLE,
  SPECIAL_FEE_COLUMNS,
  SPECIAL_FEES,
  SPECIAL_LEDE,
  SPECIAL_STEPS,
  SRC,
  TIER_STAGE_LABEL,
  type RegSource,
} from './membership-data'

/**
 * 회원 안내 데이터의 언어별 글자.
 * 사실(금액·조문·요건)의 원본은 membership-data.ts(한국어) 하나다 — 규정 대조 테스트가 그 파일을 본다.
 * 여기서는 그 글자마다 번역 키(mb.*)를 붙여 resolve(key, 한국어) 로 바꿔 끼운다.
 *  - 화면: resolve = (key) => t(key)  — ko 표에도 같은 한국어가 들어 있다
 *  - 테스트: resolve 가 (key, 한국어) 를 모아 ko 표와 견준다 — 한국어가 바뀌면 번역도 다시 보라고 실패한다
 */
export type Resolve = (key: string, ko: string) => string

const srcKey = Object.fromEntries(
  Object.entries(SRC).map(([name, source]) => [source.href, name])
) as Record<string, string>

function localSource(resolve: Resolve, source: RegSource): RegSource {
  const name = srcKey[source.href]
  return name ? { ...source, label: resolve(`mb.src.${name}`, source.label) } : source
}

export function localizeMembership(resolve: Resolve) {
  const r = (key: string, ko: string) => resolve(`mb.${key}`, ko)
  const src = (source: RegSource) => localSource(resolve, source)
  const list = (key: string, items: readonly string[]) =>
    items.map((item, index) => r(`${key}.${index + 1}`, item))

  return {
    src: Object.fromEntries(Object.entries(SRC).map(([name, s]) => [name, src(s)])) as Record<
      keyof typeof SRC,
      RegSource
    >,
    fields: r('fields', MEMBER_FIELDS),
    fullMember: r('fullMember', FULL_MEMBER_DEFINITION),
    stage: {
      entry: r('stage.entry', TIER_STAGE_LABEL.entry),
      promotion: r('stage.promotion', TIER_STAGE_LABEL.promotion),
    },
    tiers: MEMBER_TIERS.map(tier => ({
      ...tier,
      title: r(`tier.${tier.id}.title`, tier.title),
      annualFee: r(`tier.${tier.id}.annualFee`, tier.annualFee),
      registrationFee: r(`tier.${tier.id}.registrationFee`, tier.registrationFee),
      requirement: r(`tier.${tier.id}.requirement`, tier.requirement),
      source: src(tier.source),
    })),
    scoring: SCORING_TABLE.map((row, index) => ({
      ...row,
      award: r(`score.${index + 1}`, row.award),
    })),
    scoringRules: list('scoreRule', SCORING_RULES),
    bands: SCORE_BANDS.map((band, index) => ({
      ...band,
      range: r(`band.${index + 1}.range`, band.range),
      level: r(`band.${index + 1}.level`, band.level),
    })),
    scoreNote: r('scoreNote', SCORE_NOTE),
    required: list('required', REQUIRED_CONDITIONS),
    review: list('review', REVIEW_STEPS),
    bonus: BONUS_POINTS.map((group, index) => ({
      title: r(`bonus.${index + 1}.title`, group.title),
      items: list(`bonus.${index + 1}.item`, group.items),
      source: src(group.source),
    })),
    specialLede: r('specialLede', SPECIAL_LEDE),
    specialEligible: list('specialEligible', SPECIAL_ELIGIBLE),
    specialSteps: list('specialStep', SPECIAL_STEPS),
    specialColumns: SPECIAL_FEE_COLUMNS.map((label, index) => r(`specialCol.${index + 1}`, label)),
    specialFees: SPECIAL_FEES.map((row, rowIndex) => ({
      cells: row.cells.map((cell, index) => r(`specialFee.${rowIndex + 1}.${index + 1}`, cell)),
    })),
    specialCases: SPECIAL_CASES.map((fact, index) => ({
      label: r(`specialCase.${index + 1}.label`, fact.label),
      body: r(`specialCase.${index + 1}.body`, fact.body),
    })),
    benefits: MEMBER_BENEFITS.map((group, index) => ({
      title: r(`benefit.${index + 1}.title`, group.title),
      items: list(`benefit.${index + 1}.item`, group.items),
      sources: group.sources.map(src),
    })),
    arrears: ARREARS_STEPS.map((step, index) => ({
      when: r(`arrears.${index + 1}.when`, step.when),
      what: r(`arrears.${index + 1}.what`, step.what),
    })),
    duesFacts: DUES_FACTS.map((fact, index) => ({
      label: r(`duesFact.${index + 1}.label`, fact.label),
      body: r(`duesFact.${index + 1}.body`, fact.body),
    })),
    lifetime: LIFETIME_FACTS.map((fact, index) => ({
      figure: r(`lifetime.${index + 1}.figure`, fact.figure),
      label: r(`lifetime.${index + 1}.label`, fact.label),
      body: r(`lifetime.${index + 1}.body`, fact.body),
    })),
    exemptions: DUES_EXEMPTIONS.map((item, index) => ({
      title: r(`exempt.${index + 1}.title`, item.title),
      body: r(`exempt.${index + 1}.body`, item.body),
      source: src(item.source),
    })),
    joinSteps: JOIN_STEPS.map((step, index) => ({
      title: r(`join.${index + 1}.title`, step.title),
      body: r(`join.${index + 1}.body`, step.body),
      source: step.source ? src(step.source) : undefined,
    })),
    // 전화번호는 번역하지 않는다
    channels: JOIN_CHANNELS.map((channel, index) => ({
      ...channel,
      title: r(`channel.${index + 1}.title`, channel.title),
      detail: /^[\d-]+$/.test(channel.detail)
        ? channel.detail
        : r(`channel.${index + 1}.detail`, channel.detail),
    })),
  }
}

export type MembershipCopy = ReturnType<typeof localizeMembership>

/** 데이터에서 나온 키 → 한국어. ko 표가 이것과 같아야 한다(테스트) */
export function membershipDataStrings(): Record<string, string> {
  const strings: Record<string, string> = {}
  localizeMembership((key, ko) => {
    strings[key] = ko
    return ko
  })
  return strings
}

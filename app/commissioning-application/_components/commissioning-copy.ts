import type { DownloadItem, LedgerRow, RegSource } from '@/components/apply/apply-parts'
import {
  COMMISSION_DOWNLOADS,
  COMMITTEE_PAY,
  FAIRNESS_SOURCES,
  JUROR_PAY,
  PAY_SOURCES,
  RECRUITER_PAY,
  RECUSAL_GROUNDS,
  ROLES,
  STEPS,
  STEP_SOURCES,
  type Role,
  type Step,
} from './commissioning-data'

/**
 * 위원 위촉 지원 데이터의 언어별 글자.
 * 사실(자격·절차·수당)의 원본은 commissioning-data.ts(한국어) 하나다 — regulation-parity 테스트가 규정 원문과 대조한다.
 * 여기서는 그 글자마다 번역 키(cm.*)를 붙여 resolve(key, 한국어) 로 바꿔 끼운다.
 * 위원 표식(審査·運營·募集)은 번역하지 않는다.
 */
export type Resolve = (key: string, ko: string) => string

export interface CommissioningCopy {
  downloads: DownloadItem[]
  roles: Role[]
  steps: Step[]
  stepSources: RegSource[]
  jurorPay: LedgerRow[]
  committeePay: LedgerRow[]
  recruiterPay: LedgerRow[]
  paySources: RegSource[]
  recusalGrounds: string[]
  fairnessSources: RegSource[]
}

const rows = (r: Resolve, key: string, table: readonly LedgerRow[]): LedgerRow[] =>
  table.map((row, rowIndex) => ({
    ...row,
    cells: row.cells.map((cell, index) => r(`${key}.${rowIndex + 1}.${index + 1}`, cell)),
  }))

const sources = (r: Resolve, key: string, list: readonly RegSource[]): RegSource[] =>
  list.map((source, index) => ({ ...source, label: r(`${key}.${index + 1}`, source.label) }))

export function localizeCommissioning(resolve: Resolve): CommissioningCopy {
  const r: Resolve = (key, ko) => resolve(`cm.${key}`, ko)
  return {
    downloads: COMMISSION_DOWNLOADS.map((item, index) => ({
      ...item,
      type: r(`download.${index + 1}.type`, item.type),
      title: r(`download.${index + 1}.title`, item.title),
      note: r(`download.${index + 1}.note`, item.note),
    })),
    roles: ROLES.map((role, index) => {
      const n = index + 1
      return {
        ...role,
        title: r(`role.${n}.title`, role.title),
        duty: r(`role.${n}.duty`, role.duty),
        qualifications: role.qualifications.map((item, i) => r(`role.${n}.qual.${i + 1}`, item)),
        sources: sources(r, `role.${n}.src`, role.sources),
      }
    }),
    steps: STEPS.map((step, index) => ({
      title: r(`step.${index + 1}.title`, step.title),
      body: r(`step.${index + 1}.body`, step.body),
    })),
    stepSources: sources(r, 'src.step', STEP_SOURCES),
    jurorPay: rows(r, 'jurorPay', JUROR_PAY),
    committeePay: rows(r, 'committeePay', COMMITTEE_PAY),
    recruiterPay: rows(r, 'recruiterPay', RECRUITER_PAY),
    paySources: sources(r, 'src.pay', PAY_SOURCES),
    recusalGrounds: RECUSAL_GROUNDS.map((item, index) => r(`recusal.${index + 1}`, item)),
    fairnessSources: sources(r, 'src.fairness', FAIRNESS_SOURCES),
  }
}

/** 데이터에서 나온 키 → 한국어. ko 표가 이것과 같아야 한다(테스트) */
export function commissioningDataStrings(): Record<string, string> {
  const strings: Record<string, string> = {}
  localizeCommissioning((key, ko) => {
    strings[key] = ko
    return ko
  })
  return strings
}

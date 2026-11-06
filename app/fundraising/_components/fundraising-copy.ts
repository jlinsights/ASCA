import type { LedgerRow, RegSource } from '@/components/apply/apply-parts'
import {
  ACCOUNTABILITY,
  ACCOUNTABILITY_SOURCES,
  ARREARS,
  BANK_ACCOUNT,
  DUES,
  DUES_SOURCES,
  PAYMENT_SOURCES,
  PROGRAMS,
  PROGRAM_SOURCES,
} from './fundraising-data'

/**
 * 회비·후원 데이터의 언어별 글자.
 * 사실(금액·조문·절차)의 원본은 fundraising-data.ts(한국어) 하나다 — 규정 대조 테스트가 그 파일을 본다.
 * 여기서는 그 글자마다 번역 키(fr.*)를 붙여 resolve(key, 한국어) 로 바꿔 끼운다.
 *  - 화면: resolve = (key) => t(key)  — ko 표에도 같은 한국어가 들어 있다
 *  - 테스트: resolve 가 (key, 한국어) 를 모아 ko 표와 견준다 — 한국어가 바뀌면 번역도 다시 보라고 실패한다
 * 계좌번호·주소(URL)는 번역하지 않는다.
 */
export type Resolve = (key: string, ko: string) => string

const SOURCE_GROUPS = {
  dues: DUES_SOURCES,
  payment: PAYMENT_SOURCES,
  program: PROGRAM_SOURCES,
  accountability: ACCOUNTABILITY_SOURCES,
} as const

type SourceGroup = keyof typeof SOURCE_GROUPS

export interface FundraisingCopy {
  bank: { bank: string; number: string; holder: string }
  dues: LedgerRow[]
  arrears: LedgerRow[]
  programs: { title: string; han: string }[]
  accountability: { when: string; title: string; body: string }[]
  sources: Record<SourceGroup, RegSource[]>
}

const rows = (r: Resolve, key: string, table: readonly LedgerRow[]): LedgerRow[] =>
  table.map((row, rowIndex) => ({
    ...row,
    cells: row.cells.map((cell, index) => r(`${key}.${rowIndex + 1}.${index + 1}`, cell)),
  }))

export function localizeFundraising(resolve: Resolve): FundraisingCopy {
  const r = (key: string, ko: string) => resolve(`fr.${key}`, ko)
  const sources = Object.fromEntries(
    (Object.keys(SOURCE_GROUPS) as SourceGroup[]).map(group => [
      group,
      SOURCE_GROUPS[group].map((source, index) => ({
        ...source,
        label: r(`src.${group}.${index + 1}`, source.label),
      })),
    ])
  ) as Record<SourceGroup, RegSource[]>

  return {
    bank: {
      bank: r('bank.name', BANK_ACCOUNT.bank),
      number: BANK_ACCOUNT.number,
      holder: r('bank.holder', BANK_ACCOUNT.holder),
    },
    dues: rows(r, 'dues', DUES),
    arrears: rows(r, 'arrears', ARREARS),
    programs: PROGRAMS.map((program, index) => ({
      ...program,
      title: r(`program.${index + 1}`, program.title),
    })),
    accountability: ACCOUNTABILITY.map((step, index) => ({
      when: r(`acc.${index + 1}.when`, step.when),
      title: r(`acc.${index + 1}.title`, step.title),
      body: r(`acc.${index + 1}.body`, step.body),
    })),
    sources,
  }
}

/** 데이터에서 나온 키 → 한국어. ko 표가 이것과 같아야 한다(테스트) */
export function fundraisingDataStrings(): Record<string, string> {
  const strings: Record<string, string> = {}
  localizeFundraising((key, ko) => {
    strings[key] = ko
    return ko
  })
  return strings
}

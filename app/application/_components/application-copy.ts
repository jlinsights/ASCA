import type { DownloadItem, LedgerRow, RegSource } from '@/components/apply/apply-parts'
import {
  CRITERIA,
  DIVISIONS,
  DIVISION_SOURCES,
  ENTRY_DOWNLOADS,
  ENTRY_FEES,
  FEE_SOURCES,
  FRAMING_FEES,
  GRADE_THRESHOLDS,
  JUDGING_SOURCES,
  SIZES,
  type Criterion,
  type Division,
} from './application-data'

/**
 * 출품원서 데이터의 언어별 글자.
 * 사실(금액·규격·배점)의 원본은 application-data.ts(한국어) 하나다 — application-data 테스트가 규정 원문과 대조한다.
 * 여기서는 그 글자마다 번역 키(ap.*)를 붙여 resolve(key, 한국어) 로 바꿔 끼운다. 시상 내역은 award-copy.ts(aw.*)가 맡는다.
 * 규격 치수(70×200cm)·부문 표식(한·漢 …)·심사 항목 한자(點劃 …)·양식 종류(MS WORD)는 번역하지 않는다.
 */
export type Resolve = (key: string, ko: string) => string

const rows = (r: Resolve, key: string, table: readonly LedgerRow[]): LedgerRow[] =>
  table.map((row, rowIndex) => ({
    ...row,
    cells: row.cells.map((cell, index) => r(`${key}.${rowIndex + 1}.${index + 1}`, cell)),
  }))

const sources = (r: Resolve, key: string, list: readonly RegSource[]): RegSource[] =>
  list.map((source, index) => ({ ...source, label: r(`${key}.${index + 1}`, source.label) }))

export interface ApplicationCopy {
  downloads: DownloadItem[]
  divisions: Division[]
  sizes: { name: string; size: string }[]
  divisionSources: RegSource[]
  entryFees: LedgerRow[]
  framingFees: LedgerRow[]
  feeSources: RegSource[]
  criteria: Criterion[]
  thresholds: LedgerRow[]
  judgingSources: RegSource[]
}

export function localizeApplication(resolve: Resolve): ApplicationCopy {
  const r: Resolve = (key, ko) => resolve(`ap.${key}`, ko)
  return {
    downloads: ENTRY_DOWNLOADS.map((item, index) => ({
      ...item,
      title: r(`download.${index + 1}.title`, item.title),
      note: r(`download.${index + 1}.note`, item.note),
    })),
    divisions: DIVISIONS.map((division, index) => ({
      ...division,
      title: r(`division.${index + 1}.title`, division.title),
      body: r(`division.${index + 1}.body`, division.body),
    })),
    sizes: SIZES.map((size, index) => ({ ...size, name: r(`size.${index + 1}`, size.name) })),
    divisionSources: sources(r, 'src.division', DIVISION_SOURCES),
    entryFees: rows(r, 'entryFee', ENTRY_FEES),
    framingFees: rows(r, 'framingFee', FRAMING_FEES),
    feeSources: sources(r, 'src.fee', FEE_SOURCES),
    criteria: CRITERIA.map((criterion, index) => ({
      ...criterion,
      name: r(`criterion.${index + 1}.name`, criterion.name),
      score: r(`criterion.${index + 1}.score`, criterion.score),
      elements: r(`criterion.${index + 1}.elements`, criterion.elements),
    })),
    thresholds: rows(r, 'threshold', GRADE_THRESHOLDS),
    judgingSources: sources(r, 'src.judging', JUDGING_SOURCES),
  }
}

/** 데이터에서 나온 키 → 한국어. ko 표가 이것과 같아야 한다(테스트) */
export function applicationDataStrings(): Record<string, string> {
  const strings: Record<string, string> = {}
  localizeApplication((key, ko) => {
    strings[key] = ko
    return ko
  })
  return strings
}

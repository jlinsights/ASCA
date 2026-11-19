import type { RegSource } from '@/components/apply/apply-parts'
import { AWARDS, AWARD_SOURCES } from './application-data'

/**
 * 시상 내역의 언어별 글자 — /awards 와 /application 이 같이 쓴다.
 * 사실(인원·상금)의 원본은 application-data.ts(한국어) 하나다. 글자마다 aw.* 키를 붙여 resolve(key, 한국어) 로 바꿔 끼운다.
 */
export type Resolve = (key: string, ko: string) => string

/** 화면에 낼 시상 한 줄 — 구분(tier)도 번역된 글자라 원본의 한국어 유니온 대신 string */
export interface LocalAward {
  tier: string
  name: string
  count: string
  prize: string
}

export function localizeAwards(resolve: Resolve): { awards: LocalAward[]; sources: RegSource[] } {
  const r = (key: string, ko: string) => resolve(`aw.${key}`, ko)
  return {
    awards: AWARDS.map((award, index) => ({
      tier: r(`prize.${index + 1}.tier`, award.tier),
      name: r(`prize.${index + 1}.name`, award.name),
      count: r(`prize.${index + 1}.count`, award.count),
      prize: r(`prize.${index + 1}.prize`, award.prize),
    })),
    sources: AWARD_SOURCES.map((source, index) => ({
      ...source,
      label: r(`src.${index + 1}`, source.label),
    })),
  }
}

/** 데이터에서 나온 키 → 한국어. ko 표가 이것과 같아야 한다(테스트) */
export function awardDataStrings(): Record<string, string> {
  const strings: Record<string, string> = {}
  localizeAwards((key, ko) => {
    strings[key] = ko
    return ko
  })
  return strings
}

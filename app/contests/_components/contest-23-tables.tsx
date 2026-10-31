/**
 * 공모요강 번역의 공용 재료 — 원본 표(application-data)를 언어별 행으로 바꾸는 사전과 변환,
 * 요강의 섞인 값에서 뽑은 시각·금액, 한국어로 남기는 우편 주소·예금주 표시.
 */

import {
  AWARDS,
  DIVISIONS,
  ENTRY_FEES,
  SIZES,
  type Division,
} from '@/app/application/_components/application-data'
import type { LedgerRow } from '@/components/apply/apply-parts'
import { CONTEST_23, ELIGIBILITY } from './contest-23-data'
import {
  CONTEST_FACTS,
  formatWon,
  parseManwon,
  phrase,
  type Foreign,
  type Phrase,
} from './contest-i18n'

// 요강의 섞인 값('18:00 도착분')에서 숫자만 뽑는다
export const DEADLINE_TIME =
  /\d{2}:\d{2}/.exec(CONTEST_23.deadlineTime)?.[0] ?? CONTEST_23.deadlineTime
export const [CEREMONY_START = '', CEREMONY_END = ''] = CONTEST_23.ceremonyTime.split(/\s*~\s*/)

// 특별선임 금액은 ELIGIBILITY 원문에서 읽는다
export const SPECIAL_FEES = (() => {
  const body = ELIGIBILITY.find(rule => rule.title === '특별규정')?.body ?? ''
  const match = /추천작가 (\d+)만원, 초대작가 (\d+)만원/.exec(body)
  if (!match) throw new Error('특별규정의 추천·초대작가 금액을 읽을 수 없습니다')
  return { recommended: Number(match[1]) * 10000, invited: Number(match[2]) * 10000 }
})()

export const HALLS_NOTE: Phrase = {
  en: 'Gallery 1: Invited Artists and Solo Exhibitions / Gallery 2: Open Call (running concurrently)',
  ja: '第1展示室 招待作家展・個展 / 第2展示室 公募展(同時開催)',
  zh: '第1展覽室 邀請作家展・個展 / 第2展覽室 公募展(同時展出)',
}

const DIVISION_TEXT: Record<string, { title: Phrase; body: Phrase }> = {
  한글: {
    title: { en: 'Hangeul', ja: 'ハングル', zh: '韓文' },
    body: {
      en: 'Regular (jeongja) and mixed, semi-cursive (banheullim) and mixed, cursive (jinheullim), woodblock style (panbonche), folk style (minche) and more',
      ja: 'ハングル正字・正字混用・半草書・半草混用・真草書・版本体・民体など',
      zh: '韓文正字・正字混用・韓文半草・半草混用・韓文真草・版本體、民體等',
    },
  },
  한문: {
    title: { en: 'Chinese characters (Hanmun)', ja: '漢文', zh: '漢文' },
    body: {
      en: 'Oracle bone, bronze, seal, clerical, regular, running and cursive scripts',
      ja: '甲骨・金文・篆書・隷書・楷書・行書・草書',
      zh: '甲骨・金文・篆書・隸書・楷書・行書・草書',
    },
  },
  '현대서예ㆍ 캘리그라피': {
    title: {
      en: 'Contemporary calligraphy · Calligraphy art',
      ja: '現代書芸・カリグラフィー',
      zh: '現代書藝・手寫字藝術',
    },
    body: {
      en: 'Includes contemporary Korean painting',
      ja: '現代韓国画を含む',
      zh: '含現代韓國畫',
    },
  },
  전각ㆍ서각: {
    title: { en: 'Seal engraving · Wood engraving', ja: '篆刻・書刻', zh: '篆刻・書刻' },
    body: { en: 'Including wood and stone carving', ja: '木刻・石刻を含む', zh: '含木刻、石刻' },
  },
  '문인화·동양화': {
    title: {
      en: 'Literati painting · East Asian painting',
      ja: '文人画・東洋画',
      zh: '文人畫・東洋畫',
    },
    body: {
      en: 'Literati, East Asian, color, ink-wash and folk (minhwa) painting',
      ja: '文人画、東洋画、彩色画、水墨画、民画',
      zh: '文人畫、東洋畫、彩色畫、水墨畫、民畫',
    },
  },
}

const SIZE_NAMES: Record<string, Phrase> = {
  국전지: { en: 'Gukjeonji (exhibition sheet)', ja: '国展紙', zh: '國展紙' },
  전지: { en: 'Full sheet (jeonji)', ja: '全紙', zh: '全紙' },
  반지: { en: 'Half sheet (banji)', ja: '半紙', zh: '半紙' },
}

const FEE_TIERS: Record<string, Phrase> = {
  청년작가: { en: 'Young artist', ja: '青年作家', zh: '青年作家' },
  일반작가: { en: 'General artist', ja: '一般作家', zh: '一般作家' },
  추천작가: { en: 'Recommended artist', ja: '推薦作家', zh: '推薦作家' },
  초대작가: { en: 'Invited artist', ja: '招待作家', zh: '邀請作家' },
}

const AWARD_TIERS: Record<string, Phrase> = {
  본상: { en: 'Main prize', ja: '本賞', zh: '本獎' },
  특별상: { en: 'Special prize', ja: '特別賞', zh: '特別獎' },
  '기타 입상': { en: 'Other honors', ja: 'その他入賞', zh: '其他入選' },
}

const AWARD_NAMES: Record<string, Phrase> = {
  대상: { en: 'Grand Prize', ja: '大賞', zh: '大獎' },
  최우수상: { en: 'Top Excellence Prize', ja: '最優秀賞', zh: '最優秀獎' },
  우수상: { en: 'Excellence Prize', ja: '優秀賞', zh: '優秀獎' },
  오체상: { en: 'Five-Script Prize', ja: '五体賞', zh: '五體獎' },
  삼체상: { en: 'Three-Script Prize', ja: '三体賞', zh: '三體獎' },
  특선: { en: 'Special Selection', ja: '特選', zh: '特選' },
  입선: { en: 'Selected', ja: '入選', zh: '入選' },
}

const CERTIFICATE: Phrase = { en: 'Certificate', ja: '賞状', zh: '獎狀' }
const ADJUSTABLE: Phrase = { en: ' (adjustable)', ja: '(調整可)', zh: '(可調整)' }

function amountOf(text: string): number {
  const amount = parseManwon(text)
  if (amount === null) throw new Error(`금액을 읽을 수 없습니다: ${text}`)
  return amount
}

function localizeCount(count: string, lang: Foreign): string {
  const n = /(\d+)명/.exec(count)?.[1]
  if (!n) throw new Error(`인원을 읽을 수 없습니다: ${count}`)
  const unit = lang === 'en' ? n : `${n}名`
  return count.includes('조정 가능') ? `${unit}${ADJUSTABLE[lang]}` : unit
}

function localizePrize(prize: string, lang: Foreign): string {
  const amount = parseManwon(prize)
  if (amount === null) return CERTIFICATE[lang]
  const won = formatWon(amount, lang)
  if (lang === 'en') return `Certificate + ${won}`
  return lang === 'ja' ? `賞状・賞金${won}` : `獎狀及獎金${won}`
}

export const foreignDivisions = (lang: Foreign): readonly Division[] =>
  DIVISIONS.map(division => {
    const text = DIVISION_TEXT[division.title]
    if (!text) throw new Error(`공모전 번역 사전에 없는 부문입니다: ${division.title}`)
    return { ...division, title: text.title[lang], body: text.body[lang] }
  })

export const foreignSizes = (lang: Foreign) =>
  SIZES.map(size => ({ name: phrase(SIZE_NAMES, size.name, lang), size: size.size }))

export const foreignFees = (lang: Foreign): readonly LedgerRow[] =>
  ENTRY_FEES.map(row => {
    const [tier = '', first = '', more = ''] = row.cells
    return {
      ...row,
      cells: [
        phrase(FEE_TIERS, tier, lang),
        formatWon(amountOf(first), lang),
        formatWon(amountOf(more), lang),
      ],
    }
  })

export const foreignAwards = (lang: Foreign): readonly LedgerRow[] =>
  AWARDS.map((award, index) => ({
    cells: [
      phrase(AWARD_NAMES, award.name, lang),
      phrase(AWARD_TIERS, award.tier, lang),
      localizeCount(award.count, lang),
      localizePrize(award.prize, lang),
    ],
    lead: index === 0,
  }))

export const MailTo = () => <span lang='ko'>{CONTEST_23.mailTo}</span>
export const Holder = () => <span lang='ko'>{CONTEST_23.account.holder}</span>
export const Account = ({ lang }: { lang: Foreign }) => (
  <strong>
    {CONTEST_FACTS[lang].bank} {CONTEST_23.account.number}
  </strong>
)

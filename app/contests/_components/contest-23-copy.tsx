/**
 * 제23회 공모요강 요약의 언어별 문구. 한국어(ko)는 contest-23-data·application-data 의 원본을 그대로 쓰고,
 * 다른 언어는 같은 원본의 날짜·금액·인원을 읽어 문장만 옮긴다 — 숫자를 다시 적지 않는다.
 * 우편 주소와 예금주는 공문 표기라 한국어 그대로 두고 lang='ko' 를 단다.
 */

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { LedgerColumn, LedgerRow } from '@/components/apply/apply-parts'
import type { Language } from '@/lib/i18n/types'
import {
  AWARDS,
  DIVISIONS,
  ENTRY_FEES,
  SIZES,
  type Division,
} from '@/app/application/_components/application-data'
import {
  CONTEST_23,
  ELIGIBILITY,
  HOW_TO_ENTER,
  NOTICES,
  SCHEDULE,
  SPECS,
  koDate,
} from './contest-23-data'
import { contestTitle } from './contest-i18n'
import { enGuidelines } from './contest-23-copy-en'
import { jaGuidelines } from './contest-23-copy-ja'
import { zhGuidelines } from './contest-23-copy-zh'

export interface CopyRule {
  title: string
  body: ReactNode
}

export interface CopyRow {
  label: string
  value: string
  lead?: boolean
}

interface Head {
  eyebrow: string
  title: string
  lede?: string
}

export interface GuidelineCopy {
  title: string
  next: Head & { caption: string; columns: readonly [string, string]; rows: readonly CopyRow[] }
  nextNote: string
  entry: Head & { rules: readonly CopyRule[]; divisions: readonly Division[]; note: string }
  specs: Head & {
    sizes: readonly { name: string; size: string }[]
    caption: string
    rows: readonly CopyRow[]
  }
  fees: Head & { caption: string; columns: readonly LedgerColumn[]; rows: readonly LedgerRow[] }
  feesNote: ReactNode
  how: Head & { rules: readonly CopyRule[] }
  howNote: ReactNode
  prizes: Head & { caption: string; columns: readonly LedgerColumn[]; rows: readonly LedgerRow[] }
  prizesNote: string
  notice: { eyebrow: string; title: string; items: readonly string[] }
}

const KO_TITLE = contestTitle('ko')

const KO: GuidelineCopy = {
  title: KO_TITLE,
  next: {
    eyebrow: '공모 일정',
    title: KO_TITLE,
    lede: `출품 접수는 ${koDate(CONTEST_23.deadline)} ${CONTEST_23.deadlineTime}까지입니다. 공모요강 전문은 위 플립북에서 볼 수 있습니다.`,
    caption: `${KO_TITLE} 일정`,
    columns: ['구분', '내용'],
    rows: SCHEDULE,
  },
  nextNote: `주최·주관 ${CONTEST_23.host} · 후원 ${CONTEST_23.sponsors} · 전시실 ${CONTEST_23.halls}`,
  entry: {
    eyebrow: '출품 자격·부문',
    title: '누가, 무엇을 출품하나',
    lede: '한글·한문 서예를 중심으로 문인화·전각·현대서예·캘리그라피까지 다섯 부문입니다.',
    rules: ELIGIBILITY,
    divisions: DIVISIONS,
    note: '필요하면 이사회 의결로 심사 부문을 더할 수 있습니다.',
  },
  specs: {
    eyebrow: '작품 규격·표장',
    title: '작품은 이렇게 준비합니다',
    lede: '세 가지 규격 가운데 하나로 제작합니다. 전각·서각 부문은 별도 규격을 따릅니다.',
    sizes: SIZES,
    caption: '출품 점수와 표장',
    rows: SPECS,
  },
  fees: {
    eyebrow: '출품료',
    title: '출품료와 입금 계좌',
    lede: '2점째부터는 점당 금액이 내려갑니다. 표구비는 입선 이상 작품에만 따로 부과합니다.',
    caption: '출품료 (표구비 별도)',
    columns: [
      { label: '구분' },
      { label: '작품 1점', numeric: true },
      { label: '2~9점 (점당)', numeric: true },
    ],
    rows: ENTRY_FEES,
  },
  feesNote: (
    <>
      입금 계좌{' '}
      <strong>
        {CONTEST_23.account.bank} {CONTEST_23.account.number}
      </strong>{' '}
      · 예금주 {CONTEST_23.account.holder} · 입금 확인증을 출품신청서와 함께 보내 주세요. 표구비와
      10점 이상 개인전·단체 부스전은 <Link href='/application#fees'>출품원서</Link>와 공모요강을
      확인하세요.
    </>
  ),
  how: {
    eyebrow: '출품 방법',
    title: '접수는 이렇게 합니다',
    lede: `마감은 ${koDate(CONTEST_23.deadline)} 18:00, 보낸 날이 아니라 도착한 날 기준입니다.`,
    rules: HOW_TO_ENTER,
  },
  howNote: (
    <>
      <Link href='/application'>출품원서 작성하기 →</Link> 출품신청서(별지 제1호)와 표기지(별지
      제2호) 양식은 공모요강 5~8쪽과 출품원서 페이지에서 내려받을 수 있습니다.
    </>
  ),
  prizes: {
    eyebrow: '시상',
    title: '시상 내역',
    lede: `시상식은 ${koDate(CONTEST_23.ceremony)} 14:00 ${CONTEST_23.venue}에서 열립니다.`,
    caption: '시상 내역',
    columns: [{ label: '상격' }, { label: '구분' }, { label: '인원' }, { label: '상장·상금' }],
    rows: AWARDS.map((award, index) => ({
      cells: [award.name, award.tier, award.count, award.prize],
      lead: index === 0,
    })),
  },
  prizesNote:
    '특선·입선 작품은 도록에 실리고 전시됩니다. 수상 실적은 추천·초대작가 선임 배점에 반영합니다.',
  notice: { eyebrow: '유의사항', title: '출품 전에 꼭 확인하세요', items: NOTICES },
}

export const GUIDELINE_COPY: Record<Language, GuidelineCopy> = {
  ko: KO,
  en: enGuidelines(),
  ja: jaGuidelines(),
  zh: zhGuidelines(),
}

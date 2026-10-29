import type { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import {
  RegulationsIndex,
  type RegulationSummary,
} from '@/components/regulations/regulations-index'
import { REGULATIONS, REGULATIONS_BASE_PATH } from '@/lib/regulations/catalog'
import { latestEffectiveDate } from '@/lib/regulations/effective-date'
import { loadRegulation } from '@/lib/regulations/load'
import '@/components/home/home.css'
import '@/components/regulations/regulations.css'

export const metadata: Metadata = {
  title: '정관 및 규정 | 동양서예협회',
  description:
    '사단법인 동양서예협회의 정관과 회원·회비, 운영·심사, 전시, 추천·초대작가 선임, 작품 감정, 지부·지회, 이의제기 규정과 작가·회원·임원 자격 및 요건을 원문 그대로 조문 단위로 안내합니다.',
  alternates: { canonical: REGULATIONS_BASE_PATH },
  openGraph: {
    title: '정관 및 규정 | 동양서예협회',
    description: '동양서예협회의 정관과 세부 규정 8종을 조문 단위로 안내합니다.',
  },
}

export default function RegulationsPage() {
  const regulations: RegulationSummary[] = REGULATIONS.map(entry => {
    const doc = loadRegulation(entry)
    return {
      slug: entry.slug,
      legacyId: entry.legacyId,
      nameKey: entry.nameKey,
      hanja: entry.hanja,
      title: doc.title,
      titleEn: doc.titleEn,
      effectiveNote: doc.effectiveNote,
      articleCount: doc.articleCount,
    }
  })

  return (
    <>
      <RegulationsIndex
        regulations={regulations}
        totalArticles={regulations.reduce((sum, item) => sum + item.articleCount, 0)}
        latestEffective={latestEffectiveDate(regulations.map(item => item.effectiveNote))}
      />
      <LayoutFooter />
    </>
  )
}

import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { ContestIntro } from '@/components/contests/contest-intro'
import {
  ApplySectionHead,
  ApplyToc,
  ContactList,
  LedgerTable,
} from '@/components/apply/apply-parts'
import { CONTEST_EDITIONS } from '@/app/awards/_components/awards-data'
import { ContestGuidelines } from './_components/contest-guidelines'
import { CONTEST_23, koDate } from './_components/contest-23-data'
import '@/components/apply/apply.css'

/**
 * 공모전 — 협회가 여는 공모전은 대한민국 동양서예대전 하나다. 회차 기록은 /awards 와 같은 연혁 데이터를 쓴다.
 * 예전엔 존재하지 않는 contests 테이블을 읽어 "전체 공모전 0 · 접수중 0"만 보였다.
 */

const DESCRIPTION =
  '제23회 대한민국 동양서예대전 공모요강 — 접수 마감 2027년 1월 31일, 출품 부문·자격·규격·출품료·시상과 역대 대전 기록을 안내합니다.'

export const metadata: Metadata = {
  title: '공모전 | 동양서예협회',
  description: DESCRIPTION,
  // openGraph 를 쓰면 레이아웃의 openGraph 를 통째로 덮는다 — 이미지도 여기서 다시 단다
  openGraph: {
    title: '공모전 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

const TOC = [
  { href: '#next', label: '일정' },
  { href: '#entry', label: '자격·부문' },
  { href: '#specs', label: '규격·표장' },
  { href: '#fees', label: '출품료' },
  { href: '#how', label: '출품 방법' },
  { href: '#prizes', label: '시상' },
  { href: '#notice', label: '유의사항' },
  { href: '#editions', label: '역대 대전' },
  { href: '#contact', label: '문의' },
] as const

export default function ContestsPage() {
  const latest = CONTEST_EDITIONS[0]
  return (
    <div className='asca-apply min-h-screen'>
      <ContestIntro
        facts={[
          { label: '역대 대전', value: `${CONTEST_EDITIONS.length}회` },
          { label: '다음 대전', value: `제${CONTEST_23.edition}회` },
          { label: '접수 마감', value: koDate(CONTEST_23.deadline) },
          {
            label: '전시',
            value: `${koDate(CONTEST_23.exhibitionStart, false)} ~ ${koDate(CONTEST_23.exhibitionEnd, false)}`,
          },
        ]}
      />

      <div className='asca-apply__body'>
        <ApplyToc items={TOC} />

        <ContestGuidelines />

        <section id='editions' aria-labelledby='editions-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='editions-title'
            eyebrow='역대 대전'
            title={`제1회부터 제${latest?.edition ?? ''}회까지`}
            lede='개최 기간과 장소는 협회 연혁의 기록입니다.'
          />
          <LedgerTable
            caption='역대 대한민국 동양서예대전'
            columns={[
              { label: '회차' },
              { label: '연도', numeric: true },
              { label: '기간' },
              { label: '장소' },
            ]}
            rows={CONTEST_EDITIONS.map((edition, index) => ({
              cells: [
                `제${edition.edition}회`,
                String(edition.year),
                edition.date ?? '—',
                edition.online ? `${edition.venue ?? ''} (온라인)`.trim() : (edition.venue ?? '—'),
              ],
              lead: index === 0,
            }))}
          />
        </section>

        <section id='contact' aria-labelledby='contact-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='contact-title'
            eyebrow='문의·상담'
            title='출품이 궁금하면'
            lede='출품 자격과 부문, 접수 방법은 사무국으로 문의해 주세요.'
          />
          <ContactList />
        </section>
      </div>

      <LayoutFooter />
    </div>
  )
}

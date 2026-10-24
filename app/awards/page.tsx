import type { Metadata } from 'next'
import Link from 'next/link'
import { PenLine } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import {
  ApplySectionHead,
  ApplyToc,
  ContactList,
  LedgerTable,
  RegCite,
} from '@/components/apply/apply-parts'
import { AWARDS, AWARD_SOURCES } from '@/app/application/_components/application-data'
import { CONTEST_EDITIONS } from './_components/awards-data'
import '@/components/apply/apply.css'

const DESCRIPTION =
  '대한민국 동양서예대전의 시상 등급과 상금, 그리고 제1회부터 이어진 역대 대전의 개최 기간과 장소를 규정 원문·협회 연혁과 함께 안내합니다.'

export const metadata: Metadata = {
  title: '수상 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '수상 | 동양서예협회', description: DESCRIPTION },
}

const TOC = [
  { href: '#prizes', label: '시상 내역' },
  { href: '#editions', label: '역대 대전' },
  { href: '#contact', label: '문의' },
] as const

const heroAction =
  'inline-flex min-h-11 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors'

export default function AwardsPage() {
  const latest = CONTEST_EDITIONS[0]
  return (
    <div className='asca-apply min-h-screen'>
      <PageHero
        {...PAGE_HERO_MARKS.awards}
        title='수상'
        lede='대한민국 동양서예대전은 본상과 특별상으로 시상합니다. 본상은 작품의 예술성을, 특별상은 여러 서체에 걸친 균형 있는 연구를 기준으로 선정합니다.'
        actions={
          <Link
            href='/application'
            className={`${heroAction} bg-foreground text-background hover:opacity-90`}
          >
            <PenLine className='h-4 w-4' aria-hidden='true' />
            출품원서 작성
          </Link>
        }
      >
        <HeroFacts
          facts={[
            { label: '역대 대전', value: `${CONTEST_EDITIONS.length}회` },
            { label: '시상 등급', value: `${AWARDS.length}개` },
            { label: '대상 상금', value: AWARDS[0]?.prize.replace('상장 및 상금 ', '') ?? '—' },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={TOC} />

        <section id='prizes' aria-labelledby='prizes-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='prizes-title'
            eyebrow='시상 내역과 상금'
            title='시상 내역'
            lede='특선·입선 인원은 출품작 총수와 수준에 따라 이사회 의결로 조정할 수 있습니다.'
          />
          <LedgerTable
            caption='입상 등급별 인원과 상금'
            columns={[
              { label: '상' },
              { label: '구분' },
              { label: '인원', numeric: true },
              { label: '시상', numeric: true },
            ]}
            rows={AWARDS.map((award, index) => ({
              cells: [award.name, award.tier, award.count, award.prize],
              lead: index === 0,
            }))}
          />
          <p className='asca-apply__note'>
            재정 상황이나 특별 후원이 있으면 이사회 의결로 특별상을 신설할 수 있습니다. 상금에
            부과되는 제세공과금은 수상자 본인 부담이 원칙입니다.
          </p>
          <RegCite sources={AWARD_SOURCES} />
        </section>

        <section id='editions' aria-labelledby='editions-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='editions-title'
            eyebrow='역대 대전'
            title={`제1회부터 제${latest?.edition ?? ''}회까지`}
            lede='개최 기간과 장소는 협회 연혁의 기록입니다. 회차별 수상자 명단은 사무국에 문의해 주세요.'
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
          <p className='asca-apply__note'>
            전시 기록은 <Link href='/exhibitions/past'>지난 전시</Link>와{' '}
            <Link href='/history'>연혁</Link>에서 함께 볼 수 있습니다.
          </p>
        </section>

        <section id='contact' aria-labelledby='contact-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='contact-title'
            eyebrow='문의·상담'
            title='수상 기록 문의'
            lede='회차별 수상 기록이 궁금하시면 사무국으로 연락해 주세요.'
          />
          <ContactList />
        </section>
      </div>

      <LayoutFooter />
    </div>
  )
}

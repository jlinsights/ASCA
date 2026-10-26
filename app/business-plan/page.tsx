import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AboutChapter, AboutHero, AboutPage } from '@/components/about/about-layout'
import { AboutMotion } from '@/components/about/about-motion'
import { AboutNav } from '@/components/about/about-nav'
import { Plan2025 } from './_components/plan-2025'
import { YearSection } from './_components/year-section'
import Link from 'next/link'
import { EXHIBITION_YEARS, QUICK_LINKS } from './_components/business-plan-data'
import { BOOKING_URL, CHAT_URL } from '@/lib/content/contact-info'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'

export const metadata: Metadata = {
  title: '사업계획 | 동양서예협회',
  description:
    '동양서예협회 연도별 사업계획 및 전시 아카이브. 2025년 사업계획서, 대한민국 동양서예대전 역대 전시 기록을 확인하세요.',
  openGraph: {
    title: '사업계획 | Business Plans - 동양서예협회',
    description: '전통과 현대를 잇는 동양미학 예술 플랫폼. 연도별 사업계획 및 전시 아카이브.',
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

// 2025년 전시는 사업계획서(#2025)와 겹치지 않게 #2025-exhibition 으로 건다
const yearAnchor = (year: number) => (year === 2025 ? '2025-exhibition' : String(year))

export default function BusinessPlanPage() {
  const years = EXHIBITION_YEARS.map(e => e.year)
  const firstYear = Math.min(...years)
  const lastYear = Math.max(...years)

  return (
    <>
      <AboutPage>
        <AboutHero
          tc={PAGE_HERO_MARKS.businessPlan.tc}
          title='사업계획'
          lede='동양서예협회의 연도별 사업계획과 대한민국 동양서예대전 전시 아카이브를 확인하실 수 있습니다.'
          facts={[
            { label: '수록 기간', value: `${firstYear}–${lastYear}` },
            { label: '전시 기록', value: `${EXHIBITION_YEARS.length}개년` },
          ]}
          actions={
            <>
              <a
                href={CHAT_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='ab-button ab-button--solid'
              >
                상담 문의
              </a>
              <a href={BOOKING_URL} target='_blank' rel='noopener noreferrer' className='ab-button'>
                상담 예약
              </a>
            </>
          }
        />
        <AboutNav />
        <AboutChapter
          id='2025'
          tc='計劃'
          eyebrow='2025 · 동양의 혼, 현대의 감각'
          title='2025년도 사업계획서'
          note='“전통과 현대를 잇는 동양미학 예술 플랫폼”'
          aside={
            <ul className='ab-index' aria-label='바로 가기'>
              {QUICK_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href}>
                    {link.label} <span aria-hidden='true'>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          }
        >
          <Plan2025 />
        </AboutChapter>
        <AboutChapter
          id='archive'
          tone='navy'
          tc='展覽'
          eyebrow='Archive'
          title='대한민국 동양서예대전'
          aside={
            <ul className='ab-index' aria-label='연도 바로 가기'>
              {EXHIBITION_YEARS.map(e => (
                <li key={e.year}>
                  <a href={`#${yearAnchor(e.year)}`}>{e.year}</a>
                </li>
              ))}
            </ul>
          }
        >
          {EXHIBITION_YEARS.map(exhibition => (
            <YearSection
              key={exhibition.year}
              id={yearAnchor(exhibition.year)}
              exhibition={exhibition}
            />
          ))}
        </AboutChapter>
        <AboutMotion />
      </AboutPage>
      <LayoutFooter />
    </>
  )
}

import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { AboutChapter, AboutHero, AboutPage } from '@/components/about/about-layout'
import { AboutMotion } from '@/components/about/about-motion'
import { AboutNav } from '@/components/about/about-nav'
import {
  PlanDirections,
  PlanIndicators,
  PlanKeynote,
  PlanManagement,
  PlanPrograms,
  PlanSchedule,
} from './_components/plan-2027'
import { PLAN_YEAR } from './_components/plan-2027-data'
import { YearSection } from './_components/year-section'
import Link from 'next/link'
import { EXHIBITION_YEARS, QUICK_LINKS } from './_components/business-plan-data'
import { BOOKING_URL, CHAT_URL } from '@/lib/content/contact-info'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'

export const metadata: Metadata = {
  title: '사업계획 | 동양서예협회',
  description:
    '동양서예협회 2027년도 사업계획. 제23회 대한민국 동양서예대전과 書境 초대작가전, 한·중·일 교류, 교육과 차세대, 작가의 온라인 활동, 예술경영 원칙과 역대 전시 아카이브를 안내합니다.',
  openGraph: {
    title: '사업계획 | Business Plan - 동양서예협회',
    description:
      '느리게 쓰고, 깊게 보고, 오래 남긴다 — 法古創新 · 人書俱老 의 정신으로 서예와 전시 문화를 이끄는 동양서예협회의 2027년도 사업계획.',
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

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
          lede={`${PLAN_YEAR}년, 느리지만 깊은 예술로 서예와 전시 문화의 품격을 이끌겠습니다.`}
          facts={[
            { label: '계획 연도', value: String(PLAN_YEAR) },
            { label: '중심 사업', value: '제23회 대전' },
            { label: '전시 기록', value: `${firstYear}–${lastYear}` },
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
          id='keynote'
          tone='navy'
          tc='基調'
          eyebrow={`${PLAN_YEAR} · 法古創新 · 人書俱老`}
          title={`${PLAN_YEAR}년도 사업계획`}
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
          <PlanKeynote />
        </AboutChapter>
        <AboutChapter id='directions' tc='方向' eyebrow='Direction' title='운영 방향'>
          <PlanDirections />
        </AboutChapter>
        <AboutChapter
          id='schedule'
          tone='gold'
          tc='日程'
          eyebrow='Calendar'
          title={`${PLAN_YEAR} 주요 일정`}
          note='확정된 일정만 싣고, 정해지는 대로 더합니다.'
        >
          <PlanSchedule />
        </AboutChapter>
        <AboutChapter id='programs' tc='事業' eyebrow='Programs' title='핵심 사업'>
          <PlanPrograms />
        </AboutChapter>
        <AboutChapter
          id='management'
          tone='navy'
          tc='經營'
          eyebrow='Management'
          title='예술경영 원칙'
        >
          <PlanManagement />
        </AboutChapter>
        <AboutChapter id='review' tc='省察' eyebrow='Review' title='한 해를 돌아볼 때'>
          <PlanIndicators />
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
                  <a href={`#${e.year}`}>{e.year}</a>
                </li>
              ))}
            </ul>
          }
        >
          {EXHIBITION_YEARS.map(exhibition => (
            <YearSection
              key={exhibition.year}
              id={String(exhibition.year)}
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

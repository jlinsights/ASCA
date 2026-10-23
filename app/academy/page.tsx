import { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, MessageCircle } from 'lucide-react'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { ACADEMY_LINKS, INSTITUTIONS, SAC_CLASSES, SUBJECTS } from './_components/academy-data'
import { AcademyIntro } from './_components/academy-intro'
import { AcademySubjects } from './_components/academy-subjects'
import { MunwonAcademy } from './_components/munwon-academy'
import { SacAcademy } from './_components/sac-academy'
import { PartnershipCta } from './_components/partnership-cta'
import './_components/academy.css'

export const metadata: Metadata = {
  title: '강좌 | 동양서예협회',
  description:
    '동양서예협회가 연결하는 서예 강좌 안내. 문원한문서예학원 토요 정규 과정과 예술의전당 서화아카데미 2026 가을정규 시간표, 수강료, 협회 수강생 출품료 할인을 확인하세요.',
  openGraph: {
    title: '강좌 | 동양서예협회',
    description:
      '한문·한글서예, 문인화, 캘리그라피, 민화, 전각. 협회가 승인한 교육기관의 강좌와 시간표를 한곳에서 안내합니다.',
  },
}

const TOC = [
  { href: '#munwon', label: '문원한문서예학원' },
  { href: '#sac', label: '예술의전당 서화아카데미' },
  { href: '#partnership', label: '협력 기관 모집' },
] as const

export default function AcademyPage() {
  return (
    <div className='asca-ac min-h-screen'>
      <PageHero
        {...PAGE_HERO_MARKS.academy}
        title='강좌'
        lede='전통의 깊이와 현대의 감각을 잇는 서예 교육. 협회가 승인한 교육기관의 과정과 시간표를 안내합니다.'
        actions={
          <>
            <Link
              href={ACADEMY_LINKS.booking}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity'
            >
              <CalendarDays className='h-4 w-4' aria-hidden='true' />
              수강 상담 예약
            </Link>
            <Link
              href={ACADEMY_LINKS.chat}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors'
            >
              <MessageCircle className='h-4 w-4' aria-hidden='true' />
              실시간 상담
            </Link>
          </>
        }
      >
        <HeroFacts
          facts={[
            { label: '연계 교육기관', value: `${INSTITUTIONS.length}곳` },
            { label: '지도 과목', value: `${SUBJECTS.length}개` },
            { label: '서화아카데미 강좌', value: `${SAC_CLASSES.length}개` },
          ]}
        />
      </PageHero>

      <div className='asca-ac__body'>
        <nav className='asca-ac__toc' aria-label='강좌 바로가기'>
          {TOC.map(item => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <AcademyIntro />
        <AcademySubjects />
        <MunwonAcademy />
        <SacAcademy />
        <PartnershipCta />
      </div>

      <LayoutFooter />
    </div>
  )
}

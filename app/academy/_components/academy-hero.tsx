'use client'

import Link from 'next/link'
import { CalendarDays, MessageCircle } from 'lucide-react'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { ACADEMY_LINKS, SAC_CLASSES } from './academy-data'
import { useAcademyText } from './use-academy-copy'

const TOC = [
  { href: '#munwon', key: 'tocMunwon' },
  { href: '#sac', key: 'tocSac' },
  { href: '#partnership', key: 'tocPartnership' },
] as const

/** 강좌 머리와 바로가기 — 고른 언어로 */
export function AcademyHero() {
  const { copy, ui } = useAcademyText()
  const count = (name: string, n: number) => ui(name).replace('{n}', String(n))

  return (
    <PageHero
      {...PAGE_HERO_MARKS.academy}
      title={ui('heroTitle')}
      lede={ui('heroLede')}
      actions={
        <>
          <Link
            href={ACADEMY_LINKS.booking}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity'
          >
            <CalendarDays className='h-4 w-4' aria-hidden='true' />
            {ui('heroBooking')}
          </Link>
          <Link
            href={ACADEMY_LINKS.chat}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors'
          >
            <MessageCircle className='h-4 w-4' aria-hidden='true' />
            {ui('heroChat')}
          </Link>
        </>
      }
    >
      <HeroFacts
        facts={[
          {
            label: ui('factInstitutions'),
            value: count('factInstitutionsValue', copy.institutions.length),
          },
          { label: ui('factSubjects'), value: count('factSubjectsValue', copy.subjects.length) },
          { label: ui('factClasses'), value: count('factClassesValue', SAC_CLASSES.length) },
        ]}
      />
    </PageHero>
  )
}

/** 강좌 바로가기 — 본문 첫머리 */
export function AcademyToc() {
  const { ui } = useAcademyText()
  return (
    <nav className='asca-ac__toc' aria-label={ui('tocLabel')}>
      {TOC.map(item => (
        <a key={item.href} href={item.href}>
          {ui(item.key)}
        </a>
      ))}
    </nav>
  )
}

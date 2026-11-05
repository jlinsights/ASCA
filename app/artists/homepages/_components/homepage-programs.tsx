'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { regulationHref } from '@/lib/regulations/catalog'

// /artists/homepages — 협회 전시·행사에 참여하면 단계별로 열리는 온라인 공간.
// 문구는 lib/i18n/locales/<언어>/homepage-programs.ts(키 hpProg*). 모든 주장은 아래 근거 조문으로 보낸다.

interface Cite {
  key: string
  href: string
}

interface Step {
  numeral: string
  prefix: 'hpProgStep1' | 'hpProgStep2' | 'hpProgStep3'
  points: number
  cites: Cite[]
  /** 마지막 단계(작가의 집)만 먹색 면으로 — 단계의 끝이 어디인지 보이게 */
  destination?: boolean
}

const dues = regulationHref('membership-dues')
const exhibition = regulationHref('exhibition')

const STEPS: Step[] = [
  {
    numeral: '一',
    prefix: 'hpProgStep1',
    points: 2,
    cites: [{ key: 'hpProgStep1Cite', href: `${exhibition}#a12` }],
  },
  {
    numeral: '二',
    prefix: 'hpProgStep2',
    points: 3,
    cites: [
      { key: 'hpProgStep2Cite', href: `${dues}#a9` },
      { key: 'hpProgStep2Cite2', href: `${exhibition}#a4-2` },
    ],
  },
  {
    numeral: '三',
    prefix: 'hpProgStep3',
    points: 4,
    cites: [
      { key: 'hpProgStep3Cite', href: `${dues}#a10` },
      { key: 'hpProgStep3Cite2', href: `${dues}#a10-2` },
    ],
    destination: true,
  },
]

const DIFFS = ['hpProgDiff1', 'hpProgDiff2', 'hpProgDiff3'] as const

const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

function CiteLinks({ cites, light }: { cites: Cite[]; light: boolean }) {
  const { t } = useLanguage()
  return (
    // 근거 조문은 한 줄에 하나 — 이어 쓰면 구분 점이 줄 끝에 매달린다
    <div
      className={`mt-6 text-xs leading-relaxed ${light ? 'text-white/70' : 'text-muted-foreground'}`}
    >
      <p className={`font-medium ${light ? 'text-white' : 'text-scholar-red'}`}>
        {t('hpProgCiteLabel')}
      </p>
      <ul>
        {cites.map(cite => (
          <li key={cite.key}>
            <Link
              href={cite.href}
              className={`inline-flex min-h-11 items-center underline decoration-1 underline-offset-4 transition-colors ${FOCUS} ${
                light
                  ? 'hover:text-white focus-visible:outline-white'
                  : 'hover:text-foreground focus-visible:outline-scholar-red'
              }`}
            >
              {t(cite.key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StepItem({ step }: { step: Step }) {
  const { t } = useLanguage()
  const dark = Boolean(step.destination)
  const points = Array.from({ length: step.points }, (_, i) => t(`${step.prefix}Point${i + 1}`))
  return (
    <li
      className={`relative flex flex-col rounded-sm px-6 pb-8 pt-7 md:px-8 ${
        dark
          ? 'border border-transparent bg-ink-black text-white dark:border-white/20'
          : 'border border-border bg-background'
      }`}
    >
      <div className='flex items-baseline gap-4'>
        <span
          aria-hidden='true'
          className={`font-serif text-5xl leading-none md:text-6xl ${dark ? 'text-white' : 'text-scholar-red'}`}
        >
          {step.numeral}
        </span>
        <span
          className={`text-sm font-medium tracking-wide ${dark ? 'text-white/70' : 'text-muted-foreground'}`}
        >
          {t(`${step.prefix}Label`)}
        </span>
      </div>
      <h3 className='mt-6 font-serif text-2xl leading-snug md:text-[1.75rem]'>
        {t(`${step.prefix}Title`)}
      </h3>
      <p
        className={`mt-4 text-sm leading-relaxed ${dark ? 'text-white/80' : 'text-muted-foreground'}`}
      >
        {t(`${step.prefix}Body`)}
      </p>
      <ul
        className={`mt-6 divide-y border-y text-sm ${dark ? 'divide-white/15 border-white/15' : 'divide-border border-border'}`}
      >
        {points.map(point => (
          <li key={point} className='flex gap-3 py-3 leading-relaxed'>
            <span
              aria-hidden='true'
              className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-[1px] ${dark ? 'bg-white' : 'bg-scholar-red'}`}
            />
            {point}
          </li>
        ))}
      </ul>
      {step.prefix === 'hpProgStep1' && (
        <Link
          href='/artists'
          className={`mt-6 inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-foreground underline-offset-4 hover:underline ${FOCUS} focus-visible:outline-scholar-red`}
        >
          {t('hpProgStep1Link')} <span aria-hidden='true'>→</span>
        </Link>
      )}
      <div className='mt-auto'>
        <CiteLinks cites={step.cites} light={dark} />
      </div>
    </li>
  )
}

export function HomepagePrograms() {
  const { t } = useLanguage()
  return (
    <section
      aria-labelledby='homepage-programs-title'
      className='gallery-container break-keep pt-12 md:pt-20'
    >
      <div className='grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-16'>
        <div>
          <p className='text-sm tracking-widest text-scholar-red'>{t('hpProgEyebrow')}</p>
          <h2
            id='homepage-programs-title'
            className='mt-3 max-w-2xl font-serif text-3xl leading-tight text-foreground md:text-5xl'
          >
            {t('hpProgTitle')}
          </h2>
        </div>
        <p className='max-w-xl text-base leading-relaxed text-muted-foreground'>
          {t('hpProgLede')}
        </p>
      </div>

      <ol aria-label={t('hpProgStepsLabel')} className='mt-12 grid gap-5 lg:grid-cols-3 lg:gap-6'>
        {STEPS.map(step => (
          <StepItem key={step.prefix} step={step} />
        ))}
      </ol>

      <div className='mt-16 grid gap-10 border-t border-border pt-12 lg:grid-cols-[1fr_2fr] lg:gap-16'>
        <h2 className='font-serif text-2xl leading-snug text-foreground md:text-3xl'>
          {t('hpProgDiffTitle')}
        </h2>
        <dl className='grid gap-8 md:grid-cols-3 md:gap-10'>
          {DIFFS.map((prefix, index) => (
            <div key={prefix}>
              <dt className='font-serif text-xl leading-snug text-foreground'>
                <span aria-hidden='true' className='mr-2 text-sm text-scholar-red'>
                  0{index + 1}
                </span>
                {t(`${prefix}Title`)}
              </dt>
              <dd className='mt-3 text-sm leading-relaxed text-muted-foreground'>
                {t(`${prefix}Body`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className='mt-12 grid gap-8 rounded-sm bg-muted/60 px-6 py-8 md:px-10 lg:grid-cols-[1fr_auto] lg:items-center'>
        <div>
          <h2 className='font-serif text-xl text-foreground md:text-2xl'>{t('hpProgWhoTitle')}</h2>
          <ul className='mt-4 space-y-2 text-sm leading-relaxed text-foreground'>
            <li>{t('hpProgWhoMember')}</li>
            <li>{t('hpProgWhoSpecial')}</li>
          </ul>
          <CiteLinks
            cites={[{ key: 'hpProgWhoCite', href: `${regulationHref('artist-selection')}#a11` }]}
            light={false}
          />
        </div>
        <div className='flex flex-wrap gap-3'>
          <Link
            href='/contact'
            className={`inline-flex h-12 items-center rounded-sm bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 ${FOCUS} focus-visible:outline-scholar-red`}
          >
            {t('hpProgCta')} <span aria-hidden='true'>&nbsp;→</span>
          </Link>
          <Link
            href='/membership'
            className={`inline-flex h-12 items-center rounded-sm border border-ink-black px-6 text-sm font-medium text-foreground transition-colors hover:bg-ink-black hover:text-white ${FOCUS} focus-visible:outline-scholar-red`}
          >
            {t('hpProgCtaMembership')}
          </Link>
        </div>
      </div>
    </section>
  )
}

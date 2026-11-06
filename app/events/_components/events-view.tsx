'use client'

import { ApplySectionHead } from '@/components/apply/apply-parts'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { useLanguage } from '@/contexts/language-context'
import { EventArchive } from './event-archive'
import type { EventRow } from './event-rows'
import { UpcomingEvents } from './upcoming-events'

/**
 * 행사 목록의 화면 틀 — 고른 언어를 따르는 클라이언트 부분. 행사 목록은 page.tsx(서버)가 읽어 넘기고,
 * 메타데이터는 page.tsx 에서 한국어로 둔다(공지사항과 같은 방식).
 */
interface EventsViewProps {
  upcoming: readonly EventRow[]
  past: readonly EventRow[]
  total: number
  firstYear: number | undefined
  initialType?: string
  initialQuery?: string
}

export function EventsView({
  upcoming,
  past,
  total,
  firstYear,
  initialType,
  initialQuery,
}: EventsViewProps) {
  const { t } = useLanguage()
  const count = (n: number) => t('evCount').replace('{n}', String(n))

  return (
    <>
      <PageHero {...PAGE_HERO_MARKS.events} title={t('evHeroTitle')} lede={t('evHeroLede')}>
        <HeroFacts
          facts={[
            { label: t('evFactUpcoming'), value: count(upcoming.length) },
            { label: t('evFactRecorded'), value: count(total) },
            ...(firstYear
              ? [
                  {
                    label: t('evFactSince'),
                    value: t('evYear').replace('{year}', String(firstYear)),
                  },
                ]
              : []),
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <section id='upcoming' aria-labelledby='upcoming-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='upcoming-title'
            eyebrow={t('evUpcomingEyebrow')}
            title={upcoming.length > 0 ? t('evUpcomingTitle') : t('evNoneTitle')}
          />
          <UpcomingEvents rows={upcoming} />
        </section>

        <section id='archive' aria-labelledby='archive-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='archive-title'
            eyebrow={t('evPastEyebrow')}
            title={
              firstYear
                ? t('evArchiveSince').replace('{year}', String(firstYear))
                : t('evArchiveTitle')
            }
            lede={t('evArchiveLede')}
          />
          <EventArchive rows={past} initialType={initialType} initialQuery={initialQuery} />
        </section>
      </div>
    </>
  )
}

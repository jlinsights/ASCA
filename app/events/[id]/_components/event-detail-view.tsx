'use client'

import Link from 'next/link'
import { ApplySectionHead, ContactList, LedgerTable } from '@/components/apply/apply-parts'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import { CONTACT_LABELS } from '@/app/contests/_components/contest-i18n'
import { useLanguage } from '@/contexts/language-context'
import type { EventLink } from '@/lib/events/event-links'
import type { EventFact, EventPhase } from '@/lib/events/event-view'
import type { Language } from '@/lib/i18n/types'
import { eventTypeText, type EventRow } from '../../_components/event-rows'

/**
 * 행사 상세의 화면 틀 — 고른 언어를 따르는 클라이언트 부분. 행사 값은 page.tsx(서버)가 읽어 넘기고,
 * 메타데이터는 page.tsx 에서 한국어로 둔다(공지사항 상세와 같은 방식).
 * 제목·본문·장소·주최·기간 글자는 원문 그대로 — 번역본이 없다.
 */

/** eventFacts() 의 한국어 항목 이름 → 번역 키 */
const FACT_KEYS: Readonly<Record<string, string>> = {
  구분: 'evDetailType',
  기간: 'evDetailPeriod',
  장소: 'evFieldPlace',
  주최: 'evDetailOrganizer',
  주관: 'evDetailHost',
  후원: 'evDetailSponsor',
  협찬: 'evDetailCosponsor',
}

export interface EventDetailData {
  id: string
  title: string
  type: string
  typeLabel: string
  phase: EventPhase
  period: string
  place: string | null
  lead: string
  facts: readonly EventFact[]
  link: EventLink | null
  isAhead: boolean
}

interface EventDetailViewProps {
  event: EventDetailData
  related: readonly EventRow[]
}

export function EventDetailView({ event, related }: EventDetailViewProps) {
  const { t, language } = useLanguage() as { t: (key: string) => string; language: Language }
  const typeText = eventTypeText(event, t)
  const factLabel = (label: string) => (FACT_KEYS[label] ? t(FACT_KEYS[label]) : label)
  // 구분 칸 값은 유형 표의 한국어 — 고른 언어의 유형 이름으로 바꾼다
  const factValue = (fact: EventFact) => (fact.label === '구분' ? typeText : fact.value)

  return (
    <>
      <PageHero
        {...PAGE_HERO_MARKS.events}
        tier='band'
        title={event.title}
        crumbs={[{ label: t('evHeroTitle'), href: '/events' }, { label: event.title }]}
      >
        <HeroFacts
          facts={[
            { label: t('evFieldPeriod'), value: event.period },
            { label: t('evFieldPlace'), value: event.place },
            { label: t('evDetailType'), value: typeText },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <div className='asca-events__detail'>
          <article className='asca-events__article' aria-labelledby='about-title'>
            <p className='asca-events__kicker'>
              <span className='asca-events__phase' data-phase={event.phase}>
                {t(`evPhase_${event.phase}`)}
              </span>
              {typeText}
            </p>
            <h2 id='about-title' className='sr-only'>
              {t('evDetailAbout')}
            </h2>
            <div className='asca-events__lead'>
              {event.lead.split(/\n{2,}/).map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {event.link && (
              <p className='asca-events__cta'>
                <Link href={event.link.href} className='asca-events__more is-primary'>
                  {t(event.link.labelKey)} →
                </Link>
              </p>
            )}

            <section aria-labelledby='facts-title' className='asca-events__facts'>
              <ApplySectionHead
                id='facts-title'
                eyebrow={t('evDetailFactsEyebrow')}
                title={t('evDetailFactsTitle')}
              />
              <LedgerTable
                caption={t('evDetailFactsCaption').replace('{title}', event.title)}
                columns={[{ label: t('evDetailColItem') }, { label: t('evDetailColValue') }]}
                rows={event.facts.map(fact => ({
                  cells: [factLabel(fact.label), factValue(fact)],
                }))}
              />
            </section>

            {event.isAhead && (
              <section aria-labelledby='ask-title' className='asca-events__facts'>
                <ApplySectionHead
                  id='ask-title'
                  eyebrow={t('evDetailAskEyebrow')}
                  title={t('evDetailAskTitle')}
                  lede={t('evDetailAskLede')}
                />
                <ContactList labels={CONTACT_LABELS[language]} />
              </section>
            )}
          </article>

          <aside className='asca-events__aside' aria-labelledby='related-title'>
            <h2 id='related-title' className='asca-events__aside-title'>
              {related.length > 0
                ? t('evDetailRelated').replace('{type}', typeText)
                : t('evArchiveTitle')}
            </h2>
            {related.length > 0 && (
              <ol className='asca-events__related'>
                {related.map(row => (
                  <li key={row.id}>
                    <Link href={`/events/${row.id}`}>
                      <span className='asca-events__related-date'>
                        {row.year}.{row.monthDay}
                      </span>
                      <span className='asca-events__related-title'>{row.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
            <Link href='/events#archive' className='asca-events__more'>
              {t('evDetailBack')}
            </Link>
          </aside>
        </div>
      </div>
    </>
  )
}

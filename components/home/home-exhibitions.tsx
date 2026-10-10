'use client'

import { Calendar, MapPin } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import type { HistoryEvent } from '@/app/history/_data/history-events'
import { HomeSectionHead } from './home-section-head'

interface HomeExhibitionsProps {
  exhibitions: HistoryEvent[]
}

export function HomeExhibitions({ exhibitions }: HomeExhibitionsProps) {
  const { t } = useLanguage()
  if (exhibitions.length === 0) return null

  return (
    <section id='exhibitions' className='asca-section' aria-labelledby='asca-ex-title'>
      <HomeSectionHead
        id='asca-ex-title'
        eyebrow={t('homeExhibitionsEyebrow')}
        tc='展覽'
        title={t('homeExhibitionsTitle')}
        more={{ label: t('homeExhibitionsMore'), href: '/history' }}
      />
      <ul className='asca-exlist'>
        {exhibitions.map(ex => (
          <li key={ex.id} className='asca-ex'>
            <p className='asca-ex__date'>
              <span className='d'>{String(ex.month).padStart(2, '0')}</span>
              <span className='m'>{ex.year}</span>
            </p>
            <div>
              <h3 className='asca-ex__title'>{ex.title}</h3>
              {ex.subtitle && <p className='asca-ex__sub'>{ex.subtitle}</p>}
              {(ex.date || ex.venue) && (
                <p className='asca-ex__meta'>
                  {ex.date && (
                    <>
                      <Calendar aria-hidden='true' />
                      {ex.date}
                    </>
                  )}
                  {ex.venue && (
                    <>
                      <MapPin aria-hidden='true' />
                      {ex.venue}
                    </>
                  )}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

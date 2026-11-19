'use client'

import { ArrowUpRight } from 'lucide-react'
import { AcademySectionHead } from './academy-section-head'
import { InstructorAnam } from './instructor-anam'
import { useAcademyText } from './use-academy-copy'

/** 문원한문서예학원 — 왼쪽은 과정 소개와 특징, 오른쪽은 수업·수강료·장소를 장부 행으로 */
export function MunwonAcademy() {
  const { copy, ui } = useAcademyText()

  return (
    <section id='munwon' className='asca-ac__section asca-ac__anchor' aria-labelledby='ac-munwon'>
      <AcademySectionHead
        id='ac-munwon'
        eyebrow={ui('munwonEyebrow')}
        title={ui('munwonTitle')}
        lede={ui('munwonLede')}
      />

      <div className='asca-ac__split'>
        <div>
          <h3 className='asca-ac__subhead'>{ui('munwonFeatures')}</h3>
          <ol className='asca-ac__numbered'>
            {copy.munwonFeatures.map(feature => (
              <li key={feature}>{feature}</li>
            ))}
          </ol>
        </div>

        <dl className='asca-ac__facts'>
          {copy.munwonFacts.map(fact => (
            <div key={fact.label} className='asca-ac__fact'>
              <dt>{fact.label}</dt>
              <dd>
                {fact.href ? (
                  <a
                    href={fact.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='asca-ac__fact-link'
                  >
                    {fact.value}
                    <ArrowUpRight aria-hidden='true' />
                    <span className='sr-only'>{ui('mapNewWindow')}</span>
                  </a>
                ) : (
                  <span className='asca-ac__fact-value'>{fact.value}</span>
                )}
                {fact.note && <span className='asca-ac__fact-note'>{fact.note}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <figure className='asca-ac__figure'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/images/programs/calligraphy-curriculum.avif'
          alt={ui('munwonFigureAlt')}
          loading='lazy'
          decoding='async'
        />
        <figcaption>{ui('munwonFigureCaption')}</figcaption>
      </figure>

      <InstructorAnam />
    </section>
  )
}

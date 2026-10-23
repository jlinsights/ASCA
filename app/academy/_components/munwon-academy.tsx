import { ArrowUpRight } from 'lucide-react'
import { MUNWON_FACTS, MUNWON_FEATURES } from './academy-data'
import { AcademySectionHead } from './academy-section-head'
import { InstructorAnam } from './instructor-anam'

/** 문원한문서예학원 — 왼쪽은 과정 소개와 특징, 오른쪽은 수업·수강료·장소를 장부 행으로 */
export function MunwonAcademy() {
  return (
    <section id='munwon' className='asca-ac__section asca-ac__anchor' aria-labelledby='ac-munwon'>
      <AcademySectionHead
        id='ac-munwon'
        eyebrow='위탁 운영 · 대한검정회 한국한문교사중앙연수원'
        title='문원한문서예학원'
        lede='사단법인 대한민국한자교육연구회 대한검정회의 후원 아래, 협회가 서예와 동양화 교육을 위탁 운영하는 토요 정규 과정입니다.'
      />

      <div className='asca-ac__split'>
        <div>
          <h3 className='asca-ac__subhead'>과정의 특징</h3>
          <ol className='asca-ac__numbered'>
            {MUNWON_FEATURES.map(feature => (
              <li key={feature}>{feature}</li>
            ))}
          </ol>
        </div>

        <dl className='asca-ac__facts'>
          {MUNWON_FACTS.map(fact => (
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
                    <span className='sr-only'>(지도, 새 창)</span>
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
          alt='서예교육과정 수강연한별 수료 제도 인포그래픽'
          loading='lazy'
          decoding='async'
        />
        <figcaption>서예교육과정 수강연한별 수료 제도</figcaption>
      </figure>

      <InstructorAnam />
    </section>
  )
}

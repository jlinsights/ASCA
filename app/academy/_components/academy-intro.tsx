'use client'

import { ArrowDown } from 'lucide-react'
import { AcademySectionHead } from './academy-section-head'
import { RegCite } from './reg-cite'
import { useAcademyText } from './use-academy-copy'

/** 협회가 잇는 교육 — 왼쪽에 취지, 오른쪽에 두 교육기관을 장부 행으로 */
export function AcademyIntro() {
  const { copy, ui } = useAcademyText()
  // {a}·{b} 자리에 정관 목적 두 가지를 굵게 끼운다
  const [before, rest = ''] = ui('introBody1').split('{a}')
  const [middle, after = ''] = rest.split('{b}')

  return (
    <section className='asca-ac__section' aria-labelledby='ac-intro'>
      <AcademySectionHead
        id='ac-intro'
        eyebrow={ui('introEyebrow')}
        title={ui('introTitle')}
        lede={ui('introLede')}
      />

      <div className='asca-ac__intro'>
        <div className='asca-ac__prose'>
          <p>
            {before}
            <strong>{ui('introGoalA')}</strong>
            {middle}
            <strong>{ui('introGoalB')}</strong>
            {after}
          </p>
          <p>{ui('introBody2')}</p>
          <RegCite sources={[copy.src.articles3, copy.src.articles4]} label={ui('cite')} />
        </div>

        <ol className='asca-ac__institutions'>
          {copy.institutions.map((institution, index) => (
            <li key={institution.href}>
              <a href={institution.href} className='asca-ac__institution'>
                <span className='asca-ac__index'>{String(index + 1).padStart(2, '0')}</span>
                <span className='asca-ac__institution-name'>{institution.name}</span>
                <span className='asca-ac__institution-role'>{institution.role}</span>
                <span className='asca-ac__institution-body'>{institution.body}</span>
                <ArrowDown className='asca-ac__institution-icon' aria-hidden='true' />
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

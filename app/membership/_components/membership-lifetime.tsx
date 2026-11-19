'use client'

import { MembershipSectionHead } from './membership-section-head'
import { RegCite } from './reg-cite'
import { useMembershipText } from './use-membership-copy'

/** 평생회원과 연회비 면제 — 세 숫자를 크게 세우고, 그 밖의 면제 경우는 아래 장부 행으로 */
export function MembershipLifetime() {
  const { copy, ui } = useMembershipText()
  const { src } = copy
  return (
    <section className='asca-mb__section' aria-labelledby='mb-lifetime'>
      <MembershipSectionHead
        id='mb-lifetime'
        title={ui('lifetimeTitle')}
        lede={ui('lifetimeLede')}
      />

      <dl className='asca-mb__lifetime'>
        {copy.lifetime.map(fact => (
          <div key={fact.label} className='asca-mb__life'>
            <dt className='asca-mb__life-label'>{fact.label}</dt>
            <dd className='asca-mb__life-figure'>{fact.figure}</dd>
            <dd className='asca-mb__life-body'>{fact.body}</dd>
          </div>
        ))}
      </dl>

      <div className='asca-mb__exempt'>
        <h3 className='asca-mb__subhead'>{ui('exempt')}</h3>
        <dl className='asca-mb__facts'>
          {copy.exemptions.map(item => (
            <div key={item.title} className='asca-mb__fact'>
              <dt>{item.title}</dt>
              <dd>
                {item.body}
                <RegCite sources={[item.source]} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <RegCite sources={[src.dues3, src.dues4]} className='asca-mb__cite--section' />
    </section>
  )
}

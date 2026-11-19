'use client'

import Link from 'next/link'
import { PAYMENT_LINKS } from './membership-data'
import { MembershipSectionHead } from './membership-section-head'
import { RegCite } from './reg-cite'
import { useMembershipText } from './use-membership-copy'

/** 회비 납부와 자격 관리 — 미납 단계는 세 칸 눈금, 나머지 사실은 장부 행으로 */
export function MembershipDues() {
  const { copy, ui } = useMembershipText()
  const { src } = copy
  return (
    <section className='asca-mb__section' aria-labelledby='mb-dues'>
      <MembershipSectionHead id='mb-dues' title={ui('duesTitle')} lede={ui('duesLede')} />

      <div className='asca-mb__dues'>
        <div>
          <h3 className='asca-mb__subhead'>{ui('arrears')}</h3>
          <ol className='asca-mb__arrears'>
            {copy.arrears.map((step, index) => (
              <li key={step.when} className='asca-mb__arrear'>
                <span className='asca-mb__arrear-step' aria-hidden='true'>
                  {index + 1}
                </span>
                <span className='asca-mb__arrear-when'>{step.when}</span>
                <span className='asca-mb__arrear-what'>{step.what}</span>
              </li>
            ))}
          </ol>
        </div>

        <dl className='asca-mb__facts'>
          {copy.duesFacts.map(fact => (
            <div key={fact.label} className='asca-mb__fact'>
              <dt>{fact.label}</dt>
              <dd>{fact.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className='asca-mb__pay'>
        <Link href={PAYMENT_LINKS.pay} target='_blank' rel='noopener noreferrer'>
          {ui('pay')}
        </Link>
        <Link href={PAYMENT_LINKS.mypage} target='_blank' rel='noopener noreferrer'>
          {ui('mypage')}
        </Link>
      </div>

      <RegCite
        sources={[src.dues5, src.dues11, src.articles8, src.qualifications]}
        className='asca-mb__cite--section'
      />
    </section>
  )
}

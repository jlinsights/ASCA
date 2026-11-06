'use client'

import { ArrowUpRight, Phone } from 'lucide-react'
import { ACADEMY_LINKS } from './academy-data'
import { PHONE } from '@/lib/content/contact-info'
import { useAcademyText } from './use-academy-copy'

/** 교육 협력 기관 모집 — 왼쪽에 모집 취지, 오른쪽에 바로 닿는 창구를 먹선 행으로 */
export function PartnershipCta() {
  const { ui } = useAcademyText()
  return (
    <section
      id='partnership'
      className='asca-ac__section asca-ac__anchor asca-ac__join'
      aria-labelledby='ac-partnership'
    >
      <div className='asca-ac__join-head'>
        <p className='asca-ac__eyebrow'>{ui('joinEyebrow')}</p>
        <h2 id='ac-partnership' className='asca-ac__title'>
          {ui('joinTitle')}
        </h2>
        <p className='asca-ac__lede'>{ui('joinLede')}</p>
      </div>

      <ul className='asca-ac__channels'>
        <li>
          <a
            href={ACADEMY_LINKS.booking}
            target='_blank'
            rel='noopener noreferrer'
            className='asca-ac__channel'
          >
            <span className='asca-ac__channel-title'>{ui('joinBooking')}</span>
            <span className='asca-ac__channel-detail'>cal.com/orientalcalligraphy/academy</span>
            <ArrowUpRight className='asca-ac__channel-icon' aria-hidden='true' />
          </a>
        </li>
        <li>
          <a
            href={ACADEMY_LINKS.chat}
            target='_blank'
            rel='noopener noreferrer'
            className='asca-ac__channel'
          >
            <span className='asca-ac__channel-title'>{ui('joinChat')}</span>
            <span className='asca-ac__channel-detail'>{ui('joinChatDetail')}</span>
            <ArrowUpRight className='asca-ac__channel-icon' aria-hidden='true' />
          </a>
        </li>
        <li>
          <a href={PHONE.href} className='asca-ac__channel'>
            <span className='asca-ac__channel-title'>{ui('joinPhone')}</span>
            <span className='asca-ac__channel-detail'>{ACADEMY_LINKS.phone}</span>
            <Phone className='asca-ac__channel-icon' aria-hidden='true' />
          </a>
        </li>
      </ul>
    </section>
  )
}

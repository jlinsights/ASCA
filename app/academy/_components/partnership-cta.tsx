import { ArrowUpRight, Phone } from 'lucide-react'
import { ACADEMY_LINKS } from './academy-data'
import { PHONE } from '@/lib/content/contact-info'

/** 교육 협력 기관 모집 — 왼쪽에 모집 취지, 오른쪽에 바로 닿는 창구를 먹선 행으로 */
export function PartnershipCta() {
  return (
    <section
      id='partnership'
      className='asca-ac__section asca-ac__anchor asca-ac__join'
      aria-labelledby='ac-partnership'
    >
      <div className='asca-ac__join-head'>
        <p className='asca-ac__eyebrow'>교육 협력 기관 모집</p>
        <h2 id='ac-partnership' className='asca-ac__title'>
          협력 기관을 찾습니다
        </h2>
        <p className='asca-ac__lede'>
          서예, 현대서예, 캘리그라피, 서각·전각, 문인화 부문에서 인가받은 교육기관이라면 협회와의
          협력을 제안해 주세요. 수강 문의도 같은 창구로 받습니다.
        </p>
      </div>

      <ul className='asca-ac__channels'>
        <li>
          <a
            href={ACADEMY_LINKS.booking}
            target='_blank'
            rel='noopener noreferrer'
            className='asca-ac__channel'
          >
            <span className='asca-ac__channel-title'>제휴·수강 상담 예약</span>
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
            <span className='asca-ac__channel-title'>실시간 상담</span>
            <span className='asca-ac__channel-detail'>채널톡으로 사무국에 바로 문의</span>
            <ArrowUpRight className='asca-ac__channel-icon' aria-hidden='true' />
          </a>
        </li>
        <li>
          <a href={PHONE.href} className='asca-ac__channel'>
            <span className='asca-ac__channel-title'>사무국 전화</span>
            <span className='asca-ac__channel-detail'>{ACADEMY_LINKS.phone}</span>
            <Phone className='asca-ac__channel-icon' aria-hidden='true' />
          </a>
        </li>
      </ul>
    </section>
  )
}

import { MEMBER_BENEFITS } from './membership-data'
import { MembershipSectionHead } from './membership-section-head'
import { RegCite } from './reg-cite'

/** 회원 혜택 — 회원 및 회비 규정 제12조의 등급별 혜택. 위 등급일수록 아래 칸 혜택이 더해진다 */
export function MembershipBenefits() {
  return (
    <section className='asca-mb__section' aria-labelledby='mb-benefits'>
      <MembershipSectionHead
        id='mb-benefits'
        title='회원 혜택'
        lede='정회원 공통 혜택에 등급이 오를수록 혜택이 더해집니다.'
      />

      <div className='asca-mb__benefits'>
        {MEMBER_BENEFITS.map((group, index) => (
          <article key={group.title} className='asca-mb__benefit'>
            <h3 className='asca-mb__benefit-title'>
              <span className='asca-mb__index' aria-hidden='true'>
                {String(index + 1).padStart(2, '0')}
              </span>
              {group.title}
            </h3>
            <ul className='asca-mb__benefit-list'>
              {group.items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <RegCite sources={group.sources} />
          </article>
        ))}
      </div>
    </section>
  )
}

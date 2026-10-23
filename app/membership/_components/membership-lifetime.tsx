import { DUES_EXEMPTIONS, LIFETIME_FACTS, SRC } from './membership-data'
import { MembershipSectionHead } from './membership-section-head'
import { RegCite } from './reg-cite'

/** 평생회원과 연회비 면제 — 세 숫자를 크게 세우고, 그 밖의 면제 경우는 아래 장부 행으로 */
export function MembershipLifetime() {
  return (
    <section className='asca-mb__section' aria-labelledby='mb-lifetime'>
      <MembershipSectionHead
        id='mb-lifetime'
        title='평생회원과 연회비 면제'
        lede='평생회비나 임원 발전기금을 완납하면 연회비 납부 의무를 영구히 면제받습니다.'
      />

      <dl className='asca-mb__lifetime'>
        {LIFETIME_FACTS.map(fact => (
          <div key={fact.label} className='asca-mb__life'>
            <dt className='asca-mb__life-label'>{fact.label}</dt>
            <dd className='asca-mb__life-figure'>{fact.figure}</dd>
            <dd className='asca-mb__life-body'>{fact.body}</dd>
          </div>
        ))}
      </dl>

      <div className='asca-mb__exempt'>
        <h3 className='asca-mb__subhead'>그 밖에 연회비가 면제되는 경우</h3>
        <dl className='asca-mb__facts'>
          {DUES_EXEMPTIONS.map(item => (
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

      <RegCite sources={[SRC.dues3, SRC.dues4]} className='asca-mb__cite--section' />
    </section>
  )
}

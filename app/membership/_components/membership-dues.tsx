import Link from 'next/link'
import { ARREARS_STEPS, DUES_FACTS, PAYMENT_LINKS, SRC } from './membership-data'
import { MembershipSectionHead } from './membership-section-head'
import { RegCite } from './reg-cite'

/** 회비 납부와 자격 관리 — 미납 단계는 세 칸 눈금, 나머지 사실은 장부 행으로 */
export function MembershipDues() {
  return (
    <section className='asca-mb__section' aria-labelledby='mb-dues'>
      <MembershipSectionHead
        id='mb-dues'
        title='회비 납부와 자격 관리'
        lede='연회비는 온라인 모금함에서 납부하고, 마이페이지에서 납부내역을 확인합니다.'
      />

      <div className='asca-mb__dues'>
        <div>
          <h3 className='asca-mb__subhead'>연회비를 내지 않으면</h3>
          <ol className='asca-mb__arrears'>
            {ARREARS_STEPS.map((step, index) => (
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
          {DUES_FACTS.map(fact => (
            <div key={fact.label} className='asca-mb__fact'>
              <dt>{fact.label}</dt>
              <dd>{fact.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className='asca-mb__pay'>
        <Link href={PAYMENT_LINKS.pay} target='_blank' rel='noopener noreferrer'>
          온라인 모금함에서 납부
        </Link>
        <Link href={PAYMENT_LINKS.mypage} target='_blank' rel='noopener noreferrer'>
          마이페이지에서 납부내역 확인
        </Link>
      </div>

      <RegCite
        sources={[SRC.dues5, SRC.dues11, SRC.articles8, SRC.qualifications]}
        className='asca-mb__cite--section'
      />
    </section>
  )
}

import {
  FULL_MEMBER_DEFINITION,
  MEMBER_FIELDS,
  MEMBER_TIERS,
  SRC,
  TIER_STAGE_LABEL,
  type TierStage,
} from './membership-data'
import { MembershipSectionHead } from './membership-section-head'
import { RegCite } from './reg-cite'

const STAGES: readonly TierStage[] = ['entry', 'promotion']

/**
 * 회원 등급 사다리 — 넓은 화면에선 다섯 열이 한 줄로 이어지고(연회비·비용·자격 행이 서로 맞물린다),
 * 좁은 화면에선 세로 타임라인이 된다. 입회(청년·일반)와 승급(추천·초대·임원)으로 묶는다.
 */
export function MembershipTiers() {
  return (
    <section className='asca-mb__section' aria-labelledby='mb-tiers'>
      <MembershipSectionHead
        id='mb-tiers'
        title='회원 등급 및 연회비'
        lede='회원 종류별 연회비와 가입/승급 요건을 안내합니다.'
      />

      <div className='asca-mb__who'>
        <div>
          <h3 className='asca-mb__subhead'>회원 자격</h3>
          <p className='asca-mb__who-body'>{MEMBER_FIELDS}</p>
        </div>
        <div>
          <h3 className='asca-mb__subhead'>정회원</h3>
          <p className='asca-mb__who-body'>{FULL_MEMBER_DEFINITION}</p>
        </div>
      </div>

      <div className='asca-mb__stages' aria-hidden='true'>
        {STAGES.map(stage => (
          <span key={stage} className={`asca-mb__stage asca-mb__stage--${stage}`}>
            {TIER_STAGE_LABEL[stage]}
          </span>
        ))}
      </div>

      <ol className='asca-mb__ladder'>
        {MEMBER_TIERS.map(tier => (
          <li key={tier.id} className={`asca-mb__tier asca-mb__tier--${tier.stage}`}>
            <div className='asca-mb__tier-head'>
              <span className='asca-mb__node' aria-hidden='true' />
              <h3 className='asca-mb__tier-name'>{tier.title}</h3>
              <p className='asca-mb__tier-en' lang='en'>
                {tier.titleEn}
              </p>
              <span className='asca-mb__stage-inline'>{TIER_STAGE_LABEL[tier.stage]}</span>
            </div>
            <p className='asca-mb__fee'>
              <span className='asca-mb__fee-num'>{tier.annualFee}</span>
              <span className='asca-mb__fee-unit'>/ 연</span>
            </p>
            <p className='asca-mb__cost'>{tier.registrationFee}</p>
            <p className='asca-mb__req'>{tier.requirement}</p>
          </li>
        ))}
      </ol>

      <RegCite
        sources={[SRC.dues2, SRC.dues3, SRC.select9, SRC.articles11, SRC.qualifications]}
        className='asca-mb__cite--section'
      />
    </section>
  )
}

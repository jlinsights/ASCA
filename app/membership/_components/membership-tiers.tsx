'use client'

import type { TierStage } from './membership-data'
import { MembershipSectionHead } from './membership-section-head'
import { RegCite } from './reg-cite'
import { useMembershipText } from './use-membership-copy'

const STAGES: readonly TierStage[] = ['entry', 'promotion']

/**
 * 회원 등급 사다리 — 넓은 화면에선 다섯 열이 한 줄로 이어지고(연회비·비용·자격 행이 서로 맞물린다),
 * 좁은 화면에선 세로 타임라인이 된다. 입회(청년·일반)와 승급(추천·초대·임원)으로 묶는다.
 */
export function MembershipTiers() {
  const { copy, ui, language } = useMembershipText()
  const { src } = copy
  return (
    <section className='asca-mb__section' aria-labelledby='mb-tiers'>
      <MembershipSectionHead id='mb-tiers' title={ui('tiersTitle')} lede={ui('tiersLede')} />

      <div className='asca-mb__who'>
        <div>
          <h3 className='asca-mb__subhead'>{ui('who')}</h3>
          <p className='asca-mb__who-body'>{copy.fields}</p>
        </div>
        <div>
          <h3 className='asca-mb__subhead'>{ui('fullMember')}</h3>
          <p className='asca-mb__who-body'>{copy.fullMember}</p>
        </div>
      </div>

      <div className='asca-mb__stages' aria-hidden='true'>
        {STAGES.map(stage => (
          <span key={stage} className={`asca-mb__stage asca-mb__stage--${stage}`}>
            {copy.stage[stage]}
          </span>
        ))}
      </div>

      <ol className='asca-mb__ladder'>
        {copy.tiers.map(tier => (
          <li key={tier.id} className={`asca-mb__tier asca-mb__tier--${tier.stage}`}>
            <div className='asca-mb__tier-head'>
              <span className='asca-mb__node' aria-hidden='true' />
              <h3 className='asca-mb__tier-name'>{tier.title}</h3>
              {/* 영어 화면에서는 제목이 이미 영어라 겹쳐 달지 않는다 */}
              {language !== 'en' && (
                <p className='asca-mb__tier-en' lang='en'>
                  {tier.titleEn}
                </p>
              )}
              <span className='asca-mb__stage-inline'>{copy.stage[tier.stage]}</span>
            </div>
            <p className='asca-mb__fee'>
              <span className='asca-mb__fee-num'>{tier.annualFee}</span>
              <span className='asca-mb__fee-unit'>{ui('perYear')}</span>
            </p>
            <p className='asca-mb__cost'>{tier.registrationFee}</p>
            <p className='asca-mb__req'>{tier.requirement}</p>
          </li>
        ))}
      </ol>

      <RegCite
        sources={[src.dues2, src.dues3, src.select9, src.articles11, src.qualifications]}
        className='asca-mb__cite--section'
      />
    </section>
  )
}

'use client'

import { MembershipSectionHead } from './membership-section-head'
import { RegCite } from './reg-cite'
import { useMembershipText } from './use-membership-copy'

/**
 * 승급 기준 — 배점 장부와 점수 눈금이 위에, 점수 밖의 필수 요건·심사 절차·가산점이 아래에.
 * "점수만 채우면 승급" 으로 읽히지 않게 눈금 바로 밑에 그 사실을 적는다.
 */
export function MembershipPromotion() {
  const { copy, ui, language } = useMembershipText()
  const { src } = copy
  return (
    <section className='asca-mb__section' aria-labelledby='mb-promotion'>
      <MembershipSectionHead id='mb-promotion' title={ui('promoTitle')} lede={ui('promoLede')} />

      <div className='asca-mb__promo'>
        <div>
          <table className='asca-mb__scores'>
            <caption className='sr-only'>{ui('scoresCaption')}</caption>
            <thead>
              <tr>
                <th scope='col'>{ui('colAward')}</th>
                <th scope='col'>{ui('colPoints')}</th>
              </tr>
            </thead>
            <tbody>
              {copy.scoring.map(row => (
                <tr key={row.award}>
                  <th scope='row'>{row.award}</th>
                  <td>
                    <span className='asca-mb__points'>{row.points}</span>
                    {/* 영어는 머리 칸(Points)만 두고 숫자 뒤 단위를 붙이지 않는다 — 1 points 를 피한다 */}
                    {language !== 'en' && ui('pointsUnit')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className='asca-mb__rules'>
            {copy.scoringRules.map(rule => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className='asca-mb__scale-wrap'>
          <h3 className='asca-mb__subhead'>{ui('total')}</h3>
          <ol
            className='asca-mb__scale'
            style={{
              gridTemplateColumns: copy.bands.map(band => `${band.span}fr`).join(' '),
            }}
            aria-label={ui('scaleLabel')}
          >
            {copy.bands.map(band => (
              <li
                key={band.range}
                className={`asca-mb__band${band.emphasis ? ' asca-mb__band--strong' : ''}`}
              >
                <span className='asca-mb__band-bar' aria-hidden='true' />
                <span className='asca-mb__band-range'>{band.range}</span>
                <span className='asca-mb__band-level'>{band.level}</span>
              </li>
            ))}
          </ol>
          <p className='asca-mb__note'>{copy.scoreNote}</p>

          <div className='asca-mb__checks'>
            <div>
              <h3 className='asca-mb__subhead'>{ui('required')}</h3>
              <ol className='asca-mb__numbered'>
                {copy.required.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className='asca-mb__subhead'>{ui('review')}</h3>
              <ol className='asca-mb__numbered'>
                {copy.review.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className='asca-mb__bonus'>
        <h3 className='asca-mb__subhead'>{ui('bonus')}</h3>
        <div className='asca-mb__bonus-grid'>
          {copy.bonus.map(group => (
            <div key={group.title} className='asca-mb__bonus-group'>
              <h4 className='asca-mb__bonus-title'>{group.title}</h4>
              <ul className='asca-mb__rules'>
                {group.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <RegCite
        sources={[src.select2, src.select3, src.select4, src.select5, src.select6, src.select8]}
        className='asca-mb__cite--section'
      />
    </section>
  )
}

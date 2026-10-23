import {
  BONUS_POINTS,
  REQUIRED_CONDITIONS,
  REVIEW_STEPS,
  SCORE_BANDS,
  SCORE_NOTE,
  SCORING_RULES,
  SCORING_TABLE,
  SRC,
} from './membership-data'
import { MembershipSectionHead } from './membership-section-head'
import { RegCite } from './reg-cite'

/**
 * 승급 기준 — 배점 장부와 점수 눈금이 위에, 점수 밖의 필수 요건·심사 절차·가산점이 아래에.
 * "점수만 채우면 승급" 으로 읽히지 않게 눈금 바로 밑에 그 사실을 적는다.
 */
export function MembershipPromotion() {
  return (
    <section className='asca-mb__section' aria-labelledby='mb-promotion'>
      <MembershipSectionHead
        id='mb-promotion'
        title='작가 승급 기준'
        lede='대한민국 동양서예대전 입상 점수와 자격심사로 추천·초대작가를 선임합니다.'
      />

      <div className='asca-mb__promo'>
        <div>
          <table className='asca-mb__scores'>
            <caption className='sr-only'>대한민국 동양서예대전 수상 등급별 배점</caption>
            <thead>
              <tr>
                <th scope='col'>수상 등급</th>
                <th scope='col'>배점</th>
              </tr>
            </thead>
            <tbody>
              {SCORING_TABLE.map(row => (
                <tr key={row.award}>
                  <th scope='row'>{row.award}</th>
                  <td>
                    <span className='asca-mb__points'>{row.points}</span>점
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className='asca-mb__rules'>
            {SCORING_RULES.map(rule => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className='asca-mb__scale-wrap'>
          <h3 className='asca-mb__subhead'>합산 점수</h3>
          <ol
            className='asca-mb__scale'
            style={{
              gridTemplateColumns: SCORE_BANDS.map(band => `${band.span}fr`).join(' '),
            }}
            aria-label='합산 점수별 선정 대상'
          >
            {SCORE_BANDS.map(band => (
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
          <p className='asca-mb__note'>{SCORE_NOTE}</p>

          <div className='asca-mb__checks'>
            <div>
              <h3 className='asca-mb__subhead'>필수 요건</h3>
              <ol className='asca-mb__numbered'>
                {REQUIRED_CONDITIONS.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className='asca-mb__subhead'>심사</h3>
              <ol className='asca-mb__numbered'>
                {REVIEW_STEPS.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className='asca-mb__bonus'>
        <h3 className='asca-mb__subhead'>가산점</h3>
        <div className='asca-mb__bonus-grid'>
          {BONUS_POINTS.map(group => (
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
        sources={[SRC.select2, SRC.select3, SRC.select4, SRC.select5, SRC.select6, SRC.select8]}
        className='asca-mb__cite--section'
      />
    </section>
  )
}

import Link from 'next/link'
import {
  SPECIAL_CASES,
  SPECIAL_ELIGIBLE,
  SPECIAL_FEE_COLUMNS,
  SPECIAL_FEES,
  SPECIAL_LEDE,
  SPECIAL_STEPS,
  SRC,
} from './membership-data'
import { MembershipSectionHead } from './membership-section-head'
import { RegCite } from './reg-cite'

/**
 * 특별선임 — 점수 승급(위 섹션)과 다른 두 번째 길. 대상·절차를 위에, 비회원 비용표와
 * 회원 상태별 처리를 아래에 둔다. 금액은 회원 및 회비 규정 제3조 ④ 표와 같아야 한다(테스트가 잡는다).
 */
export function MembershipSpecial() {
  return (
    <section className='asca-mb__section' aria-labelledby='mb-special'>
      <MembershipSectionHead id='mb-special' title='추천·초대작가 특별선임' lede={SPECIAL_LEDE} />

      <div className='asca-mb__checks'>
        <div>
          <h3 className='asca-mb__subhead'>신청할 수 있는 분</h3>
          <ol className='asca-mb__numbered'>
            {SPECIAL_ELIGIBLE.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className='asca-mb__subhead'>신청부터 선임까지</h3>
          <ol className='asca-mb__numbered'>
            {SPECIAL_STEPS.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className='asca-mb__dues asca-mb__special'>
        <div>
          <h3 className='asca-mb__subhead'>비회원 특별선임 비용</h3>
          <div className='asca-mb__table-scroll'>
            <table className='asca-mb__scores'>
              <caption className='sr-only'>비회원 특별선임 등록비</caption>
              <thead>
                <tr>
                  {SPECIAL_FEE_COLUMNS.map(label => (
                    <th key={label} scope='col'>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SPECIAL_FEES.map(({ cells: [name, ...amounts] }) => (
                  <tr key={name}>
                    <th scope='row'>{name}</th>
                    {amounts.map((amount, index) => (
                      <td key={SPECIAL_FEE_COLUMNS[index + 1]}>{amount}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className='asca-mb__note'>
            이사회가 의결한 자격을 기준으로 냅니다. 등록비는 정회원이 같은 자격에 이르기까지 내는
            가입·승급 등록비의 합입니다.{' '}
            <Link href='/application-for-recommended-invited-calligrapher#special'>
              특별선임 신청 안내
            </Link>
          </p>
        </div>

        <dl className='asca-mb__facts'>
          {SPECIAL_CASES.map(fact => (
            <div key={fact.label} className='asca-mb__fact'>
              <dt>{fact.label}</dt>
              <dd>{fact.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      <RegCite
        sources={[SRC.select11, SRC.dues3, SRC.articles5]}
        className='asca-mb__cite--section'
      />
    </section>
  )
}

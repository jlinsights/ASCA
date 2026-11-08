'use client'

import Link from 'next/link'
import { MembershipSectionHead } from './membership-section-head'
import { RegCite } from './reg-cite'
import { useMembershipText } from './use-membership-copy'

/**
 * 특별선임 — 점수 승급(위 섹션)과 다른 두 번째 길. 대상·절차를 위에, 비회원 비용표와
 * 회원 상태별 처리를 아래에 둔다. 금액은 회원 및 회비 규정 제3조 ④ 표와 같아야 한다(테스트가 잡는다).
 */
export function MembershipSpecial() {
  const { copy, ui } = useMembershipText()
  const { src } = copy
  return (
    <section className='asca-mb__section' aria-labelledby='mb-special'>
      <MembershipSectionHead id='mb-special' title={ui('specialTitle')} lede={copy.specialLede} />

      <div className='asca-mb__checks'>
        <div>
          <h3 className='asca-mb__subhead'>{ui('specialEligible')}</h3>
          <ol className='asca-mb__numbered'>
            {copy.specialEligible.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className='asca-mb__subhead'>{ui('specialSteps')}</h3>
          <ol className='asca-mb__numbered'>
            {copy.specialSteps.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className='asca-mb__dues asca-mb__special'>
        <div>
          <h3 className='asca-mb__subhead'>{ui('specialFees')}</h3>
          <div className='asca-mb__table-scroll'>
            <table className='asca-mb__scores'>
              <caption className='sr-only'>{ui('specialCaption')}</caption>
              <thead>
                <tr>
                  {copy.specialColumns.map(label => (
                    <th key={label} scope='col'>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {copy.specialFees.map(({ cells: [name, ...amounts] }) => (
                  <tr key={name}>
                    <th scope='row'>{name}</th>
                    {amounts.map((amount, index) => (
                      <td key={copy.specialColumns[index + 1]}>{amount}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className='asca-mb__note'>
            {ui('specialNote')}{' '}
            <Link href='/application-for-recommended-invited-calligrapher#special'>
              {ui('specialLink')}
            </Link>
          </p>
        </div>

        <dl className='asca-mb__facts'>
          {copy.specialCases.map(fact => (
            <div key={fact.label} className='asca-mb__fact'>
              <dt>{fact.label}</dt>
              <dd>{fact.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      <RegCite
        sources={[src.select11, src.dues3, src.articles5]}
        className='asca-mb__cite--section'
      />
    </section>
  )
}

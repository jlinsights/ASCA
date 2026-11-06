'use client'

import { ArrowUpRight } from 'lucide-react'
import { ACADEMY_LINKS, SAC_CLASSES, SAC_INSTRUCTOR_COUNT, SAC_LINKS } from './academy-data'
import { AcademySectionHead } from './academy-section-head'
import { SacTimetable } from './sac-timetable'
import { useAcademyText } from './use-academy-copy'

/**
 * 예술의전당 서화아카데미 — 학기 띠, 협회 수강생 혜택, 주간 시간표, 수강료·안내.
 * 학기 상태(모집 중·진행 중)는 빌드 시점에 굳으므로 계산하지 않고 학기 기간만 적는다.
 */
export function SacAcademy() {
  const { copy, ui } = useAcademyText()
  const SAC_TERM = copy.term
  return (
    <section id='sac' className='asca-ac__section asca-ac__anchor' aria-labelledby='ac-sac'>
      <AcademySectionHead
        id='ac-sac'
        eyebrow={ui('sacEyebrow')}
        title={ui('sacTitle')}
        lede={ui('sacLede')
          .replace('{instructors}', String(SAC_INSTRUCTOR_COUNT))
          .replace('{classes}', String(SAC_CLASSES.length))}
      />

      <dl className='asca-ac__term'>
        <div>
          <dt>{ui('termName')}</dt>
          <dd className='asca-ac__term-strong'>{SAC_TERM.name}</dd>
        </div>
        <div>
          <dt>{ui('termPeriod')}</dt>
          <dd>{SAC_TERM.period}</dd>
        </div>
        <div>
          <dt>{ui('termLength')}</dt>
          <dd>{SAC_TERM.length}</dd>
        </div>
        <div>
          <dt>{ui('termRecess')}</dt>
          <dd>{SAC_TERM.recess}</dd>
        </div>
      </dl>

      <aside className='asca-ac__benefit' aria-labelledby='ac-benefit'>
        <p className='asca-ac__eyebrow'>{ui('benefitEyebrow')}</p>
        <h3 id='ac-benefit' className='asca-ac__benefit-title'>
          {copy.benefit.headline}
        </h3>
        <dl className='asca-ac__benefit-list'>
          {copy.benefit.items.map(item => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </aside>

      <h3 className='asca-ac__subhead'>{ui('timetable')}</h3>
      <SacTimetable />
      <p className='asca-ac__source'>
        {ui('source')}{' '}
        <a href={SAC_LINKS.post} target='_blank' rel='noopener noreferrer'>
          {ui('sourceLink')}
          <span className='sr-only'>{ui('newWindow')}</span>
        </a>
      </p>

      <div className='asca-ac__sac-info'>
        <div>
          <h3 className='asca-ac__subhead'>{ui('fees')}</h3>
          <table className='asca-ac__fees'>
            <caption className='sr-only'>
              {ui('feesCaption').replace('{term}', SAC_TERM.name)}
            </caption>
            <tbody>
              {copy.fees.map(fee => (
                <tr key={fee.label}>
                  <th scope='row'>{fee.label}</th>
                  <td>{fee.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className='asca-ac__dash-list asca-ac__dash-list--small'>
            {copy.discounts.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className='asca-ac__subhead'>{ui('info')}</h3>
          <dl className='asca-ac__facts'>
            <div className='asca-ac__fact'>
              <dt>{ui('infoPlace')}</dt>
              <dd>
                <span className='asca-ac__fact-value'>{SAC_TERM.place}</span>
              </dd>
            </div>
            <div className='asca-ac__fact'>
              <dt>{ui('infoFormat')}</dt>
              <dd>
                <span className='asca-ac__fact-value'>{SAC_TERM.format}</span>
              </dd>
            </div>
            <div className='asca-ac__fact'>
              <dt>{ui('infoApply')}</dt>
              <dd>
                <span className='asca-ac__fact-value'>{ui('infoApplyValue')}</span>
                <span className='asca-ac__fact-note'>{ui('infoApplyNote')}</span>
              </dd>
            </div>
            <div className='asca-ac__fact'>
              <dt>{ui('infoContact')}</dt>
              <dd>
                <a href={`tel:${SAC_TERM.tel}`} className='asca-ac__fact-link'>
                  {SAC_TERM.contact}
                </a>
                <span className='asca-ac__fact-note'>
                  {ui('infoContactNote').replace('{hours}', SAC_TERM.contactHours)}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <ul className='asca-ac__channels asca-ac__channels--pair'>
        <li>
          <a
            href={SAC_LINKS.recruiting}
            target='_blank'
            rel='noopener noreferrer'
            className='asca-ac__channel'
          >
            <span className='asca-ac__channel-title'>{ui('nextTerm')}</span>
            <span className='asca-ac__channel-detail'>{ui('nextTermDetail')}</span>
            <ArrowUpRight className='asca-ac__channel-icon' aria-hidden='true' />
          </a>
        </li>
        <li>
          <a
            href={ACADEMY_LINKS.booking}
            target='_blank'
            rel='noopener noreferrer'
            className='asca-ac__channel'
          >
            <span className='asca-ac__channel-title'>{ui('discountConsult')}</span>
            <span className='asca-ac__channel-detail'>{ui('discountConsultDetail')}</span>
            <ArrowUpRight className='asca-ac__channel-icon' aria-hidden='true' />
          </a>
        </li>
      </ul>
    </section>
  )
}

import Link from 'next/link'
import { AboutRows } from '@/components/about/about-layout'
import {
  DIRECTIONS,
  INDICATORS,
  KEYNOTE,
  MANAGEMENT,
  PROGRAMS,
  SCHEDULE,
  type PlanItem,
} from './plan-2027-data'

const toRows = (items: readonly PlanItem[]) =>
  items.map(item => ({ label: item.title, body: <p>{item.body}</p> }))

/** 기조 — 한 문장과 풀이 */
export function PlanKeynote() {
  return (
    <>
      <p className='ab-quote' data-reveal>
        {KEYNOTE.quote}
      </p>
      {KEYNOTE.paragraphs.map(paragraph => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </>
  )
}

export function PlanDirections() {
  return <AboutRows numbered items={toRows(DIRECTIONS)} />
}

/** 주요 일정 — 확정된 날짜만, 굵은 줄은 한 해의 중심 */
export function PlanSchedule() {
  return (
    <dl className='ab-ledger ab-ledger--dates'>
      {SCHEDULE.map(row => (
        <div key={row.what}>
          <dt>{row.when}</dt>
          <dd>{row.lead ? <strong>{row.what}</strong> : row.what}</dd>
        </div>
      ))}
    </dl>
  )
}

export function PlanPrograms() {
  return (
    <AboutRows
      numbered
      items={PROGRAMS.map(program => ({
        label: program.title,
        body: (
          <>
            <p>{program.body}</p>
            <ul>
              {program.points.map(point => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {program.href && (
              <p>
                <Link href={program.href} className='ab-link'>
                  {program.linkLabel} <span aria-hidden='true'>→</span>
                </Link>
              </p>
            )}
          </>
        ),
      }))}
    />
  )
}

export function PlanManagement() {
  return <AboutRows items={toRows(MANAGEMENT)} />
}

export function PlanIndicators() {
  return (
    <>
      <p>숫자로 목표를 부풀리기보다, 해마다 같은 잣대로 기록하고 총회에서 함께 돌아봅니다.</p>
      <ul>
        {INDICATORS.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  )
}

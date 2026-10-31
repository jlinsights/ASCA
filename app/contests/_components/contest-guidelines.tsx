'use client'

import { ApplySectionHead, LedgerTable } from '@/components/apply/apply-parts'
import { useLanguage } from '@/contexts/language-context'
import { GUIDELINE_COPY, type CopyRule } from './contest-23-copy'

/**
 * 제23회 공모요강 요약 — 위 플립북(전문)을 읽지 않아도 출품에 필요한 것을 이 페이지에서 끝낼 수 있게.
 * 순서는 출품자가 묻는 순서: 언제 → 누가·무엇을 → 얼마 → 어떻게 → 무엇을 받나 → 주의할 점.
 * 문구는 언어별로 contest-23-copy 에서 읽는다.
 */

function NumberedRules({ items }: { items: readonly CopyRule[] }) {
  return (
    <ol className='asca-apply__numbered'>
      {items.map(item => (
        <li key={item.title}>
          <div>
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function ContestGuidelines() {
  const { language } = useLanguage()
  const copy = GUIDELINE_COPY[language]
  const { next, entry, specs, fees, how, prizes, notice } = copy
  return (
    <>
      <section id='next' aria-labelledby='next-title' className='asca-apply__anchor'>
        <ApplySectionHead
          id='next-title'
          eyebrow={next.eyebrow}
          title={next.title}
          lede={next.lede}
        />
        <LedgerTable
          caption={next.caption}
          columns={next.columns.map(label => ({ label }))}
          rows={next.rows.map(row => ({ cells: [row.label, row.value], lead: row.lead }))}
        />
        <p className='asca-apply__note'>{copy.nextNote}</p>
      </section>

      <section id='entry' aria-labelledby='entry-title' className='asca-apply__anchor'>
        <ApplySectionHead
          id='entry-title'
          eyebrow={entry.eyebrow}
          title={entry.title}
          lede={entry.lede}
        />
        <NumberedRules items={entry.rules} />
        <ul className='asca-apply__divisions'>
          {entry.divisions.map(division => (
            <li key={division.mark} className='asca-apply__division'>
              <span className='asca-apply__division-mark' aria-hidden='true' lang='ko'>
                {division.mark}
              </span>
              <h3 className='asca-apply__division-title'>{division.title}</h3>
              <p className='asca-apply__division-body'>{division.body}</p>
            </li>
          ))}
        </ul>
        <p className='asca-apply__note'>{entry.note}</p>
      </section>

      <section id='specs' aria-labelledby='specs-title' className='asca-apply__anchor'>
        <ApplySectionHead
          id='specs-title'
          eyebrow={specs.eyebrow}
          title={specs.title}
          lede={specs.lede}
        />
        <dl className='asca-apply__sizes'>
          {specs.sizes.map(size => (
            <div key={size.size} className='asca-apply__size'>
              <dt>{size.name}</dt>
              <dd>{size.size}</dd>
            </div>
          ))}
        </dl>
        <LedgerTable
          caption={specs.caption}
          columns={next.columns.map(label => ({ label }))}
          rows={specs.rows.map(row => ({ cells: [row.label, row.value] }))}
        />
      </section>

      <section id='fees' aria-labelledby='fees-title' className='asca-apply__anchor'>
        <ApplySectionHead
          id='fees-title'
          eyebrow={fees.eyebrow}
          title={fees.title}
          lede={fees.lede}
        />
        <LedgerTable caption={fees.caption} columns={fees.columns} rows={fees.rows} />
        <p className='asca-apply__note'>{copy.feesNote}</p>
      </section>

      <section id='how' aria-labelledby='how-title' className='asca-apply__anchor'>
        <ApplySectionHead id='how-title' eyebrow={how.eyebrow} title={how.title} lede={how.lede} />
        <NumberedRules items={how.rules} />
        <p className='asca-apply__note'>{copy.howNote}</p>
      </section>

      <section id='prizes' aria-labelledby='prizes-title' className='asca-apply__anchor'>
        <ApplySectionHead
          id='prizes-title'
          eyebrow={prizes.eyebrow}
          title={prizes.title}
          lede={prizes.lede}
        />
        <LedgerTable caption={prizes.caption} columns={prizes.columns} rows={prizes.rows} />
        <p className='asca-apply__note'>{copy.prizesNote}</p>
      </section>

      <section id='notice' aria-labelledby='notice-title' className='asca-apply__anchor'>
        <ApplySectionHead id='notice-title' eyebrow={notice.eyebrow} title={notice.title} />
        <ol className='asca-apply__numbered'>
          {notice.items.map(item => (
            <li key={item}>
              <div>
                <span>{item}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

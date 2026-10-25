import Link from 'next/link'
import { ApplySectionHead, LedgerTable } from '@/components/apply/apply-parts'
import {
  AWARDS,
  DIVISIONS,
  ENTRY_FEES,
  SIZES,
} from '@/app/application/_components/application-data'
import {
  CONTEST_23,
  ELIGIBILITY,
  HOW_TO_ENTER,
  NOTICES,
  SCHEDULE,
  SPECS,
  koDate,
  type RuleItem,
} from './contest-23-data'

/**
 * 제23회 공모요강 요약 — 위 플립북(전문)을 읽지 않아도 출품에 필요한 것을 이 페이지에서 끝낼 수 있게.
 * 순서는 출품자가 묻는 순서: 언제 → 누가·무엇을 → 얼마 → 어떻게 → 무엇을 받나 → 주의할 점.
 */

const TITLE = `제${CONTEST_23.edition}회 대한민국 동양서예대전`

function NumberedRules({ items }: { items: readonly RuleItem[] }) {
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
  return (
    <>
      <section id='next' aria-labelledby='next-title' className='asca-apply__anchor'>
        <ApplySectionHead
          id='next-title'
          eyebrow='공모 일정'
          title={TITLE}
          lede={`출품 접수는 ${koDate(CONTEST_23.deadline)} ${CONTEST_23.deadlineTime}까지입니다. 공모요강 전문은 위 플립북에서 볼 수 있습니다.`}
        />
        <LedgerTable
          caption={`${TITLE} 일정`}
          columns={[{ label: '구분' }, { label: '내용' }]}
          rows={SCHEDULE.map(row => ({ cells: [row.label, row.value], lead: row.lead }))}
        />
        <p className='asca-apply__note'>
          주최·주관 {CONTEST_23.host} · 후원 {CONTEST_23.sponsors} · 전시실 {CONTEST_23.halls}
        </p>
      </section>

      <section id='entry' aria-labelledby='entry-title' className='asca-apply__anchor'>
        <ApplySectionHead
          id='entry-title'
          eyebrow='출품 자격·부문'
          title='누가, 무엇을 출품하나'
          lede='한글·한문 서예를 중심으로 문인화·전각·현대서예·캘리그라피까지 다섯 부문입니다.'
        />
        <NumberedRules items={ELIGIBILITY} />
        <ul className='asca-apply__divisions'>
          {DIVISIONS.map(division => (
            <li key={division.title} className='asca-apply__division'>
              <span className='asca-apply__division-mark' aria-hidden='true'>
                {division.mark}
              </span>
              <h3 className='asca-apply__division-title'>{division.title}</h3>
              <p className='asca-apply__division-body'>{division.body}</p>
            </li>
          ))}
        </ul>
        <p className='asca-apply__note'>필요하면 이사회 의결로 심사 부문을 더할 수 있습니다.</p>
      </section>

      <section id='specs' aria-labelledby='specs-title' className='asca-apply__anchor'>
        <ApplySectionHead
          id='specs-title'
          eyebrow='작품 규격·표장'
          title='작품은 이렇게 준비합니다'
          lede='세 가지 규격 가운데 하나로 제작합니다. 전각·서각 부문은 별도 규격을 따릅니다.'
        />
        <dl className='asca-apply__sizes'>
          {SIZES.map(size => (
            <div key={size.name} className='asca-apply__size'>
              <dt>{size.name}</dt>
              <dd>{size.size}</dd>
            </div>
          ))}
        </dl>
        <LedgerTable
          caption='출품 점수와 표장'
          columns={[{ label: '구분' }, { label: '내용' }]}
          rows={SPECS.map(row => ({ cells: [row.label, row.value] }))}
        />
      </section>

      <section id='fees' aria-labelledby='fees-title' className='asca-apply__anchor'>
        <ApplySectionHead
          id='fees-title'
          eyebrow='출품료'
          title='출품료와 입금 계좌'
          lede='2점째부터는 점당 금액이 내려갑니다. 표구비는 입선 이상 작품에만 따로 부과합니다.'
        />
        <LedgerTable
          caption='출품료 (표구비 별도)'
          columns={[
            { label: '구분' },
            { label: '작품 1점', numeric: true },
            { label: '2~9점 (점당)', numeric: true },
          ]}
          rows={ENTRY_FEES}
        />
        <p className='asca-apply__note'>
          입금 계좌{' '}
          <strong>
            {CONTEST_23.account.bank} {CONTEST_23.account.number}
          </strong>{' '}
          · 예금주 {CONTEST_23.account.holder} · 입금 확인증을 출품신청서와 함께 보내 주세요.
          표구비와 10점 이상 개인전·단체 부스전은 <Link href='/application#fees'>출품원서</Link>와
          공모요강을 확인하세요.
        </p>
      </section>

      <section id='how' aria-labelledby='how-title' className='asca-apply__anchor'>
        <ApplySectionHead
          id='how-title'
          eyebrow='출품 방법'
          title='접수는 이렇게 합니다'
          lede={`마감은 ${koDate(CONTEST_23.deadline)} 18:00, 보낸 날이 아니라 도착한 날 기준입니다.`}
        />
        <NumberedRules items={HOW_TO_ENTER} />
        <p className='asca-apply__note'>
          <Link href='/application'>출품원서 작성하기 →</Link> 출품신청서(별지 제1호)와 표기지(별지
          제2호) 양식은 공모요강 5~8쪽과 출품원서 페이지에서 내려받을 수 있습니다.
        </p>
      </section>

      <section id='prizes' aria-labelledby='prizes-title' className='asca-apply__anchor'>
        <ApplySectionHead
          id='prizes-title'
          eyebrow='시상'
          title='시상 내역'
          lede={`시상식은 ${koDate(CONTEST_23.ceremony)} 14:00 ${CONTEST_23.venue}에서 열립니다.`}
        />
        <LedgerTable
          caption='시상 내역'
          columns={[
            { label: '상격' },
            { label: '구분' },
            { label: '인원' },
            { label: '상장·상금' },
          ]}
          rows={AWARDS.map((award, index) => ({
            cells: [award.name, award.tier, award.count, award.prize],
            lead: index === 0,
          }))}
        />
        <p className='asca-apply__note'>
          특선·입선 작품은 도록에 실리고 전시됩니다. 수상 실적은 초대작가 추천 심의에 반영합니다.
        </p>
      </section>

      <section id='notice' aria-labelledby='notice-title' className='asca-apply__anchor'>
        <ApplySectionHead id='notice-title' eyebrow='유의사항' title='출품 전에 꼭 확인하세요' />
        <ol className='asca-apply__numbered'>
          {NOTICES.map(notice => (
            <li key={notice}>
              <div>
                <span>{notice}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

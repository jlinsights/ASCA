import type { Metadata } from 'next'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { HeroFacts, PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'
import {
  ApplySectionHead,
  ApplyToc,
  ContactList,
  LedgerTable,
} from '@/components/apply/apply-parts'
import { CalendarFlipbook } from '@/components/events/calendar-flipbook'
import { koDate } from '@/lib/utils/ko-date'
import { CALENDAR_2027, FAQ, GIFT_TIERS, STEPS, WAYS } from './_components/calendar-2027-data'
import '@/components/apply/apply.css'
import '../_components/events.css'

/**
 * 2027 동양서예 캘린더 증정 행사 — 안내 플립북 전문 아래에 참여 방법·증정 기준·신청 절차를 한 화면에 정리.
 * 정적 주소라 /events/[id] 보다 먼저 잡힌다.
 */

const TITLE = '2027 동양서예 캘린더 증정 행사'
const DESCRIPTION = `${CALENDAR_2027.artist}의 2027 캘린더를 드립니다. 연회비·후원·대전 조기 출품·대만 기행 가운데 하나 이상 참여하면 신청할 수 있습니다. 신청 마감 ${koDate(CALENDAR_2027.closes)} ${CALENDAR_2027.closesTime}.`

export const metadata: Metadata = {
  title: `${TITLE} | 동양서예협회`,
  description: DESCRIPTION,
  alternates: { canonical: CALENDAR_2027.path },
  openGraph: { title: `${TITLE} | 동양서예협회`, description: DESCRIPTION },
}

const TOC = [
  { href: '#ways', label: '참여 방법' },
  { href: '#gifts', label: '증정 기준' },
  { href: '#apply', label: '신청 절차' },
  { href: '#faq', label: '자주 묻는 질문' },
  { href: '#contact', label: '문의' },
] as const

function ApplyActions() {
  return (
    <p className='asca-events__cta'>
      <a
        href={CALENDAR_2027.formUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='asca-events__more is-primary'
      >
        신청서 작성하기 ↗
      </a>
      <a
        href={CALENDAR_2027.payUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='asca-events__more'
      >
        온라인 납부 ↗
      </a>
    </p>
  )
}

export default function Calendar2027Page() {
  const { account } = CALENDAR_2027
  return (
    <div className='asca-apply min-h-screen'>
      <PageHero
        {...PAGE_HERO_MARKS.calendarEvent}
        title={TITLE}
        crumbs={[{ label: '행사', href: '/events' }, { label: TITLE }]}
        lede={`${CALENDAR_2027.artist}의 작품으로 엮은 2027 캘린더를 감사의 마음으로 드립니다.`}
      >
        <HeroFacts
          facts={[
            {
              label: '신청',
              value: `${koDate(CALENDAR_2027.opens, false)} – ${koDate(CALENDAR_2027.closes, false)} ${CALENDAR_2027.closesTime}`,
            },
            { label: '조기 참여', value: `${koDate(CALENDAR_2027.earlyBy, false)}까지` },
            { label: '발송', value: `${koDate(CALENDAR_2027.shipFrom, false)}부터` },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={TOC} />

        <div>
          <CalendarFlipbook />
          <ApplyActions />
        </div>

        <section id='ways' aria-labelledby='ways-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='ways-title'
            eyebrow='참여 방법'
            title='하나만 참여해도 받습니다'
            lede='아래 네 가지 가운데 하나 이상 참여하면 신청할 수 있습니다. 여러 가지를 함께하면 증정 등급이 올라갑니다.'
          />
          <ol className='asca-apply__numbered'>
            {WAYS.map(way => (
              <li key={way.title}>
                <div>
                  <strong>{way.title}</strong>
                  <span>
                    {way.body} · <Link href={way.href}>{way.linkLabel} →</Link>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id='gifts' aria-labelledby='gifts-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='gifts-title'
            eyebrow='증정 기준'
            title='참여한 만큼 드립니다'
            lede='해당하는 가장 높은 등급 하나만 드리며, 납부가 확인된 뒤 발송합니다.'
          />
          <LedgerTable
            caption='캘린더 증정 기준'
            columns={[{ label: '등급' }, { label: '조건' }, { label: '증정' }]}
            rows={GIFT_TIERS.map(tier => ({
              cells: [tier.tier, tier.condition, tier.gift],
              lead: tier.lead,
            }))}
          />
          <p className='asca-apply__note'>
            캘린더는 수량이 정해진 감사 선물입니다. {koDate(CALENDAR_2027.earlyBy, false)}까지
            참여한 분께 먼저 보내 드리며, 마지막 발송은 {koDate(CALENDAR_2027.shipLast)}입니다.
          </p>
        </section>

        <section id='apply' aria-labelledby='apply-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='apply-title'
            eyebrow='신청 절차'
            title='납부하고, 신청서를 내면 끝'
            lede={`신청 마감은 ${koDate(CALENDAR_2027.closes)} ${CALENDAR_2027.closesTime}입니다.`}
          />
          <ol className='asca-apply__numbered'>
            {STEPS.map(step => (
              <li key={step.title}>
                <div>
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                </div>
              </li>
            ))}
          </ol>
          <p className='asca-apply__note'>
            계좌 이체{' '}
            <strong>
              {account.bank} {account.number}
            </strong>{' '}
            · 예금주 {account.holder}
          </p>
          <ApplyActions />
        </section>

        <section id='faq' aria-labelledby='faq-title' className='asca-apply__anchor'>
          <ApplySectionHead id='faq-title' eyebrow='자주 묻는 질문' title='신청 전에 확인하세요' />
          <ol className='asca-apply__numbered'>
            {FAQ.map(item => (
              <li key={item.q}>
                <div>
                  <strong>{item.q}</strong>
                  <span>{item.a}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id='contact' aria-labelledby='contact-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='contact-title'
            eyebrow='문의'
            title='사무국'
            lede='카카오톡 채널 「동양서예협회」로도 문의할 수 있습니다.'
          />
          <ContactList />
        </section>
      </div>

      <LayoutFooter />
    </div>
  )
}

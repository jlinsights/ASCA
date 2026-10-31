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
import { CONTEST_FLIPBOOK_URL } from '@/components/contests/contest-flipbook'
import { SiteFaqList } from '@/components/faq/site-faq-list'
import {
  CALENDAR_2027,
  isCalendarEventOpen,
} from '@/app/events/calendar-2027/_components/calendar-2027-data'
import { defaultSEO } from '@/lib/seo-constants'
import { CONTEST_23, SCHEDULE, koDate } from '../_components/contest-23-data'
import {
  ENTRY_PATHS,
  HALLS,
  HUB_PATH,
  HUB_TITLE,
  buildEventJsonLd,
} from './_components/daejeon-23-hub-data'
import '@/components/apply/apply.css'
import '@/app/events/_components/events.css'

/**
 * 제23회 대전 허브 — 두 전시실 구성, 출품 경로, 일정, 자주 묻는 질문을 한 화면에 모으고
 * 공모요강 전문(/contests)·출품원서(/application)로 잇는다. 정적 주소라 /contests/[id] 보다 먼저 잡힌다.
 */

// 캘린더 증정 안내는 신청 마감(12-15 18:00)이 지나면 내린다 — 정적 페이지라 한 시간마다 다시 만든다
export const revalidate = 3600

const DESCRIPTION = `예술의전당 서울서예박물관 제1·2전시실에서 공모전과 書境 초대작가전을 함께 엽니다. 출품 마감 ${koDate(CONTEST_23.deadline)}, 전시 ${koDate(CONTEST_23.exhibitionStart, false)} ~ ${koDate(CONTEST_23.exhibitionEnd, false)}.`

export const metadata: Metadata = {
  title: `${HUB_TITLE} | 동양서예협회`,
  description: DESCRIPTION,
  alternates: { canonical: HUB_PATH },
  // openGraph 를 쓰면 레이아웃의 openGraph 를 통째로 덮는다 — 이미지도 여기서 다시 단다
  openGraph: {
    title: `${HUB_TITLE} | 동양서예협회`,
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

const TOC = [
  { href: '#halls', label: '전시 구성' },
  { href: '#paths', label: '출품 경로' },
  { href: '#dates', label: '일정' },
  { href: '#faq', label: '자주 묻는 질문' },
  { href: '#contact', label: '문의' },
] as const

const HUB_FAQ_IDS = ['entry-fees', 'awards', 'special-appointment'] as const

function EntryActions() {
  return (
    <p className='asca-events__cta'>
      <Link href='/application' className='asca-events__more is-primary'>
        출품원서 작성하기 →
      </Link>
      <a
        href={CONTEST_FLIPBOOK_URL}
        target='_blank'
        rel='noopener noreferrer'
        className='asca-events__more'
      >
        공모요강 플립북 ↗
      </a>
      <Link href='/contests' className='asca-events__more'>
        공모요강 전문 →
      </Link>
    </p>
  )
}

export default function Daejeon23HubPage() {
  const eventJsonLd = buildEventJsonLd()
  return (
    <div className='asca-apply min-h-screen'>
      <script
        type='application/ld+json'
        // 정적 상수만 직렬화한다. </script> 가 끼어들 수 없게 < 를 이스케이프
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, '\\u003c') }}
      />
      <PageHero
        {...PAGE_HERO_MARKS.contests}
        title={HUB_TITLE}
        crumbs={[{ label: '공모전', href: '/contests' }, { label: `제${CONTEST_23.edition}회` }]}
        lede='서울서예박물관 두 전시실에서, 공모전과 書境 초대작가전을 한 흐름으로 엽니다.'
      >
        <HeroFacts
          facts={[
            {
              label: '출품 마감',
              value: `${koDate(CONTEST_23.deadline, false)} ${CONTEST_23.deadlineTime}`,
            },
            {
              label: '전시',
              value: `${koDate(CONTEST_23.exhibitionStart, false)} ~ ${koDate(CONTEST_23.exhibitionEnd, false)}`,
            },
            { label: '시상식', value: koDate(CONTEST_23.ceremony, false) },
            { label: '관람', value: '무료' },
          ]}
        />
      </PageHero>

      <div className='asca-apply__body'>
        <ApplyToc items={TOC} />

        <div>
          <EntryActions />
          {isCalendarEventOpen() && (
            <p className='asca-apply__note'>
              {koDate(CALENDAR_2027.closes)} {CALENDAR_2027.closesTime}까지 출품신청서와 출품료를
              내면 2027 동양서예 캘린더 증정 대상입니다 ·{' '}
              <Link href={CALENDAR_2027.path}>증정 행사 안내 →</Link>
            </p>
          )}
        </div>

        <section id='halls' aria-labelledby='halls-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='halls-title'
            eyebrow='전시 구성'
            title='같은 기간, 두 전시실에서'
            lede={`${CONTEST_23.venue} 제1·2전시실을 함께 씁니다. 신진 작가의 출품작과 초대작가의 필묵이 같은 기간, 같은 공간에서 만납니다.`}
          />
          <ol className='asca-apply__numbered'>
            {HALLS.map(item => (
              <li key={item.hall}>
                <div>
                  <strong>
                    {item.hall} · {item.title}
                  </strong>
                  <span>{item.body}</span>
                </div>
              </li>
            ))}
          </ol>
          <p className='asca-apply__note'>
            2026년 4월의 書境 전시 기록은 <Link href='/exhibitions/past'>지난 전시</Link>에서 볼 수
            있습니다.
          </p>
        </section>

        <section id='paths' aria-labelledby='paths-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='paths-title'
            eyebrow='출품 경로'
            title='어디로 출품하나'
            lede='자격과 출품료, 규격은 공모요강 전문에 있습니다. 아래에서 내 경로를 찾아 해당 절로 이동하세요.'
          />
          <ol className='asca-apply__numbered'>
            {ENTRY_PATHS.map(path => (
              <li key={path.title}>
                <div>
                  <strong>{path.title}</strong>
                  <span>
                    {path.who}
                    <br />
                    {path.body}{' '}
                    {path.links.map((link, index) => (
                      <span key={link.href}>
                        {index > 0 && ' · '}
                        <Link href={link.href}>{link.label} →</Link>
                      </span>
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id='dates' aria-labelledby='dates-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='dates-title'
            eyebrow='일정'
            title='접수부터 시상까지'
            lede={`출품은 ${koDate(CONTEST_23.deadline)} ${CONTEST_23.deadlineTime}까지 받습니다. 보낸 날이 아니라 도착한 날이 기준입니다.`}
          />
          <LedgerTable
            caption={`${HUB_TITLE} 일정`}
            columns={[{ label: '구분' }, { label: '내용' }]}
            rows={SCHEDULE.map(row => ({ cells: [row.label, row.value], lead: row.lead }))}
          />
          <EntryActions />
        </section>

        <section id='faq' aria-labelledby='faq-title' className='asca-apply__anchor'>
          <ApplySectionHead id='faq-title' eyebrow='자주 묻는 질문' title='출품 전에 확인하세요' />
          <SiteFaqList ids={HUB_FAQ_IDS} />
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

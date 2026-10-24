import type { Metadata } from 'next'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { ContestIntro } from '@/components/contests/contest-intro'
import {
  ApplySectionHead,
  ApplyToc,
  ContactList,
  LedgerTable,
} from '@/components/apply/apply-parts'
import { CONTEST_EDITIONS, NEXT_CONTEST } from '@/app/awards/_components/awards-data'
import '@/components/apply/apply.css'

/**
 * 공모전 — 협회가 여는 공모전은 대한민국 동양서예대전 하나다. 회차 기록은 /awards 와 같은 연혁 데이터를 쓴다.
 * 예전엔 존재하지 않는 contests 테이블을 읽어 "전체 공모전 0 · 접수중 0"만 보였다.
 */

const DESCRIPTION =
  '사단법인 동양서예협회가 주최하는 대한민국 동양서예대전의 다음 회차 일정, 공모 요강, 역대 대전 기록을 안내합니다.'

export const metadata: Metadata = {
  title: '공모전 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '공모전 | 동양서예협회', description: DESCRIPTION },
}

const TOC = [
  { href: '#next', label: '다음 대전' },
  { href: '#editions', label: '역대 대전' },
  { href: '#contact', label: '문의' },
] as const

export default function ContestsPage() {
  const latest = CONTEST_EDITIONS[0]
  return (
    <div className='asca-apply min-h-screen'>
      <ContestIntro
        facts={[
          { label: '역대 대전', value: `${CONTEST_EDITIONS.length}회` },
          { label: '다음 대전', value: `제${NEXT_CONTEST.edition}회 · 2027년 4월` },
        ]}
      />

      <div className='asca-apply__body'>
        <ApplyToc items={TOC} />

        <section id='next' aria-labelledby='next-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='next-title'
            eyebrow='다음 대전'
            title={`제${NEXT_CONTEST.edition}회 대한민국 동양서예대전`}
            lede='출품 요강과 접수 일정은 확정되는 대로 공지사항에 안내합니다.'
          />
          <LedgerTable
            caption={`제${NEXT_CONTEST.edition}회 대전 일정`}
            columns={[{ label: '구분' }, { label: '내용' }]}
            rows={[
              { cells: ['전시 기간', NEXT_CONTEST.date], lead: true },
              { cells: ['장소', NEXT_CONTEST.venue] },
              { cells: ['함께 열리는 전시', '한·중·일 동양서예 초대작가전'] },
            ]}
          />
          <p className='asca-apply__note'>
            출품 방법은 <Link href='/application'>출품원서</Link>, 시상 내역과 상금은{' '}
            <Link href='/awards'>수상</Link>, 새 소식은 <Link href='/notice'>공지사항</Link>에서
            확인하세요.
          </p>
        </section>

        <section id='editions' aria-labelledby='editions-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='editions-title'
            eyebrow='역대 대전'
            title={`제1회부터 제${latest?.edition ?? ''}회까지`}
            lede='개최 기간과 장소는 협회 연혁의 기록입니다.'
          />
          <LedgerTable
            caption='역대 대한민국 동양서예대전'
            columns={[
              { label: '회차' },
              { label: '연도', numeric: true },
              { label: '기간' },
              { label: '장소' },
            ]}
            rows={CONTEST_EDITIONS.map((edition, index) => ({
              cells: [
                `제${edition.edition}회`,
                String(edition.year),
                edition.date ?? '—',
                edition.online ? `${edition.venue ?? ''} (온라인)`.trim() : (edition.venue ?? '—'),
              ],
              lead: index === 0,
            }))}
          />
        </section>

        <section id='contact' aria-labelledby='contact-title' className='asca-apply__anchor'>
          <ApplySectionHead
            id='contact-title'
            eyebrow='문의·상담'
            title='출품이 궁금하면'
            lede='출품 자격과 부문, 접수 방법은 사무국으로 문의해 주세요.'
          />
          <ContactList />
        </section>
      </div>

      <LayoutFooter />
    </div>
  )
}

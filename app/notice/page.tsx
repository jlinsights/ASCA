import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { listPublishedNotices } from '@/lib/notices/notices-data'
import { toNoticeRow } from '@/lib/notices/notice-view'
import { todayKst } from '@/lib/events/event-view'
import { NoticeView } from './_components/notice-view'
import '@/components/apply/apply.css'
import '@/app/events/_components/events.css'
import './_components/notice.css'

/**
 * 공지사항 — 게시일 순 장부. 고정 공지는 맨 위 띠에, 나머지는 해마다 묶어 분류·검색으로 거른다.
 * 예전엔 브라우저에서 10건씩 읽어 그 안에서 고정 공지를 골라 2쪽부터 고정 공지가 사라졌고,
 * 조회수(늘 0)·작성자·댓글 수를 카드마다 달았다(2026-11-03).
 * 본문은 언어 선택을 따르는 NoticeView(클라이언트)가 그리고, 메타데이터는 여기서 한국어로 둔다.
 */

const DESCRIPTION =
  '동양서예협회 공지사항 — 협회 소식과 행사 안내, 공모·전시 일정을 게시일 순으로 알립니다.'

export const metadata: Metadata = {
  title: '공지사항 | 동양서예협회',
  description: DESCRIPTION,
  // openGraph 를 쓰면 레이아웃의 openGraph 를 통째로 덮는다 — 이미지도 여기서 다시 단다
  openGraph: {
    title: '공지사항 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const firstParam = (value: string | string[] | undefined): string | undefined =>
  typeof value === 'string' ? value : value?.[0]

export default async function NoticePage({ searchParams }: PageProps) {
  const params = await searchParams
  const today = todayKst()
  const rows = (await listPublishedNotices()).map(notice => toNoticeRow(notice, today))

  return (
    <div className='asca-apply min-h-screen'>
      <NoticeView
        rows={rows}
        initialCategory={firstParam(params.category)}
        initialQuery={firstParam(params.q)?.slice(0, 50)}
      />
      <LayoutFooter />
    </div>
  )
}

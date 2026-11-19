import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { defaultSEO } from '@/lib/seo-constants'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { todayKst } from '@/lib/events/event-view'
import { getPublishedNotice, listPublishedNotices } from '@/lib/notices/notices-data'
import {
  noticeFacts,
  parseNoticeContent,
  toNoticeRow,
  type NoticeRow,
} from '@/lib/notices/notice-view'
import type { Notice } from '@/lib/types/cms-legacy'
import { log } from '@/lib/utils/logger'
import { NoticeDetailView } from '../_components/notice-detail-view'
import '@/components/apply/apply.css'
import '@/app/events/_components/events.css'
import '../_components/notice.css'

/**
 * 공지 상세 — 서버에서 읽고, 본문은 언어 선택을 따르는 NoticeDetailView 가 그린다.
 * 예전 상세는 브라우저에서 읽으며 조회수를 두 번 올렸고(그래도 늘 0), 쓸 수 없는 댓글 칸(공개 쓰기 권한 없음)과
 * alert 만 띄우는 공유 버튼을 달았다(2026-11-03). 본문의 '구분: …' 항목 줄은 표로, 옛 사이트 원문 링크는 버린다.
 */

type PageProps = { params: Promise<{ id: string }> }

const RELATED_LIMIT = 4

/** 같은 분류의 공지를 게시일이 가까운 순으로 — 못 읽어도 본문은 그린다 */
async function loadRelated(notice: Notice, today: string): Promise<NoticeRow[]> {
  try {
    const all = (await listPublishedNotices()).map(other => toNoticeRow(other, today))
    const self = toNoticeRow(notice, today)
    const origin = new Date(self.published).getTime()
    return all
      .filter(other => other.id !== notice.id && other.category === self.category)
      .map(other => ({ other, gap: Math.abs(new Date(other.published).getTime() - origin) }))
      .sort((a, b) => a.gap - b.gap)
      .slice(0, RELATED_LIMIT)
      .map(({ other }) => other)
      .sort((a, b) => b.published.localeCompare(a.published)) // 고른 뒤엔 최신순으로 보여 준다
  } catch (err) {
    log.error('related notices load failed', err)
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const notice = await getPublishedNotice((await params).id)
  if (!notice) return { title: '공지를 찾을 수 없습니다 | 동양서예협회' }
  const description = (notice.excerpt?.trim() || parseNoticeContent(notice.content).lead)
    .replace(/\s+/g, ' ')
    .slice(0, 150)
  const title = `${notice.title} | 동양서예협회`
  return {
    title,
    description,
    alternates: { canonical: `/notice/${notice.id}` },
    // openGraph 를 쓰면 레이아웃의 openGraph 를 통째로 덮는다 — 이미지도 여기서 다시 단다
    openGraph: { title, description, images: [defaultSEO.image] },
  }
}

export default async function NoticeDetailPage({ params }: PageProps) {
  const notice = await getPublishedNotice((await params).id)
  if (!notice) notFound()

  const today = todayKst()
  const related = await loadRelated(notice, today)

  return (
    <div className='asca-apply min-h-screen'>
      <NoticeDetailView
        notice={toNoticeRow(notice, today)}
        lead={parseNoticeContent(notice.content).lead}
        facts={noticeFacts(notice.content)}
        related={related}
      />
      <LayoutFooter />
    </div>
  )
}

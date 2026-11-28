import type { HistoryEvent } from '@/app/history/_data/history-events'

// 홈 화면이 보여 주는 숫자·목록은 전부 저장소에 있는 실제 기록에서 계산한다.
// 시안(ui_kits/site)의 '1985년 창립·회원 1,240명' 같은 예시 값은 쓰지 않는다.

export interface HomeStats {
  sinceYear: number
  grandExhibitionEdition: number | null
  exhibitionCount: number
}

export interface BlogPostSource {
  id: string
  title: string
  publishedAt: string
  link: string
}

export interface HomePost {
  id: string
  title: string
  date: string
  isoDate: string
  href: string
}

const GRAND_EXHIBITION = /第(\d+)回\s*大韓民國\s*東洋書藝大展/

export function getHomeStats(events: readonly HistoryEvent[]): HomeStats {
  const editions = events
    .map(e => GRAND_EXHIBITION.exec(e.title)?.[1])
    .filter((n): n is string => n !== undefined)
    .map(Number)

  return {
    sinceYear: Math.min(...events.map(e => e.year)),
    grandExhibitionEdition: editions.length > 0 ? Math.max(...editions) : null,
    exhibitionCount: events.filter(e => e.type === 'exhibition').length,
  }
}

export function getRecentExhibitions(
  events: readonly HistoryEvent[],
  limit: number
): HistoryEvent[] {
  return events
    .filter(e => e.type === 'exhibition')
    .toSorted((a, b) => b.year - a.year || b.month - a.month)
    .slice(0, limit)
}

// 게시일은 UTC 로 저장돼 있다(예: 2025-12-13T15:00Z = 서울 12월 14일 0시).
function formatSeoulDate(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))
  return parts.replaceAll('-', '.')
}

// 요약(summary)은 쓰지 않는다 — blog-posts.json 의 요약은 HTML 을 공백 없이 벗겨 낸 것이라
// 문단이 붙어 읽힌다(예: '…철학서예는…'). 홈 목록은 날짜와 제목만 보여 준다.
export function getLatestPosts(posts: readonly BlogPostSource[], limit: number): HomePost[] {
  return posts
    .toSorted((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit)
    .map(p => ({
      id: p.id,
      title: p.title,
      date: formatSeoulDate(p.publishedAt),
      isoDate: p.publishedAt,
      // 옛 Webflow 주소(p.link = /post/<slug>)가 아니라 이 사이트의 글 주소로 바로 보낸다
      href: `/blog/${p.id}`,
    }))
}

import { Metadata } from 'next'
import { constructMetadata } from '@/lib/seo'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { historyEvents } from '@/app/history/_data/history-events'
import blogPosts from '@/lib/data/blog-posts.json'
import { getHomeStats, getLatestPosts, getRecentExhibitions } from '@/components/home/home-data'
import { HomeHero } from '@/components/home/home-hero'
import { HomeExhibitions } from '@/components/home/home-exhibitions'
import { HomeJournal } from '@/components/home/home-journal'
import { HomeJoin } from '@/components/home/home-join'
import '@/components/home/home.css'

// 제목·설명·og·twitter 를 한 곳(lib/seo-constants.ts defaultSEO)에서 만든다.
// canonical 은 홈에만 단다(레이아웃에 두면 모든 페이지가 홈의 사본이라고 알린다 — lib/seo.ts 주석).
export const metadata: Metadata = constructMetadata({ url: '/' })

// 홈 콘텐츠는 저장소의 연혁·블로그 기록에서 서버에서 계산해 넘긴다.
// (Supabase CMS 프로젝트가 복구 불가 상태라 CMS 의존 섹션은 두지 않는다.)
const RECENT_EXHIBITIONS = 4
const LATEST_POSTS = 4

export default function Home() {
  const stats = getHomeStats(historyEvents)
  const exhibitions = getRecentExhibitions(historyEvents, RECENT_EXHIBITIONS)
  const posts = getLatestPosts(blogPosts, LATEST_POSTS)

  return (
    <div className='asca-home min-h-screen'>
      <HomeHero stats={stats} />
      <HomeExhibitions exhibitions={exhibitions} />
      <HomeJournal posts={posts} />
      <HomeJoin />
      <LayoutFooter />
    </div>
  )
}

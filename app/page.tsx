import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { historyEvents } from '@/app/history/_data/history-events'
import blogPosts from '@/lib/data/blog-posts.json'
import { getHomeStats, getLatestPosts, getRecentExhibitions } from '@/components/home/home-data'
import { HomeHero } from '@/components/home/home-hero'
import { HomeExhibitions } from '@/components/home/home-exhibitions'
import { HomeJournal } from '@/components/home/home-journal'
import { HomeJoin } from '@/components/home/home-join'
import '@/components/home/home.css'

const HOME_DESCRIPTION =
  '사단법인 동양서예협회(ASCA)는 한국·중국·일본을 잇는 동양 서예의 전통을 이어 가는 예술문화단체입니다. 대한민국 동양서예대전 공모와 전시, 추천·초대작가 선정, 서예 강좌를 안내합니다.'

export const metadata: Metadata = {
  // 협회명만 두면 대전 이름으로 찾는 사람에게 홈이 걸리지 않는다
  title: '사단법인 동양서예협회 | 대한민국 동양서예대전',
  // 검색 결과 요약에 쓰인다 — 협회가 무엇이고 무엇을 하는지(대전·작가·강좌)를 한 번에 알 수 있게
  description: HOME_DESCRIPTION,
  // 홈에만 단다(레이아웃에 두면 모든 페이지가 홈의 사본이라고 알린다 — lib/seo.ts 주석).
  // 옛 Webflow 홈도 canonical 이 https://orientalcalligraphy.org/ 였다
  alternates: { canonical: '/' },
  openGraph: {
    title: '사단법인 동양서예협회 | 대한민국 동양서예대전',
    description: HOME_DESCRIPTION,
    url: '/',
    images: ['/logo/Logo & Tagline_white BG.png'],
  },
}

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

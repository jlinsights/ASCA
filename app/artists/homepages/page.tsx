import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { loadFeaturedHomepages } from '../_components/load-featured-homepages'
import { ArtistHomepagesPage } from './homepages-client'

const TITLE = '작가의 홈페이지 | 동양서예협회'
const DESCRIPTION =
  '개인 홈페이지에서 작품과 전시 기록을 이어 가는 동양서예협회 작가들입니다. 협회 사무국이 구축하고 운영하는 작가 홈페이지와 書境 개인전·부스전 안내를 함께 봅니다.'

// 요청마다 작가의 현재 공개 상태를 읽는다. 정적으로 굳으면 배포 뒤 숨긴(자격 정지 등) 작가의
// 이름·사진·홈페이지가 다음 배포까지 남는다 — /artists 는 searchParams 를 읽어 원래 요청마다 그렸다.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, images: [defaultSEO.image] },
}

export default async function Page() {
  const artists = await loadFeaturedHomepages()
  return <ArtistHomepagesPage artists={artists} />
}

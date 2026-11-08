import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'

// /blog 목록의 metadata 는 레이아웃에서 단다(목록 화면은 클라이언트 컴포넌트 BlogListClient 다).
// 글 상세(/blog/[slug])와 가이드는 각자 metadata 를 내보내 이 값을 덮는다
const DESCRIPTION = '서예사와 서예가, 동양 미술과 한자 문화를 다루는 동양서예협회 블로그입니다.'

export const metadata: Metadata = {
  title: '블로그 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: {
    title: '블로그 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}

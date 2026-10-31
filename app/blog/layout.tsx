import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'

// /blog 목록은 클라이언트 컴포넌트라 metadata 를 내보낼 수 없다 — 레이아웃에서 단다.
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

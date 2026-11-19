import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'

// 이 페이지는 클라이언트 컴포넌트라 metadata 를 내보낼 수 없다 — 레이아웃에서 단다
const DESCRIPTION =
  '동양서예협회는 창작자의 저작권을 존중하고 보호합니다. 협회 웹사이트에 실린 작품 이미지와 글의 이용 원칙을 안내합니다.'

export const metadata: Metadata = {
  title: '저작권 정책 | 동양서예협회',
  description: DESCRIPTION,
  alternates: { canonical: '/copyright-policy' },
  openGraph: {
    title: '저작권 정책 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

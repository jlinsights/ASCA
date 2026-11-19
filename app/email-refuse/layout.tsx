import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'

// 이 페이지는 클라이언트 컴포넌트라 metadata 를 내보낼 수 없다 — 레이아웃에서 단다
const DESCRIPTION =
  '동양서예협회는 이메일 주소의 무단 수집을 엄격히 금지합니다. 웹사이트에 게시된 이메일 주소를 자동 수집 프로그램으로 모으는 행위를 거부합니다.'

export const metadata: Metadata = {
  title: '이메일 무단수집 거부 | 동양서예협회',
  description: DESCRIPTION,
  alternates: { canonical: '/email-refuse' },
  openGraph: {
    title: '이메일 무단수집 거부 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

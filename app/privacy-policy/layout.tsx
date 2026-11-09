import type { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'

// 이 페이지는 클라이언트 컴포넌트라 metadata 를 내보낼 수 없다 — 레이아웃에서 단다
const DESCRIPTION =
  '사단법인 동양서예협회 개인정보처리방침입니다. 협회가 수집하는 개인정보의 항목, 이용 목적, 보유 기간과 정보주체의 권리를 안내합니다.'

export const metadata: Metadata = {
  title: '개인정보처리방침 | 동양서예협회',
  description: DESCRIPTION,
  alternates: { canonical: '/privacy-policy' },
  openGraph: {
    title: '개인정보처리방침 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

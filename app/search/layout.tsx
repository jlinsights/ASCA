import type { Metadata } from 'next'

// 검색 결과 화면은 검색어마다 내용이 달라 색인하지 않는다. 결과 속 링크는 따라가게 둔다
export const metadata: Metadata = {
  title: '검색 | 동양서예협회',
  robots: { index: false, follow: true },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}

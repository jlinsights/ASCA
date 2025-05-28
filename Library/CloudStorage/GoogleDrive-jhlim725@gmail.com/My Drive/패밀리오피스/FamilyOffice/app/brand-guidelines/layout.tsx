import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '브랜드 가이드라인 | 패밀리오피스',
  description: '일관된 사용자 경험을 위한 디자인 시스템과 브랜드 가이드라인입니다. 색상 팔레트, 타이포그래피, UI 컴포넌트 등을 포함합니다.',
  keywords: ['브랜드 가이드라인', '디자인 시스템', 'UI 컴포넌트', '색상 팔레트', '타이포그래피'],
  openGraph: {
    title: '브랜드 가이드라인 | 패밀리오피스',
    description: '일관된 사용자 경험을 위한 디자인 시스템과 브랜드 가이드라인',
    type: 'website',
  },
}

export default function BrandGuidelinesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
} 
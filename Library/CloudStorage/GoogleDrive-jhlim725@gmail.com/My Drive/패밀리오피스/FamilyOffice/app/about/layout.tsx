import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '소개 | 패밀리오피스 S',
  description: '패밀리오피스 S는 대한민국 상위 1% 자산가를 위한 전문적인 자산관리 및 투자 자문 서비스를 제공합니다. 신뢰할 수 있는 파트너로서 고객의 자산 보호와 성장을 지원합니다.',
  keywords: ['패밀리오피스', '자산관리', '투자자문', '상속설계', '세무컨설팅', '부동산투자', '대한민국', '프리미엄서비스'],
  openGraph: {
    title: '소개 | 패밀리오피스 S',
    description: '대한민국 상위 1% 자산가를 위한 전문적인 자산관리 서비스',
    type: 'website',
  },
}

export default function AboutLayout({
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
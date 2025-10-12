import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import galleryData from '@/lib/data/gallery-data.json'
import { GalleryData } from '@/types/gallery'
import '@/styles/gallery.css'

// 동적 임포트로 성능 최적화
const GalleryClient = dynamic(() => import('@/components/gallery/GalleryClient'), {
  loading: () => <GalleryLoadingSkeleton />
})

// 로딩 스켈레톤 컴포넌트
function GalleryLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* 헤더 스켈레톤 */}
      <div className="text-center space-y-4">
        <div className="h-8 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
      </div>

      {/* 검색 바 스켈레톤 */}
      <div className="max-w-md mx-auto">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* 카테고리 필터 스켈레톤 */}
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-full w-24 animate-pulse" />
        ))}
      </div>

      {/* 그리드 스켈레톤 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}

// 에러 경계 컴포넌트
function GalleryErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
        📷
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">갤러리를 불러올 수 없습니다</h2>
      <p className="text-gray-600 mb-4">잠시 후 다시 시도해주세요.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}

// 현대적인 갤러리 통계 컴포넌트
function GalleryStats({ data }: { data: GalleryData }) {
  const stats = [
    {
      icon: '📸',
      value: data.metadata.totalImages,
      label: '총 이미지 수',
      description: '다양한 활동 기록',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      icon: '📂',
      value: data.categories.length,
      label: '카테고리',
      description: '다양한 분류',
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100'
    },
    {
      icon: '📅',
      value: new Date(data.metadata.lastUpdated).getFullYear(),
      label: '최신 연도',
      description: '업데이트됨',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100'
    },
    {
      icon: '⭐',
      value: '95%',
      label: '품질',
      description: '최고 화질',
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`relative group cursor-default transform transition-all duration-300 hover:scale-105 hover:-translate-y-2`}
        >
          {/* 카드 배경 */}
          <div className={`relative p-6 bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50`}>
            {/* 아이콘 */}
            <div className="text-3xl mb-3 text-center group-hover:scale-110 transition-transform duration-300">
              {stat.icon}
            </div>
            
            {/* 값 */}
            <div className={`text-3xl font-bold text-center bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
              {stat.value}
            </div>
            
            {/* 라벨 */}
            <div className="text-sm font-semibold text-gray-700 text-center mb-1">
              {stat.label}
            </div>
            
            {/* 설명 */}
            <div className="text-xs text-gray-500 text-center">
              {stat.description}
            </div>

            {/* 호버 효과 오버레이 */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </div>

          {/* 그림자 효과 */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-20 blur-xl scale-110 group-hover:opacity-30 transition-all duration-300 rounded-2xl -z-10`}></div>
        </div>
      ))}
    </div>
  )
}

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* 리디렉션 안내 */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center text-white space-y-8">
            <div className="text-6xl mb-6">🎨</div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              갤러리가 메인 페이지로 이동했습니다
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
              동양서예협회의 다양한 활동과 순간들을 담은 갤러리가 메인 페이지로 이동했습니다
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
              <p className="text-blue-100/90 text-lg leading-relaxed">
                서예 작품, 전시회 현장, 심사위원회 활동, 휘호대회, 시상식, 기념사진 등<br />
                265개의 고화질 이미지가 <strong className="text-white">메인 페이지</strong>에서 바로 확인하실 수 있습니다.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                메인 갤러리로 이동
              </Link>
              
              <Link 
                href="/about-organization"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                협회 소개
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 변경사항 설명 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">다양한 활동 기록</h3>
            <p className="text-gray-600">
              서예 작품부터 전시회, 행사, 기념식까지 모든 순간
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">빠른 접근</h3>
            <p className="text-gray-600">
              사이트 접속 즉시 모든 활동 사진을 바로 확인할 수 있습니다
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">체계적 분류</h3>
            <p className="text-gray-600">
              작품, 전시회, 심사위원회, 휘호대회 등 카테고리별 정리
            </p>
          </div>
        </div>
      </div>

      {/* SEO 및 메타데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": "동양서예협회 갤러리",
            "description": "동양서예협회의 서예 작품, 전시회, 심사위원회, 휘호대회, 시상식 등 다양한 활동 기록 갤러리",
            "url": "https://asca-main-orkqns499-jlinsights-projects.vercel.app/gallery",
            "image": galleryData.items.slice(0, 5).map(item => ({
              "@type": "ImageObject",
              "name": item.title,
              "description": item.description,
              "url": `https://asca-main-orkqns499-jlinsights-projects.vercel.app${item.src}`,
              "thumbnailUrl": `https://asca-main-orkqns499-jlinsights-projects.vercel.app${item.thumbnail}`
            })),
            "numberOfItems": galleryData.metadata.totalImages,
            "dateModified": galleryData.metadata.lastUpdated
          })
        }}
      />
    </main>
  )
}

// 메타데이터 내보내기 (리디렉션 페이지)
export const metadata = {
  title: '갤러리 페이지 이동 안내 | 동양서예협회',
  description: '동양서예협회 갤러리가 메인 페이지로 이동했습니다. 서예 작품, 전시회, 심사위원회, 휘호대회, 시상식 등 265개의 다양한 활동 사진을 메인 페이지에서 확인하세요.',
  keywords: ['서예', '갤러리', '동양서예', '전시회', '휘호대회', '심사위원회', '시상식', '기념사진', '리디렉션', '메인페이지'],
  openGraph: {
    title: '갤러리 페이지 이동 안내 | 동양서예협회',
    description: '서예 작품부터 전시회, 심사위원회, 휘호대회, 시상식까지 다양한 활동을 담은 갤러리가 메인 페이지로 이동했습니다.',
    type: 'website'
  }
}
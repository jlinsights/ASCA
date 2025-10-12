import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import galleryData from '@/lib/data/gallery-data.json'
import { GalleryData } from '@/types/gallery'

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

// 갤러리 통계 컴포넌트
function GalleryStats({ data }: { data: GalleryData }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{data.metadata.totalImages}</div>
        <div className="text-sm text-blue-800">총 작품 수</div>
      </div>
      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
        <div className="text-2xl font-bold text-green-600">{data.categories.length}</div>
        <div className="text-sm text-green-800">카테고리</div>
      </div>
      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">
          {new Date(data.metadata.lastUpdated).getFullYear()}
        </div>
        <div className="text-sm text-purple-800">최신 연도</div>
      </div>
      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
        <div className="text-2xl font-bold text-orange-600">HD</div>
        <div className="text-sm text-orange-800">고화질</div>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  const data = galleryData as GalleryData

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              동양서예협회 갤러리
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              서예 작품과 협회 활동을 한눈에 감상하세요. 
              위원회 회의, 서예 대회, 초대 작가 작품 등 다양한 갤러리를 제공합니다.
            </p>
            <div className="mt-6 text-sm text-gray-500">
              마지막 업데이트: {new Date(data.metadata.lastUpdated).toLocaleDateString('ko-KR')}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 갤러리 통계 */}
        <GalleryStats data={data} />

        {/* 갤러리 그리드 */}
        <Suspense fallback={<GalleryLoadingSkeleton />}>
          <GalleryClient data={data} />
        </Suspense>
      </div>

      {/* SEO 및 메타데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": "동양서예협회 갤러리",
            "description": "동양서예협회의 서예 작품과 활동 사진 갤러리",
            "url": "https://asca-main-orkqns499-jlinsights-projects.vercel.app/gallery",
            "image": data.items.slice(0, 5).map(item => ({
              "@type": "ImageObject",
              "name": item.title,
              "description": item.description,
              "url": `https://asca-main-orkqns499-jlinsights-projects.vercel.app${item.src}`,
              "thumbnailUrl": `https://asca-main-orkqns499-jlinsights-projects.vercel.app${item.thumbnail}`
            })),
            "numberOfItems": data.metadata.totalImages,
            "dateModified": data.metadata.lastUpdated
          })
        }}
      />
    </main>
  )
}

// 메타데이터 내보내기 (App Router)
export const metadata = {
  title: '갤러리 | 동양서예협회',
  description: `동양서예협회의 서예 작품과 활동 사진을 감상하세요. 총 ${galleryData.metadata.totalImages}개의 고화질 이미지를 제공합니다.`,
  keywords: ['서예', '갤러리', '동양서예', '서예작품', '전시회', '서예대회'],
  openGraph: {
    title: '갤러리 | 동양서예협회',
    description: `${galleryData.metadata.totalImages}개의 서예 작품과 활동 사진`,
    type: 'website',
    images: galleryData.items.slice(0, 4).map(item => ({
      url: item.thumbnail,
      alt: item.title
    }))
  }
}
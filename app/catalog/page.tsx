"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PageFlip } from "@/components/page-flip/page-flip"
import { CatalogPage as PageContent } from "@/components/page-flip/catalog-page"
import { CatalogCover } from "@/components/page-flip/catalog-cover"
import { useLanguage } from "@/contexts/language-context"
import { useEffect, useState } from "react"

// 샘플 작품 데이터
const artworks = [
  {
    title: "찰나의 아름다움",
    artist: "엠마 윌리엄스",
    year: "2023",
    medium: "혼합 매체",
    dimensions: "100 x 150 cm",
    description: "이 작품은 자연과 기술의 교차점을 탐구하며, 디지털 시대에 자연과의 관계를 재고하도록 초대합니다.",
    imageSrc: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "감정적 지형",
    artist: "사라 애덤스",
    year: "2022",
    medium: "캔버스에 아크릴",
    dimensions: "120 x 180 cm",
    description: "대담한 색상과 역동적인 붓놀림을 통해 감정적 풍경을 담아낸 대형 추상화입니다.",
    imageSrc: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "기억의 그릇",
    artist: "카를로스 디아즈",
    year: "2021",
    medium: "재활용 재료, 혼합 매체",
    dimensions: "80 x 60 x 40 cm",
    description: "정체성, 기억, 문화적 유산의 주제를 탐구하는 조각 작품입니다.",
    imageSrc: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "디지털 와비-사비",
    artist: "타카하시 유키코",
    year: "2023",
    medium: "디지털 프린트",
    dimensions: "100 x 100 cm",
    description: "전통적인 일본 미학과 현대 디지털 기술을 혼합한 작품입니다.",
    imageSrc: "/placeholder.svg?height=400&width=300",
  },
  {
    title: "소닉 필드",
    artist: "빌헬름 쿠퍼",
    year: "2022",
    medium: "사운드 설치, 혼합 매체",
    dimensions: "가변 크기",
    description: "인간의 존재와 환경 조건에 반응하는 인터랙티브 설치 작품입니다.",
    imageSrc: "/placeholder.svg?height=400&width=300",
  },
]

export default function CatalogPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <p>{t("loadingCatalog")}</p>
        </div>
        <Footer />
      </main>
    )
  }

  const catalogPages = [
    // 표지
    <CatalogCover
      key="cover"
      title="갤러리아 도록"
      subtitle="찰나의 아름다움 전시회"
      date="2023년 봄"
      publisher="갤러리아 출판"
      imageSrc="/placeholder.svg?height=400&width=300"
    />,

    // 소개 페이지
    <PageContent key="intro">
      <div className="h-full p-4">
        <h2 className="text-2xl font-bold mb-6 text-celadon-green">전시 소개</h2>
        <p className="mb-4">
          찰나의 아름다움 전시회는 우리 세계에서 아름다움의 일시적인 특성을 탐구합니다. 사진, 조각, 디지털 아트 등
          다양한 매체를 통해 예술가들은 우리의 관심을 사로잡고 감정을 불러일으키는 순간적인 순간들을 반영합니다.
        </p>
        <p className="mb-4">
          이번 전시는 5명의 국제적인 예술가들이 참여하여 각자의 독특한 시각과 기법으로 '찰나'라는 주제를 해석합니다.
          관람객들은 순간의 아름다움을 포착하고 영원히 기억에 남는 예술 작품들을 경험하게 될 것입니다.
        </p>
        <p>
          갤러리아는 이번 전시를 통해 관람객들이 일상에서 지나치기 쉬운 순간적인 아름다움에 주목하고, 그 가치를
          재발견하는 기회를 제공하고자 합니다.
        </p>
      </div>
    </PageContent>,

    // 작품 페이지들
    ...artworks.map((artwork, index) => (
      <PageContent
        key={`artwork-${index}`}
        title={artwork.title}
        artist={artwork.artist}
        year={artwork.year}
        medium={artwork.medium}
        dimensions={artwork.dimensions}
        description={artwork.description}
        imageSrc={artwork.imageSrc}
        imageAlt={artwork.title}
      />
    )),

    // 마지막 페이지
    <PageContent key="last">
      <div className="h-full flex flex-col justify-center items-center p-4">
        <h2 className="text-2xl font-bold mb-6 text-celadon-green">감사합니다</h2>
        <p className="text-center mb-8">갤러리아의 '찰나의 아름다움' 전시회 도록을 감상해 주셔서 감사합니다.</p>
        <div className="text-sm text-center">
          <p>© 2023 갤러리아</p>
          <p>모든 작품의 저작권은 해당 작가에게 있습니다.</p>
          <p>www.galleria.com</p>
        </div>
      </div>
    </PageContent>,
  ]

  return (
    <main className="min-h-screen">
      <Header />

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("onlineCatalog")}</h1>
          <p className="text-lg">{t("catalogDescription")}</p>
        </div>

        <div className="flex justify-center">
          <PageFlip pages={catalogPages} width={550} height={750} title="갤러리아_찰나의_아름다움_도록" />
        </div>
      </section>

      <Footer />
    </main>
  )
}

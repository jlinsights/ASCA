import { Metadata } from 'next'
import { defaultSEO } from '@/lib/seo-constants'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { ApplicationView } from './_components/application-view'
import { localizedPageMetadata } from '@/lib/seo/localized-metadata'
import '@/components/apply/apply.css'
import '@/components/apply/support.css'
const DESCRIPTION =
  '대한민국 동양서예대전 출품원서를 온라인으로 작성하거나 Word·PDF 양식으로 제출하세요. 공모 부문과 작품 규격, 출품비, 심사 방식, 시상 내역을 규정 원문과 함께 안내합니다.'

const metadata: Metadata = {
  alternates: { canonical: '/application' },
  title: '출품원서 | 동양서예협회',
  description: DESCRIPTION,
  // openGraph 를 쓰면 레이아웃의 openGraph 를 통째로 덮는다 — 이미지도 여기서 다시 단다
  openGraph: {
    title: '출품원서 | 동양서예협회',
    description: DESCRIPTION,
    images: [defaultSEO.image],
  },
}

export default function ApplicationPage() {
  return (
    <div className='asca-apply min-h-screen'>
      <ApplicationView />
      <LayoutFooter />
    </div>
  )
}

// 언어 주소(/en·/ja·/zh)는 제목·설명·canonical·hreflang 을 그 언어로 바꾼다
export const generateMetadata = localizedPageMetadata('/application', metadata)

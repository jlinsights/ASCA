import { Metadata } from 'next'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { BrandSidebar } from './_components/brand-sidebar'
import { BrandIdentity } from './_components/brand-identity'
import { LogoIdentity } from './_components/logo-identity'
import { ColorPalette } from './_components/color-palette'
import { BrandTagline, BrandSlogan } from './_components/brand-messaging'

export const metadata: Metadata = {
  title: '브랜드 가이드라인 | 동양서예협회',
  description:
    '사단법인 동양서예협회의 브랜드와 로고 사용 가이드라인을 소개합니다. 로고의 기본 요소, 최소 사용 크기, 여백 규정, 색상 가이드라인, 금지 규정 등 브랜드 아이덴티티 보호를 위한 세부 지침을 확인하실 수 있습니다.',
  openGraph: {
    title: '동양서예 브랜드와 로고 사용 가이드',
    description:
      '사단법인 동양서예협회의 브랜드와 로고 사용 가이드라인을 소개합니다. 협회의 정체성과 가치를 담은 로고의 의미와 올바른 활용 방법을 안내합니다.',
    images: [
      {
        url: 'https://imagedelivery.net/iELritu8tmGaSR8tZ-NWcg/561446ce-48df-41cf-c8d8-ac7427ed2600/Contain',
      },
    ],
  },
}

export default function BrandPage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm font-medium tracking-widest text-scholar-red uppercase mb-3'>
            Brand Guidelines
          </p>
          <h1 className='text-3xl md:text-4xl font-bold mb-4'>브랜드 가이드라인</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            사단법인 동양서예협회의 브랜드 아이덴티티, 로고 사용 규정, 컬러 팔레트, 태그라인 및
            슬로건 활용 지침을 안내합니다.
          </p>
          <p className='mt-3 text-sm italic text-scholar-red/80'>
            &ldquo;正法의 계승 발전과 創新의 조화로운 구현&rdquo;
          </p>
        </div>
      </section>

      <section className='container mx-auto px-4 py-8 md:py-12'>
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
          <BrandSidebar />
          <main className='flex-1 min-w-0 space-y-16'>
            <BrandIdentity />
            <LogoIdentity />
            <ColorPalette />
            <BrandTagline />
            <BrandSlogan />
          </main>
        </div>
      </section>

      <LayoutFooter />
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { LayoutFooter } from '@/components/layout/layout-footer'
import { TaiwanTripFlipbook } from '@/components/programs/taiwan-trip-flipbook'
import { PageHero } from '@/components/layout/page-hero'
import { PAGE_HERO_MARKS } from '@/components/layout/page-hero-marks'

/**
 * 문화교류 — 실제로 다녀온 교류 기록(대만 방문 자료집)만 싣는다.
 * 예전 목록은 규정에 없는 회원 등급('고급 실습생'·'인증 서예가')과 참가비, 2025년에 끝난 "모집 중" 마감일,
 * 확인되지 않은 협력 단체를 붙인 샘플 프로그램이었고, "지금 신청하기" 버튼은 아무 일도 하지 않았다.
 */

const DESCRIPTION =
  '동양서예협회의 국제 문화교류 기록입니다. 한·중·일 연합전과 해외 교류전시는 협회 정관 제4조의 사업으로, 지난 교류 자료와 역대 교류전 기록을 안내합니다.'

export const metadata: Metadata = {
  title: '문화교류 | 동양서예협회',
  description: DESCRIPTION,
  openGraph: { title: '문화교류 | 동양서예협회', description: DESCRIPTION },
}

const linkStyle = 'underline underline-offset-4'

export default function CulturalExchangePage() {
  return (
    <div className='min-h-screen bg-transparent'>
      <PageHero
        {...PAGE_HERO_MARKS.culturalExchange}
        title='문화교류'
        lede='한·중·일 연합전과 국내외 교류전시는 협회가 정관으로 정한 사업입니다. 지난 교류의 기록을 모았습니다.'
      />

      <div className='container mx-auto space-y-10 px-4 py-10 md:py-16'>
        <TaiwanTripFlipbook />
        <p className='max-w-2xl text-sm leading-relaxed text-muted-foreground'>
          역대 한·중·일 교류전 기록은{' '}
          <Link href='/history' className={linkStyle}>
            연혁
          </Link>
          과{' '}
          <Link href='/exhibitions/past' className={linkStyle}>
            지난 전시
          </Link>
          에서, 교류 단체는{' '}
          <Link href='/partners' className={linkStyle}>
            유관단체
          </Link>
          에서 볼 수 있습니다.
        </p>
      </div>

      <LayoutFooter />
    </div>
  )
}

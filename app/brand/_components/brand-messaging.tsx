import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

const TAGLINE_LOGO_URL =
  'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC%20%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%86%E1%85%AE%E1%86%AB%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9%20%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B3%E1%86%B7/Logo%20%26%20Tagline_black%20BG.png'

const SLOGAN_LOGO_URL =
  'https://pub-918cc20d48bd44a29913d2bf8f72a874.r2.dev/%E1%84%83%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%A3%E1%86%BC%E1%84%89%E1%85%A5%E1%84%8B%E1%85%A8%E1%84%92%E1%85%A7%E1%86%B8%E1%84%92%E1%85%AC%20%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%86%E1%85%AE%E1%86%AB%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9%20%E1%84%86%E1%85%A9%E1%84%8B%E1%85%B3%E1%86%B7/Logo%20%26%20Slogan_black%20BG.png'

const TAGLINE_USAGES = [
  {
    title: '공식 문서 활용',
    items: [
      { label: '레터헤드', text: '공문서 상단 로고 하단에 정렬하여 배치' },
      { label: '명함', text: '로고와 함께 명함 전면 하단 또는 후면 중앙에 배치' },
      { label: '이메일 서명', text: '로고 아래 작은 크기로 일관되게 사용' },
      { label: '프레스 릴리스', text: '첫 페이지 헤더 영역에 반드시 포함' },
    ],
  },
  {
    title: '디지털 미디어 적용',
    items: [
      { label: '웹사이트 헤더', text: '랜딩 페이지 히어로 섹션에 강조하여 표시' },
      { label: '소셜 미디어', text: '프로필 소개와 주요 캠페인 이미지에 통합' },
      { label: '디지털 광고', text: '브랜드 메시지의 마무리로 활용' },
      { label: '프레젠테이션', text: '타이틀 슬라이드와 엔딩 슬라이드에 포함' },
    ],
  },
  {
    title: '디자인 가이드라인',
    items: [
      { label: '여백 규정', text: '로고와 최소 20px(또는 로고 높이의 1/3) 간격 유지' },
      { label: '비율', text: '텍스트 크기는 로고의 1/3 이하로 설정' },
      { label: '서체', text: 'Brandon Grotesque 또는 Montserrat 산세리프체 사용' },
      { label: '컬러', text: '로고와 동일한 색상 사용, 배경에 따라 흰색/검정 전환' },
    ],
  },
]

const SLOGAN_USAGES = [
  {
    title: '마케팅 활용',
    items: [
      { label: 'SNS 캠페인', text: '해시태그(#ArtistryInEveryStroke)와 함께 활용' },
      { label: '광고 카피', text: '주요 광고의 헤드라인이나 클로징 메시지로 사용' },
      { label: '프로모션', text: '시즌별 마케팅 캠페인의 핵심 메시지로 활용' },
      { label: '브랜드 스토리텔링', text: '콘텐츠 마케팅의 일관된 주제로 발전' },
    ],
  },
  {
    title: '제품 및 서비스 적용',
    items: [
      { label: '제품 패키지', text: '고급 서예 용품 패키지의 디자인 요소로 통합' },
      { label: '교육 프로그램', text: '워크샵과 강좌의 주제로 활용' },
      { label: '공간 디자인', text: '전시장, 교실, 스튜디오의 벽면 그래픽으로 적용' },
      { label: '기념품 및 굿즈', text: '티셔츠, 토트백, 문구류 등의 디자인 포인트' },
    ],
  },
  {
    title: '다국어 및 지역 적용',
    items: [
      { label: '한국어', text: '"삶의 모든 획에 예술을 담다"' },
      { label: '중국어', text: '"笔墨人生，艺术常在"' },
      { label: '일본어', text: '"人生の一筆一筆に芸術を込めて"' },
      { label: '지역별 변형', text: '문화적 맥락에 맞게 의미를 유지하며 지역화' },
    ],
  },
]

interface MessagingSectionProps {
  id: string
  title: string
  quote: string
  description: string
  logoUrl: string
  logoAlt: string
  usages: typeof TAGLINE_USAGES
}

function MessagingSection({
  id,
  title,
  quote,
  description,
  logoUrl,
  logoAlt,
  usages,
}: MessagingSectionProps) {
  return (
    <section id={id} className='scroll-mt-24'>
      <h2 className='text-2xl font-bold mb-6'>{title}</h2>

      <Card className='overflow-hidden mb-6'>
        <div className='relative w-full bg-neutral-900 flex items-center justify-center p-8 md:p-12'>
          <Image
            src={logoUrl}
            alt={logoAlt}
            width={600}
            height={300}
            className='max-w-full h-auto object-contain'
            unoptimized
          />
        </div>
        <CardContent className='p-5 md:p-6 text-center'>
          <p className='text-lg md:text-xl font-semibold italic text-scholar-red mb-3'>
            &ldquo;{quote}&rdquo;
          </p>
          <p className='text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto'>
            {description}
          </p>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {usages.map(usage => (
          <Card key={usage.title}>
            <CardContent className='p-5'>
              <h3 className='font-bold text-sm mb-3'>{usage.title}</h3>
              <ul className='space-y-2'>
                {usage.items.map(item => (
                  <li key={item.label} className='flex gap-2 text-sm'>
                    <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-scholar-red/60' />
                    <div>
                      <strong className='text-foreground text-xs'>{item.label}:</strong>{' '}
                      <span className='text-muted-foreground text-xs'>{item.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

export function BrandTagline() {
  return (
    <MessagingSection
      id='tagline'
      title='태그라인'
      quote='Where Tradition Flows Contemporary'
      description="이 태그라인은 동양서예협회의 핵심 철학을 담고 있습니다. 수천 년의 전통이 현대적 흐름 속에서 자연스럽게 이어지는 모습을 '흐름(Flow)'이라는 동적 표현으로 형상화했습니다."
      logoUrl={TAGLINE_LOGO_URL}
      logoAlt='Oriental Calligraphy Logo with Tagline'
      usages={TAGLINE_USAGES}
    />
  )
}

export function BrandSlogan() {
  return (
    <MessagingSection
      id='slogan'
      title='슬로건'
      quote='Artistry in Every Stroke of Life'
      description='이 슬로건은 서예를 단순한 예술 형식을 넘어 삶의 철학으로 확장합니다. 매 붓 획(Stroke)이 예술성을 담고 있듯, 우리 삶의 모든 순간과 행동에도 예술적 의미와 아름다움이 깃들어 있음을 표현합니다.'
      logoUrl={SLOGAN_LOGO_URL}
      logoAlt='Oriental Calligraphy Logo with Slogan'
      usages={SLOGAN_USAGES}
    />
  )
}

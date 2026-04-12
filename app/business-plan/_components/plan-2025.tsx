import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, Palette, Monitor, TrendingUp, Sparkles, Calendar } from 'lucide-react'

const VISION_ITEMS = [
  '서예의 정신을 계승하되, 현대미술과의 융합을 통한 새로운 미학 창조',
  '동양적 정신성과 현대적 감각의 조화를 추구하는 예술가들의 플랫폼 구축',
  '전통과 현대의 조화로운 융합을 통한 새로운 예술 가치 창출',
]

const STRATEGY_ITEMS = [
  'Contemporary Asian Art 플랫폼 구축',
  '디지털 전환을 통한 온라인 전시/판매 활성화',
  '국제 교류 확대 및 글로벌 네트워크 구축',
  '신진 작가 발굴 및 육성 프로그램 강화',
]

const EXHIBITIONS = [
  {
    period: '상반기 (6월)',
    title: '제22회 대한민국 동양서예대전 및 동양서예초대작가전',
    items: [
      'Contemporary Asian Art 섹션 신설',
      '디지털 캘리그래피 특별전',
      'AR 기반 인터랙티브 전시',
      '국제 심포지엄 개최',
    ],
  },
  {
    period: '하반기 (10월)',
    title: '초대작가 회원연합전 - "전통과 현대의 대화"',
    items: [
      '미디어아트 융합 전시',
      '설치미술 프로젝트',
      '국제 아티스트 콜라보레이션',
      'VR 갤러리 동시 운영',
    ],
  },
]

const INCOME = [
  { label: '회비수입', amount: '₩7,589,496' },
  { label: '출품료수입', amount: '₩29,377,110' },
  { label: '등록비수입', amount: '₩264,000' },
  { label: '후원 및 기타수입', amount: '₩21,000,000' },
]

const EXPENSES = [
  { label: '전시사업비', amount: '₩28,800,797' },
  { label: '운영비', amount: '₩21,165,961' },
  { label: '회원지원비', amount: '₩5,000,000' },
  { label: '예비비', amount: '₩2,500,000' },
]

const EXPECTED_EFFECTS = [
  '동양 예술의 현대적 재해석과 새로운 가치 창출',
  '글로벌 아트 시장에서의 입지 강화',
  '디지털 전환을 통한 새로운 수익 모델 창출',
  '신진 작가 육성을 통한 예술 생태계 활성화',
  '전통과 현대의 조화를 통한 문화적 가치 확산',
]

export function Plan2025() {
  return (
    <div className='space-y-6'>
      <Card className='border-scholar-red/20 bg-gradient-to-br from-scholar-red/5 to-transparent'>
        <CardContent className='p-5 md:p-6 text-center'>
          <Badge variant='outline' className='mb-3 border-scholar-red/40 text-scholar-red'>
            2025
          </Badge>
          <h3 className='text-xl font-bold mb-1'>2025년도 사업계획서</h3>
          <p className='text-sm text-muted-foreground mb-3'>동양서예협회</p>
          <p className='text-sm italic text-scholar-red'>
            &ldquo;전통과 현대를 잇는 동양미학 예술 플랫폼&rdquo;
          </p>
          <p className='text-xs text-muted-foreground mt-1'>동양의 혼, 현대의 감각</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Target className='h-5 w-5 text-scholar-red' />
            I. 비전 및 전략 목표
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <h4 className='text-sm font-semibold mb-2'>핵심 비전</h4>
            <ul className='space-y-1.5'>
              {VISION_ITEMS.map(item => (
                <li key={item} className='flex gap-2 text-sm text-muted-foreground'>
                  <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-scholar-red/60' />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className='text-sm font-semibold mb-2'>전략적 목표</h4>
            <ul className='space-y-1.5'>
              {STRATEGY_ITEMS.map(item => (
                <li key={item} className='flex gap-2 text-sm text-muted-foreground'>
                  <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500/60' />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Palette className='h-5 w-5 text-scholar-red' />
            II. 주요 사업 계획
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <h4 className='text-sm font-semibold'>1. 전시 프로그램</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {EXHIBITIONS.map(ex => (
              <div key={ex.period} className='rounded-lg border p-4 bg-muted/30'>
                <div className='flex items-center gap-2 mb-2'>
                  <Calendar className='h-4 w-4 text-scholar-red' />
                  <span className='text-sm font-semibold'>{ex.period}</span>
                </div>
                <p className='text-sm mb-2'>{ex.title}</p>
                <ul className='space-y-1'>
                  {ex.items.map(item => (
                    <li key={item} className='flex gap-2 text-xs text-muted-foreground'>
                      <span className='mt-1 h-1 w-1 shrink-0 rounded-full bg-scholar-red/50' />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h4 className='text-sm font-semibold pt-2'>2. Art Lab & 레지던시 프로그램</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div className='rounded-lg border p-4 bg-muted/30'>
              <p className='text-sm font-semibold mb-2'>Artist Residency</p>
              <ul className='space-y-1'>
                {[
                  '국내외 작가 교류 프로그램 운영',
                  '실험적 프로젝트 제작 지원',
                  '융합 작품 제작 지원',
                ].map(item => (
                  <li key={item} className='flex gap-2 text-xs text-muted-foreground'>
                    <span className='mt-1 h-1 w-1 shrink-0 rounded-full bg-scholar-red/50' />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className='rounded-lg border p-4 bg-muted/30'>
              <p className='text-sm font-semibold mb-2'>Art Lab 운영</p>
              <ul className='space-y-1'>
                {[
                  '디지털 기술 접목 연구 공간',
                  '신소재 실험 작업실 운영',
                  '협업 프로젝트 공간 제공',
                ].map(item => (
                  <li key={item} className='flex gap-2 text-xs text-muted-foreground'>
                    <span className='mt-1 h-1 w-1 shrink-0 rounded-full bg-scholar-red/50' />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h4 className='text-sm font-semibold pt-2'>
            <Monitor className='inline h-4 w-4 mr-1 text-scholar-red' />
            3. 디지털 플랫폼 구축
          </h4>
          <ul className='space-y-1.5'>
            {[
              '온라인 갤러리 플랫폼 개편',
              'NFT 아트 마켓플레이스 구축',
              'AR/VR 전시 시스템 도입',
              '작가 포트폴리오 플랫폼 확대',
            ].map(item => (
              <li key={item} className='flex gap-2 text-sm text-muted-foreground'>
                <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-scholar-red/60' />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <TrendingUp className='h-5 w-5 text-scholar-red' />
            III. 예산 계획
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='rounded-lg border p-4'>
              <h4 className='text-sm font-semibold mb-3'>수입 계획 (₩58,230,606)</h4>
              <div className='space-y-2'>
                {INCOME.map(item => (
                  <div key={item.label} className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>{item.label}</span>
                    <span className='font-mono text-xs'>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='rounded-lg border p-4'>
              <h4 className='text-sm font-semibold mb-3'>지출 계획 (₩57,466,758)</h4>
              <div className='space-y-2'>
                {EXPENSES.map(item => (
                  <div key={item.label} className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>{item.label}</span>
                    <span className='font-mono text-xs'>{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='mt-4 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center'>
            <span className='text-sm font-semibold text-green-600 dark:text-green-400'>
              예상 순수지: ₩763,848
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Sparkles className='h-5 w-5 text-scholar-red' />
            IV. 기대 효과
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='space-y-2'>
            {EXPECTED_EFFECTS.map(item => (
              <li key={item} className='flex gap-2 text-sm text-muted-foreground'>
                <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-scholar-red/60' />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

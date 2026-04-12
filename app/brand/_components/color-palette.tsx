'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIMARY_COLORS, NEUTRAL_COLORS, type ColorSwatch } from './brand-data'

function SwatchCard({ color }: { color: ColorSwatch }) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(color.hex)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1500)
  }

  return (
    <button
      type='button'
      onClick={handleCopy}
      className='group relative flex flex-col overflow-hidden rounded-lg border transition-all hover:shadow-lg hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
    >
      <div className='h-20 w-full' style={{ backgroundColor: color.hex }} />
      <div className='flex flex-1 flex-col gap-1 p-3 text-left bg-card'>
        <span className='text-xs font-semibold truncate'>{color.name}</span>
        <span className='text-[11px] font-mono text-muted-foreground'>{color.hex}</span>
      </div>
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity',
          'group-hover:opacity-100'
        )}
      >
        {isCopied ? (
          <Check className='h-5 w-5 text-green-400' />
        ) : (
          <Copy className='h-4 w-4 text-white/80' />
        )}
      </div>
    </button>
  )
}

const COLOR_USAGE_GUIDES = [
  {
    title: '주요 컬러 활용',
    items: [
      { label: 'Ink Black', text: '기본 배경, 밝은 텍스트, 여백 강조' },
      { label: 'Rice Paper White', text: '로고, 주요 헤딩, 중요 텍스트' },
      { label: 'Celadon Green', text: '액센트, 버튼, 하이라이트, 포인트' },
      { label: 'Terra Red', text: '경고, 중요 알림, 특별 강조 요소' },
    ],
  },
  {
    title: '뉴트럴 컬러 활용',
    items: [
      { label: 'Neutral 100~300', text: '배경, 카드, 구분선, 여백' },
      { label: 'Neutral 400~500', text: '본문 텍스트, 부가 정보, 아이콘' },
      { label: 'Neutral 600~800', text: '헤딩, 강조 텍스트, 중요 UI 요소' },
      { label: '계층적 적용', text: '정보의 중요도에 따라 명도 차이를 둔 단계적 적용' },
    ],
  },
  {
    title: '컬러 조합 원칙',
    items: [
      { label: '대비와 가독성', text: 'WCAG 2.1 AA 기준 준수' },
      { label: '조화로운 조합', text: '최대 3개의 주요 컬러를 한 화면에서 조화롭게 사용' },
      { label: '의미적 일관성', text: '동일한 기능과 상태는 항상 같은 색상' },
      { label: '문화적 맥락', text: '동아시아 예술의 색채 미학을 고려' },
    ],
  },
]

export function ColorPalette() {
  return (
    <section id='color-palette' className='scroll-mt-24'>
      <h2 className='text-2xl font-bold mb-3'>컬러 팔레트</h2>
      <p className='text-muted-foreground mb-8 leading-relaxed'>
        동양서예협회의 컬러 팔레트는 동아시아 예술의 전통적 재료와 자연에서 영감을 받았습니다. 깊은
        먹색부터 종이의 따스함까지, 각 색상은 서예의 역사와 정신을 담고 있습니다. 색상을 클릭하면
        HEX 코드가 복사됩니다.
      </p>

      <h3 className='font-bold text-base mb-4 pl-3 border-l-4 border-scholar-red'>주요 컬러</h3>
      <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8'>
        {PRIMARY_COLORS.map(color => (
          <SwatchCard key={color.hex + color.name} color={color} />
        ))}
      </div>

      <h3 className='font-bold text-base mb-4 pl-3 border-l-4 border-scholar-red'>뉴트럴 컬러</h3>
      <div className='grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 mb-8'>
        {NEUTRAL_COLORS.map(color => (
          <SwatchCard key={color.hex + color.name} color={color} />
        ))}
      </div>

      <h3 className='font-bold text-base mb-4 pl-3 border-l-4 border-scholar-red'>
        컬러 사용 가이드라인
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {COLOR_USAGE_GUIDES.map(guide => (
          <Card key={guide.title}>
            <CardContent className='p-5'>
              <h4 className='font-bold text-sm mb-3'>{guide.title}</h4>
              <ul className='space-y-2'>
                {guide.items.map(item => (
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

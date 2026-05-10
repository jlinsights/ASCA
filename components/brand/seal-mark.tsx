/**
 * 협회 인장(印章) 모티프 — 동도(同道)
 *
 * Design: docs/02-design/features/asca-community-page-rollout.design.md §4
 * SSOT: .agents/community-marketing-playbook.md §1.1 (동도 호칭 정체성)
 *
 * 현재: text fallback (인주색 배경 + 한지색 한자 + 약간 회전).
 * 협회 작가 친필 인장 SVG 도착 시 이 파일 단일 교체.
 *
 * <HanjaMark> 옆 짝 — homepage Hero에 한자 표지가 있다면, /community Hero에는 SealMark.
 */

import { cn } from '@/lib/utils'

type SealMarkVariant = 'hero' | 'inline'

type SealMarkProps = {
  variant?: SealMarkVariant
  text?: string
  ariaLabel?: string
  className?: string
}

const VARIANT_CLASS: Record<SealMarkVariant, string> = {
  hero: 'w-16 h-16 md:w-20 md:h-20 text-2xl md:text-3xl rounded-sm',
  inline: 'w-10 h-10 text-base rounded-sm',
}

export function SealMark({
  variant = 'hero',
  text = '同道',
  ariaLabel = '협회 인장 동도',
  className,
}: SealMarkProps) {
  return (
    <span
      role='img'
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center font-serif font-medium leading-none',
        'bg-[color:var(--vermillion)] text-[color:var(--rice-paper,#f5f5f0)]',
        '-rotate-2 shadow-sm select-none',
        VARIANT_CLASS[variant],
        className
      )}
    >
      <span aria-hidden='true' className='tracking-tight'>
        {text}
      </span>
    </span>
  )
}

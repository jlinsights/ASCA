/**
 * 협회 한자 표지 — 法古創新 · 人書俱老
 *
 * Plan/Design: docs/02-design/features/asca-homepage-brand-rollout.design.md §4
 * SSOT: .agents/brand-guidelines.md (시각 표지)
 *
 * 현재: text fallback (Noto Serif CJK + DESIGN.md display-lg).
 * SVG 친필 자산(`public/brand/hanja-mark.svg`) 도착 후 이 파일 단일 교체로 대응.
 * 가운뎃점은 인주색(vermillion #e63946) — 한자 표지 유일한 컬러 액센트.
 */

import { cn } from '@/lib/utils'

type HanjaMarkVariant = 'hero' | 'header' | 'footer'
type HanjaMarkColor = 'ink' | 'paper' | 'inherit'

type HanjaMarkProps = {
  variant?: HanjaMarkVariant
  color?: HanjaMarkColor
  className?: string
  ariaLabel?: string
}

const VARIANT_CLASS: Record<HanjaMarkVariant, string> = {
  hero: 'text-5xl md:text-7xl lg:text-8xl tracking-[0.15em]',
  header: 'text-2xl md:text-3xl tracking-[0.12em]',
  footer: 'text-base md:text-lg tracking-[0.1em]',
}

const COLOR_CLASS: Record<HanjaMarkColor, string> = {
  ink: 'text-foreground',
  paper: 'text-background',
  inherit: 'text-inherit',
}

export function HanjaMark({
  variant = 'hero',
  color = 'ink',
  className,
  ariaLabel = '법고창신 인서구로',
}: HanjaMarkProps) {
  return (
    <span
      role='img'
      aria-label={ariaLabel}
      className={cn(
        'font-serif font-medium leading-none whitespace-nowrap',
        VARIANT_CLASS[variant],
        COLOR_CLASS[color],
        className
      )}
    >
      <span aria-hidden='true'>法古創新</span>
      <span
        aria-hidden='true'
        className='mx-3 md:mx-4 inline-block align-middle text-[color:var(--vermillion,#e63946)]'
      >
        ·
      </span>
      <span aria-hidden='true'>人書俱老</span>
    </span>
  )
}

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // 배지는 클릭 대상이 아니라 hover 배경을 두지 않는다. 배경을 className 으로 바꾼 배지
        // (bg-success/10 text-foreground 등)에 hover:bg-primary/80 이 남으면 hover 시 남색 면에
        // 글자가 묻힌다. 클릭되는 배지는 자기 className 에 hover 를 직접 준다.
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        traditional:
          'border-transparent bg-celadon-green text-ink-black hover:bg-sage-green transition-all duration-300',
        innovation:
          'border-transparent bg-sage-green text-ink-black hover:bg-celadon-green transition-all duration-300',
        special:
          'border-transparent bg-terra-red text-rice-paper hover:bg-terra-red/90 transition-all duration-300',
        neutral:
          'border-transparent bg-stone-gray text-rice-paper hover:bg-stone-gray/90 transition-all duration-300',
        rice: 'border-celadon-green bg-rice-paper text-ink-black hover:bg-celadon-green transition-all duration-300',
        ink: 'border-rice-paper bg-ink-black text-rice-paper hover:bg-ink-black/90 transition-all duration-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        traditional: "border-transparent bg-[#88A891] text-[#1a1a1a] hover:bg-[#B7C4B7] transition-all duration-300",
        innovation: "border-transparent bg-[#B7C4B7] text-[#1a1a1a] hover:bg-[#88A891] transition-all duration-300",
        special: "border-transparent bg-[#9B4444] text-[#f5f5f0] hover:bg-[#8a3a3a] transition-all duration-300",
        neutral: "border-transparent bg-[#707070] text-[#f5f5f0] hover:bg-[#5a5a5a] transition-all duration-300",
        rice: "border-[#88A891] bg-[#f5f5f0] text-[#1a1a1a] hover:bg-[#88A891] hover:text-[#f5f5f0] transition-all duration-300",
        ink: "border-[#f5f5f0] bg-[#1a1a1a] text-[#f5f5f0] hover:bg-[#2a2a2a] transition-all duration-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

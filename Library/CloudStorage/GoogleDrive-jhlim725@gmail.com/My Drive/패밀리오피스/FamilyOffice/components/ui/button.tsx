import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-fo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group",
  {
    variants: {
      variant: {
        primary: "bg-gradient-forest hover:bg-gradient-to-r hover:from-forest-600 hover:to-forest-700 text-white shadow-forest hover:shadow-forest-hover hover:scale-105",
        secondary: "glass-card border-2 border-navy-primary/20 hover:border-navy-primary text-navy-primary hover:bg-navy-primary hover:text-white shadow-soft hover:shadow-hover-light hover:scale-102",
        tertiary: "bg-gradient-bronze hover:bg-gradient-to-r hover:from-bronze-600 hover:to-bronze-700 text-white shadow-bronze hover:shadow-bronze-hover hover:scale-105",
        ghost: "hover:glass-card hover:scale-102 transition-fo",
        link: "text-forest-primary hover:text-gradient-forest underline-offset-4 hover:underline",
        default: "bg-gradient-brand hover:bg-gradient-to-r hover:from-navy-600 hover:to-forest-600 text-white shadow-brand hover:shadow-hover-brand hover:scale-105",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-medium hover:shadow-heavy hover:scale-105",
        outline: "glass-card border border-white/20 hover:border-white/40 hover:scale-102",
        subtle: "bg-white/10 hover:bg-white/20 backdrop-blur-sm text-navy-primary dark:text-white hover:scale-102",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    if (asChild) {
      // asChild일 때는 children을 그대로 전달 (Slot은 단일 React 엘리먼트만 허용)
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* 컨텐츠 */}
        <span className="relative z-10 flex items-center justify-center">
          {children}
        </span>
        
        {/* 글래스 샤인 효과 */}
        {variant !== "link" && variant !== "ghost" && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full"
            style={{ transition: 'transform 0.7s cubic-bezier(0.19, 1, 0.22, 1)' }}
          />
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

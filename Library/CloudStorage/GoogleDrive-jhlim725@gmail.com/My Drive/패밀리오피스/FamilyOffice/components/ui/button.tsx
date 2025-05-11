import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-sm text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-primary disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-burgundy-primary text-white hover:bg-burgundy-light shadow-medium hover:shadow-heavy",
        secondary:
          "border-2 border-navy-primary text-navy-primary hover:bg-navy-light hover:text-white shadow-light hover:shadow-medium",
        tertiary: "bg-gold-primary text-navy-primary hover:bg-gold-light shadow-light hover:shadow-medium",
        ghost: "hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary",
        link: "text-burgundy-primary underline-offset-4 hover:underline",
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        subtle: "bg-accent text-accent-foreground hover:bg-accent/80",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 py-1 text-xs",
        lg: "h-12 px-8 py-3 text-lg",
        icon: "h-10 w-10",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = "Button"

export { Button, buttonVariants }

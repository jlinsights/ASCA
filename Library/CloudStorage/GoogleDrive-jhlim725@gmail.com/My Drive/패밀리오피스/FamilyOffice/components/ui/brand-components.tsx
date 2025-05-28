import React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

// 브랜드 컨테이너 컴포넌트
const brandContainerVariants = cva(
  "w-full",
  {
    variants: {
      variant: {
        default: "container mx-auto px-4",
        full: "w-full px-4",
        narrow: "container mx-auto px-4 max-w-4xl",
        wide: "container mx-auto px-4 max-w-7xl",
      },
      spacing: {
        none: "",
        sm: "py-8",
        md: "py-12",
        lg: "py-16",
        xl: "py-24",
      }
    },
    defaultVariants: {
      variant: "default",
      spacing: "md",
    },
  }
)

export interface BrandContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof brandContainerVariants> {}

export const BrandContainer = React.forwardRef<HTMLDivElement, BrandContainerProps>(
  ({ className, variant, spacing, ...props }, ref) => {
    return (
      <div
        className={cn(brandContainerVariants({ variant, spacing, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
BrandContainer.displayName = "BrandContainer"

// 브랜드 섹션 컴포넌트
const brandSectionVariants = cva(
  "w-full",
  {
    variants: {
      background: {
        default: "bg-background",
        muted: "bg-muted/20",
        glass: "glass-card",
        gradient: "bg-gradient-brand",
        navy: "bg-navy-primary text-white",
        bronze: "bg-bronze-primary text-white",
        forest: "bg-forest-primary text-white",
      },
      spacing: {
        none: "",
        sm: "py-8",
        md: "py-12", 
        lg: "py-16",
        xl: "py-24",
      }
    },
    defaultVariants: {
      background: "default",
      spacing: "md",
    },
  }
)

export interface BrandSectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof brandSectionVariants> {}

export const BrandSection = React.forwardRef<HTMLElement, BrandSectionProps>(
  ({ className, background, spacing, ...props }, ref) => {
    return (
      <section
        className={cn(brandSectionVariants({ background, spacing, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
BrandSection.displayName = "BrandSection"

// 브랜드 헤딩 컴포넌트
const brandHeadingVariants = cva(
  "font-heading font-bold tracking-tight",
  {
    variants: {
      size: {
        sm: "text-2xl md:text-3xl",
        md: "text-3xl md:text-4xl",
        lg: "text-4xl md:text-5xl",
        xl: "text-5xl md:text-6xl",
        "2xl": "text-6xl md:text-7xl",
      },
      color: {
        default: "text-foreground",
        brand: "text-gradient-brand",
        bronze: "text-gradient-bronze",
        forest: "text-gradient-forest",
        navy: "text-navy-primary",
        muted: "text-muted-foreground",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      }
    },
    defaultVariants: {
      size: "lg",
      color: "default",
      align: "left",
    },
  }
)

export interface BrandHeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'>,
    VariantProps<typeof brandHeadingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const BrandHeading = React.forwardRef<HTMLHeadingElement, BrandHeadingProps>(
  ({ className, size, color, align, as: Comp = 'h2', ...props }, ref) => {
    return (
      <Comp
        className={cn(brandHeadingVariants({ size, color, align, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
BrandHeading.displayName = "BrandHeading"

// 브랜드 텍스트 컴포넌트
const brandTextVariants = cva(
  "font-body",
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      },
      color: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        bronze: "text-bronze-primary",
        forest: "text-forest-primary",
        navy: "text-navy-primary",
        trustBlue: "text-trust-blue",
        successGreen: "text-success-green",
        warningAmber: "text-warning-amber",
        premiumPurple: "text-premium-purple",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify",
      }
    },
    defaultVariants: {
      size: "base",
      color: "default",
      weight: "normal",
      align: "left",
    },
  }
)

export interface BrandTextProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, 'color'>,
    VariantProps<typeof brandTextVariants> {
  as?: 'p' | 'span' | 'div'
}

export const BrandText = React.forwardRef<HTMLParagraphElement, BrandTextProps>(
  ({ className, size, color, weight, align, as: Comp = 'p', ...props }, ref) => {
    return (
      <Comp
        className={cn(brandTextVariants({ size, color, weight, align, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
BrandText.displayName = "BrandText"

// 브랜드 카드 컴포넌트
const brandCardVariants = cva(
  "rounded-lg border transition-fo",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground shadow-light",
        glass: "glass-card",
        elevated: "bg-card text-card-foreground shadow-medium hover-lift",
        outline: "border-2 bg-transparent",
        gradient: "bg-gradient-brand text-white border-0",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
)

export interface BrandCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof brandCardVariants> {}

export const BrandCard = React.forwardRef<HTMLDivElement, BrandCardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        className={cn(brandCardVariants({ variant, padding, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
BrandCard.displayName = "BrandCard"

// 브랜드 그리드 컴포넌트
const brandGridVariants = cva(
  "grid gap-6",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
      },
      gap: {
        sm: "gap-4",
        md: "gap-6",
        lg: "gap-8",
        xl: "gap-12",
      }
    },
    defaultVariants: {
      cols: 3,
      gap: "md",
    },
  }
)

export interface BrandGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof brandGridVariants> {}

export const BrandGrid = React.forwardRef<HTMLDivElement, BrandGridProps>(
  ({ className, cols, gap, ...props }, ref) => {
    return (
      <div
        className={cn(brandGridVariants({ cols, gap, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
BrandGrid.displayName = "BrandGrid"

// 브랜드 스페이서 컴포넌트
const brandSpacerVariants = cva(
  "w-full",
  {
    variants: {
      size: {
        xs: "h-2",
        sm: "h-4",
        md: "h-6",
        lg: "h-12",
        xl: "h-24",
      }
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface BrandSpacerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof brandSpacerVariants> {}

export const BrandSpacer = React.forwardRef<HTMLDivElement, BrandSpacerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        className={cn(brandSpacerVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
BrandSpacer.displayName = "BrandSpacer" 
"use client"

import * as React from "react"

const AspectRatio = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { ratio?: number }
>(({ className, ratio = 16 / 9, ...props }, ref) => (
  <div
    ref={ref}
    style={{ aspectRatio: ratio }}
    className={className}
    {...props}
  />
))
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
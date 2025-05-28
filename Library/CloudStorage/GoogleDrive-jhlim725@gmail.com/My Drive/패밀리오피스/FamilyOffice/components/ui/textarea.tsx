import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-sm border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg-secondary px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary shadow-sm transition-all duration-300 ease-in-out",
        "placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }

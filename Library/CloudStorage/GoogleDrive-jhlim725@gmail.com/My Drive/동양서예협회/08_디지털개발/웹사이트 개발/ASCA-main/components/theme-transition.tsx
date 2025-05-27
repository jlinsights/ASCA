"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ThemeTransitionProps {
  clickPosition: { x: number; y: number } | null
}

export function ThemeTransition({ clickPosition }: ThemeTransitionProps) {
  const { theme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (clickPosition) {
      setPosition(clickPosition)
      setIsAnimating(true)

      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 1500) // Animation duration

      return () => clearTimeout(timer)
    }
  }, [clickPosition, theme])

  if (!isAnimating || !position) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{
        background: theme === "dark" ? "#222222" : "#fcfcfc",
      }}
    >
      <div
        className="absolute rounded-full animate-ink-spread"
        style={{
          top: position.y,
          left: position.x,
          transform: "translate(-50%, -50%)",
          background: theme === "dark" ? "#222222" : "#fcfcfc",
        }}
      />
    </div>
  )
}

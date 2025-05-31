"use client"

import type React from "react"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

interface ThemeToggleProps {
  onToggle: (position: { x: number; y: number }) => void
}

export function ThemeToggle({ onToggle }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const handleToggle = (e: React.MouseEvent) => {
    const position = {
      x: e.clientX,
      y: e.clientY,
    }

    onToggle(position)
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={handleToggle}
      className="inline-flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 relative z-10 hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 lg:h-5 lg:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
      <Moon className="absolute h-4 w-4 lg:h-5 lg:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
    </button>
  )
}

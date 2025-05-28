"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 클라이언트 사이드에서만 렌더링하여 hydration 불일치 방지
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-8 h-8"></div> // 플레이스홀더
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-8 h-8 rounded-full backdrop-blur-lg bg-white/20 dark:bg-navy-primary/80 border border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-navy-primary/90 hover:scale-105 transition-fo shadow-lg"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-600 dark:text-amber-400" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-600 dark:text-blue-300" />
      <span className="sr-only">{theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}</span>
    </Button>
  )
}

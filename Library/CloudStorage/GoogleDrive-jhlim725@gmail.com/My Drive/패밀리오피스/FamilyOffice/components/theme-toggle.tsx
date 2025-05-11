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
    return <div className="w-11 h-11"></div> // 플레이스홀더
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="fixed top-4 right-4 w-11 h-11 rounded-full shadow-medium hover:shadow-heavy z-50"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
    >
      <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-navy-primary" />
      <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gold-primary" />
      <span className="sr-only">{theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}</span>
    </Button>
  )
}

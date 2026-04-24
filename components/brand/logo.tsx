"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Image from "next/image"

interface LogoProps {
  /** 로고의 너비 (기본값: 120px) */
  width?: number
  /** 로고의 높이 (기본값: 40px) */
  height?: number
  /** 추가 CSS 클래스 */
  className?: string
  /** 로고 변형 타입
   * - 'tagline': "The Asian Society of Calligraphic Arts" 텍스트 포함 (기본값)
   * - 'slogan': "正法의 계승, 創新의 조화" 슬로건 포함
   */
  variant?: 'tagline' | 'slogan'
}

/**
 * 동양서예협회(ASCA) 로고 컴포넌트
 * 
 * 테마에 따라 자동으로 적절한 로고 버전을 선택합니다.
 * - 라이트 모드: 흰색 배경용 로고 (검은색 텍스트)
 * - 다크 모드: 검은색 배경용 로고 (흰색 텍스트)
 * 
 * @example
 * ```tsx
 * // 기본 태그라인 로고
 * <Logo width={200} height={60} />
 * 
 * // 슬로건 로고
 * <Logo variant="slogan" width={250} height={80} />
 * ```
 */
export function Logo({ width = 120, height = 40, className = "", variant = 'tagline' }: LogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 클라이언트 사이드에서만 렌더링되도록 함
  useEffect(() => {
    setMounted(true)
  }, [])

  // 로고 변형에 따른 기본 경로 설정
  const getLogoPath = (isDark: boolean) => {
    const bgType = isDark ? 'black BG' : 'white BG'
    const logoType = variant === 'slogan' ? 'Slogan' : 'Tagline'
    return `/logo/Logo & ${logoType}_${bgType}.png`
  }

  // 서버 사이드 렌더링 중에는 라이트 모드 로고를 기본으로 표시
  if (!mounted) {
    return (
      <Image
        src={getLogoPath(false)}
        alt="동양서예협회 | Oriental Calligraphy Association"
        width={width}
        height={height}
        className={`transition-all duration-300 ${className}`}
        priority
      />
    )
  }

  // 실제 테마에 따른 로고 선택
  // 다크모드에서는 흰색 로고(black BG용), 라이트모드에서는 검은색 로고(white BG용)
  const logoSrc = getLogoPath(resolvedTheme === 'dark')

  return (
    <Image
      src={logoSrc}
      alt="동양서예협회 | Oriental Calligraphy Association"
      width={width}
      height={height}
      className={`transition-all duration-300 ${className}`}
      priority
    />
  )
} 
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Share2, MessageCircle } from "lucide-react"
import { shareToKakaoTalk, KakaoShareTemplate } from "@/lib/kakao"

interface KakaoShareButtonProps {
  // 공유할 콘텐츠 정보
  title: string
  description: string
  imageUrl?: string
  webUrl: string
  mobileWebUrl?: string
  
  // 버튼 스타일링
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
  size?: "sm" | "md" | "lg"
  className?: string
  
  // 공유 타입별 설정
  shareType?: 'artist' | 'contest' | 'exhibition' | 'artwork' | 'general'
  
  // 추가 버튼 설정
  buttonText?: string
  showIcon?: boolean
  isIconOnly?: boolean
  
  // 콜백 함수
  onShareSuccess?: () => void
  onShareError?: (error: any) => void
}

export function KakaoShareButton({
  title,
  description,
  imageUrl = "/og-image.jpg",
  webUrl,
  mobileWebUrl,
  variant = "outline",
  size = "sm",
  className = "",
  shareType = 'general',
  buttonText,
  showIcon = true,
  isIconOnly = false,
  onShareSuccess,
  onShareError
}: KakaoShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false)

  // 공유 타입별 기본 설정
  const getShareConfig = () => {
    const baseConfig = {
      title,
      description,
      imageUrl: imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${imageUrl}`,
      webUrl: webUrl.startsWith('http') ? webUrl : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${webUrl}`,
      mobileWebUrl: mobileWebUrl || webUrl,
    }

    switch (shareType) {
      case 'artist':
        return {
          ...baseConfig,
          buttonText: buttonText || "작가 프로필 보기",
          defaultDescription: "동양서예협회의 뛰어난 작가를 만나보세요"
        }
      case 'contest':
        return {
          ...baseConfig,
          buttonText: buttonText || "공모전 참가하기",
          defaultDescription: "지금 바로 공모전에 참가해보세요"
        }
      case 'exhibition':
        return {
          ...baseConfig,
          buttonText: buttonText || "전시회 정보 보기",
          defaultDescription: "특별한 전시회를 확인해보세요"
        }
      case 'artwork':
        return {
          ...baseConfig,
          buttonText: buttonText || "작품 자세히 보기",
          defaultDescription: "아름다운 작품을 감상해보세요"
        }
      default:
        return {
          ...baseConfig,
          buttonText: buttonText || "자세히 보기",
          defaultDescription: "ASCA 동양서예협회에서 확인해보세요"
        }
    }
  }

  const handleShare = async () => {
    try {
      setIsSharing(true)
      
      const config = getShareConfig()
      
      // 카카오톡 공유 템플릿 생성
      const shareTemplate: KakaoShareTemplate = {
        objectType: 'feed',
        content: {
          title: config.title,
          description: config.description || config.defaultDescription,
          imageUrl: config.imageUrl,
          link: {
            mobileWebUrl: config.mobileWebUrl,
            webUrl: config.webUrl,
          },
        },
        buttons: [
          {
            title: config.buttonText,
            link: {
              mobileWebUrl: config.mobileWebUrl,
              webUrl: config.webUrl,
            },
          },
        ],
      }

      const success = await shareToKakaoTalk(shareTemplate)
      
      if (success) {
        toast.success("카카오톡으로 공유되었습니다! 📤")
        onShareSuccess?.()
      } else {
        throw new Error("공유에 실패했습니다")
      }
    } catch (error) {
      console.error('❌ Kakao share error:', error)
      toast.error("공유 중 오류가 발생했습니다. 다시 시도해주세요.")
      onShareError?.(error)
    } finally {
      setIsSharing(false)
    }
  }

  const getButtonText = () => {
    if (isSharing) return "공유 중..."
    if (buttonText) return buttonText
    
    if (isIconOnly) return ""
    return "카카오톡 공유"
  }

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return isIconOnly ? "h-8 w-8" : "h-8 px-3 text-xs"
      case 'lg':
        return isIconOnly ? "h-12 w-12" : "h-12 px-6 text-base"
      default:
        return isIconOnly ? "h-10 w-10" : "h-10 px-4 text-sm"
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleShare}
      disabled={isSharing}
      className={`
        ${getButtonSize()}
        bg-yellow-400 hover:bg-yellow-500 text-yellow-900 
        border-yellow-400 hover:border-yellow-500
        dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-yellow-50
        dark:border-yellow-500 dark:hover:border-yellow-600
        transition-all duration-200 flex items-center gap-2
        ${isIconOnly ? 'p-0 rounded-full' : ''}
        ${className}
      `}
      title={isIconOnly ? '카카오톡으로 공유하기' : undefined}
    >
      {showIcon && (
        <MessageCircle className={`
          ${isIconOnly ? 'h-5 w-5' : 'h-4 w-4'}
          ${isSharing ? 'animate-pulse' : ''}
        `} />
      )}
      {!isIconOnly && (
        <span className="font-medium">
          {getButtonText()}
        </span>
      )}
    </Button>
  )
}

// 특정 타입별 편의 컴포넌트들
export function ArtistShareButton(props: Omit<KakaoShareButtonProps, 'shareType'>) {
  return <KakaoShareButton {...props} shareType="artist" />
}

export function ContestShareButton(props: Omit<KakaoShareButtonProps, 'shareType'>) {
  return <KakaoShareButton {...props} shareType="contest" />
}

export function ExhibitionShareButton(props: Omit<KakaoShareButtonProps, 'shareType'>) {
  return <KakaoShareButton {...props} shareType="exhibition" />
}

export function ArtworkShareButton(props: Omit<KakaoShareButtonProps, 'shareType'>) {
  return <KakaoShareButton {...props} shareType="artwork" />
} 
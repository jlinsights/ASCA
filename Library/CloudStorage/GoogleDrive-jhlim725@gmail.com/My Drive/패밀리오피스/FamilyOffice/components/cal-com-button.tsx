'use client'

import { useEffect } from 'react'

interface CalComButtonProps {
  calLink?: string
  buttonText?: string
  className?: string
}

export function CalComButton({ 
  calLink = 'familyoffice/consultation',
  buttonText = '상담 예약',
  className = ''
}: CalComButtonProps) {
  const fullCalUrl = calLink.startsWith('http') ? calLink : `https://cal.com/${calLink}`

  useEffect(() => {
    // Cal.com 스크립트가 로드되었는지 확인
    const checkCalCom = () => {
      if (typeof window !== 'undefined' && window.Cal) {
        console.log('✅ Cal.com is ready for button')
        return true
      }
      return false
    }

    // 주기적으로 Cal.com 준비 상태 확인
    const interval = setInterval(() => {
      if (checkCalCom()) {
        clearInterval(interval)
      }
    }, 1000)

    // 10초 후 정리
    setTimeout(() => clearInterval(interval), 10000)

    return () => clearInterval(interval)
  }, [])

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.Cal) {
      // Cal.com 모달 열기
      window.Cal('openModal', calLink)
    } else {
      // Cal.com이 로드되지 않은 경우 직접 링크로 이동
      window.open(fullCalUrl, '_blank')
    }
  }

  return (
    <button
      onClick={handleClick}
      data-cal-link={calLink}
      className={`inline-flex items-center justify-center px-6 py-3 
        bg-gradient-to-r from-yellow-400 to-amber-500 
        hover:from-amber-500 hover:to-yellow-400
        text-gray-900 font-bold rounded-lg text-sm
        transform hover:scale-105 transition-all duration-300
        shadow-lg hover:shadow-xl
        border-2 border-amber-600 hover:border-yellow-400
        ${className}`}
    >
      📅 {buttonText}
    </button>
  )
}

// Cal 타입은 external-scripts.tsx에서 이미 정의됨 
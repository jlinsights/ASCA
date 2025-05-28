'use client'

import Cal, { getCalApi } from "@calcom/embed-react"
import { useEffect } from "react"

export function CalComInline() {
  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi({ namespace: "coffeechat" })
        cal("ui", {
          cssVarsPerTheme: {
            light: { "cal-brand": "#000000" },
            dark: { "cal-brand": "#ffffff" }
          },
          hideEventTypeDetails: false,
          layout: "month_view"
        })
        console.log('✅ Cal.com React 컴포넌트가 성공적으로 로드되었습니다.')
      } catch (error) {
        console.error('❌ Cal.com 초기화 실패:', error)
      }
    })()
  }, [])

  return (
    <div className="w-full">
      <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">무료 상담 예약</h2>
      <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8">
        패밀리오피스 VIP의 전문가들과 직접 상담을 예약하세요. 
        귀하의 자산과 가문의 번영을 위한 맞춤형 솔루션을 제안해 드립니다.
      </p>
      <div className="w-full h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <Cal 
          namespace="coffeechat"
          calLink="familyoffice/coffeechat"
          style={{ width: "100%", height: "500px", overflow: "auto" }}
          config={{ layout: "month_view" }}
        />
      </div>
    </div>
  )
} 
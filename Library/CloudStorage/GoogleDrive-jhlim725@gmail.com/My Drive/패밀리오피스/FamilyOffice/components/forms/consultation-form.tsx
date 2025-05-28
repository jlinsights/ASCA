"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

export function ConsultationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setFormError(null)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const service = formData.get("service") as string
    const message = formData.get("message") as string

    try {
      const supabase = createClient()

      const { error } = await supabase.from("consultations").insert({
        name,
        email,
        phone,
        service_type: service,
        message,
        status: "pending",
      })

      if (error) throw error

      setFormSuccess(true)
      event.currentTarget.reset()

      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setFormSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setFormError("상담 신청 중 오류가 발생했습니다. 다시 시도해 주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-light-text-secondary dark:text-dark-text-secondary mb-2 text-sm">
            성함 *
          </label>
          <Input type="text" id="name" name="name" placeholder="성함을 입력해주세요" required />
        </div>
        <div>
          <label htmlFor="phone" className="block text-light-text-secondary dark:text-dark-text-secondary mb-2 text-sm">
            연락처 *
          </label>
          <Input type="tel" id="phone" name="phone" placeholder="연락 가능한 번호를 입력해주세요" required />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-light-text-secondary dark:text-dark-text-secondary mb-2 text-sm">
          이메일 *
        </label>
        <Input type="email" id="email" name="email" placeholder="이메일 주소를 입력해주세요" required />
      </div>
      <div>
        <label htmlFor="service" className="block text-light-text-secondary dark:text-dark-text-secondary mb-2 text-sm">
          관심 서비스
        </label>
        <select 
          id="service" 
          name="service"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">관심 있는 서비스를 선택해주세요</option>
          <option value="wealth-management">통합 자산관리</option>
          <option value="inheritance">상속·증여 설계</option>
          <option value="tax-legal">세무·법률 자문</option>
          <option value="real-estate">부동산 포트폴리오</option>
          <option value="business-succession">가업승계</option>
          <option value="global-assets">해외 자산 관리</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-light-text-secondary dark:text-dark-text-secondary mb-2 text-sm">
          문의사항
        </label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="문의하실 내용을 자유롭게 작성해주세요"
          className="resize-none"
        />
      </div>
      <div className="flex items-start">
        <input type="checkbox" id="privacy" className="mt-1 mr-2" required />
        <label htmlFor="privacy" className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
          개인정보 수집 및 이용에 동의합니다. 수집된 정보는 상담 목적으로만 사용되며, 관련 법령에 따라 보호됩니다.
        </label>
      </div>

      {formError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-md text-sm">
          상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.
        </div>
      )}

      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "처리 중..." : "상담 신청하기"}
      </Button>
    </form>
  )
}

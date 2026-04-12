'use client'

import { useState, type FormEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setHasError(false)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          message: formData.get('message'),
        }),
      })

      if (!response.ok) throw new Error('Failed')
      setIsSubmitted(true)
    } catch {
      setHasError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className='border-green-500/30 bg-green-50/50 dark:bg-green-950/20'>
        <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4'>
            <Send className='h-5 w-5' />
          </div>
          <h3 className='text-lg font-semibold mb-2'>메세지가 전송되었습니다.</h3>
          <p className='text-sm text-muted-foreground'>24~48시간 이내에 연락드리겠습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className='p-5 md:p-6'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <input
              name='name'
              type='text'
              placeholder='성함'
              required
              maxLength={256}
              className='w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-scholar-red/30 focus:border-scholar-red transition-colors'
            />
          </div>
          <div>
            <input
              name='email'
              type='email'
              placeholder='이메일 주소'
              required
              maxLength={256}
              className='w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-scholar-red/30 focus:border-scholar-red transition-colors'
            />
          </div>
          <div>
            <input
              name='phone'
              type='tel'
              placeholder='휴대 전화번호'
              required
              maxLength={256}
              className='w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-scholar-red/30 focus:border-scholar-red transition-colors'
            />
          </div>
          <div>
            <textarea
              name='message'
              placeholder='남겨주실 말씀을 적어 주세요.'
              maxLength={5000}
              rows={5}
              className='w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-scholar-red/30 focus:border-scholar-red transition-colors resize-y min-h-[120px]'
            />
          </div>

          {hasError && (
            <p className='text-sm text-destructive'>
              전송 중 오류가 발생했습니다. 다시 시도해 주세요.
            </p>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className='inline-flex w-full items-center justify-center gap-2 rounded-md bg-scholar-red px-5 py-2.5 text-sm font-medium text-white hover:bg-scholar-red/90 transition-colors disabled:opacity-50'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                잠시만요..
              </>
            ) : (
              <>
                <Send className='h-4 w-4' />
                전송하기
              </>
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  )
}

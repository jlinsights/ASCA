'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CopyButtonProps {
  value: string
  label: string
}

/** 계좌번호처럼 손으로 옮겨 적기 쉬운 값을 복사한다. 클립보드가 막힌 환경에서는 값이 그대로 보이므로 실패만 알린다 */
export function CopyButton({ value, label }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setState('copied')
    } catch {
      setState('failed')
    }
    window.setTimeout(() => setState('idle'), 2400)
  }

  return (
    <button type='button' onClick={copy} className='asca-apply__copy'>
      {state === 'copied' ? (
        <Check className='h-4 w-4' aria-hidden='true' />
      ) : (
        <Copy className='h-4 w-4' aria-hidden='true' />
      )}
      <span>{label}</span>
      <span className='sr-only' aria-live='polite'>
        {state === 'copied' ? '복사했습니다' : state === 'failed' ? '복사하지 못했습니다' : ''}
      </span>
    </button>
  )
}

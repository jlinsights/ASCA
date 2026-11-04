'use client'

import { useEffect, useState } from 'react'
import type { NoticeCopy } from './notice-copy'

/**
 * 공유 — 휴대폰은 기기 공유 창, 그 밖에는 주소 복사. 결과는 alert 대신 화면 안 문장(aria-live)으로 알린다.
 * 예전 페이스북·트위터 버튼은 alert 만 띄웠다.
 */

type Status = 'idle' | 'copied' | 'failed'

interface NoticeShareProps {
  title: string
  labels: NoticeCopy['detail']
}

export function NoticeShare({ title, labels }: NoticeShareProps) {
  const [status, setStatus] = useState<Status>('idle')
  // 서버 그림과 어긋나지 않게 붙은 뒤에 확인한다
  const [canShare, setCanShare] = useState(false)
  useEffect(() => setCanShare(typeof navigator.share === 'function'), [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  const share = async () => {
    try {
      await navigator.share({ title, url: window.location.href })
    } catch (err) {
      // 사용자가 공유 창을 닫은 것(AbortError)은 실패가 아니다
      if (!(err instanceof DOMException && err.name === 'AbortError')) await copyLink()
    }
  }

  return (
    <div className='asca-notice__share' role='group' aria-label={labels.shareLabel}>
      {canShare && (
        <button type='button' className='asca-events__more' onClick={share}>
          {labels.share}
        </button>
      )}
      <button type='button' className='asca-events__more' onClick={copyLink}>
        {labels.copy}
      </button>
      <p className='asca-notice__share-status' role='status' aria-live='polite'>
        {status === 'copied' ? labels.copied : status === 'failed' ? labels.copyFailed : ''}
      </p>
    </div>
  )
}

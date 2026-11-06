'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

/** 글 위 '블로그' 돌아가기 링크 — 글 화면은 서버가 그리고, 이 한 줄만 고른 언어를 따른다 */
export function BlogBackLink() {
  const { t } = useLanguage()
  return (
    <Link
      href='/blog'
      className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8'
    >
      <ArrowLeft className='h-4 w-4' aria-hidden='true' />
      {t('blogBack')}
    </Link>
  )
}

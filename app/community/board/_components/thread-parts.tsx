'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { splitLinks, type ThreadAuthor } from '@/lib/community/threads'

const DATE_LOCALES = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-TW' } as const

/** 서버·브라우저가 같은 날짜를 그리도록 시간대를 고정한다 */
export function useThreadDate() {
  const { language } = useLanguage()
  const format = new Intl.DateTimeFormat(DATE_LOCALES[language] ?? 'ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  })
  return (iso: string) => format.format(new Date(iso))
}

/** 작성자 줄 — 공개 작가면 작가 페이지로, 아니면 표시 이름만. 탈퇴 회원은 이름 없이 */
export function AuthorLine({ author }: { author: ThreadAuthor }) {
  const { t } = useLanguage()
  const name =
    author.kind === 'deleted' ? t('boardDeletedMember') : (author.name ?? t('boardUnnamedMember'))
  return (
    <div className={`cb-author${author.kind === 'deleted' ? ' cb-author--deleted' : ''}`}>
      <span className='cb-author__mark' aria-hidden='true'>
        {author.image ? (
          <Image src={author.image} alt='' fill sizes='48px' className='object-cover' />
        ) : (
          (name.trim()[0] ?? '·')
        )}
      </span>
      <span className='cb-author__text'>
        {author.href ? (
          <Link href={author.href} className='cb-author__name'>
            {name}
          </Link>
        ) : (
          <span className='cb-author__name'>{name}</span>
        )}
        {author.role && <span className='cb-author__role'>{author.role}</span>}
      </span>
    </div>
  )
}

/** 평문 본문 — http(s) 주소만 링크로 만들고 나머지는 글자 그대로 */
export function ThreadBody({ body, className }: { body: string; className?: string }) {
  return (
    <p className={className}>
      {splitLinks(body).map((segment, index) =>
        segment.kind === 'link' ? (
          <a
            key={index}
            href={segment.value}
            target='_blank'
            rel='nofollow ugc noopener noreferrer'
          >
            {segment.value}
          </a>
        ) : (
          <span key={index}>{segment.value}</span>
        )
      )}
    </p>
  )
}

export function PlusMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 20 20' fill='none' aria-hidden='true'>
      <circle cx='10' cy='10' r='9.25' stroke='currentColor' strokeWidth='1.2' />
      <path d='M10 5.5v9M5.5 10h9' stroke='currentColor' strokeWidth='1.2' />
    </svg>
  )
}

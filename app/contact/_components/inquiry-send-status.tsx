'use client'

import { Fragment, type ReactNode, type RefObject } from 'react'
import { MessageCircle } from 'lucide-react'
import { EMAIL, KAKAO_CHAT_URL } from '@/lib/content/contact-info'
import { inquiryBody, inquirySubject, type InquiryDraft } from './inquiry-data'

/** 보내기 결과 — 사이트 접수(site-*)와 메일·카카오톡 보내기 */
export type SendState =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'site-sent' }
  | { kind: 'site-failed' }
  | { kind: 'mail' }
  | { kind: 'kakao-copied' }
  | { kind: 'kakao-manual' }

export const inputClass =
  'block w-full min-h-12 rounded-md border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-[invalid=true]:border-destructive'

const solidLink =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-foreground px-6 text-base font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto sm:justify-self-start'

/** 번역 문구의 {token} 자리에 링크 등 요소를 끼운다 — 언어마다 어순이 달라서 */
function fillSlot(template: string, token: string, node: ReactNode): ReactNode {
  const [before, after = ''] = template.split(`{${token}}`)
  return (
    <Fragment>
      {before}
      {node}
      {after}
    </Fragment>
  )
}

interface InquirySendStatusProps {
  sent: SendState
  /** 카카오톡 복사 실패 때 보여 줄 글 — 접수 성공 뒤엔 비어 있다 */
  draft: InquiryDraft
  kakaoLinkRef: RefObject<HTMLAnchorElement | null>
  statusRef: RefObject<HTMLDivElement | null>
  t: (key: string) => string
}

/** 보내기 결과 안내 — 화면 읽기 도구가 읽도록 role=status */
export function InquirySendStatus({
  sent,
  draft,
  kakaoLinkRef,
  statusRef,
  t,
}: InquirySendStatusProps) {
  const newWindow = <span className='sr-only'> {t('inqNewWindow')}</span>
  return (
    <div
      ref={statusRef}
      tabIndex={-1}
      role='status'
      aria-live='polite'
      className='text-sm leading-relaxed focus:outline-none'
    >
      {sent.kind === 'sending' && <p>{t('inqSending')}</p>}
      {sent.kind === 'site-sent' && (
        <div className='grid gap-1 border-l-2 border-foreground pl-4'>
          <p className='text-base font-medium'>{t('inqSent')}</p>
          <p className='text-muted-foreground'>{t('inqSentBody')}</p>
        </div>
      )}
      {sent.kind === 'site-failed' && <p className='text-destructive'>{t('inqSendFailed')}</p>}
      {sent.kind === 'mail' && (
        <p>
          {fillSlot(
            t('inqMailSent'),
            'email',
            <a href={`mailto:${EMAIL}`} className='underline underline-offset-4'>
              {EMAIL}
            </a>
          )}
        </p>
      )}
      {sent.kind === 'kakao-copied' && (
        <div className='grid gap-3'>
          <p>{t('inqKakaoCopied')}</p>
          <a
            ref={kakaoLinkRef}
            href={KAKAO_CHAT_URL}
            target='_blank'
            rel='noopener noreferrer'
            className={solidLink}
          >
            <MessageCircle className='h-4 w-4' aria-hidden='true' />
            {t('inqKakaoOpen')}
            {newWindow}
          </a>
        </div>
      )}
      {sent.kind === 'kakao-manual' && (
        <div className='grid gap-2'>
          <p>
            {fillSlot(
              t('inqKakaoManual'),
              'link',
              <a
                href={KAKAO_CHAT_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='underline underline-offset-4'
              >
                {t('inqKakaoChannel')}
                {newWindow}
              </a>
            )}
          </p>
          <textarea
            readOnly
            aria-label={t('inqCopyLabel')}
            value={`${inquirySubject(draft)}\n${inquiryBody(draft)}`}
            rows={8}
            className={inputClass}
          />
        </div>
      )}
    </div>
  )
}

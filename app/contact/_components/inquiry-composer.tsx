'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail, MessageCircle } from 'lucide-react'
import { EMAIL, KAKAO_CHAT_URL, mailto } from '@/lib/content/contact-info'
import {
  EMPTY_INQUIRY,
  INQUIRY_TOPICS,
  draftFromSearch,
  findInquiryTopic,
  inquiryBody,
  inquirySubject,
  mailtoBody,
  validateInquiry,
  type InquiryDraft,
  type InquiryField,
} from './inquiry-data'

type SendState =
  | { kind: 'idle' }
  | { kind: 'mail' }
  | { kind: 'kakao-copied' }
  | { kind: 'kakao-manual' }

const FIELD_ORDER: InquiryField[] = ['topic', 'name', 'contact', 'message']

const inputClass =
  'block w-full min-h-12 rounded-md border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-[invalid=true]:border-destructive'

/**
 * 문의서 — 용건을 먼저 고르면(Teachable·Klook 의 '무엇을 도와드릴까요' 흐름),
 * 답이 정리된 안내가 있는 용건은 그 안내를 먼저 권하고, 나머지는 메일·카카오톡으로 보낼 글을 만든다.
 */
export function InquiryComposer() {
  const [draft, setDraft] = useState<InquiryDraft>(EMPTY_INQUIRY)
  const [errors, setErrors] = useState<Partial<Record<InquiryField, string>>>({})
  const [sent, setSent] = useState<SendState>({ kind: 'idle' })
  const formRef = useRef<HTMLFormElement>(null)
  const kakaoLinkRef = useRef<HTMLAnchorElement>(null)

  // 복사가 끝나면 채널 열기 링크로 초점을 옮겨 다음 동작을 바로 하게 한다
  useEffect(() => {
    if (sent.kind === 'kakao-copied') kakaoLinkRef.current?.focus()
  }, [sent.kind])

  // 작품 상세의 '이 작품 문의하기'가 ?topic=&about= 로 채워 연다
  useEffect(() => {
    const prefill = draftFromSearch(window.location.search)
    if (Object.keys(prefill).length > 0) setDraft(current => ({ ...current, ...prefill }))
  }, [])

  const topic = findInquiryTopic(draft.topic)
  const update =
    (field: keyof InquiryDraft) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setDraft(current => ({ ...current, [field]: value }))
      setSent({ kind: 'idle' })
    }

  /** 빠진 칸이 있으면 알리고 첫 칸으로 초점을 옮긴다 */
  const check = (): boolean => {
    const found = validateInquiry(draft)
    setErrors(found)
    const first = FIELD_ORDER.find(field => found[field])
    if (!first) return true
    const target =
      first === 'topic'
        ? formRef.current?.querySelector<HTMLInputElement>('input[name="inquiry-topic"]')
        : formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)
    target?.focus()
    return false
  }

  const sendMail = () => {
    if (!check()) return
    setSent({ kind: 'mail' })
    window.location.href = mailto(inquirySubject(draft), mailtoBody(draft))
  }

  const sendKakao = async () => {
    if (!check()) return
    try {
      await navigator.clipboard.writeText(`${inquirySubject(draft)}\n${inquiryBody(draft)}`)
      // 복사가 끝난 뒤의 window.open 은 사용자 클릭이 만료돼 팝업 차단될 수 있다 (Codex #214).
      // 그래서 창을 자동으로 열지 않고, 채널 열기 링크를 보여 주고 초점을 옮긴다.
      setSent({ kind: 'kakao-copied' })
    } catch {
      // 복사가 막힌 브라우저 — 글을 보여 주고 직접 복사하게 한다
      setSent({ kind: 'kakao-manual' })
    }
  }

  const describedBy = (field: InquiryField, hint?: string) =>
    [hint, errors[field] ? `inquiry-${field}-error` : ''].filter(Boolean).join(' ') || undefined

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={event => {
        event.preventDefault()
        sendMail()
      }}
      className='grid gap-8'
      aria-describedby='inquiry-how'
    >
      <p id='inquiry-how' className='max-w-2xl text-base leading-relaxed text-muted-foreground'>
        용건과 연락처를 적으면 보낼 글을 만들어 드립니다. 메일 앱이나 카카오톡 채널로 보내시면
        사무국이 적어 주신 연락처로 답을 드립니다.
      </p>

      <fieldset aria-describedby={describedBy('topic')}>
        <legend className='mb-3 text-sm font-medium text-foreground'>
          용건 <span aria-hidden='true'>*</span>
          <span className='sr-only'>(필수)</span>
        </legend>
        <div className='grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3'>
          {INQUIRY_TOPICS.map(option => (
            <label key={option.id} className='block cursor-pointer'>
              <input
                type='radio'
                name='inquiry-topic'
                value={option.id}
                checked={draft.topic === option.id}
                onChange={() => {
                  setDraft(current => ({ ...current, topic: option.id }))
                  setErrors(current => ({ ...current, topic: undefined }))
                  setSent({ kind: 'idle' })
                }}
                className='peer sr-only'
              />
              <span className='flex h-full min-h-16 flex-col justify-center gap-1 rounded-md border border-border px-3 py-3 sm:px-4 transition-colors hover:border-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2'>
                <span className='text-base font-medium'>{option.label}</span>
                <span className='text-sm opacity-75'>{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.topic && (
          <p id='inquiry-topic-error' className='mt-2 text-sm text-destructive'>
            {errors.topic}
          </p>
        )}
      </fieldset>

      {topic?.guide && (
        <p className='flex flex-wrap items-center gap-x-3 gap-y-1 border-l-2 border-foreground pl-4 text-base'>
          <span className='text-muted-foreground'>자주 묻는 내용은 안내에 정리돼 있습니다.</span>
          <Link
            href={topic.guide.href}
            className='inline-flex min-h-11 items-center gap-1 font-medium underline underline-offset-4'
          >
            {topic.guide.label} 먼저 보기
            <ArrowRight className='h-4 w-4' aria-hidden='true' />
          </Link>
        </p>
      )}

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='grid gap-2'>
          <label htmlFor='inquiry-name' className='text-sm font-medium'>
            이름 <span aria-hidden='true'>*</span>
          </label>
          <input
            id='inquiry-name'
            data-field='name'
            autoComplete='name'
            required
            value={draft.name}
            onChange={update('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
            className={inputClass}
          />
          {errors.name && (
            <p id='inquiry-name-error' className='text-sm text-destructive'>
              {errors.name}
            </p>
          )}
        </div>

        <div className='grid gap-2'>
          <label htmlFor='inquiry-email' className='text-sm font-medium'>
            이메일
          </label>
          <input
            id='inquiry-email'
            data-field='contact'
            type='email'
            inputMode='email'
            autoComplete='email'
            value={draft.email}
            onChange={update('email')}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={describedBy('contact', 'inquiry-contact-hint')}
            className={inputClass}
          />
        </div>

        <div className='grid gap-2'>
          <label htmlFor='inquiry-phone' className='text-sm font-medium'>
            전화번호
          </label>
          <input
            id='inquiry-phone'
            type='tel'
            inputMode='tel'
            autoComplete='tel'
            value={draft.phone}
            onChange={update('phone')}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={describedBy('contact', 'inquiry-contact-hint')}
            className={inputClass}
          />
        </div>

        <div className='grid gap-2'>
          <label htmlFor='inquiry-subject' className='text-sm font-medium'>
            관련 작품·작가 <span className='font-normal text-muted-foreground'>(선택)</span>
          </label>
          <input
            id='inquiry-subject'
            value={draft.subject}
            onChange={update('subject')}
            className={inputClass}
          />
        </div>

        <p id='inquiry-contact-hint' className='-mt-3 text-sm text-muted-foreground md:col-span-2'>
          이메일과 전화번호 중 하나는 꼭 적어 주세요.
        </p>
        {errors.contact && (
          <p id='inquiry-contact-error' className='-mt-4 text-sm text-destructive md:col-span-2'>
            {errors.contact}
          </p>
        )}

        {topic?.asksPlan && (
          <div className='grid gap-2 md:col-span-2'>
            <label htmlFor='inquiry-plan' className='text-sm font-medium'>
              예산·희망 일정 <span className='font-normal text-muted-foreground'>(선택)</span>
            </label>
            <input
              id='inquiry-plan'
              value={draft.plan}
              onChange={update('plan')}
              placeholder='예: 2027년 3월까지, 100만 원 안팎'
              className={inputClass}
            />
          </div>
        )}

        <div className='grid gap-2 md:col-span-2'>
          <label htmlFor='inquiry-message' className='text-sm font-medium'>
            문의 내용 <span aria-hidden='true'>*</span>
          </label>
          <textarea
            id='inquiry-message'
            data-field='message'
            required
            rows={6}
            value={draft.message}
            onChange={update('message')}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={describedBy('message')}
            className={`${inputClass} min-h-40 leading-relaxed`}
          />
          {errors.message && (
            <p id='inquiry-message-error' className='text-sm text-destructive'>
              {errors.message}
            </p>
          )}
        </div>
      </div>

      <div className='grid gap-3 sm:flex sm:flex-wrap sm:items-center'>
        <button
          type='submit'
          className='inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foreground px-6 text-base font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        >
          <Mail className='h-4 w-4' aria-hidden='true' />
          메일로 보내기
        </button>
        <button
          type='button'
          onClick={sendKakao}
          className='inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-foreground px-6 text-base font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        >
          <MessageCircle className='h-4 w-4' aria-hidden='true' />
          카카오톡으로 보내기
          <span className='sr-only'> (내용을 복사합니다)</span>
        </button>
      </div>

      <div role='status' aria-live='polite' className='text-sm leading-relaxed'>
        {sent.kind === 'mail' && (
          <p>
            메일 앱에서 글을 확인하고 보내기를 눌러 주세요. 메일 앱이 열리지 않으면{' '}
            <a href={`mailto:${EMAIL}`} className='underline underline-offset-4'>
              {EMAIL}
            </a>
            로 직접 보내 주세요.
          </p>
        )}
        {sent.kind === 'kakao-copied' && (
          <div className='grid gap-3'>
            <p>문의 내용을 복사했습니다. 카카오톡 채널을 열어 채팅창에 붙여 넣어 보내 주세요.</p>
            <a
              ref={kakaoLinkRef}
              href={KAKAO_CHAT_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-foreground px-6 text-base font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto sm:justify-self-start'
            >
              <MessageCircle className='h-4 w-4' aria-hidden='true' />
              카카오톡 채널 열기
              <span className='sr-only'> (새 창)</span>
            </a>
          </div>
        )}
        {sent.kind === 'kakao-manual' && (
          <div className='grid gap-2'>
            <p>
              이 브라우저에서는 자동 복사가 되지 않았습니다. 아래 글을 복사해{' '}
              <a
                href={KAKAO_CHAT_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='underline underline-offset-4'
              >
                카카오톡 채널
                <span className='sr-only'> (새 창)</span>
              </a>
              에 붙여 넣어 주세요.
            </p>
            <textarea
              readOnly
              aria-label='보낼 문의 내용'
              value={`${inquirySubject(draft)}\n${inquiryBody(draft)}`}
              rows={8}
              className={inputClass}
            />
          </div>
        )}
      </div>
    </form>
  )
}

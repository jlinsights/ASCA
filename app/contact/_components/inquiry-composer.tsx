'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail, MessageCircle, Send } from 'lucide-react'
import { mailto } from '@/lib/content/contact-info'
import { useLanguage } from '@/contexts/language-context'
import { ApplySectionHead } from '@/components/apply/apply-parts'
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
  type InquiryErrors,
  type InquiryField,
} from './inquiry-data'
import { InquirySendStatus, inputClass, type SendState } from './inquiry-send-status'
import { postInquiry } from './inquiry-site-send'

const FIELD_ORDER: InquiryField[] = ['topic', 'name', 'contact', 'message']

/**
 * 문의서 — 용건을 먼저 고르면(Teachable·Klook 의 '무엇을 도와드릴까요' 흐름),
 * 답이 정리된 안내가 있는 용건은 그 안내를 먼저 권하고, 나머지는 메일·카카오톡으로 보낼 글을 만든다.
 */
export function InquiryComposer() {
  const [draft, setDraft] = useState<InquiryDraft>(EMPTY_INQUIRY)
  const { t, language } = useLanguage()
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState(false)
  const [website, setWebsite] = useState('')
  const statusRef = useRef<HTMLDivElement>(null)
  const [errors, setErrors] = useState<InquiryErrors>({})
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

  /** 사이트 접수함에 보낸다 — 실패하면 글을 그대로 두고 메일·카카오톡을 권한다 */
  const sendSite = async () => {
    if (sent.kind === 'sending' || !check()) return
    if (!consent) {
      setConsentError(true)
      formRef.current?.querySelector<HTMLInputElement>('#inquiry-consent')?.focus()
      return
    }
    setSent({ kind: 'sending' })
    const result = await postInquiry(draft, language, website)
    if (result === 'sent') {
      setDraft(EMPTY_INQUIRY)
      setConsent(false)
      setSent({ kind: 'site-sent' })
    } else {
      setSent({ kind: 'site-failed' })
    }
    statusRef.current?.focus()
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
        void sendSite()
      }}
      className='relative grid gap-8'
      aria-describedby='inquiry-how'
    >
      <p id='inquiry-how' className='max-w-2xl text-base leading-relaxed text-muted-foreground'>
        {t('inqHow')}
      </p>

      <fieldset aria-describedby={describedBy('topic')}>
        <legend className='mb-3 text-sm font-medium text-foreground'>
          {t('inqTopic')} <span aria-hidden='true'>*</span>
          <span className='sr-only'>{t('inqRequired')}</span>
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
                <span className='text-base font-medium'>{t(`inqTopic_${option.id}`)}</span>
                <span className='text-sm opacity-75'>{t(`inqTopicHint_${option.id}`)}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.topic && (
          <p id='inquiry-topic-error' className='mt-2 text-sm text-destructive'>
            {t(`inqErr_${errors.topic}`)}
          </p>
        )}
      </fieldset>

      {topic?.guideHref && (
        <p className='flex flex-wrap items-center gap-x-3 gap-y-1 border-l-2 border-foreground pl-4 text-base'>
          <span className='text-muted-foreground'>{t('inqGuideNote')}</span>
          <Link
            href={topic.guideHref}
            className='inline-flex min-h-11 items-center gap-1 font-medium underline underline-offset-4'
          >
            {t(`inqGuide_${topic.id}`)}
            <ArrowRight className='h-4 w-4' aria-hidden='true' />
          </Link>
        </p>
      )}

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='grid gap-2'>
          <label htmlFor='inquiry-name' className='text-sm font-medium'>
            {t('inqName')} <span aria-hidden='true'>*</span>
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
              {t(`inqErr_${errors.name}`)}
            </p>
          )}
        </div>

        <div className='grid gap-2'>
          <label htmlFor='inquiry-email' className='text-sm font-medium'>
            {t('inqEmail')}
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
            {t('inqPhone')}
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
            {t('inqSubject')}{' '}
            <span className='font-normal text-muted-foreground'>{t('inqOptional')}</span>
          </label>
          <input
            id='inquiry-subject'
            value={draft.subject}
            onChange={update('subject')}
            className={inputClass}
          />
        </div>

        <p id='inquiry-contact-hint' className='-mt-3 text-sm text-muted-foreground md:col-span-2'>
          {t('inqContactHint')}
        </p>
        {errors.contact && (
          <p id='inquiry-contact-error' className='-mt-4 text-sm text-destructive md:col-span-2'>
            {t(`inqErr_${errors.contact}`)}
          </p>
        )}

        {topic?.asksPlan && (
          <div className='grid gap-2 md:col-span-2'>
            <label htmlFor='inquiry-plan' className='text-sm font-medium'>
              {t('inqPlan')}{' '}
              <span className='font-normal text-muted-foreground'>{t('inqOptional')}</span>
            </label>
            <input
              id='inquiry-plan'
              value={draft.plan}
              onChange={update('plan')}
              placeholder={t('inqPlanPlaceholder')}
              className={inputClass}
            />
          </div>
        )}

        <div className='grid gap-2 md:col-span-2'>
          <label htmlFor='inquiry-message' className='text-sm font-medium'>
            {t('inqMessage')} <span aria-hidden='true'>*</span>
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
              {t(`inqErr_${errors.message}`)}
            </p>
          )}
        </div>
      </div>

      <div className='grid gap-2'>
        <label className='flex cursor-pointer items-start gap-3 text-sm leading-relaxed'>
          <input
            id='inquiry-consent'
            type='checkbox'
            checked={consent}
            onChange={event => {
              setConsent(event.target.checked)
              setConsentError(false)
            }}
            aria-invalid={consentError}
            aria-describedby={
              consentError
                ? 'inquiry-consent-detail inquiry-consent-error'
                : 'inquiry-consent-detail'
            }
            className='mt-0.5 h-5 w-5 shrink-0 accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          />
          <span>
            {t('inqConsentLabel')} <span aria-hidden='true'>*</span>
          </span>
        </label>
        <p id='inquiry-consent-detail' className='pl-8 text-sm text-muted-foreground'>
          {t('inqConsentDetail')}{' '}
          <Link href='/privacy-policy' className='underline underline-offset-4'>
            {t('inqPrivacyLink')}
          </Link>
        </p>
        {consentError && (
          <p id='inquiry-consent-error' className='pl-8 text-sm text-destructive'>
            {t('inqErr_consentMissing')}
          </p>
        )}
      </div>

      {/* 덫 칸 — 사람에게는 보이지 않고 키보드로도 닿지 않는다. 채워져 오면 서버가 저장하지 않는다 */}
      <div aria-hidden='true' className='absolute -left-[9999px] h-px w-px overflow-hidden'>
        <label htmlFor='inquiry-website'>Website</label>
        <input
          id='inquiry-website'
          name='website'
          tabIndex={-1}
          autoComplete='off'
          value={website}
          onChange={event => setWebsite(event.target.value)}
        />
      </div>

      <div className='grid gap-4'>
        <button
          type='submit'
          disabled={sent.kind === 'sending'}
          className='inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foreground px-8 text-base font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 sm:justify-self-start'
        >
          <Send className='h-4 w-4' aria-hidden='true' />
          {sent.kind === 'sending' ? t('inqSending') : t('inqSendSite')}
        </button>
        <div className='grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3'>
          <span className='text-sm text-muted-foreground'>{t('inqOtherWays')}</span>
          <button
            type='button'
            onClick={sendMail}
            className='inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            <Mail className='h-4 w-4' aria-hidden='true' />
            {t('inqSendMail')}
          </button>
          <button
            type='button'
            onClick={sendKakao}
            className='inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            <MessageCircle className='h-4 w-4' aria-hidden='true' />
            {t('inqSendKakao')}
            <span className='sr-only'> {t('inqSendKakaoSr')}</span>
          </button>
        </div>
      </div>

      <InquirySendStatus
        sent={sent}
        draft={draft}
        kakaoLinkRef={kakaoLinkRef}
        statusRef={statusRef}
        t={t}
      />
    </form>
  )
}

/** /contact 의 문의서 영역 — 제목·안내도 선택한 언어로 (페이지는 서버 컴포넌트라 여기서 번역) */
export function InquirySection() {
  const { t } = useLanguage()
  return (
    <section id='inquiry' aria-labelledby='inquiry-title' className='asca-apply__anchor'>
      <ApplySectionHead
        id='inquiry-title'
        eyebrow={t('inqSectionEyebrow')}
        title={t('inqSectionTitle')}
        lede={t('inqSectionLede')}
      />
      <InquiryComposer />
    </section>
  )
}

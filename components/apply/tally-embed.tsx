'use client'

import Script from 'next/script'
import { ExternalLink } from 'lucide-react'

const TALLY_SCRIPT = 'https://tally.so/widgets/embed.js'

interface TallyWindow extends Window {
  Tally?: { loadEmbeds: () => void }
}

/**
 * Tally 공식 임베드 로더와 같은 일을 한다 — 스크립트가 있으면 loadEmbeds()(높이 자동 맞춤),
 * 없거나 막혔으면 data-tally-src 를 src 로 옮겨 양식만이라도 띄운다.
 */
function loadEmbeds() {
  const tally = (window as TallyWindow).Tally
  if (tally) {
    tally.loadEmbeds()
    return
  }
  document
    .querySelectorAll<HTMLIFrameElement>('iframe[data-tally-src]:not([src])')
    .forEach(frame => {
      frame.src = frame.dataset.tallySrc ?? ''
    })
}

interface TallyEmbedProps {
  formId: string
  title: string
  /** 스크립트가 높이를 맞추기 전·차단됐을 때의 높이 */
  initialHeight: number
  /** 번역 화면에서만 넘긴다 — 기본은 한국어 */
  labels?: TallyEmbedLabels
}

export interface TallyEmbedLabels {
  fallback: string
  openNew: string
  newWindow: string
}

const TALLY_LABELS_KO: TallyEmbedLabels = {
  fallback: '양식이 보이지 않으면',
  openNew: '새 창에서 열기',
  newWindow: ' (새 창)',
}

/**
 * 온라인 신청서 — next/script 의 onReady 는 첫 로드뿐 아니라 클라이언트 이동으로 다시 마운트될
 * 때마다 불려서, 다른 페이지를 거쳐 돌아와도 iframe 이 빈 채로 남지 않는다(onLoad 는 1회뿐).
 */
export function TallyEmbed({
  formId,
  title,
  initialHeight,
  labels = TALLY_LABELS_KO,
}: TallyEmbedProps) {
  const embedSrc = `https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`
  const directHref = `https://tally.so/r/${formId}`

  return (
    <>
      <iframe
        data-tally-src={embedSrc}
        loading='lazy'
        width='100%'
        height={initialHeight}
        title={title}
        className='asca-apply__form-frame'
      />
      <Script src={TALLY_SCRIPT} strategy='lazyOnload' onReady={loadEmbeds} onError={loadEmbeds} />
      <p className='asca-apply__form-alt'>
        {labels.fallback}{' '}
        <a href={directHref} target='_blank' rel='noopener noreferrer'>
          {labels.openNew}
          <ExternalLink className='h-3.5 w-3.5' aria-hidden='true' />
          <span className='sr-only'>{labels.newWindow}</span>
        </a>
      </p>
    </>
  )
}

import Image from 'next/image'
import { pickWatermarkChar } from '@/lib/exhibitions/pick-watermark-char'
import type { ExhibitionStatus } from '@/lib/types/exhibition-legacy'

interface ExhibitionHeroProps {
  title: string
  subtitle?: string | null
  status: ExhibitionStatus
  startDate: string
  endDate: string
  isFeatured: boolean
  featuredImageUrl?: string | null
  ownerActions?: React.ReactNode
}

const STATUS_LABELS: Record<ExhibitionStatus, string> = {
  upcoming: 'UPCOMING',
  current: 'NOW SHOWING',
  past: 'CONCLUDED',
}

export function ExhibitionHero({
  title,
  subtitle,
  status,
  isFeatured,
  featuredImageUrl,
  ownerActions,
}: ExhibitionHeroProps) {
  const watermarkChar = pickWatermarkChar(title)
  const isPosterMode = Boolean(featuredImageUrl)

  return (
    <section
      aria-labelledby='exhibition-title'
      className='relative my-6 mb-24 rounded-2xl overflow-hidden aspect-[16/9] min-h-[480px] md:aspect-[16/9] aspect-[4/5] bg-ink-black isolate'
    >
      {isPosterMode ? (
        <>
          <Image
            src={featuredImageUrl as string}
            alt={title}
            fill
            sizes='100vw'
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-t from-ink-black/90 via-ink-black/40 to-ink-black/20 pointer-events-none' />
        </>
      ) : (
        <>
          <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,_color-mix(in_srgb,_var(--celadon-green)_40%,_var(--ink-black))_0%,_var(--ink-black)_70%)]' />
          <div
            data-watermark
            aria-hidden='true'
            className='absolute right-[4%] top-1/2 -translate-y-1/2 font-brush text-[clamp(8rem,22vw,18rem)] leading-none text-white/[0.08] pointer-events-none select-none'
          >
            {watermarkChar}
          </div>
        </>
      )}

      {ownerActions && <div className='absolute top-6 right-6 z-10 flex gap-2'>{ownerActions}</div>}

      <div className='absolute left-0 right-0 bottom-0 p-8 md:p-12 text-rice-paper z-10'>
        {(isFeatured || status === 'upcoming') && (
          <span className='inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-brand-gold text-ink-black text-xs font-semibold tracking-widest uppercase mb-4'>
            <span className='w-1.5 h-1.5 rounded-full bg-current motion-safe:animate-pulse' />
            {STATUS_LABELS[status]}
          </span>
        )}
        <h1
          id='exhibition-title'
          className='font-serif font-semibold text-4xl md:text-6xl leading-tight tracking-tight max-w-[18ch] mb-2'
        >
          {title}
        </h1>
        {subtitle && (
          <p className='font-serif italic text-lg md:text-xl text-rice-paper/75 max-w-[40ch]'>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}

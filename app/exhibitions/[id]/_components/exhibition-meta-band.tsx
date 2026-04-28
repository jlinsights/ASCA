import type { ExhibitionStatus } from '@/lib/types/exhibition-legacy'
import { formatExhibitionDate, getRemainingDays } from './exhibition-detail-meta'

interface ExhibitionMetaBandProps {
  startDate: string
  endDate: string
  status: ExhibitionStatus
  location?: string | null
  venue?: string | null
  curator?: string | null
  views?: number
  ticketPrice?: number | null
}

const DASH = '—'

function formatTicket(price: number | null | undefined): string {
  if (price === 0) return '무료 입장'
  if (price && price > 0) return `${price.toLocaleString()}원`
  return DASH
}

export function ExhibitionMetaBand({
  startDate,
  endDate,
  status,
  location,
  venue,
  curator,
  views,
  ticketPrice,
}: ExhibitionMetaBandProps) {
  const remaining = getRemainingDays(endDate)

  return (
    <section
      aria-label='전시 정보'
      className='grid grid-cols-2 md:grid-cols-4 gap-6 p-6 md:p-8 mb-12 bg-silk-cream border border-border rounded-xl'
    >
      <Cell
        label='기간'
        value={`${formatExhibitionDate(startDate)} — ${formatExhibitionDate(endDate)}`}
        sub={status === 'current' && remaining ? remaining : undefined}
      />
      <Cell label='장소' value={location ?? DASH} sub={venue ?? undefined} />
      <Cell label='주최' value={curator ?? DASH} />
      <Cell
        label='관람'
        value={formatTicket(ticketPrice)}
        sub={typeof views === 'number' ? `조회 ${views.toLocaleString()}회` : undefined}
      />
    </section>
  )
}

function Cell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className='text-xs font-semibold tracking-widest uppercase text-celadon-green mb-2'>
        {label}
      </p>
      <div className='font-serif text-lg font-medium text-foreground leading-tight'>{value}</div>
      {sub && <div className='text-sm text-muted-foreground mt-1'>{sub}</div>}
    </div>
  )
}

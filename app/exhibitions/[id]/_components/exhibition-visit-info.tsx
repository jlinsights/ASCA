interface ExhibitionVisitInfoProps {
  location: string
  venue?: string | null
  ticketPrice?: number | null
  openingHours?: string | null
  contact?: string | null
}

export function ExhibitionVisitInfo({
  location,
  venue,
  ticketPrice,
  openingHours,
  contact,
}: ExhibitionVisitInfoProps) {
  if (!location.trim()) return null

  const ticket =
    ticketPrice === 0 ? '무료 입장' :
    ticketPrice && ticketPrice > 0 ? `${ticketPrice.toLocaleString()}원` :
    null

  return (
    <section className="mb-24 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-start" aria-labelledby="visit-heading">
      <div className="bg-silk-cream border border-border rounded-xl p-8">
        <h3 id="visit-heading" className="font-serif text-2xl font-semibold mb-6 tracking-tight flex items-center gap-3">
          <span className="w-1 h-6 bg-scholar-red rounded-sm" aria-hidden="true" />
          관람 안내
        </h3>
        <dl className="grid grid-cols-[100px_1fr] gap-x-6 gap-y-4">
          <dt className="text-sm font-semibold text-celadon-green">주소</dt>
          <dd className="text-base text-foreground leading-relaxed">
            {location}
            {venue && <em className="not-italic block text-sm text-muted-foreground mt-0.5">{venue}</em>}
          </dd>
          {openingHours && (
            <>
              <dt className="text-sm font-semibold text-celadon-green">운영시간</dt>
              <dd className="text-base text-foreground">{openingHours}</dd>
            </>
          )}
          {ticket && (
            <>
              <dt className="text-sm font-semibold text-celadon-green">입장료</dt>
              <dd className="text-base text-foreground">{ticket}</dd>
            </>
          )}
          {contact && (
            <>
              <dt className="text-sm font-semibold text-celadon-green">문의</dt>
              <dd className="text-base text-foreground">{contact}</dd>
            </>
          )}
        </dl>
      </div>
      <div
        role="img"
        aria-label={`${location} 위치`}
        className="aspect-[4/3] bg-silk-cream border border-border rounded-xl grid place-items-center relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="w-14 h-14 bg-scholar-red text-white rounded-full grid place-items-center"
          style={{ borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }}
        >
          <span style={{ transform: 'rotate(45deg)' }} className="text-xl">📍</span>
        </div>
        <div className="absolute bottom-4 bg-ink-black text-rice-paper px-3.5 py-1.5 rounded-sm text-sm font-medium">
          {location}
        </div>
      </div>
    </section>
  )
}

interface ExhibitionDescriptionProps {
  description: string
  sectionNumber?: string
  sectionHeading?: string
  hanjaAccent?: string
}

export function ExhibitionDescription({
  description,
  sectionNumber = '§ 01',
  sectionHeading = '기획 의도',
  hanjaAccent = '— 정법의 계승, 창신의 발현',
}: ExhibitionDescriptionProps) {
  if (!description.trim()) return null

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-16 mb-24">
      <aside className="lg:sticky lg:top-24">
        <p className="font-serif text-sm tracking-widest text-celadon-green mb-2">
          {sectionNumber} — {sectionHeading}
        </p>
        <h2 className="font-serif text-3xl font-semibold leading-tight text-foreground tracking-tight">
          正法의 계승과<br/>創新의 조화
          <span className="block font-cjk text-scholar-red text-base font-medium mt-2">
            {hanjaAccent}
          </span>
        </h2>
      </aside>
      <div className="exhibition-description-prose font-cjk text-lg text-foreground max-w-prose whitespace-pre-wrap">
        {description}
      </div>
    </section>
  )
}

'use client'

interface PageHeroProps {
  title: string
  subtitle?: string
}

export function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 text-center z-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 drop-shadow-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-muted-foreground font-medium drop-shadow-md max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}

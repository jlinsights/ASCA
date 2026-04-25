import { Badge } from '@/components/ui/badge'

interface AwardHeroProps {
  year: number
  edition: string
  title: string
}

export function AwardHero({ year, edition, title }: AwardHeroProps) {
  return (
    <section className='py-12 md:py-20 bg-gradient-to-b from-muted/30 to-transparent'>
      <div className='container mx-auto px-4 text-center'>
        <Badge className='mb-4 bg-scholar-red text-white hover:bg-scholar-red/90'>{edition}</Badge>
        <h1 className='text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4'>
          {year}년 수상 내역
        </h1>
        <p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto'>{title}</p>
      </div>
    </section>
  )
}

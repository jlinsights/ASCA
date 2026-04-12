import { ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type BylawsSection } from './bylaws-data'

interface BylawsSectionCardProps {
  section: BylawsSection
  children: React.ReactNode
}

export function BylawsSectionCard({ section, children }: BylawsSectionCardProps) {
  return (
    <div id={section.id} className='scroll-mt-24'>
      <Card className='overflow-hidden'>
        <div className='bg-gradient-to-r from-scholar-red/5 to-scholar-red/10 border-b px-6 py-8 md:px-8'>
          <h2 className='text-2xl md:text-3xl font-bold mb-2'>{section.title}</h2>
          <p className='text-sm md:text-base text-muted-foreground mb-1'>{section.titleEn}</p>
          {section.enforcementDate && (
            <Badge variant='outline' className='mt-2 text-xs'>
              [{section.enforcementDate}]
            </Badge>
          )}

          <div className='mt-4'>
            <a
              href={section.googleDocsUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors'
            >
              <ExternalLink className='h-4 w-4' />
              Google Docs로 열어보기
            </a>
          </div>

          {section.infographicSrc && (
            <div className='mt-6'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.infographicSrc}
                alt={`${section.title} 인포그래픽`}
                className='rounded-lg border shadow-sm w-full max-w-[1080px]'
                loading='lazy'
              />
            </div>
          )}
        </div>

        <CardContent className='p-6 md:p-8'>
          <div className='prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-h2:text-xl prose-h2:font-bold prose-h2:border-b prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-ol:text-muted-foreground prose-strong:text-foreground'>
            {children}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

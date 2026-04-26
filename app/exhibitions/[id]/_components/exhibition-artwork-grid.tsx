import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import type { ExhibitionFull, CalligraphyStyle } from '@/lib/types/exhibition-legacy'

interface ExhibitionArtworkGridProps {
  artworks: ExhibitionFull['artworks']
}

const STYLE_LABELS: Record<CalligraphyStyle, string> = {
  zhuan: '篆書 · Seal Script',
  li: '隷書 · Clerical Script',
  kai: '楷書 · Standard Script',
  xing: '行書 · Running Script',
  cao: '草書 · Cursive Script',
  hangul: '한글 · Hangul Calligraphy',
  mixed: '한문/한글 · Mixed',
}

const STYLE_PLACEHOLDER: Record<CalligraphyStyle, string> = {
  zhuan: '篆', li: '隷', kai: '楷',
  xing: '行', cao: '草', hangul: '한', mixed: '書',
}

export function ExhibitionArtworkGrid({ artworks }: ExhibitionArtworkGridProps) {
  if (artworks.length === 0) return null

  return (
    <section className="mb-24" aria-labelledby="works-heading">
      <header className="flex items-end justify-between mb-8 gap-4 pb-4 border-b border-border">
        <h2 id="works-heading" className="font-serif text-4xl font-semibold tracking-tight">
          <span className="font-cjk text-celadon-green font-normal mr-3">貳</span>
          주요 출품작
        </h2>
        <span className="text-sm text-muted-foreground font-medium">
          총 {artworks.length}점
        </span>
      </header>

      <div className="grid gap-8 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {artworks.map(art => {
          const placeholderChar = art.style ? STYLE_PLACEHOLDER[art.style] : '書'
          const styleLabel = art.style ? STYLE_LABELS[art.style] : null

          return (
            <Link
              key={art.relationId}
              href={`/artworks/${art.id}`}
              className="group block bg-card rounded-lg overflow-hidden border border-celadon-green/20 hover:-translate-y-1 hover:shadow-xl transition-[transform,box-shadow] duration-250 motion-reduce:hover:transform-none"
            >
              <div className="relative aspect-[3/4] bg-rice-paper border-b border-border grid place-items-center overflow-hidden">
                {art.imageUrl ? (
                  <Image
                    src={art.imageUrl}
                    alt={art.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <span
                    data-calligraphy-placeholder
                    aria-hidden="true"
                    className="font-brush text-[clamp(5rem,12vw,9rem)] text-ink-black leading-none select-none"
                  >
                    {placeholderChar}
                  </span>
                )}
                {art.isFeatured && (
                  <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-brand-gold text-ink-black text-xs font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    대표
                  </div>
                )}
              </div>
              <div className="p-4 pb-5">
                {styleLabel && (
                  <span className="inline-block text-[0.6875rem] font-semibold tracking-widest uppercase text-celadon-green mb-2">
                    {styleLabel}
                  </span>
                )}
                <h3 className="font-cjk text-xl font-semibold mb-1 leading-tight group-hover:text-celadon-green transition-colors">
                  {art.title}
                  {art.titleEn && (
                    <span className="block font-serif italic text-sm font-normal text-muted-foreground mt-1">
                      {art.titleEn}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {art.artistName}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-3 border-t border-dashed border-border">
                  {art.year && <span><strong className="text-foreground font-medium">{art.year}</strong></span>}
                  {art.medium && <span>{art.medium}</span>}
                  {art.dimensions && <span>{art.dimensions}</span>}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

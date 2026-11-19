import Image from 'next/image'
import Link from 'next/link'
import { type ExhibitionYear } from './business-plan-data'

interface YearSectionProps {
  exhibition: ExhibitionYear
  id: string
}

/** 전시 아카이브 한 해 — 큰 연도, 포스터, 장소·기간 */
export function YearSection({ exhibition, id }: YearSectionProps) {
  const { year, title, venue, period, posterSrc, exhibitionLink, ceremony } = exhibition
  const poster = posterSrc && (
    <Image
      src={posterSrc}
      alt={`${title} 포스터`}
      width={400}
      height={560}
      sizes='220px'
      unoptimized
    />
  )

  return (
    <article id={id} className='ab-year' data-reveal aria-labelledby={`${id}-title`}>
      <p className='ab-year__num'>{year}</p>
      {poster ? (
        exhibitionLink ? (
          <Link href={exhibitionLink} className='ab-year__poster' tabIndex={-1} aria-hidden='true'>
            {poster}
          </Link>
        ) : (
          <div className='ab-year__poster'>{poster}</div>
        )
      ) : (
        <div />
      )}
      <div>
        <h3 id={`${id}-title`} className='ab-year__title'>
          {title}
        </h3>
        <dl className='ab-year__facts'>
          <div>
            <dt>장소</dt>
            <dd>{venue}</dd>
          </div>
          <div>
            <dt>기간</dt>
            <dd>{period}</dd>
          </div>
          {ceremony && (
            <div>
              <dt>시상식</dt>
              <dd>{ceremony}</dd>
            </div>
          )}
        </dl>
        {exhibitionLink && (
          <p className='ab-year__more'>
            <Link href={exhibitionLink} className='ab-button'>
              전시 상세보기
            </Link>
          </p>
        )}
      </div>
    </article>
  )
}

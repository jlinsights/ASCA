'use client'
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'
import { archivePublicUrl, isArchivePath } from '@/lib/archive-storage'
import type { PublicArtworkImage } from '@/lib/types/archive'
export function ArchiveImage({ path, alt }: { path?: string | null; alt: string }) {
  const { t } = useLanguage()
  const url = path && isArchivePath(path) ? archivePublicUrl(path) : null
  return url ? (
    <img src={url} alt={alt} loading='lazy' className='w-full h-full object-contain' />
  ) : (
    <div className='h-full min-h-48 flex items-center justify-center text-sm text-muted-foreground'>
      {t('arNoImage')}
    </div>
  )
}
export function Pagination({
  page,
  total,
  href,
}: {
  page: number
  total: number
  href: (page: number) => string
}) {
  const { t, metadata } = useLanguage()
  const pages = Math.max(1, Math.ceil(total / 24))
  if (pages === 1) return null
  return (
    <nav aria-label={t('arPages')} className='mt-12 flex items-center justify-center gap-6 text-sm'>
      {page > 1 && (
        <Link href={href(page - 1)} className='underline'>
          {t('arPrev')}
        </Link>
      )}
      <span>
        {page.toLocaleString(metadata.locale)} / {pages.toLocaleString(metadata.locale)}
      </span>
      {page < pages && (
        <Link href={href(page + 1)} className='underline'>
          {t('arNext')}
        </Link>
      )}
    </nav>
  )
}
export function ImageGallery({
  images,
  title,
}: {
  images: Pick<PublicArtworkImage, 'id' | 'web_path'>[]
  title: string
}) {
  const { t } = useLanguage()
  return (
    <div className='space-y-6'>
      {images.length ? (
        images.map((image, index) => (
          <figure key={image.id} className='bg-muted p-6'>
            <div className='h-[32rem] max-h-[75vh]'>
              <ArchiveImage path={image.web_path} alt={`${title} · ${index + 1}`} />
            </div>
          </figure>
        ))
      ) : (
        <div className='bg-muted p-12'>
          <ArchiveImage alt={t('arNoImage')} />
        </div>
      )}
    </div>
  )
}

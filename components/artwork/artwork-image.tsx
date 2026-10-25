import Image, { type ImageProps } from 'next/image'

/** Publication permission is rechecked at the origin, never in Next's shared cache. */
export function ArtworkImage(props: ImageProps) {
  let publicationChecked = false
  if (typeof props.src === 'string') {
    try {
      const url = new URL(props.src)
      publicationChecked =
        url.hostname.endsWith('.supabase.co') &&
        url.pathname === '/functions/v1/public-artwork-image'
    } catch {
      // Relative static assets keep the normal optimizer.
    }
  }
  return <Image {...props} unoptimized={publicationChecked || props.unoptimized} />
}

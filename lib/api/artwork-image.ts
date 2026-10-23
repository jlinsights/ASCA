// 새 Storage 경로와 기존 images.main.url을 화면용 URL로 통일한다.
// 비공개 Google Drive 링크는 로그인 페이지이므로 이미지로 사용하지 않는다.
const UNSERVABLE_HOSTS = ['drive.google.com', 'docs.google.com']

export function artworkImageUrl(images: unknown): string | null {
  if (!images || typeof images !== 'object') return null
  const main = (images as { main?: unknown }).main
  if (main && typeof main === 'object') {
    const stored = main as { path?: unknown; bucket?: unknown }
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (
      base &&
      typeof stored.path === 'string' &&
      (stored.bucket === undefined || stored.bucket === 'artwork-images') &&
      stored.path.split('/').every(part => part && part !== '.' && part !== '..')
    ) {
      return `${base.replace(/\/$/, '')}/storage/v1/object/public/artwork-images/${stored.path.split('/').map(encodeURIComponent).join('/')}`
    }
  }
  const url = main && typeof main === 'object' ? (main as { url?: unknown }).url : undefined
  if (typeof url === 'string' && (url.startsWith('/images/') || url === '/placeholder.svg')) {
    return url.split('/').includes('..') ? null : url
  }
  if (typeof url !== 'string' || !/^https?:\/\//.test(url)) return null
  try {
    const host = new URL(url).hostname
    return UNSERVABLE_HOSTS.includes(host) ? null : url
  } catch {
    return null
  }
}

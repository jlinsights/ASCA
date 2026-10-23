// artworks.images 는 {"main": {"url": "..."}} 모양이다. 작품 목록 화면은 image_url 을 읽는다.
// Google Drive 링크는 비공개 파일이라 로그인 화면으로 넘어가 이미지로 뜨지 않는다 (2026-10-23 확인, 28건).
// Supabase Storage 로 옮기기 전까지는 이미지 없음으로 보고 화면의 기본 이미지를 쓴다.
const UNSERVABLE_HOSTS = ['drive.google.com', 'docs.google.com']

export function artworkImageUrl(images: unknown): string | null {
  if (!images || typeof images !== 'object') return null
  const main = (images as { main?: unknown }).main
  const url = main && typeof main === 'object' ? (main as { url?: unknown }).url : undefined
  if (typeof url !== 'string' || !/^https?:\/\//.test(url)) return null
  try {
    const host = new URL(url).hostname
    return UNSERVABLE_HOSTS.includes(host) ? null : url
  } catch {
    return null
  }
}

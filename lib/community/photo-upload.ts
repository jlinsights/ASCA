// 게시판 사진 올리기(브라우저) — 고른 사진을 브라우저에서 먼저 줄여 보낸다.
// 휴대전화 원본은 서버 요청 한도(4.5MB)를 넘기 쉽고, 아이폰 HEIC 는 서버가 열지 못한다.
// 브라우저가 연 사진을 JPEG 로 다시 그리므로 HEIC 도(브라우저가 열 수 있으면) 올라간다.
// 위치 정보는 서버가 다시 인코딩하며 모두 지운다.

import { IMAGE_UPLOAD_MAX_BYTES, type ThreadImage } from './threads'

/** 서버가 다시 2000px 로 줄이므로 여유를 둔 긴 변 */
export const CLIENT_MAX_EDGE = 2400
const JPEG_QUALITY = 0.88

/** 실패 사유 — 화면 문구 키로 이어진다 */
export type PhotoFailure = 'unreadable' | 'tooLarge' | 'pending' | 'needName' | 'rate' | 'generic'

export class PhotoUploadError extends Error {
  constructor(readonly reason: PhotoFailure) {
    super(reason)
    this.name = 'PhotoUploadError'
  }
}

const SERVER_FAILURES: Record<string, PhotoFailure> = {
  IMAGE_UNSUPPORTED: 'unreadable',
  IMAGE_TOO_LARGE: 'tooLarge',
  TOO_MANY_PENDING_IMAGES: 'pending',
  DISPLAY_NAME_REQUIRED: 'needName',
}

/** 사진을 열어 긴 변 CLIENT_MAX_EDGE 이하 JPEG 로. 브라우저가 열지 못하면 unreadable */
export async function shrinkPhoto(file: Blob): Promise<Blob> {
  let bitmap: ImageBitmap
  try {
    // 기본값(imageOrientation: 'from-image')으로 카메라 방향이 반영된다
    bitmap = await createImageBitmap(file)
  } catch {
    throw new PhotoUploadError('unreadable')
  }
  try {
    const scale = Math.min(1, CLIENT_MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new PhotoUploadError('unreadable')
    context.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    )
    if (!blob) throw new PhotoUploadError('unreadable')
    if (blob.size > IMAGE_UPLOAD_MAX_BYTES) throw new PhotoUploadError('tooLarge')
    return blob
  } finally {
    bitmap.close()
  }
}

/** 줄인 사진을 대기 사진으로 올린다. 글을 올릴 때 이 ID 를 붙인다 */
export async function uploadPhoto(photo: Blob): Promise<ThreadImage> {
  const form = new FormData()
  form.append('file', photo, 'photo.jpg')
  let response: Response
  try {
    response = await fetch('/api/community/images', {
      method: 'POST',
      credentials: 'include',
      body: form,
    })
  } catch {
    throw new PhotoUploadError('generic')
  }
  const payload = (await response.json().catch(() => null)) as {
    code?: string
    data?: ThreadImage
  } | null
  if (response.ok && payload?.data) return payload.data
  if (response.status === 429) throw new PhotoUploadError('rate')
  throw new PhotoUploadError(SERVER_FAILURES[payload?.code ?? ''] ?? 'generic')
}

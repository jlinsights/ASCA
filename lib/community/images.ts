import 'server-only'
import sharp from 'sharp'

// 게시판 사진 처리 — 받은 파일을 그대로 저장하지 않고 다시 인코딩한다.
// 메타데이터(위치·기기)는 sharp 기본값대로 모두 버리고, 카메라 방향만 픽셀에 반영한다.

export const COMMUNITY_IMAGE_BUCKET = 'community-images'
/** 저장하는 사진의 긴 변 */
export const IMAGE_MAX_EDGE = 2000
/** 버킷 한도와 같다 */
export const IMAGE_STORED_MAX_BYTES = 2 * 1024 * 1024
/** 공개 글 사진을 브라우저가 들고 있는 시간(초) — 글을 숨기면 늦어도 이만큼 뒤에는 안 보인다 */
export const PUBLIC_IMAGE_MAX_AGE = 60
/** 글에 붙이지 않은 채 쌓아 둘 수 있는 사진(계정당) — 글 없이 저장소를 채우지 못하게 */
export const PENDING_IMAGES_MAX = 12
/** 디코딩 전에 거절할 픽셀 수(압축 폭탄 방지) — 약 8000×6000 */
const INPUT_PIXEL_LIMIT = 50_000_000
const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp', 'gif'])
const QUALITIES = [80, 68, 55]

export class ImageRejected extends Error {
  constructor(reason: string) {
    super(reason)
    this.name = 'ImageRejected'
  }
}

export interface ProcessedImage {
  data: Buffer
  width: number
  height: number
}

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const open = () => sharp(input, { limitInputPixels: INPUT_PIXEL_LIMIT, failOn: 'error' })
  let format: string | undefined
  try {
    format = (await open().metadata()).format
  } catch {
    throw new ImageRejected('unreadable')
  }
  if (!format || !ACCEPTED_FORMATS.has(format)) throw new ImageRejected('format')

  try {
    for (const quality of QUALITIES) {
      const { data, info } = await open()
        .rotate()
        .resize({
          width: IMAGE_MAX_EDGE,
          height: IMAGE_MAX_EDGE,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer({ resolveWithObject: true })
      if (data.length <= IMAGE_STORED_MAX_BYTES)
        return { data, width: info.width, height: info.height }
    }
  } catch {
    // 픽셀 한도 초과·깨진 파일
    throw new ImageRejected('decode')
  }
  throw new ImageRejected('size')
}

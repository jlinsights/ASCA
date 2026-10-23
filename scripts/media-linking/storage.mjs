import fs from 'node:fs'
import { createHash } from 'node:crypto'
import sharp from 'sharp'

export const PROJECT_REF = 'caxjyimsuvjnbmjoxfad'
export const PROJECT_URL = `https://${PROJECT_REF}.supabase.co`

export async function ensurePublicBucket(client, bucket) {
  const { data, error } = await client.storage.getBucket(bucket)
  if (!error) {
    if (!data.public) throw Error(`비공개 버킷은 공개로 바꾸지 않습니다: ${bucket}`)
    return
  }
  if (!['404', '400'].includes(String(error.statusCode)) || !/not found/i.test(error.message)) {
    throw Error(`버킷 조회 실패: ${bucket}`)
  }
  const created = await client.storage.createBucket(bucket, {
    public: true,
    allowedMimeTypes: ['image/webp'],
    fileSizeLimit: 10485760,
  })
  if (created.error) throw Error(`버킷 생성 실패: ${bucket}`)
}

async function upload(client, bucket, key, bytes) {
  const { error } = await client.storage.from(bucket).upload(key, bytes, {
    upsert: false,
    contentType: 'image/webp',
    cacheControl: '31536000',
  })
  if (error && !['409', 'Duplicate'].includes(String(error.statusCode ?? error.error))) {
    if (!/already exists|duplicate/i.test(error.message)) throw Error(`업로드 실패: ${key}`)
  }
  // 인증된 업로드 성공과 공개 읽기 성공은 다르므로 HEAD로 확인한다.
  const response = await fetch(`${PROJECT_URL}/storage/v1/object/public/${bucket}/${key}`, {
    method: 'HEAD',
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw Error(`공개 이미지 확인 실패: ${key} (${response.status})`)
}

export async function uploadDerivatives(client, bucket, prefix, file) {
  const source = fs.readFileSync(file)
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 16)
  // Storage는 한글 등 일부 유니코드 객체 키를 거부한다. 원본 분류는 매핑 키에
  // 보존하고 해당 경로 조각만 결정적인 ASCII 해시로 바꾼다.
  const safePrefix = prefix
    .split('/')
    .map(part =>
      /^[a-zA-Z0-9_.-]+$/.test(part)
        ? part
        : `folder-${createHash('sha256').update(part.normalize('NFC')).digest('hex').slice(0, 16)}`
    )
    .join('/')
  const base = `${safePrefix}/${hash}`
  const edge = bucket === 'artwork-images' ? 2400 : 1600
  const web = await sharp(source)
    .rotate()
    .resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true })
  const thumbnail = await sharp(source)
    .rotate()
    .resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()
  const record = {
    bucket,
    path: `${base}/web.webp`,
    thumbnailPath: `${base}/thumb.webp`,
    width: web.info.width,
    height: web.info.height,
    originalSize: source.length,
  }
  await upload(client, bucket, record.path, web.data)
  await upload(client, bucket, record.thumbnailPath, thumbnail)
  return record
}

export async function mapConcurrent(values, concurrency, task) {
  let next = 0
  const result = new Array(values.length)
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (next < values.length) {
        const index = next++
        result[index] = await task(values[index], index)
      }
    })
  )
  return result
}

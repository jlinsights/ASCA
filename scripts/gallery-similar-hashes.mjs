#!/usr/bin/env node
/**
 * 갤러리 사진의 지각 해시(perceptual hash)를 만든다 — 연속 촬영으로 거의 같은 사진을 묶기 위한 재료.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=… npm run gallery:similar -- --cache <다운로드 폴더>
 *
 * - 공개 Storage 의 썸네일(thumb.webp)을 내려받아 16×16 dHash(256비트)와 평균 색을 계산한다
 * - 결과는 lib/data/gallery-similar.json 에 키(galleryMediaKey)별로 저장 — 묶는 규칙은 lib/gallery-similar.ts
 * - 새 사진을 올린 뒤(upload-gallery-to-supabase.js) 다시 돌린다. 해시가 없는 사진은 묶이지 않고 그대로 보인다
 * - 내려받은 파일은 --cache 폴더에만 둔다(저장소에 넣지 않는다). 이미 받은 파일은 다시 받지 않는다
 */

import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import prettier from 'prettier'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const MEDIA = path.join(ROOT, 'lib/data/gallery-media.json')
const OUT = path.join(ROOT, 'lib/data/gallery-similar.json')
const HASH_SIZE = 16
const CONCURRENCY = 8

function argValue(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
const cacheDir = argValue('--cache')
if (!base || !cacheDir) {
  console.error(
    '사용법: NEXT_PUBLIC_SUPABASE_URL=… node scripts/gallery-similar-hashes.mjs --cache <폴더>'
  )
  process.exit(1)
}

function publicUrl(objectPath) {
  return `${base}/storage/v1/object/public/gallery/${objectPath.split('/').map(encodeURIComponent).join('/')}`
}

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

async function download(objectPath) {
  const file = path.join(cacheDir, objectPath.replaceAll('/', '__'))
  if (await exists(file)) return file
  const response = await fetch(publicUrl(objectPath))
  if (!response.ok) throw new Error(`${response.status} ${objectPath}`)
  await writeFile(file, Buffer.from(await response.arrayBuffer()))
  return file
}

/** dHash — 가로로 이웃한 화소의 밝기 비교 16×16 = 256비트, 16진수 64자 */
async function dHash(file) {
  const pixels = await sharp(file)
    .grayscale()
    .resize(HASH_SIZE + 1, HASH_SIZE, { fit: 'fill' })
    .raw()
    .toBuffer()
  let bits = ''
  for (let y = 0; y < HASH_SIZE; y++) {
    for (let x = 0; x < HASH_SIZE; x++) {
      const row = y * (HASH_SIZE + 1)
      bits += pixels[row + x] > pixels[row + x + 1] ? '1' : '0'
    }
  }
  return bits
    .match(/.{4}/g)
    .map(nibble => parseInt(nibble, 2).toString(16))
    .join('')
}

/** 평균 색 [r,g,b] — 구도는 같고 색이 다른 사진(조명·배경)이 섞이지 않게 */
async function meanColor(file) {
  const { data } = await sharp(file).resize(1, 1, { fit: 'fill' }).removeAlpha().raw().toBuffer({
    resolveWithObject: true,
  })
  return [data[0], data[1], data[2]]
}

async function main() {
  await mkdir(cacheDir, { recursive: true })
  const media = JSON.parse(await readFile(MEDIA, 'utf8'))
  const keys = Object.keys(media).sort()
  const hashes = {}
  const failures = []
  let next = 0

  async function worker() {
    while (next < keys.length) {
      const key = keys[next++]
      try {
        const file = await download(media[key].thumbnailPath)
        hashes[key] = { hash: await dHash(file), color: await meanColor(file) }
      } catch (error) {
        failures.push(`${key}: ${error.message}`)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const sorted = Object.fromEntries(
    Object.keys(hashes)
      .sort()
      .map(key => [key, hashes[key]])
  )
  // 저장소 Prettier 설정으로 맞춘다 — 그대로 쓰면 CI 의 format:check 가 막는다
  const json = JSON.stringify({ version: 1, hashBits: HASH_SIZE * HASH_SIZE, items: sorted })
  const options = (await prettier.resolveConfig(OUT)) ?? {}
  await writeFile(OUT, await prettier.format(json, { ...options, filepath: OUT }))
  console.log(`해시 ${Object.keys(sorted).length}/${keys.length}건 → ${path.relative(ROOT, OUT)}`)
  if (failures.length > 0) {
    console.error(`실패 ${failures.length}건 (이 사진들은 묶이지 않고 그대로 보입니다)`)
    for (const failure of failures.slice(0, 10)) console.error(`  ${failure}`)
    process.exitCode = 1
  }
}

await main()

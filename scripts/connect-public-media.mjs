#!/usr/bin/env node
// 기본은 파일 대조만 한다. --apply 에서만 ASCA-2026 Storage/DB에 쓴다.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { planGallery, planArtworks } from './media-linking/catalog.mjs'
import {
  PROJECT_REF,
  PROJECT_URL,
  ensurePublicBucket,
  uploadDerivatives,
  mapConcurrent,
} from './media-linking/storage.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const option = name => {
  const index = args.indexOf(name)
  if (index < 0) return undefined
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw Error(`${name} 값이 필요합니다.`)
  return args[index + 1]
}
const source = path.resolve(option('--source') ?? path.join(root, 'public'))
const apply = args.includes('--apply')
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'))

async function readAll(client, table, columns) {
  const rows = []
  for (let offset = 0; ; offset += 500) {
    const result = await client
      .from(table)
      .select(columns)
      .order('id')
      .range(offset, offset + 499)
    if (result.error) throw Error(`${table} 조회 실패`)
    rows.push(...result.data)
    if (result.data.length < 500) return rows
  }
}

function makeClient() {
  const file = option('--credentials')
  const credentials = file ? readJson(path.resolve(file)) : undefined
  if (credentials && credentials.url !== PROJECT_URL) throw Error('ASCA-2026 인증 파일이 아닙니다.')
  const key = credentials?.key ?? process.env.ASCA_SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw Error('ASCA-2026 서버 인증이 필요합니다. 키를 로그나 채팅에 출력하지 마세요.')
  if (key.split('.').length === 3) {
    const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString())
    if (claims.ref !== PROJECT_REF || claims.role !== 'service_role')
      throw Error('프로젝트/역할이 다른 키입니다.')
  }
  return createClient(PROJECT_URL, key, { auth: { persistSession: false } })
}

async function main() {
  let client
  let artworks
  let artists
  if (apply || !option('--artworks-snapshot')) {
    client = makeClient()
    ;[artworks, artists] = await Promise.all([
      readAll(client, 'artworks', 'id,title,artist_id,images,status'),
      readAll(client, 'artists', 'id,name,name_zh,visibility'),
    ])
  } else {
    artworks = readJson(path.resolve(option('--artworks-snapshot')))
    artists = readJson(path.resolve(option('--artists-snapshot')))
  }
  const catalog = readJson(path.join(root, 'lib/data/gallery-data.json'))
  const gallery = planGallery(source, catalog.items)
  const art = planArtworks(source, artworks, artists)
  const publicArtists = new Set(
    artists.filter(artist => artist.visibility === 'public').map(artist => artist.id)
  )
  const ready = art.matched.filter(
    row => row.artwork.status === 'published' && publicArtists.has(row.artwork.artist_id)
  )
  const report = {
    projectRef: PROJECT_REF,
    gallery: {
      matched: gallery.matched.length,
      missing: gallery.missing,
      unlisted: gallery.unlisted,
    },
    artworks: {
      alreadyConnected: art.connected.length,
      ineligible: art.matched
        .filter(row => !ready.includes(row))
        .map(row => ({ id: row.artwork.id, reason: '게시 상태와 작가 공개 여부 확인 필요' })),
      matched: ready.map(row => ({
        id: row.artwork.id,
        title: row.artwork.title,
        source: row.relative,
      })),
      unmatched: art.unmatched,
    },
  }
  if (option('--report'))
    fs.writeFileSync(path.resolve(option('--report')), JSON.stringify(report, null, 2))
  console.log(
    `갤러리 원본 ${gallery.matched.length} · 누락 ${gallery.missing.length} · 작품 연결 ${ready.length} · 보류 ${art.unmatched.length + art.matched.length - ready.length}`
  )
  if (!apply) {
    console.log('미리 보기 완료: 파일 업로드와 DB 변경 없음')
    return
  }
  if (gallery.missing.length) throw Error('누락된 갤러리 원본이 있어 적용하지 않습니다.')
  await ensurePublicBucket(client, 'gallery')
  await ensurePublicBucket(client, 'artwork-images')
  const backupDir = path.join(os.homedir(), 'Developer/Archive')
  fs.mkdirSync(backupDir, { recursive: true })
  const backup = path.join(
    backupDir,
    `asca-media-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  )
  fs.writeFileSync(
    backup,
    JSON.stringify(
      ready.map(row => row.artwork),
      null,
      2
    ),
    { mode: 0o600 }
  )
  console.log('변경 전 작품 이미지 백업을 저장소 밖에 저장했습니다.')

  const entries = await mapConcurrent(gallery.matched, 3, async (row, index) => {
    // Storage 키에는 공개 원본의 폴더/파일 식별자만 쓰고 OS 절대 경로는 쓰지 않는다.
    const prefix = row.key.replace(/^\/images\/gallery\//, '')
    const image = await uploadDerivatives(client, 'gallery', prefix, row.file)
    if ((index + 1) % 25 === 0) console.log(`갤러리 처리 ${index + 1}/${gallery.matched.length}`)
    return [row.key, image]
  })
  const manifestPath = path.join(root, 'lib/data/gallery-media.json')
  const nextManifest = `${manifestPath}.tmp`
  fs.writeFileSync(nextManifest, JSON.stringify(Object.fromEntries(entries), null, 2) + '\n')
  // 모든 업로드와 공개 읽기 확인이 끝난 뒤에만 화면 매핑을 바꾼다.
  fs.renameSync(nextManifest, manifestPath)

  for (const row of ready) {
    const image = await uploadDerivatives(client, 'artwork-images', row.artwork.id, row.file)
    const previous = row.artwork.images ?? {}
    const previousMain = { ...(previous.main ?? {}) }
    delete previousMain.url
    delete previousMain.original_url
    const images = {
      ...previous,
      main: {
        ...previousMain,
        ...image,
        original_file: row.relative,
      },
    }
    let update = client
      .from('artworks')
      .update({ images })
      .eq('id', row.artwork.id)
      .eq('artist_id', row.artwork.artist_id)
      .eq('title', row.artwork.title)
      .eq('status', 'published')
    update =
      row.artwork.images === null
        ? update.is('images', null)
        : update.eq('images', JSON.stringify(row.artwork.images))
    const result = await update.select('id')
    if (result.error || result.data?.length !== 1)
      throw Error(`작품 ${row.artwork.id}: 동시 변경 또는 저장 실패`)
    console.log(`작품 연결 완료: ${row.artwork.title}`)
  }
  console.log(`완료: 갤러리 ${entries.length}장, 작품 ${ready.length}점`)
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})

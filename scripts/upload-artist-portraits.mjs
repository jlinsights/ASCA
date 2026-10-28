#!/usr/bin/env node
/**
 * 작가 프로필 사진 → Supabase Storage(ASCA-2026, 'artist-images' 버킷) 업로드
 *
 * 옛 Webflow 사이트의 작가 대표 사진(album-featured-image)을 ASCA 작가 프로필로 옮길 때 쓴다.
 * 원본은 저장소 밖(~/Developer/Archive/…)에 둔다. 파일 이름(확장자 제외) = 작가 slug.
 * 기존 프로필과 같은 자리(profiles/<작가 id>.webp)에 올린다.
 *
 * 사용법:
 *   node scripts/upload-artist-portraits.mjs --dir <폴더>            # 미리 보기 — 무엇이 누구에게 붙는지만 출력
 *   node scripts/upload-artist-portraits.mjs --dir <폴더> --apply    # 업로드 + artists.profile_image 설정 (백업 먼저)
 *
 * 이미 프로필 사진이 있는 작가는 건너뛴다 — 덮어쓰지 않는다 (갱신도 profile_image 가 비어 있을 때만).
 *
 * 키: ASCA_SUPABASE_SERVICE_ROLE_KEY (미리 보기·업로드 모두).
 * .env.local 은 읽지 않는다 — 그 파일은 옛 프로젝트를 가리킨다.
 * 키는 화면·로그에 찍지 않는다. 터미널에서 직접 export 해서 쓰고, 대화창(!)에는 붙여 넣지 말 것.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

const PROJECT_REF = 'caxjyimsuvjnbmjoxfad' // ASCA-2026
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`
const BUCKET = 'artist-images'
const MAX_EDGE = 1200
const QUALITY = 85
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

const dirFlag = process.argv.indexOf('--dir')
if (dirFlag === -1 || !process.argv[dirFlag + 1]) {
  console.error('❌ --dir <폴더> 로 원본 폴더를 알려 주세요.')
  process.exit(1)
}
const sourceDir = path.resolve(process.argv[dirFlag + 1])
const apply = process.argv.includes('--apply')

// 미리 보기와 업로드가 같은 행을 보도록 둘 다 서비스 키로 읽는다 (공개 키는 RLS 로 일부만 보인다)
const key = process.env.ASCA_SUPABASE_SERVICE_ROLE_KEY
if (!key) {
  console.error('❌ ASCA_SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, key, { auth: { persistSession: false } })

function listSourceFiles() {
  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ 폴더가 없습니다: ${sourceDir}`)
    process.exit(1)
  }
  return fs
    .readdirSync(sourceDir)
    .filter(name => !name.startsWith('.') && EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort()
}

async function loadArtists(slugs) {
  const { data, error } = await supabase
    .from('artists')
    .select('id,slug,name,profile_image')
    .in('slug', slugs)
  if (error) throw new Error(`작가 조회 실패: ${error.message}`)
  return data
}

function plan(files, artists) {
  const bySlug = new Map(artists.map(a => [a.slug, a]))
  const ready = []
  const skipped = []
  for (const file of files) {
    const slug = path.basename(file, path.extname(file)).normalize('NFC')
    const artist = bySlug.get(slug)
    if (!artist) skipped.push({ file, reason: '같은 slug 의 작가 없음' })
    else if (artist.profile_image) skipped.push({ file, reason: '이미 프로필 사진 있음' })
    else ready.push({ file, artist })
  }
  return { ready, skipped }
}

async function uploadOne({ file, artist }) {
  const input = fs.readFileSync(path.join(sourceDir, file))
  const { data: buffer, info } = await sharp(input)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true })
  const objectPath = `profiles/${artist.id}.webp`
  // 가리키는 행이 없는 자리라 덮어써도 안전하다 — 앞선 실행이 파일만 올리고 멈췄어도 다시 돌릴 수 있다
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: 'image/webp',
    upsert: true,
    cacheControl: '31536000',
  })
  if (error) throw new Error(`${file}: 업로드 실패 — ${error.message}`)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
  const { data: updated, error: updateError } = await supabase
    .from('artists')
    .update({ profile_image: data.publicUrl })
    .eq('id', artist.id)
    .is('profile_image', null)
    .select('id')
  if (updateError) throw new Error(`${file}: DB 갱신 실패 — ${updateError.message}`)
  if (!updated?.length) throw new Error(`${file}: 그 사이 프로필 사진이 생겨 건너뜀`)
  return { kb: Math.round(buffer.length / 1024), size: `${info.width}×${info.height}` }
}

function writeBackup(ready) {
  const dir = path.join(os.homedir(), 'Developer/Archive')
  fs.mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const file = path.join(dir, `asca-artist-portraits-backup-${stamp}.json`)
  const rows = ready.map(({ artist }) => ({
    id: artist.id,
    slug: artist.slug,
    profile_image: artist.profile_image,
  }))
  fs.writeFileSync(file, JSON.stringify(rows, null, 2))
  return file
}

const files = listSourceFiles()
const slugs = files.map(f => path.basename(f, path.extname(f)).normalize('NFC'))
const artists = await loadArtists(slugs)
const { ready, skipped } = plan(files, artists)

console.log(`원본 ${files.length}개 · 올릴 것 ${ready.length} · 건너뜀 ${skipped.length}`)
for (const r of ready) console.log(`  ✓ ${r.file} → ${r.artist.name} (${r.artist.slug})`)
for (const s of skipped) console.log(`  – ${s.file} — ${s.reason}`)

if (!apply) {
  console.log('\n미리 보기입니다. 올리려면 --apply 를 붙여 다시 실행하세요.')
  process.exit(0)
}
if (ready.length === 0) process.exit(0)

console.log(`\n백업: ${writeBackup(ready)}`)
let failed = 0
for (const r of ready) {
  try {
    const out = await uploadOne(r)
    console.log(`  ⬆ ${r.artist.name} — ${out.size}, ${out.kb}KB`)
  } catch (error) {
    failed += 1
    console.error(`  ❌ ${error.message}`)
  }
}
console.log(`\n완료: ${ready.length - failed}/${ready.length}`)
process.exit(failed ? 1 : 0)

#!/usr/bin/env node
/**
 * 작가 프로필 사진 → Supabase Storage(ASCA-2026, 'artist-images' 버킷) 업로드
 *
 * 옛 Webflow 사이트의 작가 대표 사진(album-featured-image)을 ASCA 작가 프로필로 옮길 때 쓴다.
 * 원본은 저장소 밖(~/Developer/Archive/…)에 둔다. 파일 이름(확장자 제외) = 작가 slug.
 * 기존 프로필과 같은 폴더(profiles/)에 <작가 id>-<실행 표식>.webp 로 올린다 — 덮어쓰지 않는다.
 *
 * 사용법:
 *   node scripts/upload-artist-portraits.mjs --dir <폴더>            # 미리 보기 — 무엇이 누구에게 붙는지만 출력
 *   node scripts/upload-artist-portraits.mjs --dir <폴더> --apply    # 업로드 + artists.profile_image 설정 (백업 먼저)
 *
 * 이미 프로필 사진이 있는 작가는 건너뛴다 — 덮어쓰지 않는다 (갱신도 profile_image 가 비어 있을 때만).
 * 공개(visibility='public') 작가만 올린다 — 숨김·회원 공개 작가의 사진을 공개 버킷에 올리지 않는다.
 *
 * 키: ASCA_SUPABASE_SERVICE_ROLE_KEY (미리 보기·업로드 모두).
 * .env.local 은 읽지 않는다 — 그 파일은 옛 프로젝트를 가리킨다.
 * 키는 화면·로그에 찍지 않는다. 터미널에서 직접 export 해서 쓰고, 대화창(!)에는 붙여 넣지 말 것.
 */
import { randomBytes } from 'node:crypto'
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
/** 이번 실행만의 표식 — 파일 이름에 붙여 실행끼리 자리를 나눈다 */
const RUN_ID = randomBytes(6).toString('hex')

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

// PostgREST 는 한 번에 최대 1,000행만 돌려준다 — 잘려서 작가가 조용히 빠지지 않게 나눠 읽는다
const LOOKUP_BATCH = 200

async function loadArtists(slugs) {
  const artists = []
  for (let i = 0; i < slugs.length; i += LOOKUP_BATCH) {
    const { data, error } = await supabase
      .from('artists')
      .select('id,slug,name,profile_image,visibility')
      .in('slug', slugs.slice(i, i + LOOKUP_BATCH))
    if (error) throw new Error(`작가 조회 실패: ${error.message}`)
    artists.push(...data)
  }
  return artists
}

function plan(files, artists) {
  const bySlug = new Map(artists.map(a => [a.slug, a]))
  const ready = []
  const skipped = []
  for (const file of files) {
    const slug = path.basename(file, path.extname(file)).normalize('NFC')
    const artist = bySlug.get(slug)
    if (!artist) skipped.push({ file, reason: '같은 slug 의 작가 없음' })
    // 버킷이 공개라 사진 주소는 누구나 연다 — 서비스 키는 RLS 를 우회하니 공개 작가만 직접 고른다
    else if (artist.visibility !== 'public')
      skipped.push({ file, reason: `공개 작가가 아님(${artist.visibility})` })
    // 갱신 조건(profile_image IS NULL)과 같은 기준 — 빈 문자열도 '있음'으로 보고 건너뛴다
    else if (artist.profile_image !== null)
      skipped.push({ file, reason: '이미 프로필 사진 값이 있음' })
    else ready.push({ file, artist })
  }
  // 같은 작가에 파일이 둘이면 뒤 파일이 같은 자리를 덮어쓴다 — 쓰기 전에 막는다
  const byArtist = new Map()
  for (const r of ready) byArtist.set(r.artist.id, [...(byArtist.get(r.artist.id) ?? []), r.file])
  const duplicates = [...byArtist.values()].filter(list => list.length > 1)
  return { ready, skipped, duplicates }
}

async function uploadOne({ file, artist }) {
  const input = fs.readFileSync(path.join(sourceDir, file))
  const { data: buffer, info } = await sharp(input)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true })
  // 실행마다 고유한 자리에 덮어쓰지 않고 올린다 — 다른 실행의 파일을 바꾸거나 지울 일이 없다
  const objectPath = `profiles/${artist.id}-${RUN_ID}.webp`
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: 'image/webp',
    upsert: false,
    cacheControl: '31536000',
  })
  if (error) throw new Error(`${file}: 업로드 실패 — ${error.message}`)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
  const { data: updated, error: updateError } = await supabase
    .from('artists')
    .update({ profile_image: data.publicUrl })
    .eq('id', artist.id)
    .eq('visibility', 'public')
    .is('profile_image', null)
    .select('id')
  if (updateError || !updated?.length) {
    // 이번 실행만 쓰는 자리라 지워도 안전하다 — 연결되지 않은 사진(특히 그 사이 비공개가 된 작가의 것)을 공개 버킷에 남기지 않는다
    const { error: removeError } = await supabase.storage.from(BUCKET).remove([objectPath])
    if (removeError) console.error(`  ⚠ ${file}: 올린 파일 회수 실패 — ${objectPath}`)
    if (updateError) throw new Error(`${file}: DB 갱신 실패 — ${updateError.message}`)
    throw new Error(`${file}: 그 사이 프로필 사진이 생겼거나 비공개가 되어 건너뜀`)
  }
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
const { ready, skipped, duplicates } = plan(files, artists)

console.log(`원본 ${files.length}개 · 올릴 것 ${ready.length} · 건너뜀 ${skipped.length}`)
for (const r of ready) console.log(`  ✓ ${r.file} → ${r.artist.name} (${r.artist.slug})`)
for (const s of skipped) console.log(`  – ${s.file} — ${s.reason}`)
if (duplicates.length) {
  for (const list of duplicates)
    console.log(`  ⚠ 한 작가에 파일 ${list.length}개: ${list.join(', ')}`)
  console.error('❌ 한 작가에 파일이 여럿입니다. 하나만 남기고 다시 실행하세요.')
  process.exit(1)
}

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

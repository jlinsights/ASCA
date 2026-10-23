#!/usr/bin/env node
/**
 * 작품 이미지 → Supabase Storage(ASCA-2026, 'artwork-images' 버킷) 업로드
 *
 * 원본은 public/images/artworks/originals/ 에 둔다 (git 에 올리지 않는다 — .gitignore).
 * 파일 이름(확장자 제외)으로 작품을 찾는다:
 *   1) 작품 id(uuid)  2) 기존 Google Drive 파일 id  3) 작품 제목 (공백·대소문자 무시)
 *
 * 사용법:
 *   node scripts/upload-artwork-images.mjs            # 미리 보기 — 무엇이 어느 작품에 붙는지만 출력
 *   node scripts/upload-artwork-images.mjs --apply    # 업로드 + artworks.images 갱신 (백업 먼저)
 *   --dir <폴더>   원본 폴더를 바꾼다 (기본 public/images/artworks/originals)
 *
 * 키: ASCA_SUPABASE_SERVICE_ROLE_KEY (업로드에 필요). 미리 보기는 공개 키(ASCA_SUPABASE_ANON_KEY)로도 된다.
 * .env.local 은 읽지 않는다 — 그 파일은 옛 프로젝트를 가리킨다.
 * 키는 화면·로그에 찍지 않는다. 터미널에서 직접 export 해서 쓰고, 대화창(!)에는 붙여 넣지 말 것.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

const PROJECT_REF = 'caxjyimsuvjnbmjoxfad' // ASCA-2026
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`
const BUCKET = 'artwork-images'
const MAX_EDGE = 2400
const QUALITY = 82
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic', '.tif', '.tiff'])

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dirFlag = process.argv.indexOf('--dir')
const sourceDir =
  dirFlag > -1 && process.argv[dirFlag + 1]
    ? path.resolve(process.argv[dirFlag + 1])
    : path.join(root, 'public/images/artworks/originals')
const apply = process.argv.includes('--apply')

const serviceKey = process.env.ASCA_SUPABASE_SERVICE_ROLE_KEY
const key = serviceKey || process.env.ASCA_SUPABASE_ANON_KEY
if (!key || (apply && !serviceKey)) {
  console.error(
    apply
      ? '❌ --apply 에는 ASCA_SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.'
      : '❌ ASCA_SUPABASE_SERVICE_ROLE_KEY 또는 ASCA_SUPABASE_ANON_KEY 가 필요합니다.'
  )
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, key, { auth: { persistSession: false } })

const normalize = value => value.normalize('NFC').replace(/\s+/g, '').toLowerCase()
const driveId = url =>
  /[?&]id=([\w-]+)/.exec(url ?? '')?.[1] ?? /\/d\/([\w-]+)/.exec(url ?? '')?.[1]

function listSourceFiles() {
  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ 폴더가 없습니다: ${path.relative(root, sourceDir)}`)
    process.exit(1)
  }
  return fs
    .readdirSync(sourceDir)
    .filter(name => !name.startsWith('.') && EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort()
}

async function loadArtworks() {
  const { data, error } = await supabase.from('artworks').select('id,title,images')
  if (error) throw new Error(`작품 목록 조회 실패: ${error.message}`)
  return data
}

function matchFiles(files, artworks) {
  const byId = new Map(artworks.map(a => [a.id.toLowerCase(), a]))
  const byDrive = new Map()
  const byTitle = new Map()
  for (const artwork of artworks) {
    const drive = driveId(artwork.images?.main?.url)
    if (drive) byDrive.set(drive, artwork)
    const title = normalize(artwork.title ?? '')
    byTitle.set(title, [...(byTitle.get(title) ?? []), artwork])
  }

  const matched = []
  const unmatched = []
  for (const file of files) {
    const base = path.basename(file, path.extname(file)).normalize('NFC')
    const titleHits = byTitle.get(normalize(base)) ?? []
    const artwork =
      byId.get(base.toLowerCase()) ??
      byDrive.get(base) ??
      (titleHits.length === 1 ? titleHits[0] : undefined)
    if (artwork)
      matched.push({
        file,
        artwork,
        how: byId.has(base.toLowerCase()) ? 'id' : byDrive.has(base) ? 'drive' : 'title',
      })
    else
      unmatched.push({
        file,
        reason:
          titleHits.length > 1
            ? `같은 제목 ${titleHits.length}건 — id 로 이름을 바꿔 주세요`
            : '일치하는 작품 없음',
      })
  }

  const seen = new Map()
  for (const m of matched) seen.set(m.artwork.id, [...(seen.get(m.artwork.id) ?? []), m.file])
  const duplicates = [...seen.entries()].filter(([, list]) => list.length > 1)
  return { matched, unmatched, duplicates }
}

async function uploadOne({ file, artwork }) {
  const input = fs.readFileSync(path.join(sourceDir, file))
  const { data: buffer, info } = await sharp(input)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true })
  const objectPath = `${artwork.id}/main.webp`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, buffer, {
      contentType: 'image/webp',
      upsert: true,
      cacheControl: '31536000',
    })
  if (error) throw new Error(`${file}: 업로드 실패 — ${error.message}`)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
  // 같은 경로에 다시 올리면 CDN 캐시가 옛 이미지를 줄 수 있어 버전 쿼리를 붙인다
  const url = `${data.publicUrl}?v=${Date.now()}`
  const previous = artwork.images?.main ?? {}
  const images = {
    ...(artwork.images ?? {}),
    main: {
      url,
      path: objectPath,
      width: info.width,
      height: info.height,
      original_file: file,
      ...(previous.url && !previous.path ? { original_url: previous.url } : {}),
      ...(previous.original_url ? { original_url: previous.original_url } : {}),
    },
  }
  const { error: updateError } = await supabase
    .from('artworks')
    .update({ images })
    .eq('id', artwork.id)
  if (updateError) throw new Error(`${file}: DB 갱신 실패 — ${updateError.message}`)
  return {
    title: artwork.title,
    kb: Math.round(buffer.length / 1024),
    size: `${info.width}×${info.height}`,
  }
}

function writeBackup(matched) {
  const dir = path.join(os.homedir(), 'Developer/Archive')
  fs.mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const file = path.join(dir, `asca-artwork-images-backup-${stamp}.json`)
  const rows = matched.map(({ artwork }) => ({
    id: artwork.id,
    title: artwork.title,
    images: artwork.images,
  }))
  fs.writeFileSync(file, JSON.stringify(rows, null, 2))
  return file
}

const files = listSourceFiles()
const artworks = await loadArtworks()
const { matched, unmatched, duplicates } = matchFiles(files, artworks)

console.log(
  `원본 ${files.length}개 · 작품 ${artworks.length}점 · 연결 ${matched.length} · 미연결 ${unmatched.length}`
)
for (const m of matched) console.log(`  ✓ [${m.how}] ${m.file} → ${m.artwork.title}`)
for (const u of unmatched) console.log(`  ✗ ${u.file} — ${u.reason}`)
if (duplicates.length) {
  for (const [id, list] of duplicates)
    console.log(`  ⚠ 한 작품(${id})에 파일 ${list.length}개: ${list.join(', ')}`)
  console.error('❌ 한 작품에 파일이 여럿입니다. 하나만 남기고 다시 실행하세요.')
  process.exit(1)
}

if (!apply) {
  console.log('\n미리 보기입니다. 올리려면 --apply 를 붙여 다시 실행하세요.')
  process.exit(0)
}
if (matched.length === 0) process.exit(0)

console.log(`\n백업: ${writeBackup(matched)}`)
let failed = 0
for (const m of matched) {
  try {
    const r = await uploadOne(m)
    console.log(`  ⬆ ${r.title} — ${r.size}, ${r.kb}KB`)
  } catch (error) {
    failed += 1
    console.error(`  ❌ ${error.message}`)
  }
}
console.log(`\n완료: ${matched.length - failed}/${matched.length}`)
process.exit(failed ? 1 : 0)

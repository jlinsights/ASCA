#!/usr/bin/env node
/**
 * Supabase Storage 갤러리 업로드 스크립트
 *
 * 용도: gallery-data.json에서 참조하는 WebP 파일(158MB)만
 *       Supabase Storage 'gallery' 버킷에 업로드합니다.
 *
 * 사용법:
 *   node scripts/upload-gallery-to-supabase.js --dry-run   # 업로드 대상만 출력
 *   node scripts/upload-gallery-to-supabase.js             # 실제 업로드
 *   node scripts/upload-gallery-to-supabase.js --test      # 5개만 테스트 업로드
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// ─── 설정 ────────────────────────────────────────────────
const BUCKET_NAME = 'gallery'
const CONCURRENCY = 5       // 동시 업로드 수
const PUBLIC_DIR = path.join(__dirname, '../public')
const GALLERY_DATA_PATH = path.join(__dirname, '../lib/data/gallery-data.json')
const URL_MAP_PATH = path.join(__dirname, '../lib/data/gallery-url-map.json')

const isDryRun = process.argv.includes('--dry-run')
const isTest   = process.argv.includes('--test')

// ─── Supabase 클라이언트 ─────────────────────────────────
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

// ─── 버킷 생성 (없을 경우) ───────────────────────────────
async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) throw new Error(`버킷 목록 조회 실패: ${error.message}`)

  const exists = buckets.some(b => b.name === BUCKET_NAME)
  if (!exists) {
    console.log(`🪣  버킷 '${BUCKET_NAME}' 생성 중...`)
    const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800, // 50MB per file
    })
    if (createErr) throw new Error(`버킷 생성 실패: ${createErr.message}`)
    console.log(`✅  버킷 '${BUCKET_NAME}' 생성 완료`)
  } else {
    console.log(`✅  버킷 '${BUCKET_NAME}' 이미 존재`)
  }
}

// ─── 업로드 대상 수집 ────────────────────────────────────
function collectTargets() {
  const data = JSON.parse(fs.readFileSync(GALLERY_DATA_PATH, 'utf-8'))
  const paths = new Set()

  data.items.forEach(item => {
    if (item.src.endsWith('.webp'))       paths.add(item.src)
    if (item.thumbnail.endsWith('.webp')) paths.add(item.thumbnail)
  })

  return [...paths]
}

// ─── 파일 업로드 ─────────────────────────────────────────
async function uploadFile(localPath) {
  // localPath: /images/gallery/2025/ceremony_2025/JTL01234-1.jpg
  // storagePath: 2025/ceremony_2025/JTL01234-1.jpg
  const storagePath = localPath.replace(/^\/images\/gallery\//, '')
  const fullLocalPath = path.join(PUBLIC_DIR, localPath)

  if (!fs.existsSync(fullLocalPath)) {
    return { localPath, storagePath, status: 'MISSING' }
  }

  // 이미 업로드된 파일 스킵 확인
  const { data: existing } = await supabase.storage
    .from(BUCKET_NAME)
    .list(path.dirname(storagePath), { search: path.basename(storagePath) })

  if (existing && existing.length > 0) {
    return { localPath, storagePath, status: 'SKIPPED' }
  }

  const fileBuffer = fs.readFileSync(fullLocalPath)
  const ext = path.extname(localPath).slice(1).toLowerCase()
  const mimeType = ext === 'webp' ? 'image/webp' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png'

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      cacheControl: '31536000', // 1년 캐시
      upsert: false,
    })

  if (error) {
    return { localPath, storagePath, status: 'ERROR', error: error.message }
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`
  return { localPath, storagePath, status: 'UPLOADED', publicUrl }
}

// ─── 병렬 처리 유틸 ─────────────────────────────────────
async function pLimit(tasks, concurrency) {
  const results = []
  let i = 0
  async function worker() {
    while (i < tasks.length) {
      const idx = i++
      results[idx] = await tasks[idx]()
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  return results
}

// ─── 메인 ────────────────────────────────────────────────
async function main() {
  console.log('🚀  Supabase Storage 갤러리 업로드')
  console.log(`    URL: ${supabaseUrl}`)
  console.log(`    버킷: ${BUCKET_NAME}`)
  console.log(`    모드: ${isDryRun ? 'DRY-RUN' : isTest ? 'TEST (5개)' : '전체 업로드'}`)
  console.log('')

  let targets = collectTargets()

  // 용량 계산
  let totalBytes = 0
  targets.forEach(p => {
    try { totalBytes += fs.statSync(path.join(PUBLIC_DIR, p)).size } catch {}
  })

  console.log(`📁  업로드 대상: WebP ${targets.length}개 (${(totalBytes / 1024 / 1024).toFixed(0)} MB)`)

  if (isDryRun) {
    console.log('\n📋  대상 파일 목록 (처음 10개):')
    targets.slice(0, 10).forEach(p => console.log('   ', p))
    if (targets.length > 10) console.log(`   ... 외 ${targets.length - 10}개`)
    return
  }

  if (isTest) {
    targets = targets.slice(0, 5)
    console.log(`\n🧪  테스트 모드: ${targets.length}개만 업로드합니다`)
  }

  // 버킷 확인
  await ensureBucket()

  // 업로드 실행
  console.log('\n⬆️  업로드 시작...')
  let uploaded = 0, skipped = 0, errors = 0, missing = 0
  const urlMap = fs.existsSync(URL_MAP_PATH)
    ? JSON.parse(fs.readFileSync(URL_MAP_PATH, 'utf-8'))
    : {}

  const tasks = targets.map((localPath, idx) => async () => {
    const result = await uploadFile(localPath)

    if (result.status === 'UPLOADED') {
      urlMap[localPath] = result.publicUrl
      uploaded++
    } else if (result.status === 'SKIPPED') {
      // 이미 업로드된 파일: URL 매핑이 없으면 생성
      if (!urlMap[localPath]) {
        const storagePath = localPath.replace(/^\/images\/gallery\//, '')
        urlMap[localPath] = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`
      }
      skipped++
    } else if (result.status === 'MISSING') {
      missing++
    } else {
      errors++
      console.error(`   ❌  ${localPath}: ${result.error}`)
    }

    // 진행률 출력
    const done = uploaded + skipped + errors + missing
    if (done % 50 === 0 || done === targets.length) {
      const pct = ((done / targets.length) * 100).toFixed(0)
      process.stdout.write(`\r   진행: ${done}/${targets.length} (${pct}%) ✅${uploaded} ⏭${skipped} ❌${errors}`)
    }
  })

  await pLimit(tasks, CONCURRENCY)
  console.log('\n')

  // URL 맵 저장
  fs.writeFileSync(URL_MAP_PATH, JSON.stringify(urlMap, null, 2))

  console.log('─'.repeat(50))
  console.log(`✅  업로드 완료: ${uploaded}개`)
  console.log(`⏭️   스킵 (기존): ${skipped}개`)
  console.log(`❌  에러: ${errors}개`)
  console.log(`🔍  파일 없음: ${missing}개`)
  console.log(`\n💾  URL 맵 저장: lib/data/gallery-url-map.json (${Object.keys(urlMap).length}개)`)

  if (!isTest) {
    console.log('\n📝  다음 단계: npm run gallery:update-paths')
  }
}

main().catch(err => {
  console.error('\n❌  스크립트 오류:', err.message)
  process.exit(1)
})

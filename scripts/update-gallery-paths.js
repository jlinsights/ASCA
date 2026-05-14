#!/usr/bin/env node
/**
 * gallery-data.json 경로 업데이트 스크립트
 *
 * gallery-url-map.json을 읽어 gallery-data.json,
 * gallery-2025.json, gallery-2026.json의 src/thumbnail 필드를
 * Supabase Storage URL로 교체합니다.
 *
 * 사용법:
 *   node scripts/update-gallery-paths.js --dry-run   # 변경 사항만 출력
 *   node scripts/update-gallery-paths.js             # 실제 파일 수정
 */

const fs = require('fs')
const path = require('path')

const isDryRun = process.argv.includes('--dry-run')

const DATA_DIR = path.join(__dirname, '../lib/data')
const URL_MAP_PATH = path.join(DATA_DIR, 'gallery-url-map.json')
const FILES_TO_UPDATE = ['gallery-data.json', 'gallery-2025.json', 'gallery-2026.json']

function updateFile(filename, urlMap) {
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️   ${filename} 없음 — 스킵`)
    return { updated: 0, unchanged: 0 }
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw)
  const items = data.items ?? []

  let updated = 0,
    unchanged = 0

  items.forEach(item => {
    let changed = false

    if (urlMap[item.src]) {
      item.src = urlMap[item.src]
      changed = true
    }
    if (urlMap[item.thumbnail]) {
      item.thumbnail = urlMap[item.thumbnail]
      changed = true
    }

    if (changed) updated++
    else unchanged++
  })

  if (!isDryRun) {
    fs.writeFileSync(filePath, JSON.stringify(data)) // 압축 저장 (용량 절약)
    // 분할 파일도 업데이트하기 위해 재분할 필요
  }

  return { updated, unchanged }
}

function main() {
  console.log('📝  gallery-data.json 경로 업데이트')
  console.log(`    모드: ${isDryRun ? 'DRY-RUN (파일 수정 없음)' : '실제 수정'}`)
  console.log('')

  if (!fs.existsSync(URL_MAP_PATH)) {
    console.error('❌  gallery-url-map.json이 없습니다.')
    console.error('   먼저 업로드 스크립트를 실행하세요:')
    console.error('   node scripts/upload-gallery-to-supabase.js')
    process.exit(1)
  }

  const urlMap = JSON.parse(fs.readFileSync(URL_MAP_PATH, 'utf-8'))
  const mapSize = Object.keys(urlMap).length
  console.log(`🗺️   URL 맵 로드: ${mapSize}개 항목`)
  console.log('')

  let totalUpdated = 0,
    totalUnchanged = 0

  for (const filename of FILES_TO_UPDATE) {
    const { updated, unchanged } = updateFile(filename, urlMap)
    console.log(
      `  ${isDryRun ? '[DRY]' : '✅'} ${filename}: ${updated}개 교체, ${unchanged}개 유지`
    )
    totalUpdated += updated
    totalUnchanged += unchanged
  }

  console.log('')
  console.log('─'.repeat(50))
  console.log(`총 교체: ${totalUpdated}개 / 유지: ${totalUnchanged}개`)

  if (isDryRun) {
    console.log('\n✏️   실제 적용하려면 --dry-run 없이 실행하세요.')
  } else {
    console.log('\n🎉  완료! 갤러리 페이지에서 이미지를 확인해보세요.')
    console.log('    개발 서버: http://localhost:3000/gallery')
  }
}

main()

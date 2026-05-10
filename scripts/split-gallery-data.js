#!/usr/bin/env node
/**
 * gallery-data.json을 연도별 파일로 분할합니다.
 * 결과: lib/data/gallery-2025.json, lib/data/gallery-2026.json, ...
 */

const fs = require('fs')
const path = require('path')

const srcPath = path.join(__dirname, '../lib/data/gallery-data.json')
const destDir = path.join(__dirname, '../lib/data')

const raw = fs.readFileSync(srcPath, 'utf-8')
const data = JSON.parse(raw)

const byYear = {}

for (const item of data.items) {
  const year = item.eventYear ?? 'unknown'
  if (!byYear[year]) byYear[year] = []
  byYear[year].push(item)
}

for (const [year, items] of Object.entries(byYear)) {
  const outPath = path.join(destDir, `gallery-${year}.json`)
  const payload = {
    metadata: {
      year: Number(year),
      totalImages: items.length,
      lastUpdated: data.metadata.lastUpdated,
    },
    items,
  }
  fs.writeFileSync(outPath, JSON.stringify(payload))
  console.log(`✅  gallery-${year}.json — ${items.length}개 (${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`)
}

console.log('\n🎉 분할 완료! 전체', data.items.length, '개')

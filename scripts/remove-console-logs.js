#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Console.log를 제거할 파일 패턴
const filePatterns = [
  'app/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  'lib/**/*.{ts,tsx,js,jsx}',
  'hooks/**/*.{ts,tsx,js,jsx}',
  'contexts/**/*.{ts,tsx,js,jsx}',
  'tools/**/*.{ts,tsx,js,jsx}',
]

// 제외할 파일들
const excludePatterns = [
  'node_modules/**',
  '.next/**',
  '**/*.test.{ts,tsx,js,jsx}',
  '**/*.spec.{ts,tsx,js,jsx}',
  '**/jest.setup.js',
  '**/scripts/**',
]

// 개발 환경에서만 console을 사용하도록 변경하는 함수
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  const originalContent = content
  let changedCount = 0

  // console.log, console.error, console.warn 등을 찾아서 제거
  const consolePatterns = [
    // 단순 console.log() 패턴
    /^\s*console\.(log|error|warn|info|debug)\s*\([^)]*\)\s*;?\s*$/gm,
    // 여러 줄에 걸친 console.log 패턴
    /^\s*console\.(log|error|warn|info|debug)\s*\([^)]*\)\s*;?\s*\n/gm,
    // 조건문 안의 console.log도 제거
    /{\s*console\.(log|error|warn|info|debug)\s*\([^)]*\)\s*;?\s*}/g,
  ]

  // 각 패턴에 대해 console 문 제거
  consolePatterns.forEach(pattern => {
    const matches = content.match(pattern) || []
    changedCount += matches.length
    content = content.replace(pattern, '')
  })

  // 빈 줄이 여러 개 연속으로 있는 경우 하나로 축소
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n')

  // 파일이 변경된 경우에만 저장
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content)
    return changedCount
  }

  return 0
}

// 메인 실행 함수
async function main() {
  console.log('🧹 Removing console.log statements...\n')

  let totalFiles = 0
  let totalConsoleRemoved = 0
  const processedFiles = []

  // 각 패턴에 대해 파일 검색 및 처리
  for (const pattern of filePatterns) {
    const files = glob.sync(pattern, {
      ignore: excludePatterns,
      nodir: true,
    })

    for (const file of files) {
      const removed = processFile(file)
      if (removed > 0) {
        totalFiles++
        totalConsoleRemoved += removed
        processedFiles.push({ file, removed })
      }
    }
  }

  // 결과 출력
  console.log('\n📊 Summary:')
  console.log(`   Total files processed: ${totalFiles}`)
  console.log(`   Total console statements removed: ${totalConsoleRemoved}`)

  if (processedFiles.length > 0) {
    console.log('\n📝 Files modified:')
    processedFiles.forEach(({ file, removed }) => {
      console.log(`   - ${file}: ${removed} console statement(s) removed`)
    })
  }

  console.log('\n✅ Console.log removal completed!')
}

// 스크립트 실행
main().catch(console.error)

#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// package.json 읽기
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}

// 소스 파일에서 실제 사용되는 import들 찾기
function findUsedDependencies() {
  const filePatterns = [
    'app/**/*.{ts,tsx,js,jsx}',
    'components/**/*.{ts,tsx,js,jsx}',
    'lib/**/*.{ts,tsx,js,jsx}',
    'hooks/**/*.{ts,tsx,js,jsx}',
    'contexts/**/*.{ts,tsx,js,jsx}',
    'tools/**/*.{ts,tsx,js,jsx}',
    '*.{ts,tsx,js,jsx}',
    'next.config.js',
    'tailwind.config.js',
  ]

  const excludePatterns = [
    'node_modules/**',
    '.next/**',
    '**/*.test.{ts,tsx,js,jsx}',
    '**/*.spec.{ts,tsx,js,jsx}',
    '**/jest.setup.js',
  ]

  const usedPackages = new Set()

  filePatterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: excludePatterns,
      nodir: true,
    })

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8')

        // import 문에서 패키지명 추출
        const importMatches = [
          // ES6 imports: import ... from 'package'
          ...content.matchAll(/import\s+.*?from\s+['"`]([^'"`]+)['"`]/g),
          // require: require('package')
          ...content.matchAll(/require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g),
          // dynamic imports: import('package')
          ...content.matchAll(/import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g),
        ]

        importMatches.forEach(match => {
          let packageName = match[1]

          // 상대 경로 제외
          if (packageName.startsWith('.') || packageName.startsWith('/')) {
            return
          }

          // @types/package -> package
          if (packageName.startsWith('@types/')) {
            packageName = packageName.replace('@types/', '')
          }

          // 서브패키지 처리 (예: @radix-ui/react-dialog -> @radix-ui/react-dialog)
          if (packageName.includes('/')) {
            const parts = packageName.split('/')
            if (packageName.startsWith('@')) {
              packageName = parts[0] + '/' + parts[1]
            } else {
              packageName = parts[0]
            }
          }

          usedPackages.add(packageName)
        })
      } catch (error) {
        console.warn(`Warning: Could not read file ${file}: ${error.message}`)
      }
    })
  })

  return usedPackages
}

// 분석 실행
console.log('📦 의존성 분석 중...\n')

const usedPackages = findUsedDependencies()
const allDependencies = Object.keys(dependencies)
const unusedPackages = allDependencies.filter(pkg => !usedPackages.has(pkg))

console.log('📊 분석 결과:')
console.log(`   전체 의존성: ${allDependencies.length}개`)
console.log(`   사용 중인 의존성: ${usedPackages.size}개`)
console.log(`   미사용 의존성: ${unusedPackages.length}개\n`)

if (unusedPackages.length > 0) {
  console.log('🗑️ 미사용으로 추정되는 패키지들:')
  unusedPackages.forEach(pkg => {
    const isDev = packageJson.devDependencies && packageJson.devDependencies[pkg]
    console.log(`   - ${pkg} ${isDev ? '(dev)' : '(prod)'}`)
  })
  console.log('')
  console.log('⚠️ 주의: 다음과 같은 경우 거짓 양성일 수 있습니다:')
  console.log('   - 동적으로 로드되는 패키지')
  console.log('   - 빌드 도구나 설정 파일에서만 사용되는 패키지')
  console.log('   - TypeScript 타입만 사용하는 패키지')
  console.log('   - Next.js나 기타 프레임워크에서 자동으로 사용되는 패키지\n')
}

// Radix UI 패키지 중복 확인
console.log('🔍 Radix UI 패키지 분석:')
const radixPackages = allDependencies.filter(pkg => pkg.startsWith('@radix-ui/'))
console.log(`   설치된 Radix UI 패키지: ${radixPackages.length}개`)
const usedRadixPackages = [...usedPackages].filter(pkg => pkg.startsWith('@radix-ui/'))
console.log(`   사용 중인 Radix UI 패키지: ${usedRadixPackages.length}개`)

if (radixPackages.length > usedRadixPackages.length) {
  const unusedRadix = radixPackages.filter(pkg => !usedPackages.has(pkg))
  console.log('   미사용 Radix UI 패키지:')
  unusedRadix.forEach(pkg => console.log(`     - ${pkg}`))
}
console.log('')

// 대용량 패키지 확인
console.log('📈 주요 대용량 패키지들:')
const heavyPackages = [
  'recharts',
  '@clerk/nextjs',
  'drizzle-orm',
  'next',
  'react',
  'react-dom',
  'lucide-react',
  'i18next',
  'react-i18next',
  'airtable',
]

heavyPackages.forEach(pkg => {
  if (dependencies[pkg]) {
    const used = usedPackages.has(pkg) ? '✅' : '❌'
    console.log(`   ${used} ${pkg}: ${dependencies[pkg]}`)
  }
})

console.log('\n✅ 분석 완료!')
console.log('💡 권장사항:')
console.log('   1. 미사용 패키지들을 확인 후 필요없다면 제거')
console.log('   2. 대용량 패키지들의 사용을 최적화')
console.log('   3. 동적 임포트로 번들 크기 분산')

/**
 * 갤러리 이미지 데이터 자동 생성 스크립트
 * /public/images/gallery 폴더를 스캔하여 JSON 데이터 생성
 */

const fs = require('fs')
const path = require('path')

const GALLERY_PATH = path.join(__dirname, '../public/images/gallery')
const OUTPUT_PATH = path.join(__dirname, '../lib/data/gallery-data.json')

// 카테고리별 메타데이터
const CATEGORY_METADATA = {
  committee: {
    name: '심사위원회',
    description: '동양서예협회 심사위원회 활동',
    icon: '👥',
  },
  contest: {
    name: '휘호대회',
    description: '휘호 대회 및 경연 활동',
    icon: '🏆',
  },
  invited: {
    name: '초대작가',
    description: '초대 작가 작품 전시',
    icon: '🎨',
  },
  nominee: {
    name: '추천작가',
    description: '추천 작가 작품 전시',
    icon: '⭐',
  },
  exhibition: {
    name: '전시회',
    description: '정기 전시회 및 특별전',
    icon: '🖼️',
  },
  workshop: {
    name: '워크샵',
    description: '서예 교육 및 워크샵',
    icon: '📚',
  },
  group: {
    name: '단체사진',
    description: '동양서예협회 단체 기념사진',
    icon: '👨‍👩‍👧‍👦',
  },
  award: {
    name: '시상기념',
    description: '시상 및 수상 기념사진',
    icon: '🏅',
  },
  ceremony: {
    name: '개막식 및 시상식',
    description: '개막식, 시상식 및 기념식 행사',
    icon: '🎉',
  },
  event: {
    name: '행사 이모저모',
    description: '개막식 및 전시 연계 행사 스케치',
    icon: '📸',
  },
  people: {
    name: '인물/참석자',
    description: '행사 주요 참석자 및 인물',
    icon: '👤',
  },
  sac: {
    name: '전시장 풍경',
    description: '예술의전당 전시장 이모저모',
    icon: '🏛️',
  },
}

// 이미지 파일 확장자
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

// 계절 정보 추출 함수
function getSeasonFromDate(dateString) {
  if (!dateString) return null

  const month = parseInt(dateString.split('-')[1] || dateString.substr(4, 2))
  if (month >= 3 && month <= 5) return '봄'
  if (month >= 6 && month <= 8) return '여름'
  if (month >= 9 && month <= 11) return '가을'
  return '겨울'
}

// 카테고리별 특화 태그 생성 함수
function getCategorySpecificTags(category, year) {
  const tags = []

  switch (category) {
    case 'committee':
      tags.push('심사위원회', '위원활동', '회의')
      break
    case 'contest':
      tags.push('휘호대회', '대회', '경연', '실력평가')
      break
    case 'group':
      tags.push('단체사진', '기념촬영', '협회활동', '단체')
      break
    case 'award':
      tags.push('시상', '수상', '기념', '포상')
      break
    case 'ceremony':
      tags.push('시상식', '개막식', '기념식', '행사', '의례')
      break
    case 'event':
      tags.push('행사', '이모저모', '스케치', '현장')
      break
    case 'people':
      tags.push('인물', '참석자', '회원', '작가')
      break
    case 'sac':
      tags.push('예술의전당', '전시장', '풍경', '작품설치')
      break
    case 'exhibition':
      tags.push('전시회', '작품전시', '갤러리', '전람회')
      break
    case 'invited':
      tags.push('초대작가', '특별전시', '작품')
      break
    case 'nominee':
      tags.push('추천작가', '신진작가', '작품')
      break
    case 'workshop':
      tags.push('워크샵', '교육', '강습', '학습')
      break
  }

  // 연도별 특화 태그
  if (year === 2025) {
    tags.push('2025년도', '최신')
  }

  return tags
}

/**
 * 이미지 파일이 실제로 존재하는지 확인 (파일 크기와 유효성 체크)
 */
function isValidImageFile(filePath) {
  try {
    const stat = fs.statSync(filePath)
    // 파일 크기가 너무 작으면 (1KB 미만) 손상된 이미지로 간주
    if (stat.size < 1024) {
      console.warn(`⚠️ 파일 크기가 너무 작음: ${filePath} (${stat.size} bytes)`)
      return false
    }

    // 파일 읽기 테스트 (처음 몇 바이트만 읽어서 유효성 확인)
    const buffer = Buffer.alloc(8)
    const fd = fs.openSync(filePath, 'r')
    const bytesRead = fs.readSync(fd, buffer, 0, 8, 0)
    fs.closeSync(fd)

    if (bytesRead < 8) {
      console.warn(`⚠️ 파일을 읽을 수 없음: ${filePath}`)
      return false
    }

    return true
  } catch (error) {
    console.warn(`⚠️ 파일 확인 실패: ${filePath} - ${error.message}`)
    return false
  }
}

/**
 * 디렉토리를 재귀적으로 스캔하여 유효한 이미지 파일만 찾기
 */
function scanDirectory(dirPath, relativePath = '') {
  const items = []

  try {
    const files = fs.readdirSync(dirPath)

    for (const file of files) {
      const fullPath = path.join(dirPath, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        // 썸네일 폴더는 건너뛰기
        if (file.toLowerCase() === 'thumbnails') {
          continue
        }
        // 하위 디렉토리 스캔
        const subItems = scanDirectory(fullPath, path.join(relativePath, file))
        items.push(...subItems)
      } else if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase()
        if (IMAGE_EXTENSIONS.includes(ext)) {
          // 유효한 이미지 파일인지 확인
          if (isValidImageFile(fullPath)) {
            items.push({
              filename: file,
              path: fullPath,
              relativePath: path.join(relativePath, file).replace(/\\/g, '/'),
              size: stat.size,
              modifiedTime: stat.mtime,
            })
          } else {
            console.log(`🗑️ 손상된 이미지 파일 제외: ${fullPath}`)
          }
        }
      }
    }
  } catch (error) {
    console.warn(`디렉토리 스캔 실패: ${dirPath}`, error.message)
  }

  return items
}

/**
 * 파일명과 경로에서 메타데이터 추출
 */
function extractMetadata(imageFile) {
  const pathParts = imageFile.relativePath.split('/')
  const filename = path.parse(imageFile.filename).name

  // 카테고리 추출 (폴더명에서)
  let category = 'general'
  let eventDate = null
  let eventType = null
  let eventYear = 2025 // 기본값은 2025년 (현재 모든 사진이 2025년)

  // 연도 추출 우선순위: 폴더명 > 파일명 > 파일 수정 시간
  const extractYear = text => {
    const yearMatch = text.match(/(\d{4})/)
    return yearMatch ? parseInt(yearMatch[1]) : null
  }

  // 폴더 구조 분석: category_date 또는 category
  for (const part of pathParts) {
    // 각 폴더에서 연도 추출
    const folderYear = extractYear(part)
    if (folderYear && folderYear >= 2020 && folderYear <= 2030) {
      eventYear = folderYear
    }

    if (part.includes('committee')) {
      category = 'committee'
      const dateMatch = part.match(/(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) eventDate = dateMatch[1]
    } else if (part.includes('contest')) {
      category = 'contest'
      const dateMatch = part.match(/(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) eventDate = dateMatch[1]
    } else if (part.includes('invited')) {
      category = 'invited'
      const yearMatch = part.match(/(\d{4})/)
      if (yearMatch) eventDate = yearMatch[1]
    } else if (part.includes('nominee')) {
      category = 'nominee'
      const yearMatch = part.match(/(\d{4})/)
      if (yearMatch) eventDate = yearMatch[1]
    } else if (part.includes('exhibition')) {
      category = 'exhibition'
      const yearMatch = part.match(/(\d{4})/)
      if (yearMatch) eventDate = yearMatch[1]
    } else if (part.includes('workshop')) {
      category = 'workshop'
    } else if (part.includes('group')) {
      category = 'group'
      const dateMatch = part.match(/(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) eventDate = dateMatch[1]
      else {
        const yearMatch = part.match(/(\d{4})/)
        if (yearMatch) eventDate = yearMatch[1]
      }
    } else if (part.includes('award')) {
      category = 'award'
      const dateMatch = part.match(/(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) eventDate = dateMatch[1]
      else {
        const yearMatch = part.match(/(\d{4})/)
        if (yearMatch) eventDate = yearMatch[1]
      }
    } else if (part.includes('ceremony')) {
      category = 'ceremony'
      const dateMatch = part.match(/(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) eventDate = dateMatch[1]
      else {
        const yearMatch = part.match(/(\d{4})/)
        if (yearMatch) eventDate = yearMatch[1]
      }
    } else if (part.includes('event')) {
      category = 'event'
      const dateMatch = part.match(/(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) eventDate = dateMatch[1]
      else {
        const yearMatch = part.match(/(\d{4})/)
        if (yearMatch) eventDate = yearMatch[1]
      }
    } else if (part.includes('people')) {
      category = 'people'
      const dateMatch = part.match(/(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) eventDate = dateMatch[1]
      else {
        const yearMatch = part.match(/(\d{4})/)
        if (yearMatch) eventDate = yearMatch[1]
      }
    } else if (part.includes('sac')) {
      category = 'sac'
      const dateMatch = part.match(/(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) eventDate = dateMatch[1]
      else {
        const yearMatch = part.match(/(\d{4})/)
        if (yearMatch) eventDate = yearMatch[1]
      }
    }
  }

  // 파일명에서도 연도 추출 시도 (파일명에 날짜가 있는 경우)
  const fileYear = extractYear(filename)
  if (fileYear && fileYear >= 2020 && fileYear <= 2030) {
    eventYear = fileYear
  }

  // 제목 생성 (연도 포함)
  let title = filename
  if (category === 'committee') {
    const numberMatch = filename.match(/(\d+)/)
    const num = numberMatch ? numberMatch[1] : '1'
    title = `${eventYear}년 심사위원회 활동 ${num}`
  } else if (category === 'contest') {
    const numberMatch = filename.match(/(\d+)/)
    const num = numberMatch ? numberMatch[1] : '1'
    title = `${eventYear}년 휘호대회 ${num}`
  } else if (category === 'invited' || category === 'nominee') {
    // 파일명에서 작가명과 작품명 추출
    const parts = filename.split('-')
    if (parts.length >= 2) {
      title = `${eventYear}년 ${parts[0]} - ${parts.slice(1).join(' ')}`
    } else {
      title = `${eventYear}년 ${category === 'invited' ? '초대작가' : '추천작가'} ${filename}`
    }
  } else if (category === 'group') {
    // JTL번호 기반 제목 생성
    if (filename.includes('JTL')) {
      const numberMatch = filename.match(/JTL(\d+)/)
      const num = numberMatch ? numberMatch[1] : '1'
      title = `${eventYear}년 동양서예협회 단체사진 ${num}`
    } else {
      const numberMatch = filename.match(/(\d+)/)
      const num = numberMatch ? numberMatch[1] : '1'
      title = `${eventYear}년 단체 기념사진 ${num}`
    }
  } else if (category === 'award') {
    // JTL번호 기반 시상 기념사진 제목
    if (filename.includes('JTL')) {
      const numberMatch = filename.match(/JTL(\d+)/)
      const num = numberMatch ? numberMatch[1] : '1'
      title = `${eventYear}년 시상 기념사진 ${num}`
    } else {
      const numberMatch = filename.match(/(\d+)/)
      const num = numberMatch ? numberMatch[1] : '1'
      title = `${eventYear}년 수상 기념 ${num}`
    }
  } else if (category === 'ceremony') {
    // JTL번호 기반 시상식 사진 제목
    if (filename.includes('JTL')) {
      const numberMatch = filename.match(/JTL(\d+)/)
      const num = numberMatch ? numberMatch[1] : '1'
      title = `${eventYear}년 개막식/시상식 순간 ${num}`
    } else {
      const numberMatch = filename.match(/(\d+)/)
      const num = numberMatch ? numberMatch[1] : '1'
      title = `${eventYear}년 개막식/시상식 ${num}`
    }
  } else if (category === 'event') {
    if (filename.includes('JTL')) {
      const numberMatch = filename.match(/JTL(\d+)/)
      const num = numberMatch ? numberMatch[1] : '1'
      title = `${eventYear}년 행사 이모저모 ${num}`
    } else {
      title = `${eventYear}년 행사 현장`
    }
  } else if (category === 'people') {
    if (filename.includes('JTL')) {
      const numberMatch = filename.match(/JTL(\d+)/)
      const num = numberMatch ? numberMatch[1] : '1'
      title = `${eventYear}년 행사 참석자 ${num}`
    } else {
      title = `${eventYear}년 인물 사진`
    }
  } else if (category === 'sac') {
    if (filename.includes('JTL')) {
      const numberMatch = filename.match(/JTL(\d+)/)
      const num = numberMatch ? numberMatch[1] : '1'
      title = `${eventYear}년 전시장 풍경 ${num}`
    } else {
      title = `${eventYear}년 예술의전당 현장`
    }
  } else if (category === 'exhibition') {
    // 전시회 사진 - 날짜 기반 제목
    if (filename.includes('20250620')) {
      const timeMatch = filename.match(/(\d{6})$/)
      const time = timeMatch ? timeMatch[1] : '1'
      title = `${eventYear}년 정기전시회 ${time}`
    } else {
      const numberMatch = filename.match(/(\d+)/)
      const num = numberMatch ? numberMatch[1] : '1'
      title = `${eventYear}년 전시회 현장 ${num}`
    }
  }

  // 설명 생성
  let description = ''
  if (
    eventDate &&
    (category === 'committee' ||
      category === 'contest' ||
      category === 'group' ||
      category === 'award' ||
      category === 'ceremony' ||
      category === 'exhibition')
  ) {
    const year = eventDate.includes('-') ? eventDate : eventDate
    if (category === 'group') {
      description = `${year}년 동양서예협회 단체 기념사진`
    } else if (category === 'award') {
      description = `${year}년 시상 및 수상 기념사진`
    } else if (category === 'ceremony') {
      description = `${year}년 개막식 및 시상식 현장`
    } else if (category === 'event') {
      description = `${year}년 행사 이모저모`
    } else if (category === 'people') {
      description = `${year}년 행사 주요 참석자`
    } else if (category === 'sac') {
      description = `${year}년 예술의전당 전시장 풍경`
    } else if (category === 'exhibition') {
      description = `${year}년 정기 전시회 현장 사진`
    } else {
      const formattedDate = new Date(eventDate).toLocaleDateString('ko-KR')
      description = `${CATEGORY_METADATA[category]?.name} (${formattedDate})`
    }
  } else if (CATEGORY_METADATA[category]) {
    description = CATEGORY_METADATA[category].description
  }

  return {
    title,
    description,
    category,
    eventDate,
    eventYear,
    eventType,
  }
}

/**
 * 갤러리 데이터 생성
 */
function generateGalleryData() {
  console.log('📸 갤러리 데이터 생성 시작...')

  if (!fs.existsSync(GALLERY_PATH)) {
    console.error(`❌ 갤러리 폴더를 찾을 수 없습니다: ${GALLERY_PATH}`)
    return
  }

  // 이미지 파일 스캔
  const imageFiles = scanDirectory(GALLERY_PATH)
  console.log(`🔍 ${imageFiles.length}개의 이미지 파일 발견`)

  // 갤러리 아이템 생성
  const galleryItems = imageFiles.map((file, index) => {
    const metadata = extractMetadata(file)
    const webPath = `/images/gallery/${file.relativePath}`

    // 고화질 이미지 경로 설정
    // 원본 이미지를 그대로 사용하되, Next.js 이미지 최적화에 의존
    const originalPath = webPath

    // 썸네일도 원본 이미지 사용 (Next.js가 크기별로 자동 최적화)
    // 기존 썸네일 폴더는 무시하고 원본 이미지를 썸네일로도 사용
    const thumbnailPath = originalPath

    return {
      id: `gallery_${index + 1}`,
      title: metadata.title,
      description: metadata.description,
      category: metadata.category,
      src: originalPath, // 고화질 원본 이미지
      thumbnail: thumbnailPath, // 썸네일용 (Next.js가 자동 최적화)
      originalSize: file.size,
      modifiedTime: file.modifiedTime.toISOString(),
      eventDate: metadata.eventDate,
      eventYear: metadata.eventYear, // 연도 필드 추가
      // 이미지 품질 정보 추가 (모든 이미지 고화질 처리)
      dimensions: {
        width: null, // 실제 사용시 동적 계산
        height: null,
        aspectRatio: '1:1', // 기본값, 실제로는 이미지에 따라 다름
      },
      quality: {
        isHighRes: true, // 모든 이미지를 고해상도로 처리
        suggested: 95, // 모든 이미지 95% 품질
      },
      tags: [
        metadata.category,
        `${metadata.eventYear}년`, // 연도 태그 추가
        ...(metadata.eventDate ? [metadata.eventDate.split('-')[0]] : []),
        ...(metadata.title.includes('-') ? metadata.title.split('-').map(t => t.trim()) : []),
        // 계절 정보 추가 (월별)
        ...(metadata.eventDate ? [getSeasonFromDate(metadata.eventDate)] : []),
        // 카테고리별 특화 태그
        ...getCategorySpecificTags(metadata.category, metadata.eventYear),
        // 모든 이미지 고화질 태그
        '고화질',
      ].filter(Boolean),
    }
  })

  // 카테고리별 통계
  const categoryStats = {}
  const yearStats = {}
  const availableYears = new Set()

  galleryItems.forEach(item => {
    // 카테고리별 통계
    if (!categoryStats[item.category]) {
      categoryStats[item.category] = {
        count: 0,
        ...CATEGORY_METADATA[item.category],
      }
    }
    categoryStats[item.category].count++

    // 연도별 통계
    const year = item.eventYear
    availableYears.add(year)

    if (!yearStats[year]) {
      yearStats[year] = {
        count: 0,
        categories: new Set(),
      }
    }
    yearStats[year].count++
    yearStats[year].categories.add(item.category)
  })

  // 연도별 통계 최종 처리
  const processedYearStats = {}
  Object.keys(yearStats).forEach(year => {
    processedYearStats[year] = {
      count: yearStats[year].count,
      categories: Array.from(yearStats[year].categories),
    }
  })

  // 최종 데이터 구조
  const galleryData = {
    metadata: {
      totalImages: galleryItems.length,
      lastUpdated: new Date().toISOString(),
      categories: categoryStats,
      yearStats: processedYearStats,
      availableYears: Array.from(availableYears).sort((a, b) => b - a), // 최신 연도부터
      version: '1.0.0',
    },
    categories: Object.keys(categoryStats).map(key => ({
      id: key,
      ...categoryStats[key],
    })),
    items: galleryItems.sort((a, b) => {
      // 최신순 정렬 (수정일 기준)
      return new Date(b.modifiedTime) - new Date(a.modifiedTime)
    }),
  }

  // 출력 디렉토리 생성
  const outputDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // JSON 파일 저장
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(galleryData, null, 2), 'utf8')

  console.log('✅ 갤러리 데이터 생성 완료')
  console.log(`📁 출력 파일: ${OUTPUT_PATH}`)
  console.log(`📊 총 이미지: ${galleryData.metadata.totalImages}개`)
  console.log(`📂 카테고리: ${Object.keys(categoryStats).join(', ')}`)
  console.log(`📅 연도: ${galleryData.metadata.availableYears.join(', ')}`)

  // 연도별 상세 정보
  console.log('\n📅 연도별 통계:')
  Object.entries(processedYearStats).forEach(([year, stats]) => {
    console.log(`   ${year}년: ${stats.count}개 (${stats.categories.join(', ')})`)
  })

  // 카테고리별 상세 정보
  console.log('\n📂 카테고리별 통계:')
  Object.entries(categoryStats).forEach(([category, stats]) => {
    console.log(`   ${stats.icon || '📷'} ${stats.name}: ${stats.count}개`)
  })

  return galleryData
}

// 스크립트 실행
if (require.main === module) {
  generateGalleryData()
}

module.exports = { generateGalleryData }

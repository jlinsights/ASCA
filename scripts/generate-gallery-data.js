/**
 * 갤러리 이미지 데이터 자동 생성 스크립트
 * /public/images/gallery 폴더를 스캔하여 JSON 데이터 생성
 */

const fs = require('fs');
const path = require('path');

const GALLERY_PATH = path.join(__dirname, '../public/images/gallery');
const OUTPUT_PATH = path.join(__dirname, '../lib/data/gallery-data.json');

// 카테고리별 메타데이터
const CATEGORY_METADATA = {
  committee: {
    name: '위원회',
    description: '동양서예협회 위원회 활동',
    icon: '👥'
  },
  contest: {
    name: '서예대회',
    description: '서예 대회 및 경연 활동',
    icon: '🏆'
  },
  invited: {
    name: '초대작가',
    description: '초대 작가 작품 전시',
    icon: '🎨'
  },
  nominee: {
    name: '추천작가',
    description: '추천 작가 작품 전시',
    icon: '⭐'
  },
  exhibition: {
    name: '전시회',
    description: '정기 전시회 및 특별전',
    icon: '🖼️'
  },
  workshop: {
    name: '워크샵',
    description: '서예 교육 및 워크샵',
    icon: '📚'
  }
};

// 이미지 파일 확장자
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * 디렉토리를 재귀적으로 스캔하여 이미지 파일 찾기
 */
function scanDirectory(dirPath, relativePath = '') {
  const items = [];
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 썸네일 폴더는 건너뛰기
        if (file.toLowerCase() === 'thumbnails') {
          continue;
        }
        // 하위 디렉토리 스캔
        const subItems = scanDirectory(fullPath, path.join(relativePath, file));
        items.push(...subItems);
      } else if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          items.push({
            filename: file,
            path: fullPath,
            relativePath: path.join(relativePath, file).replace(/\\/g, '/'),
            size: stat.size,
            modifiedTime: stat.mtime
          });
        }
      }
    }
  } catch (error) {
    console.warn(`디렉토리 스캔 실패: ${dirPath}`, error.message);
  }
  
  return items;
}

/**
 * 파일명과 경로에서 메타데이터 추출
 */
function extractMetadata(imageFile) {
  const pathParts = imageFile.relativePath.split('/');
  const filename = path.parse(imageFile.filename).name;
  
  // 카테고리 추출 (폴더명에서)
  let category = 'general';
  let eventDate = null;
  let eventType = null;
  
  // 폴더 구조 분석: category_date 또는 category
  for (const part of pathParts) {
    if (part.includes('committee')) {
      category = 'committee';
      const dateMatch = part.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) eventDate = dateMatch[1];
    } else if (part.includes('contest')) {
      category = 'contest';
      const dateMatch = part.match(/(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) eventDate = dateMatch[1];
    } else if (part.includes('invited')) {
      category = 'invited';
      const yearMatch = part.match(/(\d{4})/);
      if (yearMatch) eventDate = yearMatch[1];
    } else if (part.includes('nominee')) {
      category = 'nominee';
      const yearMatch = part.match(/(\d{4})/);
      if (yearMatch) eventDate = yearMatch[1];
    } else if (part.includes('exhibition')) {
      category = 'exhibition';
    } else if (part.includes('workshop')) {
      category = 'workshop';
    }
  }
  
  // 제목 생성
  let title = filename;
  if (category === 'committee') {
    const numberMatch = filename.match(/(\d+)/);
    const num = numberMatch ? numberMatch[1] : '1';
    title = `위원회 활동 ${num}`;
  } else if (category === 'contest') {
    const numberMatch = filename.match(/(\d+)/);
    const num = numberMatch ? numberMatch[1] : '1';
    title = `서예대회 ${num}`;
  } else if (category === 'invited' || category === 'nominee') {
    // 파일명에서 작가명과 작품명 추출
    const parts = filename.split('-');
    if (parts.length >= 2) {
      title = `${parts[0]} - ${parts.slice(1).join(' ')}`;
    }
  }
  
  // 설명 생성
  let description = '';
  if (eventDate && (category === 'committee' || category === 'contest')) {
    const formattedDate = new Date(eventDate).toLocaleDateString('ko-KR');
    description = `${CATEGORY_METADATA[category]?.name} (${formattedDate})`;
  } else if (CATEGORY_METADATA[category]) {
    description = CATEGORY_METADATA[category].description;
  }
  
  return {
    title,
    description,
    category,
    eventDate,
    eventType
  };
}

/**
 * 갤러리 데이터 생성
 */
function generateGalleryData() {
  console.log('📸 갤러리 데이터 생성 시작...');
  
  if (!fs.existsSync(GALLERY_PATH)) {
    console.error(`❌ 갤러리 폴더를 찾을 수 없습니다: ${GALLERY_PATH}`);
    return;
  }
  
  // 이미지 파일 스캔
  const imageFiles = scanDirectory(GALLERY_PATH);
  console.log(`🔍 ${imageFiles.length}개의 이미지 파일 발견`);
  
  // 갤러리 아이템 생성
  const galleryItems = imageFiles.map((file, index) => {
    const metadata = extractMetadata(file);
    const webPath = `/images/gallery/${file.relativePath}`;
    
    // 고화질 이미지 경로 설정
    // 원본 이미지를 그대로 사용하되, Next.js 이미지 최적화에 의존
    const originalPath = webPath;
    
    // 썸네일도 원본 이미지 사용 (Next.js가 크기별로 자동 최적화)
    // 기존 썸네일 폴더는 무시하고 원본 이미지를 썸네일로도 사용
    const thumbnailPath = originalPath;
    
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
      // 이미지 품질 정보 추가 (모든 이미지 고화질 처리)
      dimensions: {
        width: null, // 실제 사용시 동적 계산
        height: null,
        aspectRatio: '1:1' // 기본값, 실제로는 이미지에 따라 다름
      },
      quality: {
        isHighRes: true, // 모든 이미지를 고해상도로 처리
        suggested: 95 // 모든 이미지 95% 품질
      },
      tags: [
        metadata.category,
        ...(metadata.eventDate ? [metadata.eventDate.split('-')[0]] : []), // 연도 추가
        ...(metadata.title.includes('-') ? metadata.title.split('-').map(t => t.trim()) : []),
        // 모든 이미지 고화질 태그
        '고화질'
      ].filter(Boolean)
    };
  });
  
  // 카테고리별 통계
  const categoryStats = {};
  galleryItems.forEach(item => {
    if (!categoryStats[item.category]) {
      categoryStats[item.category] = {
        count: 0,
        ...CATEGORY_METADATA[item.category]
      };
    }
    categoryStats[item.category].count++;
  });
  
  // 최종 데이터 구조
  const galleryData = {
    metadata: {
      totalImages: galleryItems.length,
      lastUpdated: new Date().toISOString(),
      categories: categoryStats,
      version: '1.0.0'
    },
    categories: Object.keys(categoryStats).map(key => ({
      id: key,
      ...categoryStats[key]
    })),
    items: galleryItems.sort((a, b) => {
      // 최신순 정렬 (수정일 기준)
      return new Date(b.modifiedTime) - new Date(a.modifiedTime);
    })
  };
  
  // 출력 디렉토리 생성
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // JSON 파일 저장
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(galleryData, null, 2), 'utf8');
  
  console.log('✅ 갤러리 데이터 생성 완료');
  console.log(`📁 출력 파일: ${OUTPUT_PATH}`);
  console.log(`📊 총 이미지: ${galleryData.metadata.totalImages}개`);
  console.log(`📂 카테고리: ${Object.keys(categoryStats).join(', ')}`);
  
  // 카테고리별 상세 정보
  Object.entries(categoryStats).forEach(([category, stats]) => {
    console.log(`   ${stats.icon || '📷'} ${stats.name}: ${stats.count}개`);
  });
  
  return galleryData;
}

// 스크립트 실행
if (require.main === module) {
  generateGalleryData();
}

module.exports = { generateGalleryData };
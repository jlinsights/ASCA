#!/usr/bin/env node

/**
 * 갤러리 이미지 최적화 스크립트
 *
 * 기능:
 * - WebP, AVIF 포맷으로 변환
 * - 반응형 다중 해상도 생성 (640w ~ 2560w)
 * - 원본 이미지 유지 (백업)
 * - 진행 상황 및 통계 표시
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

// 설정
const CONFIG = {
  // 생성할 이미지 너비 (반응형 대응)
  sizes: [640, 750, 828, 1080, 1200, 1920, 2560],

  // 품질 설정
  quality: {
    webp: 85,
    avif: 80,
    jpeg: 85
  },

  // 대상 디렉토리
  sourceDir: 'public/images/gallery',

  // 처리할 이미지 확장자
  extensions: ['jpg', 'jpeg', 'png'],

  // 이미 최적화된 이미지 건너뛰기
  skipOptimized: true
};

// 진행 상황 추적
let stats = {
  totalImages: 0,
  processedImages: 0,
  skippedImages: 0,
  totalOriginalSize: 0,
  totalOptimizedSize: 0,
  errors: []
};

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 진행률 표시
 */
function showProgress() {
  const percent = ((stats.processedImages + stats.skippedImages) / stats.totalImages * 100).toFixed(1);
  const savings = stats.totalOriginalSize > 0
    ? ((1 - stats.totalOptimizedSize / stats.totalOriginalSize) * 100).toFixed(1)
    : 0;

  console.log(`\n📊 진행률: ${percent}% (${stats.processedImages + stats.skippedImages}/${stats.totalImages})`);
  console.log(`✅ 처리완료: ${stats.processedImages}개`);
  console.log(`⏭️  건너뛰기: ${stats.skippedImages}개`);
  console.log(`💾 원본 크기: ${formatBytes(stats.totalOriginalSize)}`);
  console.log(`🚀 최적화 크기: ${formatBytes(stats.totalOptimizedSize)}`);
  console.log(`📉 용량 절감: ${savings}%`);
}

/**
 * 이미지가 이미 최적화되었는지 확인
 */
async function isAlreadyOptimized(imagePath) {
  const dir = path.dirname(imagePath);
  const name = path.basename(imagePath, path.extname(imagePath));

  // 640w WebP가 있으면 최적화된 것으로 간주
  const webpPath = path.join(dir, `${name}-640w.webp`);

  try {
    await fs.access(webpPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 단일 이미지 최적화
 */
async function optimizeImage(imagePath) {
  const dir = path.dirname(imagePath);
  const ext = path.extname(imagePath);
  const name = path.basename(imagePath, ext);

  console.log(`\n🖼️  처리 중: ${path.relative(CONFIG.sourceDir, imagePath)}`);

  try {
    // 원본 파일 크기
    const originalStats = await fs.stat(imagePath);
    stats.totalOriginalSize += originalStats.size;

    // Sharp 인스턴스 생성
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    console.log(`   원본: ${metadata.width}x${metadata.height} (${formatBytes(originalStats.size)})`);

    let optimizedSize = 0;
    let generatedCount = 0;

    // 각 크기별로 WebP와 AVIF 생성
    for (const size of CONFIG.sizes) {
      // 원본보다 큰 크기는 건너뛰기
      if (size > metadata.width) continue;

      // WebP 생성
      const webpPath = path.join(dir, `${name}-${size}w.webp`);
      await sharp(imagePath)
        .resize(size, null, { withoutEnlargement: true })
        .webp({ quality: CONFIG.quality.webp })
        .toFile(webpPath);

      const webpStats = await fs.stat(webpPath);
      optimizedSize += webpStats.size;
      generatedCount++;

      // AVIF 생성 (더 나은 압축률)
      const avifPath = path.join(dir, `${name}-${size}w.avif`);
      await sharp(imagePath)
        .resize(size, null, { withoutEnlargement: true })
        .avif({ quality: CONFIG.quality.avif })
        .toFile(avifPath);

      const avifStats = await fs.stat(avifPath);
      optimizedSize += avifStats.size;
      generatedCount++;
    }

    stats.totalOptimizedSize += optimizedSize;
    stats.processedImages++;

    const savings = ((1 - optimizedSize / originalStats.size) * 100).toFixed(1);
    console.log(`   ✅ ${generatedCount}개 파일 생성 (${formatBytes(optimizedSize)}, ${savings}% 절감)`);

  } catch (error) {
    console.error(`   ❌ 에러: ${error.message}`);
    stats.errors.push({ file: imagePath, error: error.message });
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 ASCA 갤러리 이미지 최적화 시작\n');
  console.log(`📁 대상 디렉토리: ${CONFIG.sourceDir}`);
  console.log(`📐 생성할 크기: ${CONFIG.sizes.join('w, ')}w`);
  console.log(`🎨 포맷: WebP (${CONFIG.quality.webp}%), AVIF (${CONFIG.quality.avif}%)\n`);

  // 이미지 파일 찾기
  const pattern = `${CONFIG.sourceDir}/**/*.{${CONFIG.extensions.join(',')}}`;
  const images = await glob(pattern, { nodir: true });

  stats.totalImages = images.length;
  console.log(`📸 총 ${stats.totalImages}개 이미지 발견\n`);

  if (stats.totalImages === 0) {
    console.log('⚠️  처리할 이미지가 없습니다.');
    return;
  }

  // 각 이미지 처리
  for (const imagePath of images) {
    // 이미 최적화된 이미지 건너뛰기
    if (CONFIG.skipOptimized && await isAlreadyOptimized(imagePath)) {
      console.log(`⏭️  건너뛰기: ${path.relative(CONFIG.sourceDir, imagePath)} (이미 최적화됨)`);
      stats.skippedImages++;

      // 건너뛴 파일의 원본 크기도 통계에 포함
      const originalStats = await fs.stat(imagePath);
      stats.totalOriginalSize += originalStats.size;

      continue;
    }

    await optimizeImage(imagePath);

    // 진행 상황 표시 (매 10개마다)
    if ((stats.processedImages + stats.skippedImages) % 10 === 0) {
      showProgress();
    }
  }

  // 최종 결과 표시
  console.log('\n' + '='.repeat(60));
  console.log('✨ 최적화 완료!\n');
  showProgress();

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  에러 발생: ${stats.errors.length}개`);
    stats.errors.forEach(({ file, error }) => {
      console.log(`   - ${path.relative(CONFIG.sourceDir, file)}: ${error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 다음 단계:');
  console.log('   1. Next.js Image 컴포넌트에서 최적화된 이미지 사용');
  console.log('   2. sizes 속성 설정: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"');
  console.log('   3. 배포 후 Core Web Vitals 확인\n');
}

// 스크립트 실행
main().catch(error => {
  console.error('\n❌ 치명적 에러:', error);
  process.exit(1);
});

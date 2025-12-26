#!/usr/bin/env node

/**
 * 갤러리 이미지 최적화 스크립트 (테스트 버전)
 * group_2025 디렉토리만 처리하여 동작 확인
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

// 설정
const CONFIG = {
  sizes: [640, 750, 828, 1080, 1200, 1920, 2560],
  quality: {
    webp: 85,
    avif: 80,
    jpeg: 85
  },
  // 테스트용: group_2025만 처리
  sourceDir: 'public/images/gallery/2025/group_2025',
  extensions: ['jpg', 'jpeg', 'png'],
  skipOptimized: true
};

let stats = {
  totalImages: 0,
  processedImages: 0,
  skippedImages: 0,
  totalOriginalSize: 0,
  totalOptimizedSize: 0,
  errors: []
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

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

async function isAlreadyOptimized(imagePath) {
  const dir = path.dirname(imagePath);
  const name = path.basename(imagePath, path.extname(imagePath));
  const webpPath = path.join(dir, `${name}-640w.webp`);

  try {
    await fs.access(webpPath);
    return true;
  } catch {
    return false;
  }
}

async function optimizeImage(imagePath) {
  const dir = path.dirname(imagePath);
  const ext = path.extname(imagePath);
  const name = path.basename(imagePath, ext);

  console.log(`\n🖼️  처리 중: ${path.relative(CONFIG.sourceDir, imagePath)}`);

  try {
    const originalStats = await fs.stat(imagePath);
    stats.totalOriginalSize += originalStats.size;

    const image = sharp(imagePath);
    const metadata = await image.metadata();

    console.log(`   원본: ${metadata.width}x${metadata.height} (${formatBytes(originalStats.size)})`);

    let optimizedSize = 0;
    let generatedCount = 0;

    for (const size of CONFIG.sizes) {
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

      // AVIF 생성
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

async function main() {
  console.log('🧪 ASCA 갤러리 이미지 최적화 테스트\n');
  console.log(`📁 대상 디렉토리: ${CONFIG.sourceDir}`);
  console.log(`📐 생성할 크기: ${CONFIG.sizes.join('w, ')}w`);
  console.log(`🎨 포맷: WebP (${CONFIG.quality.webp}%), AVIF (${CONFIG.quality.avif}%)\n`);

  const pattern = `${CONFIG.sourceDir}/**/*.{${CONFIG.extensions.join(',')}}`;
  const images = await glob(pattern, { nodir: true });

  stats.totalImages = images.length;
  console.log(`📸 총 ${stats.totalImages}개 이미지 발견\n`);

  if (stats.totalImages === 0) {
    console.log('⚠️  처리할 이미지가 없습니다.');
    return;
  }

  for (const imagePath of images) {
    if (CONFIG.skipOptimized && await isAlreadyOptimized(imagePath)) {
      console.log(`⏭️  건너뛰기: ${path.relative(CONFIG.sourceDir, imagePath)} (이미 최적화됨)`);
      stats.skippedImages++;

      const originalStats = await fs.stat(imagePath);
      stats.totalOriginalSize += originalStats.size;

      continue;
    }

    await optimizeImage(imagePath);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ 테스트 완료!\n');
  showProgress();

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  에러 발생: ${stats.errors.length}개`);
    stats.errors.forEach(({ file, error }) => {
      console.log(`   - ${path.relative(CONFIG.sourceDir, file)}: ${error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ 테스트 성공!');
  console.log('💡 전체 갤러리 최적화: npm run images:optimize\n');
}

main().catch(error => {
  console.error('\n❌ 치명적 에러:', error);
  process.exit(1);
});

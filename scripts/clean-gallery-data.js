#!/usr/bin/env node

/**
 * 갤러리 데이터에서 존재하지 않는 이미지 파일을 제거하는 스크립트
 * 사용법: node scripts/clean-gallery-data.js [--dry-run] [--backup]
 */

const fs = require('fs');
const path = require('path');

// 명령줄 인수 파싱
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldBackup = args.includes('--backup');

const GALLERY_DATA_PATH = './lib/data/gallery-data.json';
const BACKUP_PATH = './lib/data/gallery-data.backup.json';

function main() {
  console.log('🎨 갤러리 데이터 정리 스크립트 시작...\n');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN 모드: 실제 변경 없이 시뮬레이션만 실행됩니다.\n');
  }

  // 갤러리 데이터 읽기
  console.log('📖 갤러리 데이터를 읽는 중...');
  let galleryData;
  try {
    galleryData = JSON.parse(fs.readFileSync(GALLERY_DATA_PATH, 'utf8'));
  } catch (error) {
    console.error('❌ 갤러리 데이터 파일을 읽을 수 없습니다:', error.message);
    process.exit(1);
  }

  const originalCount = galleryData.items.length;
  console.log(`   총 ${originalCount}개의 이미지 항목 발견\n`);

  // 존재하지 않는 파일 찾기
  console.log('🔍 이미지 파일 존재 여부 확인 중...');
  
  const validItems = [];
  const invalidItems = [];

  galleryData.items.forEach((item, index) => {
    // /images/gallery/를 public/images/gallery/로 변환
    const actualPath = path.join('./public', item.src);
    
    if (fs.existsSync(actualPath)) {
      validItems.push(item);
    } else {
      invalidItems.push({
        index: index + 1,
        item: item,
        path: item.src
      });
    }
  });

  console.log(`   ✅ 존재하는 파일: ${validItems.length}개`);
  console.log(`   ❌ 존재하지 않는 파일: ${invalidItems.length}개\n`);

  // 존재하지 않는 파일 목록 출력
  if (invalidItems.length > 0) {
    console.log('🚨 다음 이미지 파일들이 존재하지 않습니다:');
    invalidItems.forEach(invalid => {
      console.log(`   ${invalid.index}. ${invalid.path}`);
      if (invalid.item.title) {
        console.log(`      제목: ${invalid.item.title}`);
      }
    });
    console.log('');

    if (!isDryRun) {
      // 백업 생성
      if (shouldBackup) {
        console.log('💾 원본 파일 백업 중...');
        try {
          fs.copyFileSync(GALLERY_DATA_PATH, BACKUP_PATH);
          console.log(`   백업 완료: ${BACKUP_PATH}\n`);
        } catch (error) {
          console.error('❌ 백업 생성 실패:', error.message);
          process.exit(1);
        }
      }

      // 새로운 갤러리 데이터 생성
      console.log('🛠️  갤러리 데이터 업데이트 중...');
      const cleanedData = {
        ...galleryData,
        items: validItems
      };

      try {
        fs.writeFileSync(GALLERY_DATA_PATH, JSON.stringify(cleanedData, null, 2), 'utf8');
        console.log('   ✅ 갤러리 데이터가 성공적으로 업데이트되었습니다.\n');
      } catch (error) {
        console.error('❌ 파일 쓰기 실패:', error.message);
        process.exit(1);
      }
    }

    // 결과 요약
    console.log('📊 작업 요약:');
    console.log(`   • 원본 항목 수: ${originalCount}`);
    console.log(`   • 제거된 항목 수: ${invalidItems.length}`);
    console.log(`   • 최종 항목 수: ${validItems.length}`);
    
    if (isDryRun) {
      console.log('\n💡 실제로 파일을 정리하려면 --dry-run 없이 실행하세요.');
      console.log('   백업을 원한다면 --backup 플래그를 추가하세요.');
    }
  } else {
    console.log('🎉 모든 이미지 파일이 정상적으로 존재합니다!');
    console.log('   정리할 항목이 없습니다.\n');
  }

  console.log('✨ 갤러리 데이터 정리 완료!');
}

// 사용법 출력
function printUsage() {
  console.log('사용법: node scripts/clean-gallery-data.js [옵션]');
  console.log('');
  console.log('옵션:');
  console.log('  --dry-run    실제 변경 없이 시뮬레이션만 실행');
  console.log('  --backup     원본 파일을 백업 후 진행');
  console.log('  --help       이 도움말 표시');
  console.log('');
  console.log('예시:');
  console.log('  node scripts/clean-gallery-data.js --dry-run');
  console.log('  node scripts/clean-gallery-data.js --backup');
  console.log('  node scripts/clean-gallery-data.js --dry-run --backup');
}

// 도움말 요청 처리
if (args.includes('--help')) {
  printUsage();
  process.exit(0);
}

// 메인 실행
main();
#!/usr/bin/env node

// 안전하게 제거 가능한 미사용 패키지들
// 신중하게 검토한 후 제거
const SAFE_TO_REMOVE = [
  // 현재 사용하지 않는 것으로 확인된 패키지들
  'critters',  // CSS 인라인 도구 - 사용하지 않음
  'embla-carousel-react', // 캐러셀 - 사용하지 않음
  'react-helmet-async', // 헬멧 - 사용하지 않음 (Next.js의 Head 사용)
  'wait-on', // 서버 대기 - 사용하지 않음
];

const KEEP_ESSENTIAL = [
  // 필수 패키지들 (분석에서 잘못 탐지된 것들)
  'react-dom', // React 필수
  'i18next', 'react-i18next', // 다국어 지원
  '@hookform/resolvers', 'react-hook-form', 'zod', // 폼 validation
  'autoprefixer', 'postcss', 'tailwindcss', // CSS 도구
  'typescript', '@types/node', '@types/react', '@types/react-dom', // TypeScript
  'eslint', 'eslint-config-next', 'prettier', // 코드 품질
  'jest', '@testing-library/react', '@testing-library/jest-dom', // 테스팅
  'husky', 'lint-staged', // Git hooks
];

console.log('🧹 안전한 의존성 정리 도구\n');

console.log('제거 예정 패키지:');
SAFE_TO_REMOVE.forEach(pkg => {
  console.log(`  - ${pkg}`);
});

console.log('\n보존할 필수 패키지들:');
KEEP_ESSENTIAL.slice(0, 10).forEach(pkg => {
  console.log(`  - ${pkg}`);
});
console.log(`  ... 및 ${KEEP_ESSENTIAL.length - 10}개 추가`);

console.log('\n실행하려면 다음 명령어를 사용하세요:');
console.log(`npm uninstall ${SAFE_TO_REMOVE.join(' ')}`);

// 번들 크기 최적화 제안
console.log('\n📦 번들 크기 최적화 제안:');
console.log('1. Recharts는 필요한 차트만 동적 임포트');
console.log('2. Radix UI 컴포넌트들은 트리쉐이킹 최적화');
console.log('3. Lucide React 아이콘들은 개별 임포트');
console.log('4. 다국어 지원은 필요한 언어만 로드');
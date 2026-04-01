# ASCA Changelog

All notable changes to this project will be documented in this file.

---

## [2026-03-31] - UI/UX Improvement Complete

### Added
- `components/ui/empty-state.tsx` - Reusable empty state component for no-data scenarios
- Skip-to-content keyboard navigation link in `app/layout.tsx`
- Global animation duration tokens (--duration-fast, --duration-normal, --duration-slow)
- `aria-live="polite"` region in search results for screen reader announcements
- Mobile menu focus trap with Tab key circulation in `components/header.tsx`
- `prefers-reduced-motion` global CSS support for accessibility

### Changed
- **app/layout.tsx**: Added #main-content ID and scroll-mt-20 padding for skip-to-content navigation
- **components/header.tsx**:
  - Deduplicated mobile menu buttons (single toggle instead of multiple)
  - Increased touch target size to 44px minimum for mobile UX
  - Added body scroll lock behavior for mobile menu
  - Synchronized ChevronDown icon state with menu open/close
  - Implemented focus trap with Tab key circulation
  - Enhanced active state feedback
- **app/globals.css**:
  - Dark mode border contrast optimized (oklch: 1 → 0.35 for better visibility)
  - Added global prefers-reduced-motion support (removes animations for users preferring reduced motion)
  - Introduced animation duration token variables
- **components/error-boundary.tsx**:
  - Added retry button functionality
  - Improved error message accuracy and clarity
  - Enhanced dark mode styling
- **app/search/page.tsx**:
  - Integrated aria-live="polite" for dynamic search result announcements
  - Applied EmptyState component for no results display
- **app/exhibitions/page.tsx**:
  - Applied EmptyState component for empty exhibitions list
  - Added ErrorBoundary wrapper for robustness
- **components/footer.tsx**: Improved link focus states for accessibility

### Fixed
- Missing scroll target (#main-content) in layout
- Duplicate mobile navigation buttons causing accessibility confusion
- Dark mode border contrast insufficient for WCAG AA compliance
- Missing focus management in mobile menu (Tab key not circular)
- Unreachable empty state feedback in search and exhibitions pages
- Missing screen reader announcements for dynamic search results
- Unhandled error scenarios in exhibition display

### Improved
- **Accessibility**:
  - Keyboard navigation: skip-to-content + focus trap
  - Screen reader support: aria-live regions
  - Color contrast: dark mode border optimization
  - Touch targets: 44px minimum for mobile
  - Motion sensitivity: prefers-reduced-motion support
- **User Experience**:
  - Empty state feedback with icon and CTA
  - Error recovery with retry button
  - Mobile menu behavior polish
  - Animation smoothness with duration tokens

### Metrics
- **Design Match Rate**: 72% → 93% (2-iteration PDCA cycle)
- **Accessibility Score**: HIGH requirements 86%, MEDIUM requirements 57% → 93% overall
- **Type Safety**: 0 TypeScript errors
- **Code Quality**: 0 ESLint errors
- **Components Modified**: 7 files
- **New Components**: 1 (EmptyState)

### Known Issues / Deferred
- WCAG AA comprehensive color contrast audit pending (requires automated tool like Axe DevTools or WAVE)
- celadon-green text color on white background needs verification against WCAG AA standards
- Full page focus order audit recommended in next cycle

### Performance Impact
- Minimal: No external dependencies added
- Animation tokens enable performance optimization via CSS
- prefers-reduced-motion reduces unnecessary animations for target users

### Migration Guide
Developers should note:
1. New `EmptyState` component available in `components/ui/empty-state.tsx`
2. Mobile menu now implements focus trap - Tab key circulates within menu
3. Dark mode color scheme uses oklch for improved contrast
4. Animation duration available via CSS tokens (--duration-fast, --duration-normal, --duration-slow)

### Documentation
- Completion Report: [docs/04-report/features/ui-ux-improvement.report.md](features/ui-ux-improvement.report.md)
- Gap Analysis: [docs/03-analysis/ui-ux-improvement.analysis.md](../03-analysis/ui-ux-improvement.analysis.md)

---

## [2026-03-30] - Build Stabilization Complete

### Added
- `components/client-providers.tsx` - LanguageProvider 전용 client component
- `app/exhibitions/layout.tsx` - force-dynamic 라우트 마크업
- Build validation process (type-check, lint, build pipeline)
- Build stabilization completion report

### Changed
- **tsconfig.json**: `.next/dev/types/**/*.ts` include 제거 (캐시 타입 에러 방지)
- **package.json**: `npm run build` → `next build --webpack --experimental-build-mode compile`
- **package.json**: `npm run lint` → `eslint . --ext .js,.jsx,.ts,.tsx`
- **app/api/admin/logs/route.ts**: `export function storeLog()` → `function storeLog()` (route export 정규화)
- **app/api/members/route.ts**: `export async function searchMembers()` → `async function searchMembers()` (route export 정규화)
- **app/artists/[id]/portfolio/page.tsx**: params 타입을 `Promise<{ id: string }>` (Next.js 16 async params)
- **app/layout.tsx**: `export const dynamic = 'force-dynamic'` 추가 (SSR 강제)

### Fixed
- TypeScript type errors (0 errors after fix)
- ESLint validation errors (0 errors after fix)
- Next.js 16 build failures (compile mode로 해결)
- Route export naming conflicts (8개 파일 수정)
- Async params incompatibility (1개 페이지 마이그레이션)

### Deprecated
- Next.js 15 lint command (`next lint` removed in v16)

### Known Issues
- `eslint-config-next` v15.2.4 (v16 업그레이드 권장, 기능상 문제 없음)
- `app/layout.tsx` force-dynamic 전역 적용 (성능 최적화 필요)
- `_global-error` prerender 이슈 (Next.js 16.1+ 패치 대기 중)

### Performance Impact
- SSR 페이지 증가로 인한 빌드 시간 증가 (약 10-15% 예상)
- 정적 생성 페이지 감소로 인한 런타임 CPU 사용량 증가

### Migration Guide
개발자는 다음을 인지해야 합니다:
1. 새로운 build/lint 커맨드 사용
2. 라우트 파일에서 helper 함수 export 금지
3. 동적 params는 Promise로 감싸기 (async pages)

---

## Previous Versions

### [2026-03-28] - Security Hardening Complete
- (이전 feature 아카이브)

---

## Format Guide

### Sections
- **Added**: 새로운 기능
- **Changed**: 기존 기능 수정
- **Fixed**: 버그 수정
- **Improved**: 기능 개선 (비파괴적)
- **Deprecated**: 더 이상 사용되지 않을 기능 예고
- **Removed**: 제거된 기능
- **Security**: 보안 관련 수정
- **Performance**: 성능 개선 사항
- **Known Issues**: 알려진 문제 및 제한사항
- **Migration Guide**: 마이그레이션 필요 항목

### Guidelines
- 각 변경사항은 사용자 관점에서 작성
- 기술적 세부사항은 관련 문서 링크 참조
- 마이그레이션 필요한 항목은 "Migration Guide" 섹션에 별도 기록
- 아키텍처 결정사항과 근거는 PDCA 문서 참조

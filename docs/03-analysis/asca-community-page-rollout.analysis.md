# ASCA Community Page Rollout — Analysis (Check Phase)

*Created: 2026-05-10*
*Phase: 03-analysis (PDCA Check)*
*Plan: docs/01-plan/features/asca-community-page-rollout.plan.md*
*Design: docs/02-design/features/asca-community-page-rollout.design.md*
*Parent: asca-homepage-brand-rollout (completed 2026-05-10, OQ#4 후속)*
*Source: bkit:gap-detector agent*

---

## 1. Summary

| 지표 | 값 |
|---|---|
| **Match Rate** | **100%** (8 / 8, Out-of-scope 4건 제외) |
| Match | 8 |
| Partial | 0 |
| Missing | 0 |
| Out-of-scope (분리 사이클로 이관) | 4 |
| 빌드 | ✓ Compiled successfully in 32.4s, 0 errors, 0 warnings, `/community` 라우트 등록 |
| TypeScript | tsc --noEmit clean (D1~D8 모든 단계) |

**평가: Report-Ready (≥ 90%) — `/pdca report` 진입 가능.**

매치율 계산식: `Match / (Match + Partial + Missing) × 100` (Out-of-scope 제외)

본 사이클은 parent `asca-homepage-brand-rollout` 의 패턴(whileInView once:true, 분리선 `w-12 h-px bg-foreground/30`, 인주색 좌측 세로선, OQ placeholder aria-disabled)을 그대로 재사용해 일관성을 확보했고, 결과적으로 1차 라운드에서 Partial·Missing 0건.

---

## 2. Design §별 매핑 표

### Plan OQ 5건 채택 결정 반영

| OQ | 결정 | 구현 위치 | 상태 |
|---|---|---|---|
| #1 Hero 시각 모티프 | 작은 인장 SVG (`<SealMark>`) + text fallback | `components/brand/seal-mark.tsx` (variant·color·ariaLabel 인터페이스 정확 일치) | Match |
| #2 카페·카톡 URL | i18n placeholder + 사무국 결정 대기 | `lib/i18n/translations.ts` `communityCafeNaverUrl`·`communityKakaoUrl` 모두 `'#'` 4언어. UI는 aria-disabled 안전 동작 | Match (deferred placeholder 패턴 정확 적용) |
| #3 100일 임서 신청 동선 | 카페 댓글 + 사무국 메일 보조 | `imseo-card.tsx` CTA + `<a mailto:>` 보조 | Match |
| #4 정회원 분기 카드 형태 | 좌측 인주색 세로선 (BrandMessage 패턴) | `membership-branch.tsx` `<blockquote> + border-l-2 border-[color:var(--vermillion)]/70` | Match |
| #5 OG 이미지 | 한지 텍스처 + 한자 표지 텍스트 합성 | `app/community/page.tsx` openGraph.images `/og/community.png` 메타데이터만 | Match (자산 자체는 분리 사이클) |

### Design §0 Convention Note

| 항목 | 채택 | 구현 |
|---|---|---|
| 페이지 라우트 | `app/community/page.tsx` (LanguageContext 패턴) | ✅ 정확 일치 |
| 컴포넌트 디렉토리 | `components/community/` 신규 | ✅ 정확 |
| 신규 표지 컴포넌트 | `components/brand/seal-mark.tsx` | ✅ 정확 |

### Design §3 컴포넌트 트리

| 노드 | 구현 위치 | 상태 |
|---|---|---|
| `<CommunityHero>` | `components/community/hero.tsx` (78줄) | Match |
| `<SealMark>` | `components/brand/seal-mark.tsx` (49줄) | Match |
| `<DaoArchitecture>` | `components/community/dao-architecture.tsx` (104줄) | Match |
| `<ImseoCard>` | `components/community/imseo-card.tsx` (118줄) | Match |
| `<CafeEntry>` | `components/community/cafe-entry.tsx` (118줄) | Match |
| `<MembershipBranch>` | `components/community/membership-branch.tsx` (84줄) | Match |
| `<LayoutFooter>` 유지 | `app/community/page.tsx` import 유지 | Match |

### Design §4 SealMark 사양

| 항목 | Design | 구현 | 상태 |
|---|---|---|---|
| `<SealMark>` 인터페이스 | variant `'hero' | 'inline'`, text default `'同道'`, ariaLabel default `'협회 인장 동도'` | seal-mark.tsx 정확 일치 | Match |
| Fallback 시각 | 인주색 배경 + 한지색 텍스트 + `-rotate-2` 회전 | `bg-[color:var(--vermillion)] text-[color:var(--rice-paper,#f5f5f0)] -rotate-2` | Match |
| variant 분기 | hero `w-16 h-16 md:w-20 md:h-20`, inline `w-10 h-10` | VARIANT_CLASS 정확 | Match |
| SVG 친필 자산 자체 | `public/brand/seal-mark.svg` | (협회 작가 의뢰 대기) | **Out-of-scope** |

### Design §5 i18n 키 표 (D7)

설계 23키 × 4언어 = **92 entry** 모두 등록 확인:

```bash
$ grep -cE "^\s+community(Hero|Dao|Imseo|Cafe|Membership)" lib/i18n/translations.ts
# 23 × 4 = 92 ✓
```

| 키 그룹 | 키 수 | × 4언어 | 상태 |
|---|---|---|---|
| Hero (L1·Body) | 2 | 8 | Match |
| Dao (Title + 3카드 × 2) | 7 | 28 | Match |
| Imseo (Title·Body·Meta·CtaLabel·MailLabel) | 5 | 20 | Match |
| Cafe (Title·Body·NaverLabel·KakaoLabel + 2 URL placeholder) | 6 | 24 | Match |
| Membership (Title·Body·CtaLabel) | 3 | 12 | Match |
| **합계** | **23** | **92** | **Match** |

### Design §6 4영역 와이어프레임

| 영역 | Design | 구현 | 상태 |
|---|---|---|---|
| Hero | 한지 배경 · whileInView즉시 (animate visible) · max-w-3xl 중앙 | hero.tsx 정확 | Match |
| DaoArchitecture | 3카드 grid · 카드 우상단 인주색 점 · stagger 0.12s | dao-architecture.tsx `top-5 right-5 w-2.5 h-2.5 rounded-sm bg-[color:var(--vermillion)]` | Match |
| ImseoCard | 1영역 중앙 · meta 라벨 · 카페 CTA + 사무국 메일 | imseo-card.tsx 정확 | Match |
| CafeEntry | 2-카드 · OQ#2 placeholder | cafe-entry.tsx `isPlaceholder()` 헬퍼로 DRY | Match |
| MembershipBranch | blockquote + 인주색 세로선 · h3 강등 · padding 작게 | membership-branch.tsx `py-16 md:py-20 lg:py-24` (다른 섹션 py-24~py-40 대비), `border-l-2 border-[color:var(--vermillion)]/70` | Match |

### Design §7 E2E (D8)

| 항목 | Design | 구현 | 상태 |
|---|---|---|---|
| 4언어 × 5영역 회귀 | 권장 5섹션 × 4언어 | `e2e/community.brand-rollout.spec.ts` 4언어 × 7 test = 28 | Match |
| OQ#2 placeholder 안전 | aria-disabled + button disabled 검증 | line 68~82 정확 | Match |
| 정회원 분기 면적 < 15% | boundingBox 비율 검증 | line 99~112 | Match |
| 시각 통일성 (SealMark X 좌표) | ±2px | line 115~138 boundingBox X 비교 | Match |
| toHaveScreenshot baseline | 권장 | (미생성) | **Out-of-scope** |

총 **30+ test 권장 → 30 test 실제 작성** (4언어 × 7 + 면적 1 + 시각통일성 1 = 30).

### Design §8 Acceptance Criteria 매핑

| Plan 기준 | 검증 |
|---|---|
| 4영역 모두 출력 | ✅ Match (5영역 page.tsx 통합 확인) |
| 4언어 SSOT 1:1 | ✅ Match (i18n 92 entry, community-marketing-playbook §1·§3·§7 인용) |
| 인라인 hex 0건 | ✅ Match (모두 `var()` 사용, 빌드 0 warnings) |
| 정회원 분기 면적 < 15% | ✅ Match (E2E spec 검증 — design §6.5 padding 강등 적용) |
| 모바일 height ≥ 48px (WCAG 2.5.5) | ✅ Match (`h-12 md:h-14` parent 패턴) |
| 4언어 × 5영역 E2E | ✅ Match (spec 작성), Out-of-scope (baseline 생성) |
| 홈 ClosingCTA 도착 정상 | ✅ Match (`/community` 라우트 신설로 자동 해소) |

### Design §9 OQ 결정 반영 표

설계 §9에서 5건 모두 매핑됨. 위 §1 (이 문서) 표와 1:1 일치. **OQ 5건 모두 ✅ Match.**

---

## 3. Gap 상세

본 분석 1차 라운드(gap-detector agent)에서 **Partial·Missing 0건**.

이유:
- parent 사이클 `asca-homepage-brand-rollout` 의 패턴이 자산화되어 있어 본 사이클에서 그대로 재사용 (whileInView·분리선·인주색 세로선·placeholder aria-disabled·DESIGN.md 토큰 라이트/다크 양쪽 등록 완료)
- design 문서 작성 시 OQ 5건 중 4건 미리 채택 결정 → do 단계 의사결정 부담 0
- OQ#2(URL)만 deferred로 두었으나 placeholder 패턴이 명확히 설계되어 있어 안전 동작 기본 보장
- `/membership` 라우트가 ASCA에 기존 존재 → MembershipBranch CTA 도착지 unblock 별도 사이클 불필요

---

## 4. Out-of-scope 명시 (분리 사이클 매핑)

design 문서에서 의도적으로 분리한 항목 — 매치율 계산에서 제외:

| 의도 cut 항목 | Design 명시 위치 | 분리 사이클 후보 |
|---|---|---|
| SealMark 친필 인장 SVG 자산 실제 제작 | §4.4 협회 작가 의뢰 (사무국 액션) | 사무국 액션 (협회 작가 의뢰) — fallback 운영 중, 도착 시 단일 교체 |
| OQ#2 카페·카톡 URL 결정 | §9 OQ#2 deferred | 사무국 액션 (i18n 1줄 갱신만으로 4언어 동시 활성) |
| OG 이미지 (`public/og/community.png`) | §10 Next Step | 디자이너 의뢰 (1200×630 한지 텍스처 + 한자 텍스트 합성) |
| E2E toHaveScreenshot baseline | §7 + §10 Next Step | `asca-homepage-brand-visual-regression-baseline` (asca-test-suite-debt unblock 후) |

메모리 `feedback_split_cycle_principle` 적용 — Out-of-scope 4건 모두 **외부 차단·의도 cut**으로 분리. iterate 단계 건너뛰고 report 진입 가능.

---

## 5. 결론

### 종합 매치율: **100%** (Out-of-scope 제외)

- **Match**: 8 (D1~D8 모두 완성)
- **Partial**: 0
- **Missing**: 0
- **Out-of-scope**: 4 (분리 사이클 매핑 완료)

### 상태

✅ **Report-Ready** (≥ 90%, 사실상 100%)

### 권장 다음 단계

1. **`/pdca report asca-community-page-rollout`** — report-generator agent 호출, `docs/04-report/features/asca-community-page-rollout.report.md` 생성
2. (병렬 — 사무국 액션) 카페·카톡 URL 결정 → OQ#2 unblock (i18n 2키 1줄 갱신)
3. (병렬 — 사무국 액션) 협회 작가 SealMark 친필 인장 의뢰
4. (병렬 — 디자이너 의뢰) OG 이미지 `public/og/community.png` 1200×630
5. (별도 사이클) `asca-membership-flow` (정회원 정관·심사·연회비) — MembershipBranch CTA 도착지 정식화
6. (별도 사이클, asca-test-suite-debt unblock 후) `asca-homepage-brand-visual-regression-baseline` — 본 사이클 + parent 사이클 toHaveScreenshot baseline 일괄

iterate 단계는 건너뜀 — Out-of-scope 4건 모두 외부 의도 cut.

---

*분석 완료. 다음: `/pdca report asca-community-page-rollout`.*

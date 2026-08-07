---
target: app/gallery/page.tsx
total_score: 29
max_score: 36
na_heuristics: 7
p0_count: 2
p1_count: 2
timestamp: 2026-08-06T07-12-52Z
slug: app-gallery-page-tsx
---

⚠️ DEGRADED: single-context (Assessment B did not return after two requests;
detector run in parent after Assessment A completed)

⚠️ 시각 검증 없음: 프로덕션 배포가 클라이언트 예외로 죽어 있어 렌더된 화면을 볼
수 없었다. 모든 판단은 소스 기반이다.

## Design Health Score

Assessment A가 제출한 표는 Nielsen 10항목과 어긋나 있었다(#6 Recognition rather
than recall 누락, #10에 존재하지 않는 "Help & support" 삽입, 합계 산술 오류).
아래는 정정본이다.

| #         | Heuristic                       | Score       | Key Issue                                                                                                                           |
| --------- | ------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 4           | URL 파라미터로 year/category/search/page 상태 유지. FilterBar에 `{totalCount} 사진`. SkeletonGrid. 라이트박스 푸터에 키 바인딩 표시 |
| 2         | Match System / Real World       | 4           | 전면 한국어. 카테고리가 기관 고유 용어(심사위원회·휘호대회·전시회). 검색 플레이스홀더 관용적                                        |
| 3         | User Control and Freedom        | 3.5         | Esc·화살표·검색 X·필터 초기화 모두 존재. URL 히스토리로 되돌리기는 되지만 UX가 이를 안 가르침                                       |
| 4         | Consistency and Standards       | 3.5         | shadcn + 8px 그리드 준수, DESIGN.md 토큰 사용. 검색 input에 `<label>` 부재                                                          |
| 5         | Error Prevention                | 3           | 이미지 오류 폴백("이미지 없음"), 빈 상태, API 오류 노출. 검색 입력 클라이언트 검증 없음                                             |
| 6         | Recognition Rather Than Recall  | 3           | 필터·검색 상시 노출은 좋음. 다만 **작품 제목이 hover 전까지 숨겨짐**, 화살표 키 내비게이션은 라이트박스 진입 전엔 발견 불가         |
| 7         | Flexibility and Efficiency      | n/a         | Experience/Read 모드 공개 갤러리. 파워유저 가속기가 기대되는 표면이 아님                                                            |
| 8         | Aesthetic and Minimalist Design | 3           | 히어로가 절제됨(그라디언트·과장 CTA 없음). 카드 hover의 `from-black/70` 오버레이가 다소 강하고 제목을 hover에 가둠                  |
| 9         | Error Recovery                  | 2.5         | 라이트박스 탈출·빈 상태 리셋은 됨. 페이지네이션 범위 밖 접근, 검색 네트워크 실패 경로가 코드에 안 보임                              |
| 10        | Help and Documentation          | 2.5         | 라이트박스 푸터 키 힌트가 유일. 갤러리 이용 안내나 메타데이터 툴팁 없음                                                             |
| **Total** |                                 | **29 / 36** | **81% — Good**                                                                                                                      |

주: Assessment A가 0.5 단위를 사용했다. 스킬 루브릭은 정수 0–4다. 값은 보존했다.

## Design Specificity Verdict

**LLM 판정 (Assessment A, 디텍터 미열람 상태):** 이 구성은 ASCA에 고유하며
무관한 제품이 그대로 가져다 쓸 수 없다.

- 카테고리 분류(👥심사위원회 / 🏆휘호대회 / 🖼️전시회)가 한국 서예 협회 조직
  구조에서 나옴. 일반 "Type/Date" 필터가 아님
- 히어로가 로고 + 태그라인 + 통계로 절제됨. 그라디언트 블롭도, 히어로 CTA도
  없음. "正法의 계승, 創新의 조화"가 작품을 주인공으로 세움
- 팔레트(Celadon Green · Scholar Red · Rice Paper)가 동아시아 서예 미학에
  명시적으로 묶여 있음

**결정론적 스캔 (detect.mjs, exit=2, 5건):**

| 심각도   | 룰                                 | 위치                                            |
| -------- | ---------------------------------- | ----------------------------------------------- |
| warning  | gradient-text                      | `components/gallery/GalleryGrid.tsx:82`         |
| warning  | ai-color-palette (from-purple-500) | `components/gallery/SocialShare.tsx:100`        |
| warning  | ai-color-palette (from-purple-600) | `components/gallery/SocialShare.tsx:100`        |
| advisory | design-system-color `#f59e0b`      | `components/gallery/ZoomableImageViewer.tsx:82` |
| advisory | design-system-color `#ef4444`      | `components/gallery/ZoomableImageViewer.tsx:82` |

**결정적 사실: 살아있는 갤러리 경로에는 지적이 0건이다.**

임포트 그래프를 실측한 결과:

```
app/gallery/page.tsx → GalleryPageClient → GalleryPageParts     ← LIVE, 디텍터 지적 0건
GalleryClient → GalleryGrid → SocialShare                        ← DEAD, warning 3건 전부 여기
ZoomableImageViewer                                              ← LIVE, 단 /artworks 표면 (갤러리 아님)
```

즉 warning 3건은 전부 죽은 코드에 있고, advisory 2건은 다른 표면에 있다. LLM
판정("고유하다")과 디텍터("slop 3건")는 충돌하지 않는다 — 서로 다른 코드를 본
것이다.

**시각 오버레이:** 없음. 스크립트 주입을 시도할 대상 페이지가 렌더되지 않는다.

## Overall Impression

살아있는 갤러리 구현(`GalleryPageClient` + `GalleryPageParts`)은 잘 만들어졌다.
절제돼 있고, 문화적 어휘가 장식이 아니라 구조로 들어가 있으며, 키보드 접근성이
나중에 덧붙인 게 아니라 처음부터 있다.

가장 큰 문제는 디자인이 아니다. **이 페이지는 프로덕션에서 렌더되지 않는다.**
별도 문서 `docs/03-analysis/asca-prod-csp-outage.analysis.md` 참조.

디자인 범위 안에서의 가장 큰 기회는 죽은 두 번째 구현을 지우는 것이다. 디텍터
지적의 100%가 거기서 나왔고, 아무도 그 코드를 볼 수 없다.

## What's Working

1. **인터랙션의 절제.** hover 애니메이션이 scale 1.02 수준이고 오버레이는
   가독성용이지 드라마용이 아니다. 관람객이 "보러 온" 의도를 존중한다.
2. **키보드 접근성이 기본값.** 라이트박스가 Esc/←/→를 지원하고 카드가
   `role="button"` + `tabIndex={0}` + Enter/Space 핸들러를 갖는다. 푸터가 이를
   노출한다. 접근성 성명서 뒤에 숨기지 않았다.
3. **스켈레톤의 품질.** `[200, 160, 220, 180]` 높이 회전이 실제 masonry 종횡비와
   맞아서 로딩 중에도 눈이 최종 레이아웃에 적응한다.

## Priority Issues

### [P0] 검색 input에 접근 가능한 이름이 없다

- **What**: `GalleryPageParts.tsx:84` — `id='gallery-search'`만 있고
  `<label htmlFor>`도 `aria-label`도 없다. placeholder만으로는 접근 가능한
  이름이 되지 않는다.
- **Why**: WCAG 4.1.2 위반. 스크린리더 사용자에게 이 입력은 이름 없는
  컨트롤이다. PRODUCT.md가 WCAG 2.1 AA를 명시하고 `design:wcag` 게이트가 걸린
  프로젝트에서 뚫린 구멍이다.
- **Fix**: `aria-label='갤러리 검색'` 추가, 또는 시각적으로 숨긴
  `<label htmlFor='gallery-search'>`.
- **Command**: `/impeccable harden`

### [P0] 라이트박스 제목이 한 줄로 잘린다

- **What**: `GalleryPageParts.tsx:281` — h2에 `line-clamp-1`. 카드 오버레이는
  `line-clamp-2`(225행)라서 **확대하면 정보가 오히려 줄어든다.**
- **Why**: 모달을 여는 행위의 기대는 "더 보기"다. "2025 대한민국 동양서예대전
  심사위원회…" 같은 실제 제목이 잘린다. 헤더에는 공간이 남는다.
- **Fix**: h2의 `line-clamp-1` 제거 또는 `line-clamp-2`로 완화.
- **Command**: `/impeccable typeset`

### [P1] 갤러리 구현이 두 벌이고 한 벌이 죽어 있다

- **What**: `GalleryClient.tsx`를 import하는 곳이 없다(주석과 테스트에만 등장).
  `GalleryClient → GalleryGrid(317) → SocialShare(230)` 약 580줄 +
  `gallery-grid/` 하위가 도달 불가다. `gallery-grid-events.test.tsx`만 이 코드를
  살아있게 붙잡고 있다.
- **Why**: 디텍터 warning 3건 전부가 여기 있다. 아무도 못 보는 코드가 품질
  신호를 오염시킨다. 더 큰 문제는 `SocialShare`(공유 기능)가 이 죽은 가지에
  있다는 것 — **살아있는 갤러리엔 공유 버튼이 없다.**
- **Fix**: 죽은 가지를 삭제하거나, 공유가 필요한 기능이면 `GalleryPageParts`로
  이식. 둘 중 하나를 정하고 테스트도 함께 정리.
- **Command**: 디자인 명령 아님 — 별도 정리 사이클

### [P1] 필터 AND 결합이 UI에 안 드러난다

- **What**: 검색어와 카테고리를 함께 걸면 API가 AND로 좁힌다(`GalleryPageClient`
  64–69행). UI에는 표시가 없다.
- **Why**: 사용자는 넓혔다고 생각하는데 0건이 되고, 빈 상태 "검색 결과가
  없습니다"는 필터가 결합됐다는 사실을 말하지 않는다.
- **Fix**: 활성 필터 뱃지 노출 — "카테고리: 전시회 + 검색: '2025'".
- **Command**: `/impeccable clarify`

### [P2] 작품 제목이 hover 전까지 안 보인다

- **What**: 카드 제목이 hover 오버레이에만 있다.
- **Why**: 터치 기기에는 hover가 없다. 모바일 관람객은 탭해서 열기 전까지
  무엇인지 모른다. 스크린리더도 `aria-label`에만 의존한다.
- **Fix**: 카드 하단에 제목을 상시 노출하거나, 최소한 터치 기기에서는 노출.
- **Command**: `/impeccable adapt`

## Persona Red Flags

**Sam (스크린리더 + 키보드 전용)**

- ❌ `gallery-search` 입력에 접근 가능한 이름 없음 (P0). 확인함.
- ❌ 카테고리 버튼 8개 이상이 개별 탭 스톱.
  `role='group' aria-label='카테고리 필터'`는 있으나 그룹 내 건너뛰기 수단이
  없음.
- ✅ 라이트박스가 `role="dialog"` + `aria-modal="true"`. 페이지네이션 화살표에
  aria-label 있음.

**Casey (한 손 모바일)**

- ❌ 제목이 hover에만 있음 — 터치에는 hover가 없다 (P2).
- ⚠️ 페이지네이션이 한 줄에 전체 페이지 번호를 렌더. 375px에서 페이지 수가
  많으면 줄바꿈이 지저분해진다.
- 참고: Assessment A는 "말줄임표가 클릭 불가"를 결함으로 적었으나, 소스 확인
  결과 `p === '…' ? <span>` 으로 의도된 구현이다. **결함 아님 — 표준 패턴이다.**
  이 지적은 기각한다.

**미술관 방문객 (PRODUCT.md 주 사용자에서 도출)**

- ✅ 로그인·가입·페이월 없음. 바로 본다.
- ❌ 공유 수단 없음. 서예 애호가는 작품을 지인에게 보내고 싶어한다.
  `SocialShare` 컴포넌트가 존재하지만 죽은 가지에 있다 (P1).
- ⚠️ 카테고리 이름이 도메인 지식을 전제한다(심사위원회 = judging panel). 협회
  관계자는 알지만 일반 관람객은 모를 수 있다.

## Minor Observations

1. `CATEGORY_META`가 `GalleryPageParts` 18–28행에 하드코딩. 백엔드가 카테고리를
   추가하면 프론트를 같이 고쳐야 한다.
2. 라이트박스 배경 클릭이 닫기다. 이미지 클릭은 `stopPropagation`으로
   안전하지만, 모바일에서 가장자리를 스치면 의도치 않게 닫힌다.
3. `/patterns/korean-pattern.png` 404 (프로덕션 네트워크 로그에서 관측).
4. 로고 이미지가 preload 되지만 load 이벤트 후 몇 초 내 미사용 경고. `as` 값
   또는 preload 의도 재검토.

## Questions to Consider

1. **masonry가 서예 사진에 맞는 레이아웃인가?** masonry는 공간 효율이 목적이다.
   서예는 개별 작품을 들여다보는 것이다. 균일 그리드나 한 번에 하나씩 보는
   방식이 작품을 더 존중하지 않나?
2. **제목을 hover에 숨긴 건 의도인가 사고인가?** 의도라면 터치 환경에 대한
   대책이 필요하고, 사고라면 P2다.
3. **다크 모드가 이 콘텐츠에 맞나?** 서예는 전통적으로 밝은 한지 위에서 본다.
   DESIGN.md가 양쪽 테마를 다루지만, 다크가 기본이어야 할 이유가 있나?
4. **`SocialShare`와 `StrokeAnimationPlayer`는 계획된 기능인가 버려진
   기능인가?** 둘 다 존재하지만 살아있는 갤러리에 연결돼 있지 않다. 방향을
   정하지 않으면 계속 신호를 오염시킨다.

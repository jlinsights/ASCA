# Exhibition Detail Mockup → Port 핸드오프

> **다음 세션 빠른 시작 가이드** (작성: 2026-04-26 본 세션 종료 시)

## TL;DR — 새 세션에서 즉시 실행할 것

```bash
cd /Users/jaehong/Developer/Projects/ASCA-exhibition-port
git status  # clean, branch feat/exhibition-detail-port
```

그 다음 슬래시 커맨드:
```
/superpowers:subagent-driven-development plan: docs/01-plan/features/exhibition-detail-mockup-port.plan.md
```

## 전체 워크플로우 진행 상황

| 단계 | 상태 | 산출물 |
|---|---|---|
| 1. Mockup 디자인 (gstack /design-html) | ✅ 완료 | `~/.gstack/projects/jlinsights-ASCA/designs/exhibition-detail-20260426/finalized.html` (943줄) |
| 2. Brainstorming (superpowers) | ✅ 완료 | `docs/02-design/features/exhibition-detail-mockup-port.design.md` (commit `397926cb`) |
| 3. Spec self-review | ✅ 완료 | commit `c711a148` (ShareBar 위치 확정, axe-core 결정 명시) |
| 4. Writing Plan (superpowers) | ✅ 완료 | `docs/01-plan/features/exhibition-detail-mockup-port.plan.md` (2,245줄, 23 task, commit `cdf41f16`) |
| 5. Worktree 셋업 | ✅ 완료 | 본 디렉터리 + 브랜치 `feat/exhibition-detail-port` |
| 6. **Subagent-driven 실행** | 🟡 **다음 세션에서 시작** | 미실행 (본 세션 컨텍스트 폭주로 dispatch 불가) |

## 잠긴 결정 (D1~D6)

- **D1**: 절충 — mockup 시각 + 운영 기능 보존 + 데이터 없는 장식은 조건부 렌더
- **D2**: 포스터를 hero 배경으로 통합, 캘리그래피 워터마크 폴백
- **D3**: 작품 풀 메타 join 쿼리 추가 (`getExhibitionFullById`)
- **D4**: Minimal scope — UI 포팅 + 작품 join만 (i18n/SSR/SEO 별도 사이클)
- **D5**: Tailwind 우선 + globals.css `@layer components` 5개 이하 추가
- **D6**: Worktree + stash + Phase 1~2 먼저 (현 단계까지 완료)

## 환경 상태 (2026-04-26 기준)

### Git
- **현 브랜치**: `feat/exhibition-detail-port` (worktree)
- **base**: `main` @ `cdf41f16` (plan commit)
- **변경 사항**: 없음 (clean)
- **stash@{0}**: `WIP: sac-academy work (paused for exhibition-detail-port)` — 본 작업과 무관, 별도 진행 예정

### 메인 ASCA 디렉터리
- 위치: `~/Developer/Projects/ASCA`
- 상태: clean (sac-academy 변경은 stash에 보관)
- 브랜치: `main`

### 워크트리 (본 디렉터리)
- 위치: `/Users/jaehong/Developer/Projects/ASCA-exhibition-port`
- 본 작업 전용

## Phase 별 Task 목록 (총 23 task)

Plan 파일에 모든 task의 TDD 5단계가 inline 코드와 함께 작성됨.

- **Phase 0** — 사전 조사 (1 task) — **plan 작성 단계에서 schema 매핑 확인 완료, skip 가능**
- **Phase 1** — 타입 + 유틸 (3 task: pickWatermarkChar / CalligraphyStyle+normalize / ExhibitionFull 확장)
- **Phase 2** — 데이터 (4 task: query / api+route / static / hook)
- **Phase 3** — UI 컴포넌트 (8 task: Loading / Error / ShareBar / MetaBand / Description / Hero / ArtworkGrid / VisitInfo)
- **Phase 4** — globals.css (1 task: dropcap)
- **Phase 5** — Orchestrator + page.tsx (2 task)
- **Phase 6** — 검증 (4 task: type/lint/test/build / 3 뷰포트 캡처 / 접근성+다크+오너 / PR)

권장: **Phase 1~2 (7 task) 완료 후 사용자 검수 → Phase 3 진행**

## Subagent-driven 실행 시 유의사항

1. **모델 선택**: Phase 1~3의 단순 task는 haiku, Phase 5 통합 task는 sonnet 권장
2. **본 worktree에서만 작업** — 메인 ASCA 디렉터리 건드리지 말 것
3. **각 task TDD 5단계 inline 코드를 그대로** 사용 (plan에서 paraphrase 금지)
4. **`.commit_message.txt` 한국어 한 줄** 매 commit 전 갱신 (ASCA CLAUDE.md 규약)
5. **commit 메시지는 conventional format** + 한국어 가능
6. **두 단계 review 게이트**: spec 준수 → 코드 품질, 둘 다 통과해야 다음 task

## 검증 게이트 (각 task 후)

```bash
npm run test -- <task-keyword>   # 해당 task의 새 테스트
npm run type-check               # 매 task 후 (특히 type 변경 task)
```

마지막 task 후:
```bash
npm run pre-commit               # 종합
```

## 참고 파일 (읽기 전용)

- Mockup HTML: `~/.gstack/projects/jlinsights-ASCA/designs/exhibition-detail-20260426/finalized.html`
- Mockup 검증 스크린샷: `/tmp/asca-verify-{desktop,tablet,mobile}.png`
- DESIGN.md (토큰 SSOT): `docs/02-design/DESIGN.md` (v1.2.0-alpha)
- Spec: `docs/02-design/features/exhibition-detail-mockup-port.design.md`
- Plan: `docs/01-plan/features/exhibition-detail-mockup-port.plan.md`

## 종료 후 정리 (PR 머지 후)

```bash
# 메인 디렉터리에서
cd ~/Developer/Projects/ASCA
git stash pop  # sac-academy 변경 복원
git worktree remove ~/Developer/Projects/ASCA-exhibition-port
git branch -d feat/exhibition-detail-port  # 머지 후 삭제
```

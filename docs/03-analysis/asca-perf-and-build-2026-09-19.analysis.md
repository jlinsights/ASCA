# ASCA 성능 감사 + 빌드 실패 재조사 (2026-09-19)

Vercel React Best Practices(62룰) 기준 감사. 카테고리 1~3(Waterfall·번들·서버)만
범위. **코드 변경 없음 — 조사 결과만 기록.**

환경: Next 16.3.0 · React 19.2.5 · 657 TS/TSX · 78 page.tsx · 222 `use client`

---

## 🔴 P0 — 기록된 장애 원인이 틀렸다

`docs/03-analysis/asca-prod-csp-outage.analysis.md` 및 메모리에 기록된 원인은
**"`vercel.json` 이 `build:full` 을 쓰는데 Vercel 에 `DATABASE_URL` 이 없어서
실패"** 였다.

### 재현 결과 (2026-09-19, 로컬)

```
DATABASE_URL 있음(.env.local) · npm run build:full → exit 1
```

- 빌드 로그 754줄 중 **`DATABASE_URL` 언급 0건** (`grep -c` 총계 기준)
- 실제 실패:
  ```
  TypeError: Cannot read properties of null (reading 'useContext')
      at t (.next/server/chunks/1303.js:198:14025)  digest: '3551904763'
  ⨯ Next.js build worker exited with code: 1
  ```

### 결론 (주장 범위를 정확히)

prerender 실패는 **그 자체로 빌드를 죽이기에 충분하고, `DATABASE_URL` 이 있는
상태에서 재현된다.** → **Vercel 에서 env 만 고쳐서는 배포가 복구되지 않는다.**
이건 확정.

단, **"Vercel 에 `DATABASE_URL` 이 없다"는 가설 자체가 기각된 것은 아니다.**
`next build` 는 `.env.local` 을 읽으므로 이번 로컬 재현은 "env 와 무관하게
깨진다" 만 증명한다. Vercel 에 env 가 _추가로_ 없을 가능성은 미검증이며, 둘 다
참일 수 있다.

**판별법(다음 단계):** Vercel 의 실패한 빌드 로그에 같은 `digest: '3551904763'`
TypeError 가 찍혀 있는지 확인. 같으면 원인은 하나다. (`gh`/`vercel` CLI 는 현재
Xcode 라이선스 때문에 막혀 있음 — [[reference_xcode_license_blocks_git]])

### prerender 실패 페이지 (6건, 빌드는 첫 실패에서 중단되므로 더 있을 수 있음)

```
/_global-error
/application-for-recommended-invited-calligrapher
/artists
/blog
/gallery
/privacy-policy
```

### 단서와 그 한계

- 콘텐츠 5개 페이지 전부 `LayoutFooter`(`'use client'` + `useLanguage` 컨텍스트)
  를 import 한다.
- ⚠️ **위 6건은 전체 집합이 아니라 하한이다.**
  `Export encountered an error ... exiting the build` — 첫 export 에러에서
  빌드가 끊긴다. 나머지 페이지는 **시도조차 되지 않았다.**
- 따라서 `LayoutFooter` 를 import 하는 page 가 59개라는 사실은 **반증이
  아니다.** 집합이 잘려 있으므로 "6 vs 59" 비교는 **애초에 계산 불가**다. 어느
  쪽으로도 결론 낼 수 없다. (판별하려면 나머지 53개가 `force-dynamic` 이라
  prerender 대상이 아닌지부터 확인해야 한다.)
- `/_global-error` 가 같이 깨지는 점은 의미가 있다. global-error 는 root layout
  을 대체하므로 `ClientProviders`(LanguageProvider) 바깥에서 렌더된다.
- 에러 문구가 "컨텍스트 값이 null" 이 아니라 **`null` 의 `.useContext` 를 읽음**
  이다. 즉 컨텍스트 미주입이 아니라 **React(디스패처) 자체가 null** 인 번들링
  계열 신호에 가깝다.
- React 중복 설치는 아님 (`react`/`react-dom` 모두 19.2.5 단일 사본 확인).

→ **미확정.** 위 두 갈래(프로바이더 경계 / 번들 React null) 중 어느 쪽인지는
추가 조사 필요.

### ⚠️ 검증 함정 (이번에 실제로 밟음)

`npm run build:full > log 2>&1; echo "EXIT=$?"` 로 백그라운드 실행 시 **래퍼는
exit 0 으로 보고된다**(마지막 `echo` 가 성공하므로). 빌드 자체의 exit code 를
반드시 따로 확인할 것. 하마터면 "빌드 통과" 로 오독할 뻔했다.

---

## 🟠 P1 — 전 페이지에 Vimeo iframe 자동재생

`components/layout/video-background.tsx` — root layout 에서 무조건 렌더된다.

```tsx
<iframe src='https://player.vimeo.com/video/51843128?background=1&autoplay=1&loop=1...' />
```

- **사이트의 모든 라우트**에서 서드파티 플레이어 번들 + 영상 스트림을 로드한다.
- 룰 위반: `bundle-defer-third-party` (CRITICAL 카테고리 2)
- LCP·TBT 직격. 모바일 데이터 소모도 상시 발생.
- 추가: `useRef` 를 import 하지만 **사용처가 없다**(import 라인 1회 등장이
  전부). 상태·이펙트·핸들러가 전혀 없으므로 **`'use client'` 자체가
  불필요**하다.

권장: 서버 컴포넌트로 전환 + 필요한 라우트에서만 `next/dynamic` 지연 로드.

---

## 🟠 P1 — 공개 콘텐츠 페이지가 클라이언트에서 데이터를 가져온다

공개 서예 사이트인데 핵심 콘텐츠 페이지가 `'use client'` + 클라이언트 fetch 다.

| 페이지                       | 상태                                         |
| ---------------------------- | -------------------------------------------- |
| `app/notice/[id]/page.tsx`   | `'use client'` + 순차 await                  |
| `app/artists/[id]/page.tsx`  | `'use client'` + `fetch('/api/artists/...')` |
| `app/artworks/[id]/page.tsx` | `'use client'`                               |
| `app/exhibitions/page.tsx`   | `'use client'`                               |

SEO(일반 관람객·서예 애호가가 주 사용자) 와 LCP 를 동시에 손해본다. 룰:
`server-parallel-fetching` · `async-suspense-boundaries`

### 실제 waterfall — `app/notice/[id]/page.tsx`

```
L80  const noticeData   = await getNoticeById(noticeId)
L88  await incrementNoticeViews(noticeId)        // ← 독립. 조회수 증가가 렌더를 막는다
L91  const commentsData = await getNoticeComments(noticeId)   // ← L88 과 독립
L95  const relatedData  = await getRelatedNotices(noticeId, noticeData.category)  // L80 의존
```

- `incrementNoticeViews` 는 **부수효과인데 렌더를 블로킹**한다 → await 하지 말
  것. (이 페이지는 `'use client'` 이므로 `server-after-nonblocking`/`after()` 은
  해당 없음. 적용 룰은 `async-parallel` 이다.)
- L88·L91 은 서로 독립 → `async-parallel`
- L95 만 L80 에 의존 → `async-dependencies` (부분 의존 패턴)

---

## 🟡 P2 — 참고

- `Header`(`components/header/header.tsx`) 는 소스에
  `@deprecated — LayoutHeader 를 쓰라` 고 적혀 있으나 **root layout 이 여전히
  이것을 쓴다.**
- `next/dynamic` 사용 5곳 / `Suspense` 14곳 / `Promise.all` 16곳 — 도입은 돼
  있으나 범위가 좁다.

---

## 측정 불가로 남긴 것

route 별 First Load JS 수치는 **얻지 못했다.** `build:full` 이 prerender 에서
죽어 번들 리포트가 출력되기 전에 종료된다. `build`(compile-only)는 page data 를
수집하지 않아 route 별 수치가 나오지 않는다. → **번들 크기 주장은 이번 감사에서
하지 않는다.** P0 해결 후 재측정할 것.

---

## 다음 순서

1. **P0 먼저.** 배포가 죽어 있으면 나머지 최적화는 프로덕션에 도달하지 못한다.
2. P0 해결 → `build:full` 통과 → route 별 번들 수치 확보 → 카테고리 2 재감사.
3. 그 다음 P1 2건.

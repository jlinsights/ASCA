# ASCA 프로덕션 전면 장애 — CSP가 Clerk 스크립트를 차단

- **발견일**: 2026-08-06
- **심각도**: P0 (사이트 전면 다운)
- **발견 경위**: impeccable `/critique`를 갤러리 표면에 돌리려고 실제 배포를 열어보다 발견
- **상태**: 미수정. **장애는 재현 확인, 원인은 유력 후보 단계 — 예외 스택 미확보**

---

## 1. 증상 (재현됨)

프로덕션에서 **모든 페이지**가 렌더링에 실패한다.

```
Application error: a client-side exception has occurred
```

- `https://asca-main-fsghzdmlh-jlinsights-projects.vercel.app/` → 위 오류
- `https://asca-main-fsghzdmlh-jlinsights-projects.vercel.app/gallery` → 위 오류

HTTP 상태는 **200**이다. 서버 렌더는 되고 클라이언트 단계에서 죽는다.
반복 로드 3회 중 2회에서 재현했고 1회는 로딩 미완료였다. 간헐이 아니라 상시로 보인다.

## 2. 원인 — 유력 후보 (미확정)

> **확정이 아니다.** CSP가 Clerk 스크립트를 차단하는 것은 콘솔에서 직접 관측했고,
> ClerkProvider가 루트 레이아웃을 감싸는 것도 소스에서 확인했다. 그러나 **실제로 던져진
> 예외의 스택은 잡지 못했다.** 프로덕션 빌드에서 Next의 에러 바운더리가 예외를 삼키고
> "Application error" 문구만 남기기 때문에, 콘솔에는 CSP 위반 외에 uncaught 예외가 안 보인다.
>
> 이 레포에는 다른 Clerk 실패 모드의 전례가 있다 — `c831d6f1 🔧 Clerk/React useContext 오류 완화`.
> 따라서 CSP가 아닌 다른 원인일 가능성을 배제하지 못한다.
>
> **확정에 필요한 것**: 소스맵이 살아있는 빌드나 `next build && next start` 로컬 프로덕션
> 실행에서 예외 스택을 직접 확보할 것. Clerk/useContext 스택이면 아래 가설이 맞고,
> 무관한 TypeError나 hydration 오류(#418/#423)면 CSP는 별건의 결함으로 분리된다.

### 가설

브라우저 콘솔:

```
Loading the script 'https://clean-firefly-86.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js'
violates the following Content Security Policy directive:
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.curator.io https://*.curator.io".
The action has been blocked.
```

연결 고리:

1. `next.config.js:146` — 프로덕션 CSP의 `script-src`에 **Clerk 오리진이 없다.**
   허용된 외부 오리진은 `cdn.curator.io` 계열뿐이다.
2. Clerk이 `clerk.browser.js`를 로드하려 하고 → CSP가 차단한다.
3. `components/client-providers.tsx:28` 의 `<ClerkProvider>` 가
   `app/layout.tsx:60` 에서 `{children}` 전체를 감싼다.
4. → Clerk 초기화 실패가 루트 경계에서 터지면 **모든 라우트가 함께 죽는다.**
   홈과 `/gallery`가 동일 증상인 것이 이 가설과 일치한다.

`app/layout.tsx` 하나에 걸려 있어서 특정 페이지 문제가 아니다.

**단, 3~4 사이의 연결은 미검증이다.** CSP가 스크립트 태그를 막았다는 것과
React가 그 때문에 렌더 예외를 던졌다는 것은 별개의 주장이다.
`@clerk/nextjs`가 스크립트 로드 실패를 우아하게 처리하고 넘어갈 여지도 있다.

## 3. 같은 CSP 줄에 걸린 부수 피해

`next.config.js:146` 한 줄이 외부 의존성을 전반적으로 막고 있다.

| 지시어 | 현재 값 | 빠진 것 | 결과 |
|---|---|---|---|
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval' cdn.curator.io *.curator.io` | `*.clerk.accounts.dev` | **전면 장애 (본 건)** |
| `connect-src` | `'self' cdn.curator.io *.curator.io` | `*.supabase.co`, Clerk API | 데이터 페칭·인증 API 차단 |
| `frame-src` | `'self' cdn.curator.io *.curator.io` | `player.vimeo.com` | 콘솔에서 Vimeo 임베드 차단 관측됨 |

## 4. 함께 확인된 배포/도메인 불일치

| 항목 | 기록된 값 | 실제 |
|---|---|---|
| README "Live at" | `https://asca-gallery.vercel.app` | **404 `DEPLOYMENT_NOT_FOUND`** |
| SEO 정식 도메인 (`lib/seo.ts` `metadataBase`) | `asca.kr` / `www.asca.kr` | DNS 미해석 (curl 000) |
| 실제 prod | — | `jlinsights-projects/asca-main`, 마지막 배포 **18일 전** |

자동 배포가 끊겨 있을 가능성이 있다. jlinsights → goodmangls 레포 이전 후 Vercel 연동이
끊긴 사례가 다른 프로젝트들에서 있었고, 배포 간격이 그 정황과 맞는다.

## 5. 부수 관측

- `/patterns/korean-pattern.png` → 404 (본 장애와 무관, 별건)

## 6. 수정 방향 (미착수)

1. `next.config.js:146` 프로덕션 CSP에 최소한 다음을 추가:
   `script-src`에 Clerk 오리진, `connect-src`에 Supabase + Clerk API,
   `frame-src`에 `player.vimeo.com`.
   오리진은 하드코딩하지 말고 `NEXT_PUBLIC_CLERK_*` / `NEXT_PUBLIC_SUPABASE_URL` 에서 파생시킬 것.
2. 재배포 후 홈과 `/gallery` 둘 다 육안 확인. 200 응답만으로는 판정 불가 —
   이 장애는 200을 반환하면서 죽는다.
3. README의 배포 URL과 `lib/seo.ts`의 `metadataBase`를 실제와 맞출 것.
4. Vercel 자동 배포 연동 상태 점검.

### 회귀 방지 제안

이 장애는 빌드·타입체크·린트를 전부 통과한다. 셋 다 클라이언트 런타임을 안 본다.
배포 후 실제 페이지를 한 번 열어서 콘솔 에러 0을 확인하는 스모크 체크가 없으면 재발한다.

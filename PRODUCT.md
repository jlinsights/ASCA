# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**주 사용자: 일반 관람객·서예 애호가.** 작품·전시·작가를 둘러보러 들어오며, 감상
자체가 목적이다. 특정 작품을 찾으러 오기보다 훑어보다 머무는 쪽에 가깝다. 서예에
대한 사전 지식은 낮음부터 높음까지 폭넓게 섞여 있다.

코드상 존재가 확인되는 부차 오디언스(주 사용자가 아니며, 해당 표면에서만
우선함):

- **공모전 응모자·협회 회원** — `app/contests`, `app/application*`,
  `app/membership`, `app/forms`. 서류 제출과 자격 확인이 목적.
- **작가** (2026-10-31 확인) — 자기 작가 페이지 연결(claim)·프로필 수정, 공모전
  출품, 그리고 사무국이 구축·운영하는 개인·단체 홈페이지(성곡 seonggok.com, 아남
  anam.orientalcalligraphy.org, 희랑 heelang.orientalcalligraphy.org, 브러시웨이즈
  brushways.org). `/artists` 맨 위에 이 홈페이지들과 홈페이지 구축 안내가 있다.
  주 사용자는 여전히 관람객이며, 작가는 자기 표면에서만 우선한다.
- **협회 사무국 운영자** — `app/admin`. 작가·작품·전시·공지 등록과 관리.

## Product Purpose

사단법인 동양서예협회(ASCA)의 공식 웹사이트. 전통 동아시아 서예 작품과 협회
활동(전시·공모전·수상·연혁·공지)을 온라인에 공개하고 탐색 가능하게 만든다.
성공은 관람객이 작품을 실제로 들여다보는 것 — 목록을 스쳐 지나가지 않는 것.

**중장기 방향 (2026-10-25 확인):** 전통서예·캘리그라피에서 현대서예·현대미술·
현대 한국화·문자예술 등으로 넓어지는 미술 플랫폼이 된다. 그래서 장르·분야·공모
부문은 데이터(DB·설정)로 두고 서예로 하드코딩하지 않는다. 석문·원문·서체 같은
서예 전용 필드는 선택이며 서예 작품에만 나온다. 문구는 "서예 작품"이 아니라
"작품"·"작가"처럼 중립적으로 쓴다.

## Positioning

일반 이미지 갤러리와 다른 점은 분류 축이 서예의 것이라는 데 있다.
연도·카테고리에 더해 오방색(동방목·남방화·중앙토·서방금·북방수)과 계절, 서예
재료(먹·한지·주인)를 디자인 토큰 층위까지 끌어올려 쓴다. 이 어휘 체계는
`DESIGN.md`에 명세돼 있고 `design:lint` / `design:wcag` 게이트로 강제된다.

## Operating Context

- Next.js 16 App Router + TypeScript, Tailwind + shadcn, Drizzle ORM +
  PostgreSQL(Supabase).
- Vercel 배포. 운영 도메인 `www.orientalcalligraphy.org` (2026-10-25 Webflow 에서
  전환). `asca-main.vercel.app` 은 옛 배포다.
- 콘텐츠는 사무국이 `app/admin` CMS로 등록한다.
- 갤러리 목록은 정적 메타데이터(`lib/data/gallery-data.json`)를 서버에서 읽고,
  항목 배열은 클라이언트로 넘기지 않는다.
- 감사 로그와 계층적 권한 제어가 관리 영역에 걸려 있다.

## Capabilities and Constraints

확인된 기능 영역: 갤러리(연도·카테고리·계절 태그 필터, 확대 뷰어, 작품 비교, 획
애니메이션 재생), 작가/작품/전시/수상/공모전, 회원·후원·서류 신청 폼, 공지·뉴스,
브랜드 가이드 페이지, 관리자 CMS.

제약과 미결 사항:

- **4개 언어**: `ko`(기본)·`en`·`ja`·`zh`(번체 `zh-TW` 로 통일). 클라이언트 번역표
  (`lib/i18n/translations/*`, `useLanguage()`)로 바꾸며 선택은 `localStorage`
  `asca-language` 에 남는다. 로케일 라우팅은 없어 서버 렌더·메타데이터는
  한국어다. 한국어로만 있는 본문은 `lang='ko'` 를 단다. 규칙은 `AGENTS.md`.
  공모전 페이지(`/contests`·`/contests/23`)처럼 아직 한국어만 있는 화면이 있다.
- 갤러리 규모(`totalImages`)는 데이터 파일이 결정하며 코드에 하드코딩돼 있지
  않다.

## Brand Commitments

- **`DESIGN.md`(= `docs/02-design/DESIGN.md`, v1.3.0-alpha)가 시각 결정의 단일
  진실 공급원이다.** 문서 스스로 "AI 코딩 에이전트가 UI를 생성·수정할 때
  참조하는 SSOT"로 선언한다. 새 시각 세계를 만들지 말고 이 시스템을 상속할 것.
- 로고: `/logo/Logo & Tagline_white BG.png`.
- 태그라인: **正法의 계승, 創新의 조화**.
- 브랜드 명세가 코드로도 존재: `app/brand/page.tsx`,
  `app/brand/_components/brand-data.ts`.
- 색 토큰은 `app/globals.css`(OKLCH)가 구현이고 `DESIGN.md`가 명세다. 둘은 1:1이
  아니며 `DESIGN.md` §2.1이 두 층을 구분한다.

## Evidence on Hand

- 실제 협회 활동사진 갤러리 — `lib/data/gallery-data.json`, 연도별로 분류돼
  있음.
- 대한민국 동양서예대전 수상자 명단, 전시 이력, 정관·기부금 약관 등 법적 문서.

없는 것(지어내지 말 것): 고객 후기·추천사, 가격/요금제, 벤치마크 수치, 사용자
수나 트래픽 통계.

## Product Principles

1. **작품이 먼저, 인터페이스는 물러난다.** 갤러리와 작품 상세에서 UI가 작품보다
   시선을 끌면 실패다.
2. **문화적 어휘는 장식이 아니라 구조다.** 오방색·계절·재료는 테마 옵션이 아니라
   분류와 토큰 체계 자체다. 일반 팔레트로 치환하지 않는다.
3. **기존 디자인 시스템을 상속한다.** `DESIGN.md`와 `design:lint`/`design:wcag`
   게이트가 이미 권위다. 새 시스템을 세우는 것이 아니라 그 안에서 작업한다.
4. **한국어가 기본 언어다.** 레이아웃·줄바꿈·타이포 판단은 한글 본문을 기준으로
   내린다. 영문에서 잘 보이는 것이 근거가 되지 않는다.
5. **공개 표면과 관리 표면은 목적이 다르다.** 전자는 감상, 후자는 업무 처리.
   같은 밀도와 같은 표현 강도를 적용하지 않는다.

## Accessibility & Inclusion

WCAG 2.1 AA. 선언에 그치지 않고 도구로 강제된다 — `npm run design:wcag`
(`scripts/design-lint.ts`)가 대비비를 검사하고, `DESIGN.md`는 AA 미달 조합을
주석으로 기록해 둔다(예: destructive 위 Rice Paper는 4.42:1로 미달이라 백색
사용). 라이트/다크 두 테마 모두 대상이다.

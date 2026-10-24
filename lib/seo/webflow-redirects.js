// 옛 Webflow 사이트(orientalcalligraphy.org) 주소 → 이 앱 주소.
//
// 도메인을 이 앱으로 옮겨도 검색 색인·공유 링크가 404 로 끊기지 않게 한다. 2026-10-24 Webflow
// sitemap(6,306 주소 = 고정 페이지 + CMS 컬렉션 × ko·en·ja·zh)을 기준으로 만들었다.
//
// - permanent: true(308) — 대응이 확정된 이동(언어 접두사, 오타·긴 주소 정리, 블로그 글)
// - permanent: false(307) — 목록으로 보내는 임시 대응. 작가 1:1 매핑·작품 처리 방침이 정해지면 바꾼다
//
// ⚠️ Next 는 redirects() 를 파일 라우트보다 먼저 본다. source 가 실제 페이지 주소와 겹치면 그 페이지가
// 사라진다 — lib/seo/__tests__/webflow-redirects.test.ts 가 막는다.
// ⚠️ 작가·회원 slug(로마자 이름) 목록을 여기 적지 않는다. 비공개 등급 작가 이름이 공개 저장소에 남는다.

const LOCALES = 'en|ja|zh'

const webflowRedirects = [
  // 언어 접두사 — 이 앱은 주소에 언어가 없고 화면에서 언어를 바꾼다
  { source: `/:locale(${LOCALES})`, destination: '/', permanent: true },
  { source: `/:locale(${LOCALES})/:path*`, destination: '/:path*', permanent: true },

  // 고정 페이지 — 이름이 바뀌었거나 같은 역할의 페이지가 있는 것
  { source: '/fundrasing', destination: '/fundraising', permanent: true },
  {
    source: '/terms-and-conditions-for-the-management-and-use-of-donations',
    destination: '/terms-and-conditions-donations',
    permanent: true,
  },
  { source: '/log-in', destination: '/sign-in', permanent: true },
  { source: '/signup', destination: '/sign-up', permanent: true },
  // 계정 화면은 인증 전환(Supabase Auth) 후 /reset-password·/profile 로 바꾼다. /reset-password 는
  // 그 브랜치가 페이지로 만들므로 여기서 가로채지 않는다
  { source: '/update-password', destination: '/sign-in', permanent: false },
  { source: '/user-account', destination: '/sign-in', permanent: false },
  { source: '/notifications', destination: '/notice', permanent: false },
  // Webflow 전용 화면(옛 홈 시안·Memberstack·접근 거부)
  { source: '/old-home', destination: '/', permanent: true },
  { source: '/memberstack-override', destination: '/', permanent: true },
  { source: '/access-denied', destination: '/', permanent: true },
  { source: '/home-pages/:slug*', destination: '/', permanent: true },
  { source: '/utility-pages/:slug*', destination: '/', permanent: true },
  // 쇼핑·결제 — 이 앱에 없다. 후원 안내로 보낸다(존치 여부 결정 전이라 임시)
  { source: '/shop', destination: '/fundraising', permanent: false },
  { source: '/checkout', destination: '/fundraising', permanent: false },
  { source: '/paypal-checkout', destination: '/fundraising', permanent: false },
  { source: '/order-confirmation', destination: '/fundraising', permanent: false },
  { source: '/product/:slug*', destination: '/fundraising', permanent: false },

  // 블로그 — 14 개 중 13 개가 lib/data/blog-posts.json 에 같은 slug 로 있다. 없는 1 개는 목록으로
  {
    source:
      '/post/yeonghoneul-ulrineun-saegcaeyi-yeongeumsul-ceongyeongja-hwagayi-saengaewa-jagpumsegyee-gwanhan-simceung-yeongu',
    destination: '/blog',
    permanent: false,
  },
  { source: '/post/:slug', destination: '/blog/:slug', permanent: true },
  { source: '/blog-category/:slug*', destination: '/blog', permanent: false },

  // CMS 컬렉션 → 목록. 작가는 slug→uuid 대조표를 만들면 1:1 로 바꾼다
  { source: '/calligrapher/:slug*', destination: '/artists', permanent: false },
  // /members 는 이 앱에도 있다(/members/apply) — Webflow 회원 분류 slug 만 집어 보낸다
  {
    source:
      '/members/:slug(advisor|executive-advisor|china-invited-calligrapher|japan-invited-calligrapher|korea-invited-calligrapher|member-calligrapher|recommended-calligrapher|next-generatiion-calligrapher)',
    destination: '/artists',
    permanent: false,
  },
  { source: '/category/:slug*', destination: '/artists', permanent: false },
  { source: '/taxonomies/:slug*', destination: '/artists', permanent: false },
  {
    source: '/countries/:country(korea|china|japan)',
    destination: '/artists/country/:country',
    permanent: true,
  },
  // 작품은 새 DB 에 아직 없다 — 처리 방침(작가 페이지 연결 / 410) 결정 전까지 작품 목록으로
  { source: '/work/:slug*', destination: '/artworks', permanent: false },
  { source: '/type/:slug*', destination: '/artworks', permanent: false },
  { source: '/event/:slug*', destination: '/exhibitions/past', permanent: false },
  { source: '/award/:slug*', destination: '/awards', permanent: false },
  // 파트너 상세 /partners/[id] 는 DB 기반 페이지라 Webflow slug 만 정확히 집어 보낸다
  {
    source: '/partners/:slug(eim-design|repudiandae-fugiat-similique|weolganseoye)',
    destination: '/partners',
    permanent: false,
  },
  { source: '/partner/:slug*', destination: '/partners', permanent: false },
]

module.exports = { webflowRedirects }

const path = require('path')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const lowMemoryBuild = process.env.CI_LOW_MEMORY_BUILD === '1'

// ─────────────────────────────────────────────────────────────
// Content-Security-Policy
//
// 2026-08 장애 교훈: 프로덕션 CSP가 Clerk 스크립트를 차단해 ClerkProvider가
// 루트 레이아웃에서 터졌고 전 페이지가 죽었다. build·lint·type-check·test는
// 전부 통과했다 — 넷 다 클라이언트 런타임을 보지 않는다.
// 자세한 내용: docs/03-analysis/asca-prod-csp-outage.analysis.md
//
// 규칙: 인스턴스 고유 오리진은 하드코딩하지 말고 env에서 파생시킨다.
//       서드파티를 추가하면 아래 THIRD_PARTY에 벤더 단위로 함께 적는다.
// ─────────────────────────────────────────────────────────────

/** URL 문자열에서 오리진만 안전하게 추출. 실패 시 null. */
function originOf(rawUrl) {
  if (!rawUrl) return null
  try {
    return new URL(rawUrl).origin
  } catch {
    return null
  }
}

/**
 * Clerk publishable key(`pk_test_<base64(frontendApi)>$`)에서 Frontend API
 * 오리진을 파생한다. 키가 없거나 형식이 다르면 null — 이 경우 아래 와일드카드가 받는다.
 */
function clerkFrontendApiOrigin() {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!pk) return null
  const encoded = pk.replace(/^pk_(test|live)_/, '')
  if (encoded === pk) return null
  try {
    const host = Buffer.from(encoded, 'base64').toString('utf8').replace(/\$+$/, '')
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host) ? `https://${host}` : null
  } catch {
    return null
  }
}

const supabaseOrigin = originOf(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseSocketOrigin = supabaseOrigin ? supabaseOrigin.replace(/^https:/, 'wss:') : null
const clerkOrigin = clerkFrontendApiOrigin()

/** 소스에서 실제로 로드가 확인된 서드파티만 벤더 단위로 나열한다. */
const THIRD_PARTY = {
  // 인스타그램 피드 위젯 — app/exhibitions/*
  curator: {
    script: ['https://cdn.curator.io', 'https://*.curator.io'],
    style: ['https://cdn.curator.io'],
    img: ['https://cdn.curator.io', 'https://*.curator.io'],
    connect: ['https://cdn.curator.io', 'https://*.curator.io'],
    frame: ['https://cdn.curator.io', 'https://*.curator.io'],
  },
  // 신청 폼 임베드 — app/application*, app/commissioning-application, app/forms
  tally: { script: ['https://tally.so'], frame: ['https://tally.so'] },
  // 배경 영상 — app/application
  vimeo: {
    frame: ['https://player.vimeo.com'],
    img: ['https://i.vimeocdn.com'],
    script: ['https://f.vimeocdn.com'],
    connect: ['https://*.vimeocdn.com'],
  },
  // 카카오 SDK(공유·지도) — components/seo/kakao-script.tsx, lib/kakao.ts
  kakao: {
    script: ['https://t1.kakaocdn.net', 'https://dapi.kakao.com'],
    connect: ['https://dapi.kakao.com', 'https://kapi.kakao.com'],
    img: ['https://t1.kakaocdn.net', 'https://k.kakaocdn.net'],
  },
  // 채널톡 상담 위젯 — app/contact/*, app/fairness-transparency-hub
  channelTalk: {
    script: ['https://cdn.channel.io'],
    connect: ['https://api.channel.io', 'wss://*.channel.io'],
    frame: ['https://*.channel.io'],
    img: ['https://*.channel.io'],
  },
  // 뉴스레터 구독 — components/layout/layout-footer.tsx
  // form: 유일하게 실제로 폼을 외부로 POST하는 벤더다.
  stibee: {
    frame: ['https://*.stibee.com'],
    connect: ['https://*.stibee.com'],
    form: ['https://*.stibee.com'],
  },
  // 음원 임베드 — app/application
  spotify: { frame: ['https://open.spotify.com'] },
  // 웹폰트 로더 — 코드에서 webfont.js 로드
  googleFonts: {
    script: ['https://ajax.googleapis.com'],
    style: ['https://fonts.googleapis.com'],
    font: ['https://fonts.gstatic.com'],
  },
  // Cloudflare Images — 정적 이미지 호스팅
  cloudflareImages: { img: ['https://imagedelivery.net'] },
}

/** THIRD_PARTY에서 특정 디렉티브에 해당하는 오리진을 모아 중복 제거한다. */
function vendorOrigins(directive) {
  return [...new Set(Object.values(THIRD_PARTY).flatMap(v => v[directive] || []))]
}

/** null을 걸러내고 공백으로 잇는다. */
function sources(...parts) {
  return parts.flat().filter(Boolean).join(' ')
}

const productionCsp = [
  `default-src 'self'`,
  // 'unsafe-inline'/'unsafe-eval'은 기존 정책 유지 — 이번 변경 범위 밖.
  // 제거하려면 nonce 도입이 선행돼야 한다(별도 과제).
  `script-src ${sources(`'self'`, `'unsafe-inline'`, `'unsafe-eval'`, clerkOrigin, 'https://*.clerk.accounts.dev', vendorOrigins('script'))}`,
  `style-src ${sources(`'self'`, `'unsafe-inline'`, vendorOrigins('style'))}`,
  `img-src ${sources(`'self'`, 'data:', 'blob:', clerkOrigin, 'https://img.clerk.com', supabaseOrigin, vendorOrigins('img'))}`,
  `font-src ${sources(`'self'`, 'data:', vendorOrigins('font'))}`,
  `connect-src ${sources(`'self'`, clerkOrigin, 'https://*.clerk.accounts.dev', 'https://clerk-telemetry.com', supabaseOrigin, supabaseSocketOrigin, vendorOrigins('connect'))}`,
  // Clerk은 봇 차단에 Cloudflare Turnstile을 프레임으로 띄운다.
  `frame-src ${sources(`'self'`, 'https://challenges.cloudflare.com', vendorOrigins('frame'))}`,
  // Clerk은 blob: 워커를 쓴다. default-src 'self' 폴백으로는 막힌다.
  `worker-src ${sources(`'self'`, 'blob:')}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  // frame 오리진 전체를 열지 않는다 — 실제로 폼을 POST하는 벤더만.
  `form-action ${sources(`'self'`, vendorOrigins('form'))}`,
].join('; ')

const developmentCsp =
  "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:; connect-src * ws: wss:; frame-src *; worker-src * blob:;"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 프로덕션 빌드에서 console 제거
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactStrictMode: true,

  // 성능 최적화
  compress: true,

  // Basic TypeScript settings
  typescript: {
    // ignoreBuildErrors removed to enforce type checking
  },

  // Turbopack 설정 (Next.js 16+ 호환)
  turbopack: {},

  // 최고 화질 이미지 최적화 - 갤러리 특화
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1200, 1920, 3840],
    imageSizes: [16, 48, 96, 256, 512, 1024],
    qualities: [75, 85, 90, 95, 100], // 커스텀 품질 설정 지원 (100은 라이트박스용)
    minimumCacheTTL: 86400, // 24시간 캐시 (고화질 이미지)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // 고화질 갤러리 이미지 최적화
    loader: 'default',
    path: '/_next/image',
    domains: [],
    unoptimized: false,
  },

  // Webpack configuration to fix RSC issues
  webpack: (config, { isServer }) => {
    // 클라이언트 번들만 단일 React 강제 (서버 번들에는 Next 내장 React 유지)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      }
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },

  // 실험적 기능으로 성능 향상
  experimental: lowMemoryBuild
    ? {
        cpus: 1,
        memoryBasedWorkersCount: false,
        webpackBuildWorker: false,
        webpackMemoryOptimizations: true,
        turbopackMemoryLimit: 1024,
        optimizeCss: false,
        gzipSize: false,
      }
    : {
        optimizePackageImports: [
          'lucide-react',
          '@radix-ui/react-icons',
          '@radix-ui/react-accordion',
          '@radix-ui/react-alert-dialog',
          '@radix-ui/react-avatar',
          '@radix-ui/react-checkbox',
          '@radix-ui/react-dialog',
          '@radix-ui/react-dropdown-menu',
          '@radix-ui/react-label',
          '@radix-ui/react-popover',
          '@radix-ui/react-progress',
          '@radix-ui/react-scroll-area',
          '@radix-ui/react-select',
          '@radix-ui/react-separator',
          '@radix-ui/react-slider',
          '@radix-ui/react-slot',
          '@radix-ui/react-switch',
          '@radix-ui/react-tabs',
          '@radix-ui/react-toast',
          '@radix-ui/react-tooltip',
          'recharts',
          'date-fns',
          'react-virtuoso',
          'framer-motion',
        ],
        optimizeCss: true, // critters 기반 critical CSS 인라인화
        gzipSize: true,
      },

  // @clerk/nextjs는 번들에 포함해야 React 컨텍스트가 일치함 (serverExternalPackages 제외)

  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' ? developmentCsp : productionCsp,
          },
        ],
      },
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)

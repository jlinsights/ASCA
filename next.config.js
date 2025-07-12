/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // 개발 서버 설정
  ...(process.env.NODE_ENV === 'development' && {
    // 개발 모드에서 빠른 새로고침 활성화
    reactStrictMode: true,
    // 개발 서버 설정 - deprecated 옵션 제거
    devIndicators: {
      position: 'bottom-right',
    },
    // 개발 중 소스맵 생성
    productionBrowserSourceMaps: false,
    // 개발 서버 로깅
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  }),

  // 성능 최적화
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
    // 트리 쉐이킹 개선
    serverMinification: true,
    // 개발 모드에서 타입 체크 개선
    typedRoutes: true,
  },
  
  // Next.js 15에서 변경된 설정
  serverExternalPackages: ['swr'],
  
  // 이미지 최적화
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'dl.airtable.com',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: process.env.NODE_ENV === 'development' ? 0 : 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 컴파일 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 웹팩 최적화
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 개발 환경에서 빠른 빌드를 위한 설정
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: require('path').join(process.cwd(), '.next/cache/webpack'),
      }
      
      // 개발 모드에서 소스맵 최적화
      config.devtool = 'cheap-module-source-map'
    }

    // self is not defined 에러 해결
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    // 서버사이드에서 self 정의
    if (isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'self': 'globalThis',
        })
      )
      
      // SWR을 서버 사이드에서 제외
      config.externals = [...(config.externals || []), 'swr']
    }

    return config
  },

  // 압축 설정
  compress: true,
  
  // 보안 헤더 및 CORS 설정
  headers: async () => {
    const headers = []
    
    // 보안 헤더 (모든 페이지에 적용)
    headers.push({
      source: '/(.*)',
      headers: [
        // Content Security Policy
        {
          key: 'Content-Security-Policy',
          value: process.env.NODE_ENV === 'development' 
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: ws: wss:;"
            : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
        },
        // XSS Protection
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        // Content Type Options
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        // Frame Options
        { key: 'X-Frame-Options', value: 'DENY' },
        // Referrer Policy
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // Permissions Policy
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    })

    // HSTS (프로덕션에서만)
    if (process.env.NODE_ENV === 'production') {
      headers.push({
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      })
    }

    // API 라우트용 제한적 CORS (개발환경에서만 느슨하게)
    if (process.env.NODE_ENV === 'development') {
      headers.push({
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-CSRF-Token' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      })
    } else {
      // 프로덕션에서는 매우 제한적인 CORS
      headers.push({
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-CSRF-Token' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      })
    }
    
    // 정적 파일 캐싱
    headers.push({
      source: '/:all*(svg|jpg|png|gif|webp|avif)',
      headers: [
        {
          key: 'Cache-Control',
          value: process.env.NODE_ENV === 'development' 
            ? 'no-cache, no-store, must-revalidate'
            : 'public, max-age=31536000, immutable',
        },
      ],
    })
    
    headers.push({
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: process.env.NODE_ENV === 'development' 
            ? 'no-cache, no-store, must-revalidate'
            : 'public, max-age=31536000, immutable',
        },
      ],
    })
    
    return headers
  },

  // 타입스크립트 성능 개선
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },
  
  // ESLint 성능 개선
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['pages', 'components', 'lib', 'app'],
  },

  // 트레일링 슬래시 설정 - URL 일관성 보장
  trailingSlash: false,
  
  // 리다이렉트 설정
  async redirects() {
    return []
  },
  
  // 리라이트 설정
  async rewrites() {
    return [
      // API 라우트 우선 처리
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig) 
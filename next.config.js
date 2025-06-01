/** @type {import('next').NextConfig} */
const nextConfig = {
  // 성능 최적화
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true
  },
  
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
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 컴파일 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 웹팩 최적화
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 프로덕션 빌드에서만 적용
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }

    // 개발 환경에서 캐시 최적화
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      }
    }

    return config
  },

  // 압축 설정
  compress: true,
  
  // PWA 및 캐싱
  headers: async () => {
    return [
      {
        source: '/:all*(svg|jpg|png|gif|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // 개발 서버 최적화
  devIndicators: {
    buildActivity: false, // 빌드 인디케이터 비활성화로 성능 개선
  },

  // 불필요한 폴리필 제거
  swcMinify: true,
  
  // 타입스크립트 성능 개선
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint 성능 개선
  eslint: {
    ignoreDuringBuilds: false,
  },

  // 번들 분석 (필요시 활성화)
  // bundleAnalyzer: {
  //   enabled: process.env.ANALYZE === 'true',
  // },

  // 트레일링 슬래시 설정 - URL 일관성 보장
  trailingSlash: false,
  // 정적 내보내기 설정 (필요한 경우에만)
  // output: 'export',
  // 리다이렉트 설정
  async redirects() {
    return [
      // 필요한 리다이렉트 규칙 추가
    ]
  },
  // 리라이트 설정 - SPA처럼 동작하도록
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

module.exports = nextConfig 